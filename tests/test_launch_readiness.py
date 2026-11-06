#!/usr/bin/env python3
"""Regression tests for the report-only and strict production launch gate."""
import subprocess
import sys
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
    report = run()
    combined = report.stdout + report.stderr
    assert report.returncode == 0, combined
    assert "Launch readiness audit" in combined, combined
    assert "Expected indexable routes: 26" in combined, combined
    assert "Approved canonical domain is missing" in combined, combined
    assert "Canonical URL tags cannot be finalized" in combined, combined
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
