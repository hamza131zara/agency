#!/usr/bin/env python3
"""Create a clean, root-level Hostinger upload ZIP for the Phase I website."""
from __future__ import annotations

import argparse
import hashlib
import shutil
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = [
    "index.html",
    "services.html",
    "work.html",
    "about.html",
    "contact.html",
    "privacy.html",
    "404.html",
    "contact.php",
    "config.example.php",
    ".htaccess",
    "robots.txt",
    "sitemap.xml",
]
DIRECTORIES = ["assets", "work"]
EXCLUDED_PARTS = {".git", ".github", "tests", "docs", "node_modules", "__pycache__"}
DEPLOY_NOTES = """AGENCY — PHASE I HOSTINGER UPLOAD PACKAGE
=============================================

This is a deployment template, not yet a production-configured release.

BEFORE UPLOAD
1. Confirm the real agency name/logo and canonical domain.
2. Review all project notes and the draft privacy notice.
3. Replace YOUR-DOMAIN.example in robots.txt and sitemap.xml with the canonical HTTPS domain.
4. Back up any existing Hostinger public_html files before replacing them.
5. Activate/verify SSL on the domain before forcing HTTPS.

UPLOAD
1. Extract this ZIP on your computer. Its contents are already arranged at the website root.
2. Upload the CONTENTS (index.html, pages, assets/, work/, contact.php, .htaccess, etc.)
   directly to the Hostinger document root, usually public_html. Do not add another parent folder.
3. In Hostinger File Manager, copy config.example.php to config.php.
4. Edit config.php on the server only. Set recipient_email to the monitored agency inbox,
   from_email to a verified sender on the final domain, and from_name to the approved agency name.
   Never commit config.php or put working credentials in the repository.
5. Set the hosting PHP version to 8.2 or later. Keep .htaccess protections enabled.
6. Submit a real inquiry and verify it arrives at the configured mailbox, including spam folder
   and Reply-To. A successful PHP mail() handoff is not proof of final inbox delivery.

IMPORTANT LIMITATIONS
- The displayed brand "AGENCY" is a placeholder until the official name/logo is confirmed.
- robots.txt and sitemap.xml intentionally contain a domain placeholder in this template.
- config.example.php intentionally contains non-working placeholder addresses. The form must not
  be considered live until server-only config.php is configured and the live email test passes.
- Project mockups are illustrations, not production screenshots. Review project claims before launch.
- SMS, Instagram/social publishing and client automation dashboards are Phase II, not included here.
- Do not upload any credentials, .env files, config.php, tests, CI files or development dependencies.
"""

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(ROOT / "dist"))
    args = parser.parse_args()
    output_dir = Path(args.output).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    for rel in ROOT_FILES:
        if not (ROOT / rel).is_file():
            raise SystemExit(f"Required deployment file is missing: {rel}")
    for rel in DIRECTORIES:
        if not (ROOT / rel).is_dir():
            raise SystemExit(f"Required deployment directory is missing: {rel}")
    if (ROOT / "config.php").exists():
        raise SystemExit("Refusing to package a working config.php. Deployment secrets/config must stay server-only.")

    with tempfile.TemporaryDirectory(prefix="agency-hostinger-") as tmp:
        stage = Path(tmp) / "upload-root"
        stage.mkdir()
        for rel in ROOT_FILES:
            shutil.copy2(ROOT / rel, stage / rel)
        for rel in DIRECTORIES:
            shutil.copytree(ROOT / rel, stage / rel, ignore=shutil.ignore_patterns(
                ".DS_Store", "Thumbs.db", "*.pyc", "__pycache__", ".git"
            ))
        (stage / "UPLOAD-INSTRUCTIONS.txt").write_text(DEPLOY_NOTES, encoding="utf-8")

        zip_path = output_dir / "agency-hostinger-phase1-template.zip"
        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for file in sorted(stage.rglob("*")):
                if not file.is_file():
                    continue
                rel = file.relative_to(stage).as_posix()
                if any(part in EXCLUDED_PARTS for part in Path(rel).parts):
                    raise SystemExit(f"Refusing to include excluded development path: {rel}")
                if Path(rel).name in {"config.php", ".env"} or Path(rel).name.startswith(".env."):
                    raise SystemExit(f"Refusing to include a secret/config file: {rel}")
                archive.write(file, arcname=rel)

    with zipfile.ZipFile(zip_path) as archive:
        names = set(archive.namelist())
        missing = set(ROOT_FILES + ["UPLOAD-INSTRUCTIONS.txt"]) - names
        if missing:
            raise SystemExit(f"ZIP verification failed; missing files: {sorted(missing)}")
        if any(name.startswith("agency/") for name in names):
            raise SystemExit("ZIP verification failed; files must be at the web root.")
        if any(Path(name).name == "config.php" for name in names):
            raise SystemExit("ZIP verification failed; config.php must never be packaged.")
        if any(any(part in EXCLUDED_PARTS for part in Path(name).parts) for name in names):
            raise SystemExit("ZIP verification failed; development-only path found.")

    digest = hashlib.sha256(zip_path.read_bytes()).hexdigest()
    checksum_path = output_dir / "agency-hostinger-phase1-template.zip.sha256"
    checksum_path.write_text(f"{digest}  {zip_path.name}\n", encoding="ascii")
    print(f"Package created and verified: {zip_path}")
    print(f"Files in archive: {len(names)}")
    print(f"SHA-256: {digest}")
    print(f"Checksum: {checksum_path}")

if __name__ == "__main__":
    main()
