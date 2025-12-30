# LifeHub TODO

> Working list of improvements/tasks inferred from README, dashboard code, and supporting scripts. Update or check off items as you tackle them.

## Automation & Integrations
- [x] Teach the Automation Scheduler (`dashboard.js:1911`) to launch real scripts (e.g. via native helper, local HTTP bridge, or AppleScript) instead of simulated timers; capture stdout/stderr for display.
- [x] Persist automation run history (timestamps, exit codes, log excerpts) somewhere durable (JSON file, SQLite, or remote service) rather than localStorage so it survives browser clears.
- [x] Add a script that updates `dashboard-data.js.backups` with actual Time Machine / rsync / Backblaze timestamps and mark entries overdue based on their cadence.
- [x] Generate the agenda `.ics` automatically (export from Calendar/Google) so `Resources/calendar.ics` stays current without manual copying.
- [x] Document the dashboard widgets (Copilot, scheduler, triage, downloads watcher, resurface carousel, scratchpad, backup, kiosk) in `README.md`, including how to refresh their data feeds.
- [x] Replace the Pyodide CDN requirement with a local bundle or service worker cache so the text games load offline.
- [x] Ship a single “refresh all” command (Makefile, npm script, or CLI) that runs stats, recent-files, Welltory summary, directory indexes, and text-game builders in one go.
- [x] Provide LaunchAgent/cron recipes so stats, recent-files, backups, and Welltory scripts update on a set schedule without manual intervention.

## Dashboard Widgets
- [x] Copilot search (`dashboard.js:1788`) only indexes card metadata and recent file paths; hook it up to a richer search index (Spotlight, `rg`, SQLite) so queries match file contents and tags.
- [x] Activity Timeline (`dashboard.js:2113`) currently merges agenda + reminders + recent files; include automation runs, download sweeps, Welltory imports, or backup refreshes for a fuller log.
- [x] Inbox Triage board (`dashboard.js:2239`) uses seed data; feed it real Inbox metadata (maybe from `generate_recent_files.py`) and allow “move to Family/Finance/etc.” actions via shell scripts.
- [x] Downloads watcher (`dashboard.js:2154`) needs HTTP to read `../Downloads/index.html`; add a tiny local server or emit a JSON feed so it works when viewing the dashboard over `file://`.
- [x] Resurface carousel relies on only three items per area (from `generate_recent_files.py`); expand the generator to emit deeper history so dormant files (>90 days) appear reliably.
- [x] Scratchpad panel (`dashboard.js:2425`) should get “Promote to LifeHub” actions (e.g., save into `Projects/Notes/*.md`) instead of being localStorage-only.
- [x] Kiosk mode (`dashboard.js:2535`) could expose settings for rotation order, dwell time, and panel selection; consider adding auto zoom/fullscreen controls for wall displays.

## Text Games (Pyodide)
- [ ] Add command history (Up/Down) and auto-focus on input after each response so typing flows without extra clicks.
- [ ] Bind keyboard shortcuts (Cmd/Ctrl+K focus input, Cmd/Ctrl+L clear console, Cmd/Ctrl+S save slot, Cmd/Ctrl+R load slot).
- [ ] Add inline “Map” / “Help” buttons and a collapsible ASCII map panel under the console.
- [ ] Show active slot + last saved time near save controls; render errors/success as colored chips.
- [ ] Add optional autosave toggle (save to selected slot every turn or every N commands).
- [ ] Increase console max-height on desktop (e.g., 400px) while keeping internal scroll, and keep Send button in a “processing…” state while Pyodide runs.
- [ ] Harden persistence: validate save payloads, expose a “reset slots” button, and consider iCloud/disk-backed saves to survive storage clears.
- [ ] Share a single Pyodide instance between both games and preload via `setup_pyodide.py` for faster startup/offline use.

## Scripts & Data
- [x] Extend `scripts/update_dashboard_stats.py` to include additional KPIs (folder size, week-over-week change, items needing action) and surface them in the stats widget.
- [x] Provide a helper command (npm/pnpm script or Makefile) that runs `python3 scripts/build_text_game_sources.py` automatically when text-game Python files change.
- [x] Improve `scripts/generate_directory_indexes.py` output further with hero icons or thumbnails (especially for Media folders) instead of plain text lists.
- [x] Create a real search/indexer pipeline (e.g., scheduled `rg`/`ripgrep` dumps into JSON) that Copilot and the command palette can tap into for “find invoices mentioning RACV”-style queries.
- [ ] Add lint/tests for the Python helper scripts (stats, Welltory, recent-files, directory indexes) so regressions are caught by CI before shipping.
- [x] Bundle a setup script that copies `directory.css` to every generated root (LifeHub + Downloads) automatically after running `generate_directory_indexes.py`.

## Misc
- [x] Add instructions for running a lightweight HTTP server (so Pyodide + Downloads watcher work) and consider ship a script to launch it automatically.
- [x] Hook Welltory summary generation into a recurring task/automation so `welltory-summary.json` stays fresh without manual CLI runs.
- [ ] Explore exposing the embedded text games’ save slots to iCloud Drive or disk files so browser storage wipes don’t lose progress.
- [ ] Implement voice-triggered dashboard actions (Siri/voice command hooks) for search, focus mode, automations, and quick-links.
- [ ] Build an AI summariser that scans recent files per area and shows a “What changed this week” brief on the dashboard.
- [ ] Create a unified notification center banner for overdue backups, stale downloads, unfiled Inbox items, and agenda conflicts.
- [ ] Add a directory heatmap/visual overlay showing month-over-month growth vs. idle folders.
- [ ] Ship a smart tag recommender in the triage board that suggests macOS tags based on filenames/content.
- [ ] Upgrade Media directory indexes to gallery mode (previews, EXIF info, grouping by event/location).
- [ ] Layer a time-block planner over the agenda widget to propose filing/automation slots during the week.
- [ ] Add a one-click “export kit” that zips a chosen folder, hashes it, and copies it to Archive + backup drive.
- [ ] Build a LifeHub health dashboard (storage usage, file counts, automation cadence) with sparkline cards.
- [ ] Support collaboration mode that exports selected folders as read-only static sites for sharing with family/coworkers.
