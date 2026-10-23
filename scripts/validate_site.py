#!/usr/bin/env python3
"""Dependency-free page metadata and local-link validator."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys
ROOT=Path(__file__).resolve().parents[1]
IGNORE={"http","https","mailto","tel","data","javascript"}
errors=[]
class Parser(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True); self.ids=set(); self.dupes=set(); self.links=[]; self.title=""; self.in_title=False; self.h1=0; self.lang=False; self.viewport=False; self.description=False; self.missing_alt=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=="html": self.lang=bool(a.get("lang"))
  if tag=="title": self.in_title=True
  if tag=="h1": self.h1+=1
  if tag=="meta":
   if a.get("name","").lower()=="viewport": self.viewport=True
   if a.get("name","").lower()=="description" and a.get("content","").strip(): self.description=True
  if a.get("id"):
   if a["id"] in self.ids: self.dupes.add(a["id"])
   self.ids.add(a["id"])
  if tag=="img" and "alt" not in a: self.missing_alt.append(a.get("src","unknown"))
  for k in ("href","src","action"):
   if a.get(k): self.links.append((k,a[k].strip()))
 def handle_endtag(self,tag):
  if tag=="title": self.in_title=False
 def handle_data(self,data):
  if self.in_title: self.title+=data.strip()
html_files=sorted([*ROOT.glob("*.html"), *ROOT.glob("work/*.html")])
pages={}
for file in html_files:
 parser=Parser()
 try: parser.feed(file.read_text(encoding="utf-8")); parser.close()
 except Exception as exc: errors.append(f"{file.name}: parse error {exc}"); continue
 pages[file.resolve()]=parser
 if not parser.lang: errors.append(f"{file.name}: html lang is missing")
 if not parser.title.strip(): errors.append(f"{file.name}: page title is missing")
 if not parser.viewport: errors.append(f"{file.name}: viewport metadata is missing")
 if not parser.description: errors.append(f"{file.name}: meta description is missing")
 if parser.h1 != 1: errors.append(f"{file.name}: expected one h1, found {parser.h1}")
 if parser.dupes: errors.append(f"{file.name}: duplicate IDs {sorted(parser.dupes)}")
 if parser.missing_alt: errors.append(f"{file.name}: image alt is missing {parser.missing_alt}")
for source,parser in pages.items():
 for kind,raw in parser.links:
  if raw.startswith("#"):
   if len(raw)>1 and raw[1:] not in parser.ids: errors.append(f"{Path(source).name}: broken fragment {raw}")
   continue
  url=urlsplit(raw)
  if url.scheme.lower() in IGNORE or url.netloc: continue
  target=(ROOT/url.path.lstrip("/")) if url.path.startswith("/") else (Path(source).parent/url.path if url.path else Path(source))
  target=target.resolve()
  if not target.exists(): errors.append(f"{Path(source).name}: broken local {kind} {raw}"); continue
  if url.fragment and target in pages and url.fragment not in pages[target].ids: errors.append(f"{Path(source).name}: missing fragment target {raw}")
required=["index.html","services.html","work.html","about.html","contact.html","brief-builder.html","privacy.html","404.html","contact.php","config.example.php",".htaccess","robots.txt","sitemap.xml","assets/css/styles.css","assets/js/main.js","assets/favicon.svg",".github/workflows/quality.yml"]
for rel in required:
 path=ROOT/rel
 if not path.is_file() or not path.stat().st_size: errors.append(f"required file missing or empty: {rel}")
if "contact.php?csrf=1" not in (ROOT/"assets/js/main.js").read_text(encoding="utf-8"): errors.append("browser form is not wired to PHP endpoint")
if "hash_equals" not in (ROOT/"contact.php").read_text(encoding="utf-8"): errors.append("CSRF check missing")
if "PHASE 2" not in (ROOT/"index.html").read_text(encoding="utf-8"): errors.append("home does not identify Phase 2 scope")
if "data-project-filter" not in (ROOT/"work.html").read_text(encoding="utf-8"): errors.append("portfolio category filters missing")
if "brief-form" not in (ROOT/"brief-builder.html").read_text(encoding="utf-8"): errors.append("project brief builder form missing")
if 'id="service-finder-form"' not in (ROOT/"services.html").read_text(encoding="utf-8"): errors.append("service finder form missing")
if "serviceRecommendations" not in (ROOT/"assets/js/main.js").read_text(encoding="utf-8"): errors.append("service finder recommendation logic missing")
if "requestedBriefService" not in (ROOT/"assets/js/main.js").read_text(encoding="utf-8"): errors.append("project brief service prefill is missing")
if "URL.createObjectURL" not in (ROOT/"assets/js/main.js").read_text(encoding="utf-8"): errors.append("brief download behavior missing")
if errors:
 print("Site validation FAILED:")
 for message in errors: print(" - "+message)
 sys.exit(1)
print(f"Site validation passed: {len(html_files)} pages, metadata, local links/fragments and contact wiring.")
