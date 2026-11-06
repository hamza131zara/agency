#!/usr/bin/env python3
"""Validate baseline SEO/discoverability signals without inventing a canonical domain.

This is a structural quality gate, not a ranking or AI-citation guarantee.
Canonical URL enforcement activates only after the owner-approved HTTPS origin
is recorded in docs/LAUNCH_APPROVALS.json.
"""
import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
APPROVALS = ROOT / "docs" / "LAUNCH_APPROVALS.json"
NO_INDEX = {"privacy.html", "terms.html", "disclaimer.html", "404.html"}
EXPECTED_INDEXABLE_ROUTES = 26


class PageMetadataParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.h1_parts = []
        self.h1_count = 0
        self.description_values = []
        self.robots_values = []
        self.canonical_values = []
        self.og_title = False
        self.og_description = False
        self.og_image = False
        self.twitter_card = False
        self._in_title = False
        self._h1_depth = 0
        self._current_h1 = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        values = {key.lower(): value or "" for key, value in attrs}
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1_count += 1
            self._h1_depth = 1
            self._current_h1 = []
        elif self._h1_depth:
            self._h1_depth += 1
        if tag == "meta":
            name = values.get("name", "").lower()
            prop = values.get("property", "").lower()
            if name == "description":
                self.description_values.append(values.get("content", "").strip())
            elif name == "robots":
                self.robots_values.append(values.get("content", "").lower())
            elif prop == "og:title":
                self.og_title = True
            elif prop == "og:description":
                self.og_description = True
            elif prop == "og:image":
                self.og_image = True
            elif name == "twitter:card":
                self.twitter_card = True
        elif tag == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical_values.append(values.get("href", "").strip())

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "title":
            self._in_title = False
        if tag == "h1" and self._h1_depth:
            text = normalize("".join(self._current_h1))
            self.h1_parts.append(text)
            self._current_h1 = []
            self._h1_depth = 0
        elif self._h1_depth and tag not in {"h1"}:
            self._h1_depth = max(1, self._h1_depth - 1)

    def handle_data(self, data):
        if self._in_title:
            self.title_parts.append(data)
        if self._h1_depth:
            self._current_h1.append(data)


def normalize(value):
    return re.sub(r"\s+", " ", value or "").strip()


def route_inventory():
    files = sorted([
        *ROOT.glob("*.html"),
        *ROOT.glob("services/*.html"),
        *ROOT.glob("work/*.html"),
        *ROOT.glob("products/*.html"),
    ])
    indexable = []
    excluded = []
    for path in files:
        relative = path.relative_to(ROOT).as_posix()
        (excluded if relative in NO_INDEX else indexable).append((relative, path))
    return indexable, excluded


def main():
    if not APPROVALS.is_file():
        print("Discoverability validation failed: LAUNCH_APPROVALS.json is missing.")
        return 1

    approvals = json.loads(APPROVALS.read_text(encoding="utf-8"))
    origin = str(approvals.get("canonicalOrigin", "")).strip().rstrip("/")
    canonical_approved = (
        origin.startswith("https://")
        and "replace-" not in origin.lower()
        and "your-domain" not in origin.lower()
    )

    indexable, excluded = route_inventory()
    failures = []
    warnings = []
    titles = Counter()
    descriptions = Counter()
    canonical_pages = 0

    if len(indexable) != EXPECTED_INDEXABLE_ROUTES:
        failures.append(
            f"Expected {EXPECTED_INDEXABLE_ROUTES} indexable HTML routes; found {len(indexable)}."
        )

    for relative, path in indexable:
        parser = PageMetadataParser()
        try:
            parser.feed(path.read_text(encoding="utf-8"))
        except OSError as exc:
            failures.append(f"{relative}: unable to read HTML ({exc}).")
            continue

        title = normalize("".join(parser.title_parts))
        description = parser.description_values[0] if parser.description_values else ""
        h1 = next((item for item in parser.h1_parts if item), "")
        title_key = title.casefold()
        description_key = description.casefold()

        if not title:
            failures.append(f"{relative}: missing title element.")
        else:
            titles[title_key] += 1
        if len(parser.description_values) != 1 or not description:
            failures.append(
                f"{relative}: expected exactly one non-empty meta description; found {len(parser.description_values)}."
            )
        else:
            descriptions[description_key] += 1
            if len(description) > 320:
                warnings.append(f"{relative}: meta description is {len(description)} characters; review for concision.")
        if parser.h1_count != 1 or not h1:
            failures.append(
                f"{relative}: expected exactly one non-empty primary H1; found {parser.h1_count}."
            )

        noindex = any("noindex" in value for value in parser.robots_values)
        if noindex:
            failures.append(f"{relative}: indexable route is marked noindex.")

        if canonical_approved:
            expected_path = "/" if relative == "index.html" else "/" + relative
            expected = origin + expected_path
            if len(parser.canonical_values) != 1 or parser.canonical_values[0] != expected:
                failures.append(
                    f"{relative}: expected one self-canonical URL ({expected}); found {parser.canonical_values}."
                )
            else:
                canonical_pages += 1
        elif parser.canonical_values:
            failures.append(
                f"{relative}: canonical tags must wait until the exact canonical domain is approved."
            )

        if not parser.og_title or not parser.og_description:
            warnings.append(f"{relative}: Open Graph title/description coverage is incomplete.")
        if not parser.og_image:
            warnings.append(f"{relative}: Open Graph image is not set.")
        if not parser.twitter_card:
            warnings.append(f"{relative}: Twitter/X card metadata is not set.")

    for title, count in titles.items():
        if count > 1:
            failures.append(f"Duplicate page title used by {count} indexable routes: {title}.")
    for description, count in descriptions.items():
        if count > 1:
            failures.append(f"Duplicate meta description used by {count} indexable routes: {description[:110]}.")

    for relative, path in excluded:
        parser = PageMetadataParser()
        parser.feed(path.read_text(encoding="utf-8"))
        if not any("noindex" in value for value in parser.robots_values):
            failures.append(f"{relative}: legal draft/404 route must remain noindex.")

    print("Agency discoverability audit")
    print(f"Indexable routes checked: {len(indexable)}")
    print(f"Excluded noindex routes checked: {len(excluded)}")
    print(f"Unique titles: {len(titles)}")
    print(f"Unique meta descriptions: {len(descriptions)}")
    if canonical_approved:
        print(f"Self-canonical pages verified: {canonical_pages}")
    else:
        print("Canonical verification: intentionally deferred until owner-approved canonical domain is recorded.")
    print(f"Warnings: {len(warnings)}")
    for warning in warnings:
        print(f"  WARNING: {warning}")
    print(f"Blocking issues: {len(failures)}")
    for failure in failures:
        print(f"  ERROR: {failure}")

    if failures:
        print("Discoverability validation: FAILED.")
        return 1
    print("Discoverability validation: PASSED (structural baseline only; no ranking/citation guarantee).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
