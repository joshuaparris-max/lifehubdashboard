#!/usr/bin/env python3
"""
Rebuild the LifeHub dashboard stats JSON by counting files inside key areas.
Run from the repo root:

    python3 LifeHub/scripts/update_dashboard_stats.py
"""

from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIFEHUB = ROOT

EXCLUDED_DIRS = {
    ".git",
    ".svn",
    "__pycache__",
    "node_modules",
    ".idea",
    ".DS_Store",
    "Library",
}


def count_files(path: Path) -> int:
    total = 0
    if not path.exists():
        return total

    for dirpath, dirnames, filenames in os.walk(path):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        total += len(filenames)
    return total


def main() -> None:
    stats = {
        "inboxCount": count_files(LIFEHUB / "Inbox"),
        "familyHealthCount": count_files(LIFEHUB / "Family" / "Health"),
        "financeCount": count_files(LIFEHUB / "Finance"),
        "projectsCount": count_files(LIFEHUB / "Projects"),
        "housingCount": count_files(LIFEHUB / "Housing"),
        "mediaCount": count_files(LIFEHUB / "Media"),
        "archiveCount": count_files(LIFEHUB / "Archive"),
        "templatesCount": count_files(LIFEHUB / "Templates"),
    }

    output_path = LIFEHUB / "dashboard-stats.json"
    output_path.write_text(json.dumps(stats, indent=2))
    print(f"Wrote {output_path} with {len(stats)} stats.")


if __name__ == "__main__":
    main()
