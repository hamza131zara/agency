#!/usr/bin/env python3
"""Validate portfolio evidence metadata and approved visual-asset boundaries."""

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / "docs" / "PORTFOLIO_PROJECTS.json"
GOVERNANCE_PATH = ROOT / "docs" / "PORTFOLIO_EVIDENCE_VISUAL_GOVERNANCE.md"


class ImageSourceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "img":
            values = dict(attrs)
            if values.get("src"):
                self.sources.append(values["src"])


def fail(message):
    raise SystemExit("Portfolio evidence validation failed: " + message)


def main():
    if not INVENTORY_PATH.is_file() or not GOVERNANCE_PATH.is_file():
        fail("inventory or visual-governance policy document is missing")

    data = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    projects = data.get("publicCatalogue")
    if not isinstance(projects, list) or not projects:
        fail("publicCatalogue must be a non-empty array")

    ids = [item.get("id") for item in projects]
    if len(ids) != len(set(ids)):
        fail("project IDs must be unique")

    public_ids = set()
    for item in projects:
        project_id = item.get("id")
        visibility = item.get("catalogueVisibility")
        if not project_id or visibility not in {"public", "excluded"}:
            fail("every project needs an ID and an explicit public/excluded visibility")
        visual = item.get("visualGovernance")
        if not isinstance(visual, dict):
            fail(f"{project_id}: missing visualGovernance record")
        required = (
            "visualStatus",
            "approvedAssets",
            "authenticScreenshotPermission",
            "brandAssetPermission",
            "testimonialPermission",
            "outcomeEvidence",
            "ownerApproval",
            "reviewedAt",
        )
        missing = [key for key in required if key not in visual]
        if missing:
            fail(f"{project_id}: incomplete visualGovernance fields: {', '.join(missing)}")
        if not isinstance(visual["approvedAssets"], list):
            fail(f"{project_id}: approvedAssets must be an array")
        if visibility == "public":
            public_ids.add(project_id)
            if not item.get("slug"):
                fail(f"{project_id}: public project needs a detail-page slug")
            if item.get("agencyContribution", "").lower().find("not independently verified") >= 0:
                # The page must continue to avoid asserting agency delivery until evidence changes.
                page = ROOT / "work" / f"{item['slug']}.html"
                if not page.is_file():
                    fail(f"{project_id}: missing public project page")
                page_text = page.read_text(encoding="utf-8").lower()
                if "agency delivery" not in page_text and "agency contribution" not in page_text:
                    fail(f"{project_id}: page omits the agency-contribution evidence boundary")

            page = ROOT / "work" / f"{item['slug']}.html"
            page_text = page.read_text(encoding="utf-8")
            if 'data-case-study-version="1"' not in page_text:
                fail(f"{project_id}: shared case-study marker is missing")
            if "illustrative" not in page_text.lower() and "conceptual" not in page_text.lower():
                fail(f"{project_id}: page must visibly disclose illustrative/conceptual visuals")

            parser = ImageSourceParser()
            parser.feed(page_text)
            approved = set(visual["approvedAssets"])
            # The global agency shield is navigational brand chrome, not case-study evidence.
            # It is approved centrally as the official SDC identity, so keep portfolio media
            # permissions focused on project-specific imagery.
            global_brand_assets = {"/assets/brand/sdc-logo.webp"}
            unapproved = [
                src for src in parser.sources
                if src not in approved and src not in global_brand_assets
            ]
            if unapproved:
                fail(f"{project_id}: unapproved image source(s): {', '.join(unapproved)}")

    work_page = (ROOT / "work.html").read_text(encoding="utf-8")
    card_ids = set(re.findall(r'data-project-id="([^"]+)"', work_page))
    if card_ids != public_ids:
        fail(
            "catalogue cards do not match public inventory "
            f"(missing={sorted(public_ids - card_ids)}, unexpected={sorted(card_ids - public_ids)})"
        )

    policy = GOVERNANCE_PATH.read_text(encoding="utf-8").lower()
    for phrase in ("permission scope", "sensitive information", "asset approval record", "launch gate"):
        if phrase not in policy:
            fail(f"visual-governance policy is missing required section: {phrase}")

    print(
        "Portfolio evidence validation passed: "
        f"{len(projects)} inventory records, {len(public_ids)} public cards, "
        "visual permissions and screenshot disclosures checked."
    )


if __name__ == "__main__":
    main()
