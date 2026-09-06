# LifeHub Copilot Instructions

## Project Overview

**LifeHub** is a personal information management dashboard and automation suite. It combines:
- A **file organization framework** (structured folders for Work, Finance, Family, etc.)
- A **web-based dashboard** (`dashboard.html` with JSON-fed widgets)
- **Python automation scripts** that build and maintain the dashboard data feeds

**NOT a traditional web app**—it's a personal hub that runs locally via `python3 -m http.server` and syncs with file changes using periodic scripts and launchd/cron jobs.

---

## Architecture at a Glance

### Three Main Pillars

1. **Data Layer**: Python scripts in `scripts/` that crawl folders, parse files, and generate JSON feeds
2. **Dashboard UI**: `dashboard.html` (vanilla JS) + `dashboard.css` that displays widgets powered by JSON
3. **Automation**: `automation/` folder holds launchd plists and cron configs for periodic refreshes

### Data Flow

```
LifeHub folders (File system)
    ↓
Python scripts (scripts/*.py) parse/analyze → JSON feeds (*.json)
    ↓
dashboard.html reads JSON → renders widgets (via JS)
    ↓
User interacts → save/load slots persist state
```

### Key Files & Directories

| File/Dir | Purpose |
|----------|---------|
| `scripts/` | Python automation—all data generators |
| `dashboard.html` | Main UI (vanilla JS, 20+ widgets) |
| `dashboard.js` | Widget renderers + fetch logic; includes `file://` fallback |
| `dashboard-inline-data.js` | Embedded JSON snapshots (generated, for offline mode) |
| `dashboard-*.json` | Live widget data feeds (stats, wellbeing, downloads, etc.) |
| `automation/` | Scheduling configs (launchd, cron) + configs (agenda/source.json) |
| `Makefile` | Quick build shortcuts (make refresh-all, make stats, etc.) |
| `Personal/`, `Work/`, `Finance/` | User folders scanned by scripts |

---

## Critical Developer Workflows

### 1. **Refresh All Dashboard Data**

```bash
make refresh-all
# OR: bash scripts/refresh_all.sh
```

Runs sequentially (see `scripts/refresh_all.sh`):
- `update_dashboard_stats.py` → `dashboard-stats.json` (folder sizes, inbox count, trends)
- `update_welltory_summary.py` → `welltory-summary.json` (HRV/heart data)
- `fetch_agenda_ics.py` → `Resources/calendar.ics` (from `automation/agenda/source.json`)
- `generate_recent_files.py` → `recent-files.json` (freshly modified files)
- `generate_downloads_feed.py` → `downloads-feed.json` (Downloads folder watcher)
- `build_search_index.py` → `search-index.json` (text snippets for search)
- `bash scripts/refresh_indexes.sh` → build `index.html` under each folder
- `update_backup_status.py` → dashboard backup widget state
- `build_text_game_sources.py` → `text-game-sources.js` (Pyodide games)
- `build_dashboard_inline_data.py` → `dashboard-inline-data.js` (for `file://` fallback)

**Key insight**: All scripts are idempotent (safe to run multiple times) and write to `*.json` files that the dashboard reads on refresh.

### 2. **Serve Dashboard Locally**

```bash
python3 -m http.server 8765
# Then: http://localhost:8765/dashboard.html
```

**Why HTTP is needed**:
- Pyodide text games require HTTP (not `file://`)
- Downloads watcher widget needs active fetch
- `fetch()` from `file://` URLs triggers CORS errors

**Offline fallback**: Dashboard auto-detects `file://` protocol, sets `window.LIFEHUB_OFFLINE_MODE = true`, and uses inline data from `dashboard-inline-data.js`. See top of `dashboard.js` for the shim.

### 3. **Individual Script Runs**

```bash
make stats                  # update dashboard-stats.json only
make wellbeing              # update wellbeing data
make recent                 # update recent-files.json
make downloads              # update downloads-feed.json
make refresh-indexes        # rebuild directory indexes
make refresh-text-games     # rebuild Pyodide sources
python3 scripts/build_search_index.py --dry-run  # preview without writing
```

