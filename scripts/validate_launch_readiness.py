#!/usr/bin/env python3
"""Report launch blockers; use --strict to gate the production release.

This script intentionally does not invent a domain, legal operator, inbox or
production configuration. CI uses report-only mode. The Hostinger release
runbook requires --strict-predeploy before upload and --strict after staged smoke tests.
"""
import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
APPROVALS = ROOT / "docs" / "LAUNCH_APPROVALS.json"
SITEMAP = ROOT / "sitemap.xml"
ROBOTS = ROOT / "robots.txt"
LEGAL = {
    "privacy.html": ("DRAFT NOTICE", "noindex, nofollow"),
    "terms.html": ("DRAFT TERMS", "noindex, nofollow"),
    "disclaimer.html": ("DRAFT DISCLAIMER", "noindex, nofollow"),
}
NO_INDEX = {"privacy.html", "terms.html", "disclaimer.html", "404.html"}
NAMESPACE = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class CanonicalParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "link":
            return
        values = dict(attrs)
        if values.get("rel", "").lower() == "canonical":
            self.canonicals.append(values.get("href", ""))


def add(blockers, message):
    blockers.append(message)


def is_placeholder(value):
    if not isinstance(value, str):
        return True
    text = value.strip().lower()
    return not text or any(token in text for token in (
        "replace-", "replace_", "your-domain", "not-provided",
        "not-approved", "example.com", "example.org", "yourdomain"
    ))


def is_approved(value):
    """Only the JSON boolean true counts as an approval."""
    return value is True


def is_approved_https_origin(value):
    if not isinstance(value, str) or is_placeholder(value):
        return False
    try:
        parsed = urlsplit(value.rstrip("/"))
        port = parsed.port
    except ValueError:
        return False
    return (
        parsed.scheme.lower() == "https"
        and bool(parsed.hostname)
        and parsed.username is None
        and parsed.password is None
        and parsed.path == ""
        and parsed.query == ""
        and parsed.fragment == ""
        and (port is None or 1 <= port <= 65535)
        and "@" not in parsed.netloc
        and not any(character.isspace() for character in parsed.netloc)
    )


def is_valid_email(value):
    return (
        isinstance(value, str)
        and not is_placeholder(value)
        and re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value.strip()) is not None
    )


def is_valid_iso_date(value):
    if not isinstance(value, str):
        return False
    try:
        from datetime import date
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


def route_inventory():
    html_files = sorted([
        *ROOT.glob("*.html"),
        *ROOT.glob("services/*.html"),
        *ROOT.glob("work/*.html"),
        *ROOT.glob("products/*.html"),
    ])
    routes = set()
    for file in html_files:
        rel = file.relative_to(ROOT).as_posix()
        if rel in NO_INDEX:
            continue
        routes.add("/" if rel == "index.html" else "/" + rel)
    return html_files, routes


