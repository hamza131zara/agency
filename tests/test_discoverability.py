#!/usr/bin/env python3
"""Regression tests for the agency's SEO/discoverability structural gate."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "validate_discoverability.py"


def main():
    result = subprocess.run(
        [sys.executable, str(SCRIPT)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    output = result.stdout + result.stderr
    assert result.returncode == 0, output
    assert "Indexable routes checked: 26" in output, output
    assert "Canonical verification: intentionally deferred" in output, output
    assert "Discoverability validation: PASSED" in output, output
    print("Discoverability tests passed: route inventory, metadata and deferred canonical gate.")


if __name__ == "__main__":
    main()
