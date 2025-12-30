#!/usr/bin/env python3
"""Build a lightweight search index for Copilot/command palette."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "search-index.json"
TEXT_EXTENSIONS = {
    ".txt",
    ".md",
    ".markdown",
    ".rtf",
    ".csv",
    ".tsv",
    ".json",
    ".yaml",
    ".yml",
    ".ini",
    ".cfg",
    ".conf",
    ".log",
    ".tex",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".html",
    ".css",
    ".scss",
    ".sh",
    ".zsh",
    ".fish",
    ".bat",
    ".ps1",
    ".sql",
    ".rst",
}
MAX_SNIPPET_CHARS = 400
MAX_FILE_SIZE = 512 * 1024  # 512 KB
SKIP_DIRS = {"Library", "node_modules", ".git", "__pycache__", ".idea", "automation/logs"}
INDEX_ROOTS = [
    "Inbox",
    "Work",
    "Family",
    "Finance",
    "Housing",
    "Personal",
    "Projects",
    "Hobbies",
    "Media",
    "Templates",
    "Resources",
    "Archive",
]


def iter_text_files(base: Path) -> Iterable[Path]:
    if not base.exists():
        return
    for dirpath, dirnames, filenames in os.walk(base):
        rel_dir = Path(dirpath).relative_to(ROOT)
        dirnames[:] = [name for name in dirnames if name not in SKIP_DIRS]
        for filename in filenames:
            path = Path(dirpath) / filename
            if path.suffix.lower() not in TEXT_EXTENSIONS:
                continue
            try:
                if path.stat().st_size > MAX_FILE_SIZE:
                    continue
            except OSError:
                continue
            yield path


def build_entry(path: Path) -> dict | None:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None
    snippet = " ".join(text.split())[:MAX_SNIPPET_CHARS]
    segments = path.relative_to(ROOT).parts
    area = segments[0] if segments else ""
    try:
        mtime = path.stat().st_mtime
        modified = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
    except OSError:
        modified = None
    return {
        "path": "/".join(segments),
        "area": area,
        "snippet": snippet,
        "modified": modified,
    }


def main() -> None:
    entries: list[dict] = []
    for root in INDEX_ROOTS:
        for path in iter_text_files(ROOT / root):
            entry = build_entry(path)
            if entry:
                entries.append(entry)
    OUTPUT_PATH.write_text(json.dumps(entries, indent=2), encoding="utf-8")
    print(f"Wrote search index with {len(entries)} entries -> {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