def inspect_sitemap(blockers, origin, expected_routes):
    try:
        root = ET.parse(SITEMAP).getroot()
    except (ET.ParseError, OSError) as exc:
        add(blockers, f"Sitemap cannot be parsed: {exc}")
        return 0

    urls = [
        node.text.strip()
        for node in root.findall("sm:url/sm:loc", NAMESPACE)
        if node.text and node.text.strip()
    ]
    if len(urls) != len(set(urls)):
        add(blockers, "Sitemap contains duplicate URLs.")

    if is_placeholder(origin):
        add(blockers, "Approved canonical domain is missing; sitemap still uses a placeholder host.")

    paths = set()
    placeholder_urls = []
    for url in urls:
        parsed = urlsplit(url)
        if parsed.scheme != "https" or not parsed.netloc:
            add(blockers, f"Sitemap URL is not an absolute HTTPS URL: {url}")
            continue
        if not is_placeholder(origin) and f"{parsed.scheme}://{parsed.netloc}" != origin.rstrip("/"):
            add(blockers, f"Sitemap host does not match approved canonical origin: {url}")
        if is_placeholder(url):
            placeholder_urls.append(url)
        if parsed.query or parsed.fragment:
            add(blockers, f"Sitemap URL must not contain query or fragment: {url}")
        paths.add(parsed.path or "/")
        target = ROOT / parsed.path.lstrip("/")
        if parsed.path in ("", "/"):
            target = ROOT / "index.html"
        if not target.is_file():
            add(blockers, f"Sitemap route has no corresponding file: {parsed.path}")

    if placeholder_urls:
        add(blockers, f"Sitemap contains {len(placeholder_urls)} URLs using a placeholder domain.")

    for route in sorted(expected_routes - paths):
        add(blockers, f"Indexable page is missing from sitemap: {route}")
    for route in sorted(paths - expected_routes):
        add(blockers, f"Sitemap includes a non-indexable or unknown route: {route}")

    if len(urls) != len(expected_routes):
        add(blockers, f"Sitemap count is {len(urls)}; expected {len(expected_routes)} indexable HTML routes.")
    return len(urls)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--strict", action="store_true",
        help="exit non-zero while any launch blocker remains"
    )
    parser.add_argument(
        "--strict-predeploy", action="store_true",
        help="exit non-zero for unresolved owner/legal/domain/hosting gates before upload; post-deploy tests remain informational"
    )
    args = parser.parse_args()

    blockers = []
    post_deployment_blockers = []
    if not APPROVALS.is_file():
        print("Launch readiness: BLOCKED — docs/LAUNCH_APPROVALS.json is missing.")
        return 1 if (args.strict or args.strict_predeploy) else 0

    approvals = json.loads(APPROVALS.read_text(encoding="utf-8"))
    raw_origin = approvals.get("canonicalOrigin", "")
    origin = raw_origin.rstrip("/") if isinstance(raw_origin, str) else ""
    origin_approved = is_approved_https_origin(origin)
    html_files, expected_routes = route_inventory()

    if not origin_approved:
        add(blockers, "Set and approve a valid HTTPS origin containing only scheme, host and optional port.")

    brand = approvals.get("brand", {})
    for field, label in (
        ("publicDisplayName", "Confirm the public agency/brand name."),
        ("approvedBy", "Record who approved the public brand identity."),
        ("evidenceLocation", "Record evidence for the brand approval."),
    ):
        if is_placeholder(brand.get(field)):
            add(blockers, label)
    if not is_approved(brand.get("logoAndBrandApproval")):
        add(blockers, "Owner approval of logo and brand assets is outstanding.")

    operator = approvals.get("operator", {})
    for field, label in (
        ("legalName", "Provide the legal operator's full name."),
        ("jurisdiction", "Confirm the operator's jurisdiction."),
        ("registeredAddress", "Provide the required registered/business address."),
        ("officialContactEmail", "Provide an official legal contact email."),
        ("legalReviewer", "Record the legal reviewer."),
        ("evidenceLocation", "Record the legal review evidence."),
    ):
        if is_placeholder(operator.get(field)):
            add(blockers, label)
    if not is_valid_email(operator.get("officialContactEmail")):
        add(blockers, "Provide a syntactically valid official legal contact email.")
    for field, label in (
        ("privacyApproval", "Privacy notice approval is outstanding."),
        ("termsApproval", "Terms of use approval is outstanding."),
        ("disclaimerApproval", "Disclaimer approval is outstanding."),
    ):
        if not is_approved(operator.get(field)):
            add(blockers, label)

    for filename, (draft_marker, noindex_marker) in LEGAL.items():
        path = ROOT / filename
        if not path.is_file():
            add(blockers, f"Required legal page is missing: {filename}")
            continue
        content = path.read_text(encoding="utf-8")
        approval_field = {
            "privacy.html": "privacyApproval",
            "terms.html": "termsApproval",
            "disclaimer.html": "disclaimerApproval",
        }[filename]
        approved = is_approved(operator.get(approval_field))
        has_draft_marker = draft_marker.lower() in content.lower()
        if not approved:
            if not has_draft_marker:
                add(blockers, f"{filename} must remain visibly marked as a draft until approved.")
            if noindex_marker not in content:
                add(blockers, f"{filename} must remain noindex until legal approval is complete.")
            add(blockers, f"{filename} is not approved for publication.")
        else:
            if has_draft_marker:
                add(blockers, f"{filename} is marked approved but still contains draft-only wording.")
            if noindex_marker not in content:
                add(blockers, f"{filename} must remain noindex until its indexing decision is separately reviewed.")

    contact = approvals.get("contact", {})
    for field, label in (
        ("monitoredRecipientInbox", "Set the monitored inquiry recipient inbox."),
        ("verifiedSenderAddress", "Set a verified sender address on the approved domain."),
    ):
        if is_placeholder(contact.get(field)):
            add(blockers, label)
        if not is_valid_email(contact.get(field)):
            add(blockers, label.replace(".", " with a syntactically valid email address."))
    if not is_approved(contact.get("senderDomainAuthenticationChecked")):
        add(blockers, "Verify sender-domain mail authentication (SPF/DKIM as supported).")
    if contact.get("hostMailSubmissionTest") != "passed":
        add(post_deployment_blockers, "Run a real production contact-form submission test.")
    if contact.get("inboxDeliveryAndReplyToTest") != "passed":
        add(post_deployment_blockers, "Verify inbox receipt, spam placement and Reply-To behavior.")

    hosting = approvals.get("hosting", {})
    for field, label in (
        ("providerAndPlanConfirmed", "Confirm the production hosting plan."),
        ("documentRootConfirmed", "Confirm the public document root."),
        ("supportedPhpVersionVerified", "Verify the production PHP version."),
        ("sslEnabledAndVerified", "Enable and verify SSL before forcing HTTPS."),
        ("productionBackupCreated", "Back up the existing production web root before replacing files."),
        ("deploymentApproved", "Record explicit owner approval for production deployment."),
    ):
        if not is_approved(hosting.get(field)):
            add(blockers, label)
    if not is_approved(hosting.get("productionConfigInstalledOutsideRepository")):
        add(post_deployment_blockers, "Install private production config.php on the host, outside the public repository.")
    if not is_approved(hosting.get("httpsRedirectVerified")):
        add(post_deployment_blockers, "Verify the HTTP-to-HTTPS redirect on the deployed host.")
    if not is_valid_iso_date(hosting.get("deploymentDate")):
        add(post_deployment_blockers, "Record the deployment date using an ISO 8601 calendar date.")
    if not isinstance(hosting.get("approvedCommit"), str) or re.fullmatch(r"[0-9a-fA-F]{40}", hosting.get("approvedCommit")) is None:
        add(post_deployment_blockers, "Record the exact 40-character deployed Git commit SHA.")

    search = approvals.get("searchAndIndexing", {})
    for field, label in (
        ("canonicalDomainAppliedToSitemap", "Replace sitemap placeholder host with the approved canonical domain."),
        ("robotsSitemapUrlUpdated", "Update robots.txt to point at the approved sitemap URL."),
    ):
        if not is_approved(search.get(field)):
            add(blockers, label)
    if not is_approved(search.get("sitemapUploadedAndFetched")):
        add(post_deployment_blockers, "Fetch the deployed sitemap over HTTPS and verify all indexable routes.")

    manual = approvals.get("manualReleaseReview", {})
    for field, label in (
        ("contentAndClaimsApproved", "Owner must approve public agency/service claims."),
        ("teamProfileConsentVerified", "Verify team-profile accuracy and publication consent."),
        ("projectAndProductCopyApproved", "Approve project and product descriptions/status labels."),
        ("visualAssetPermissionsVerified", "Verify permissions for all published visual assets."),
        ("keyboardReviewCompleted", "Complete owner keyboard-only review."),
        ("screenReaderReviewCompleted", "Complete owner screen-reader/assistive-technology review."),
        ("mobileAndTabletVisualReviewCompleted", "Complete visual review on mobile and tablet."),
        ("finalPublishApproval", "Record final owner approval to publish."),
    ):
        if not is_approved(manual.get(field)):
            add(blockers, label)
    if is_placeholder(manual.get("reviewer")):
        add(blockers, "Record the person responsible for final manual release review.")
    if not is_valid_iso_date(manual.get("reviewedAt")):
        add(blockers, "Record the manual release review date using an ISO 8601 calendar date.")
    if is_placeholder(manual.get("evidenceLocation")):
        add(blockers, "Record evidence for the manual release review.")

    robots = ROBOTS.read_text(encoding="utf-8") if ROBOTS.is_file() else ""
    expected_sitemap = f"{origin}/sitemap.xml" if origin_approved else ""
    if not expected_sitemap or expected_sitemap not in robots:
        add(blockers, "robots.txt does not reference the approved canonical sitemap URL.")

    sitemap_count = inspect_sitemap(blockers, origin, expected_routes)

    if not origin_approved:
        add(blockers, "Canonical URL tags cannot be finalized until a valid approved HTTPS origin is supplied.")
    else:
        missing_canonicals = []
        incorrect_canonicals = []
        for file in html_files:
            rel = file.relative_to(ROOT).as_posix()
            route = "/" if rel == "index.html" else "/" + rel
            if route not in expected_routes:
                continue
            canonical_parser = CanonicalParser()
            canonical_parser.feed(file.read_text(encoding="utf-8"))
            expected_canonical = origin + route
            if canonical_parser.canonicals != [expected_canonical]:
                if not canonical_parser.canonicals:
                    missing_canonicals.append(route)
                else:
                    incorrect_canonicals.append(route)
        if missing_canonicals:
            add(blockers, f"Add canonical URL tags to all indexable pages; missing on {len(missing_canonicals)} routes.")
        if incorrect_canonicals:
            add(blockers, f"Correct canonical URL tags on {len(incorrect_canonicals)} routes.")

    # A committed config.php is always a security failure; production config belongs on the host only.
    if (ROOT / "config.php").exists():
        add(blockers, "Do not commit config.php; keep production mail credentials on the server only.")
    gitignore = (ROOT / ".gitignore").read_text(encoding="utf-8") if (ROOT / ".gitignore").is_file() else ""
    if "/config.php" not in gitignore:
        add(blockers, ".gitignore must exclude config.php.")

    print("Launch readiness audit")
    print(f"- HTML routes discovered: {len(html_files)}")
    print(f"- Expected indexable routes: {len(expected_routes)}")
    print(f"- Sitemap URLs: {sitemap_count}")
    print(f"- Production canonical origin: {'configured' if origin_approved else 'MISSING OR INVALID'}")
    print(f"- Pre-deployment blockers: {len(blockers)}")
    print(f"- Post-deployment verification items: {len(post_deployment_blockers)}")
    for item in dict.fromkeys(blockers):
        print(f"PRE-DEPLOYMENT BLOCKER: {item}")
    for item in dict.fromkeys(post_deployment_blockers):
        print(f"POST-DEPLOYMENT CHECK: {item}")

    if blockers and (args.strict or args.strict_predeploy):
        mode = "release" if args.strict else "pre-deployment"
        print(f"RESULT: NOT READY FOR {mode.upper()} — resolve every listed pre-deployment blocker.")
        return 1
    if args.strict and post_deployment_blockers:
        print("RESULT: DEPLOYMENT VERIFICATION INCOMPLETE — resolve all post-deployment checks.")
        return 1
    if args.strict_predeploy and not blockers:
        print("RESULT: PRE-DEPLOYMENT GATES PASSED — staging upload may proceed; run --strict after smoke tests.")
        return 0
    if blockers or post_deployment_blockers:
        print("RESULT: AUDIT COMPLETE — use strict-predeploy before upload and strict after staging/production smoke tests.")
        return 0
    print("RESULT: ALL RECORDED LAUNCH GATES PASSED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
