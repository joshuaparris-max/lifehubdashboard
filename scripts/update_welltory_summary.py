#!/usr/bin/env python3
"""
Summarise the latest Welltory export into JSON for the dashboard widget.

Run from the repo root:

    python3 LifeHub/scripts/update_welltory_summary.py
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WELLTORY_DIR = ROOT / "Personal" / "Health" / "Welltory"
OUTPUT_FILE = ROOT / "welltory-summary.json"


def load_latest_csv() -> Path | None:
    candidates = sorted(
        WELLTORY_DIR.glob("WELLTORY_MEASUREMENT_DATA_EXPORT_*.csv"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def summarise_csv(path: Path) -> dict[str, object]:
    if not path:
        return {}

    measurements = []
    with path.open(newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            measurements.append(row)

    if not measurements:
        return {}

    def average(field: str) -> float:
        values = [
            float(entry[field])
            for entry in measurements
            if entry.get(field) not in (None, "", "null")
        ]
        return round(sum(values) / len(values), 1) if values else 0.0

    latest_date = measurements[0].get("Date")

    return {
        "sourceFile": path.name,
        "latestMeasurement": latest_date,
        "measurementCount": len(measurements),
        "stressAverage": average("Stress (HRV)"),
        "energyAverage": average("Energy (HRV)"),
        "focusAverage": average("Focus"),
    }


def main() -> None:
    summary = summarise_csv(load_latest_csv())
    OUTPUT_FILE.write_text(json.dumps(summary, indent=2))
    print(f"Wrote {OUTPUT_FILE} with {summary.get('measurementCount', 0)} measurements.")


if __name__ == "__main__":
    main()
