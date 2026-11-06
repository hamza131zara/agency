#!/usr/bin/env python3
"""Validate product release approvals, publication boundaries and review templates."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "docs" / "PRODUCT_RELEASE_GOVERNANCE.json"
READINESS = ROOT / "docs" / "PRODUCT_CATALOGUE_READINESS.json"
POLICY = ROOT / "docs" / "PRODUCT_RELEASE_GOVERNANCE.md"
CHECKLIST = ROOT / "docs" / "PRODUCT_SUBMISSION_CHECKLIST.md"
CHANGELOG = ROOT / "docs" / "PRODUCT_CHANGELOG_TEMPLATE.md"
CATALOGUE = ROOT / "products.html"

EXPECTED_IDS = {
    "strideto", "regexlab", "jotjson",
    "siteintel-pulse", "free-ai-mixer", "auto-trading-agent",
}
PUBLIC_DETAIL_IDS = EXPECTED_IDS - {"auto-trading-agent"}

ALLOWED = {
    "ownerAuthority": {"not-recorded", "approved", "rejected"},
    "approvedPublicCopy": {"not-recorded", "pending", "approved"},
    "screenshotAndBrandPermissions": {"not-approved", "pending", "approved", "not-applicable"},
    "licenseReview": {"not-reviewed", "in-review", "approved", "restricted", "not-applicable"},
    "thirdPartyNoticesReview": {"not-reviewed", "in-review", "approved", "restricted", "not-applicable"},
    "privacyAndSecurityReview": {"not-reviewed", "in-review", "approved", "restricted", "not-applicable"},
    "distributionArtifact": {"not-created", "draft", "built", "verified"},
    "installDocumentation": {"not-available", "developer-documentation-only", "draft", "approved"},
    "cleanInstallVerification": {"not-run", "failed", "passed"},
    "versionAndChangelog": {"not-established", "draft", "published"},
    "pricingApproval": {"not-approved", "pending", "approved", "not-applicable"},
    "supportPolicyApproval": {"not-approved", "pending", "approved", "not-applicable"},
    "updatePolicyApproval": {"not-approved", "pending", "approved", "not-applicable"},
    "refundAndConsumerTerms": {"not-approved", "pending", "approved", "not-applicable"},
    "releaseApproval": {"not-approved", "pending", "approved", "rejected"},
}

def fail(message):
    raise SystemExit("Product release governance validation FAILED: " + message)


def require_file(path):
    if not path.is_file() or path.stat().st_size == 0:
        fail(f"required governance file missing or empty: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


def has_all(text, phrases, label):
    missing = [phrase for phrase in phrases if phrase.lower() not in text.lower()]
    if missing:
        fail(f"{label} is missing required terms: {', '.join(missing)}")


def main():
    register = json.loads(require_file(REGISTER))
    readiness = json.loads(require_file(READINESS))
    policy = require_file(POLICY)
    checklist = require_file(CHECKLIST)
    changelog = require_file(CHANGELOG)
    catalogue = require_file(CATALOGUE)

    products = register.get("products")
    if not isinstance(products, list):
        fail("release register products must be an array")
    ids = [p.get("productId") for p in products]
    if len(ids) != len(set(ids)):
        fail("product release register IDs must be unique")
    if set(ids) != EXPECTED_IDS:
        fail(f"expected six release records; found {sorted(set(ids))}")

    readiness_ids = {p.get("id") for p in readiness.get("products", [])}
    if readiness_ids != EXPECTED_IDS:
        fail("release register does not match six-candidate readiness inventory")

    cards = {
        item_id: status
        for item_id, status in re.findall(
            r'data-product-id="([^"]+)"[^>]*data-status="([^"]+)"', catalogue
        )
    }
    if set(cards) != EXPECTED_IDS:
        fail("product catalogue cards do not match the six release-register IDs")

    expected_catalogue_states = {
        "strideto": "public",
        "regexlab": "public",
        "jotjson": "public",
        "siteintel-pulse": "development",
        "free-ai-mixer": "development",
        "auto-trading-agent": "unavailable",
    }
    expected_dispositions = {
        "strideto": "reference-only",
        "regexlab": "public-tool-only",
        "jotjson": "public-tool-only",
        "siteintel-pulse": "development-only",
        "free-ai-mixer": "development-only",
        "auto-trading-agent": "excluded",
    }

    for product in products:
        product_id = product["productId"]
        if cards.get(product_id) != expected_catalogue_states[product_id]:
            fail(f"{product_id}: catalogue availability state conflicts with release register")
        if product.get("marketplaceDisposition") != expected_dispositions[product_id]:
            fail(f"{product_id}: marketplace disposition conflicts with release register")
    for product in products:
        product_id = product["productId"]
        if not isinstance(product.get("approvalEvidence"), list):
            fail(f"{product_id}: approvalEvidence must be an array")
        if not isinstance(product.get("readyToInstall"), bool):
            fail(f"{product_id}: readyToInstall must be boolean")
        if not isinstance(product.get("commercialOfferApproved"), bool):
            fail(f"{product_id}: commercialOfferApproved must be boolean")

        for field, allowed in ALLOWED.items():
            value = product.get(field)
            if value not in allowed:
                fail(f"{product_id}: invalid or missing {field} state: {value!r}")

        if product.get("readyToInstall"):
            required = {
                "ownerAuthority": {"approved"},
                "approvedPublicCopy": {"approved"},
                "screenshotAndBrandPermissions": {"approved", "not-applicable"},
                "licenseReview": {"approved", "not-applicable"},
                "thirdPartyNoticesReview": {"approved", "not-applicable"},
                "privacyAndSecurityReview": {"approved", "not-applicable"},
                "distributionArtifact": {"verified"},
                "installDocumentation": {"approved"},
                "cleanInstallVerification": {"passed"},
                "versionAndChangelog": {"published"},
                "supportPolicyApproval": {"approved"},
                "updatePolicyApproval": {"approved"},
                "releaseApproval": {"approved"},
            }
            for field, allowed in required.items():
                if product[field] not in allowed:
                    fail(f"{product_id}: readyToInstall is true but {field} is not approved/verified")
            evidence_fields = {"approver", "decision", "date", "scope", "evidenceLocation"}
            if not product["approvalEvidence"] or not all(
                evidence_fields.issubset(set(entry)) for entry in product["approvalEvidence"]
            ):
                fail(f"{product_id}: installable release lacks complete approvalEvidence entries")

        if product["commercialOfferApproved"]:
            for field, allowed in {
                "ownerAuthority": {"approved"},
                "approvedPublicCopy": {"approved"},
                "licenseReview": {"approved", "not-applicable"},
                "thirdPartyNoticesReview": {"approved", "not-applicable"},
                "pricingApproval": {"approved"},
                "supportPolicyApproval": {"approved"},
                "updatePolicyApproval": {"approved"},
                "refundAndConsumerTerms": {"approved"},
                "releaseApproval": {"approved"},
            }.items():
                if product[field] not in allowed:
                    fail(f"{product_id}: commercial offer approved before {field} gate passed")
            if not product["approvalEvidence"]:
                fail(f"{product_id}: commercial offer lacks approval evidence")

        if product_id in PUBLIC_DETAIL_IDS:
            page = ROOT / "products" / f"{product_id}.html"
            page_text = require_file(page)
            if f'data-product-id="{product_id}"' not in page_text:
                fail(f"{product_id}: detail page ID does not match release register")
            has_all(page_text, ["Availability", "Licence", "Pricing", "Support", "Updates"], f"{product_id} detail page")
        elif (ROOT / "products" / f"{product_id}.html").exists():
            fail("Auto-Trading-Agent must remain excluded from product detail pages")

        if product["readyToInstall"] is False and product["releaseStatus"] in {
            "ready-to-install", "commercially-available"
        }:
            fail(f"{product_id}: releaseStatus conflicts with readyToInstall=false")
        if product["commercialOfferApproved"] is False and product["pricingApproval"] == "approved":
            fail(f"{product_id}: pricing marked approved without an approved commercial offer")

    has_all(policy, [
        "Product submission workflow", "Ready-to-install release gate",
        "Commercial offer gate", "Version and change-history policy",
        "Approval record template", "withdrawal",
    ], "release governance policy")
    has_all(checklist, [
        "Ownership and authority", "Licensing and third-party notices",
        "Technical release artifact", "Security, privacy and data handling",
        "Commercial terms", "Final decision",
    ], "product submission checklist")
    has_all(changelog, [
        "[Unreleased]", "SHA-256", "Compatibility", "Upgrade / migration",
        "Security", "Known limitations",
    ], "product changelog template")

    if register.get("products") and any(p.get("readyToInstall") for p in products):
        print("Product release governance validation passed with an approved installable product.")
    else:
        print(
            "Product release governance validation passed: six records, "
            "catalogue parity, explicit approval gates and no unapproved installable/commercial claims."
        )


if __name__ == "__main__":
    main()