### 4. **Automation / Scheduling**

**launchd** (macOS):
```bash
cp automation/launchd/com.lifehub.refresh.plist ~/Library/LaunchAgents/
# Edit USERNAME placeholders, then:
launchctl load ~/Library/LaunchAgents/com.lifehub.refresh.plist
```

**cron** (macOS/Linux):
```bash
crontab automation/cron/refresh_all.cron  # after updating path placeholders
# Runs scripts/refresh_all.sh every 4 hours
```

---

## Project-Specific Patterns & Conventions

### 1. **Python Script Structure**

All scripts in `scripts/` follow this template:

```python
#!/usr/bin/env python3
"""One-sentence description."""

from __future__ import annotations
import json
import os
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]  # ~/LifeHub
LIFEHUB = ROOT

EXCLUDED_DIRS = {".git", "__pycache__", "node_modules", ".DS_Store"}

def _helper_function(path: Path) -> dict:
    """Specific to this script; prefix with underscore."""
    # logic here
    return data

def main() -> None:
    """Fetch data, process, write JSON."""
    result = _helper_function(LIFEHUB)
    output = LIFEHUB / "dashboard-stats.json"
    with output.open("w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": result
        }, f, indent=2)
    print(f"✓ Wrote {output}")

if __name__ == "__main__":
    main()
```

**Key conventions**:
- Use `pathlib.Path` with `Path(__file__).resolve().parents[1]` for cross-platform paths
- Prefix internal helpers with `_` (e.g., `_parse_folder()`)
- Always include ISO 8601 timestamp in output JSON
- Print a checkmark (✓) on success for visual confirmation
- No classes (keep it functional)
- Exclude `.DS_Store`, `__pycache__`, `node_modules`, `.git` from walks

### 2. **JSON Feed Format**

All dashboard feeds follow this schema:

```json
{
  "timestamp": "2025-04-16T14:30:00+00:00",
  "data": { ... },
  "notes": "optional"
}
```

Examples:
- `dashboard-stats.json`: `{ "timestamp": "...", "inbox_count": 12, "folder_sizes": {...} }`
- `recent-files.json`: `{ "timestamp": "...", "files": [{"path": "...", "modified": "...", ...}] }`
- `search-index.json`: `{ "timestamp": "...", "index": [{"file": "...", "snippet": "..."}, ...] }`

**Pattern**: Widgets fetch by file ID and expect these top-level keys.

### 3. **Widget Registration**

To add a new widget:

1. Create `scripts/generate_my_widget.py` → writes `my-widget.json`
2. Reference in `dashboard-data.js` (hardcoded paths object)
3. Add `<div id="widget-my-widget">` to `dashboard.html`
4. Add fetch + render in `dashboard.js` (look for existing widget handlers)
5. Add script to `scripts/refresh_all.sh` for automation

See `generate_downloads_feed.py` + `dashboard-downloads-watcher` widget for a simple example.

### 4. **Text Games (Pyodide Sandbox)**

Two games in `scripts/`:

- **`fun_text_game_base.py`** (v1): Room exploration, NPCs, gear inventory
- **`fun_text_game_v2.py`** (v2): Deck-building roguelike (Starship Heist)
  - Draft cards → build deck → fight 3 zones → beat final AI
  - Completely separate mechanic from v1 (no rooms)
  - Card effects: damage, block, draw, heal, double, exhaust

Both compile to `text-game-sources.js` via `build_text_game_sources.py` using Pyodide (Python in browser sandbox). No server-side execution.

### 5. **Offline Mode & `file://` Protocol**

**The problem**: Serving via `file://` breaks `fetch()` and network requests.

**The solution** (in `dashboard.js`):
1. Detect `window.location.protocol === 'file:'` → set `window.LIFEHUB_OFFLINE_MODE = true`
2. Replace `window.fetch()` with a shim that:
   - Returns fake `{}` JSON for local requests
   - Allows real network calls for Pyodide CDN + Groq API + trusted hosts
3. Fallback to `dashboard-inline-data.js` (embedded snapshots of all JSON)

