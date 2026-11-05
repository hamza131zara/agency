#!/usr/bin/env python3
"""Final static acceptance checks for the Phase 4 portfolio experience."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "docs" / "PORTFOLIO_PROJECTS.json"
REQUIRED_SECTIONS = {
    "project-context": "Context",
    "project-scope": "Scope & approach",
    "project-details": "Implementation details",
}


class PageAudit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.nav_labels = set()
        self.article_version = False
        self.main_count = 0
        self.h1_count = 0
        self.evidence_panel = False
        self.related_nav = False
        self.title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "main" and attrs.get("id") == "main":
            self.main_count += 1
        if tag == "h1":
            self.h1_count += 1
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "nav" and attrs.get("aria-label"):
            self.nav_labels.add(attrs["aria-label"])
            if attrs["aria-label"] == "Related portfolio projects":
                self.related_nav = True
        if tag == "article" and attrs.get("data-case-study-version") == "1":
            self.article_version = True
        if attrs.get("class") == "project-evidence-panel":
            self.evidence_panel = True
        if tag == "title":
            self.title = True


def fail(message):
    raise SystemExit("Portfolio acceptance FAILED: " + message)


def main():
    data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    projects = data.get("publicCatalogue", [])
    public = [p for p in projects if p.get("catalogueVisibility") == "public"]
    if len(public) != 5:
        fail(f"expected exactly five public portfolio projects, found {len(public)}")

    work_path = ROOT / "work.html"
    work_text = work_path.read_text(encoding="utf-8")
    card_ids = re.findall(r'data-project-id="([^"]+)"', work_text)
    expected_ids = [p["id"] for p in public]
    if len(card_ids) != len(set(card_ids)) or set(card_ids) != set(expected_ids):
        fail("catalogue cards do not exactly match the five public inventory IDs")

    checked = []
    for project in public:
        project_id = project["id"]
        slug = project.get("slug")
        if not slug:
            fail(f"{project_id}: public inventory record has no detail-page slug")
        path = ROOT / "work" / f"{slug}.html"
        if not path.is_file():
            fail(f"{project_id}: missing detail page {path.relative_to(ROOT)}")

        source = path.read_text(encoding="utf-8")
        page = PageAudit()
        page.feed(source)
        if page.main_count != 1 or page.h1_count != 1 or not page.title:
            fail(f"{project_id}: expected title, one main landmark and one h1")
        if not page.article_version:
            fail(f"{project_id}: shared case-study article marker missing")
        if "Breadcrumb" not in page.nav_labels or "On this page" not in page.nav_labels:
            fail(f"{project_id}: semantic breadcrumb or section index missing")
        if not page.evidence_panel or not page.related_nav:
            fail(f"{project_id}: evidence panel or related-project navigation missing")
        for anchor in REQUIRED_SECTIONS:
            if anchor not in page.ids:
                fail(f"{project_id}: required section anchor #{anchor} missing")
        for anchor in REQUIRED_SECTIONS:
            if "#" + anchor not in page.links:
                fail(f"{project_id}: section index link to #{anchor} missing")
        if "../work.html" not in page.links:
            fail(f"{project_id}: parent catalogue breadcrumb missing")
        checked.append(project_id)

    print(
        "Portfolio acceptance structural checks passed: "
        f"{len(checked)} public detail pages, five matching catalogue cards, "
        "shared case-study navigation, evidence panels and section anchors."
    )


if __name__ == "__main__":
    main()
