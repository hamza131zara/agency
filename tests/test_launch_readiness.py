#!/usr/bin/env python3
"""Regression tests for the report-only and strict production launch gate."""
import importlib.util
import subprocess
import sys
import tempfile
from contextlib import redirect_stdout
from io import StringIO
from unittest.mock import patch
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "validate_launch_readiness.py"


def run(*args):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )


def main():
    spec = importlib.util.spec_from_file_location("launch_readiness_validator", SCRIPT)
    validator = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(validator)

    assert validator.is_approved(True) is True
    assert validator.is_approved(False) is False
    assert validator.is_approved("true") is False
    assert validator.is_approved("false") is False
    assert validator.is_approved(1) is False
    assert validator.is_approved_https_origin("https://agency.dev") is True
    assert validator.is_approved_https_origin("https://agency.dev:8443") is True
    assert validator.is_valid_email("hello@agency.dev") is True
    assert validator.is_valid_email("not-an-email") is False
    assert validator.is_valid_iso_date("2026-11-07") is True
    assert validator.is_valid_iso_date("tomorrow") is False
    for invalid_origin in (
        "http://agency.example",
        "https://agency.dev/path",
        "https://user@agency.dev",
        "https://agency.dev?query=1",
        "https://agency.dev#fragment",
        "https://agency.dev:99999",
        "https://agency.example",
        "NOT-APPROVED",
    ):
        assert validator.is_approved_https_origin(invalid_origin) is False, invalid_origin

    with tempfile.TemporaryDirectory() as temp_dir:
        validator.APPROVALS = Path(temp_dir) / "missing-approvals.json"
        output = StringIO()
        with patch.object(sys, "argv", [str(SCRIPT), "--strict-predeploy"]), redirect_stdout(output):
            assert validator.main() == 1, output.getvalue()
        assert "missing" in output.getvalue().lower(), output.getvalue()

    report = run()
    combined = report.stdout + report.stderr
    assert report.returncode == 0, combined
    assert "Launch readiness audit" in combined, combined
    assert "Expected indexable routes: 26" in combined, combined
    assert "Production canonical origin: configured" in combined, combined
    assert "Sitemap URLs: 26" in combined, combined
    assert "Approved canonical domain is missing" not in combined, combined
    assert "Canonical URL tags cannot be finalized" not in combined, combined
    assert "Privacy notice approval is outstanding" in combined, combined
    assert "Sitemap cannot be parsed" not in combined, combined

    predeploy = run("--strict-predeploy")
    predeploy_output = predeploy.stdout + predeploy.stderr
    assert predeploy.returncode == 1, predeploy_output
    assert "NOT READY FOR PRE-DEPLOYMENT" in predeploy_output, predeploy_output

    strict = run("--strict")
    strict_output = strict.stdout + strict.stderr
    assert strict.returncode == 1, strict_output
    assert "NOT READY FOR RELEASE" in strict_output, strict_output
    assert "Post-deployment verification items:" in strict_output, strict_output

    print("Launch-readiness tests passed: report-only, strict pre-deployment and full release gates behave as expected.")


if __name__ == "__main__":
    main()