**For developers**: Always test both modes—`make refresh-all && python3 -m http.server 8765` + opening via `file://` in browser.

### 6. **Configuration & Settings**

User edits JSON configs directly:
- `automation/agenda/source.json` → calendar feed URL + import type
- `automation/backups/targets.json` → backup targets and expected intervals
- `automation/backups/status.json` → current backup timestamps (updated by automation)

No database—all state lives in `.js` + `.json` files on disk.

---

## Testing & Development

### Linting & Formatting

```bash
npm run lint      # ESLint on src/ tests/ scripts/
npm run format    # Prettier (js, json, md)
npm test          # Jest (jsdom environment)
```

### Python Validation

```bash
python3 -m py_compile scripts/update_dashboard_stats.py
python3 scripts/build_search_index.py --dry-run  # preview index
python3 scripts/check_dashboard_links.py         # sanity check
```

### Local Smoke Test

```bash
# Terminal 1
python3 -m http.server 8765

# Terminal 2
curl -sS http://127.0.0.1:8765/dashboard-stats.json | python3 -m json.tool
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Widget blank / shows "Error" | JSON file missing or stale | `make refresh-all` |
| Pyodide games won't load | Offline mode + missing `dashboard-inline-data.js` | `python3 scripts/setup_pyodide.py` once, then refresh |
| Dashboard won't load at all | Inline data too large (> 5MB) | Run `build_dashboard_inline_data.py` to compress |
| Search index doesn't find files | Index stale | Re-run `python3 scripts/build_search_index.py` |
| Automation never runs | launchd plist path wrong or not loaded | `launchctl list \| grep lifehub` to check; see `log stream --predicate 'process == "launchd"'` |
| Downloads watcher broken | `file://` mode + no HTTP server | Serve via `python3 -m http.server 8765` |

---

## Getting Started on a New Feature

1. **Identify the pillar**:
   - Data? → Create `scripts/my_script.py`
   - UI? → Edit `dashboard.html`, wire in `dashboard.js`
   - Automation? → Add to `automation/` + `scripts/refresh_all.sh`

2. **Model on existing code**:
   - Python: See `scripts/update_dashboard_stats.py`
   - JS widget: See `dashboard.js` function that renders existing widgets
   - New command: Add to Makefile

3. **Test locally**:
   ```bash
   make refresh-all
   python3 -m http.server 8765
   # Open http://localhost:8765/dashboard.html
   ```

4. **Add to automation**:
   - If periodic: Add script to `scripts/refresh_all.sh`
   - If scheduled: Update launchd plist or cron job

---

## Command Reference

| Command | Effect |
|---------|--------|
| `make refresh-all` | Rebuild all dashboard feeds |
| `make stats` / `make wellbeing` / `make recent` / `make downloads` | Update individual feeds |
| `make refresh-indexes` | Rebuild all directory `index.html` files |
| `make refresh-text-games` | Rebuild Pyodide game sources |
| `npm run lint` / `npm run format` | ESLint + Prettier |
| `npm test` | Jest (jsdom) |
| `python3 -m http.server 8765` | Serve on localhost:8765 |
| `python3 scripts/check_dashboard_links.py` | Validate all dashboard paths |
| `python3 scripts/setup_pyodide.py` | Download Pyodide runtime once |

---

## Notes for AI Agents

- **Files are source of truth**: No database—just Python + JSON + HTML/JS on disk
- **Idempotent scripts**: All `scripts/*.py` are safe to run multiple times (they overwrite output JSON)
- **Path handling**: Always use `pathlib.Path` + `Path(...).resolve().parents[1]` for cross-platform safety
- **Offline resilience**: Dashboard detects `file://` mode and falls back to embedded JSON; test both modes
- **Text games sandboxed**: Pyodide runs Python in the browser—no server execution required
- **Vanilla JS**: No React/Vue—keep it simple, use `fetch()` or XMLHttpRequest for JSON
- **Timestamps everywhere**: All JSON feeds include ISO 8601 `timestamp` field for tracking freshness
