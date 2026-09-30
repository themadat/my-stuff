# Current handoff

## State

Release **0.0.1.88** is prepared and verified, uncommitted/unpushed. Version/cache surfaces were aligned once with `scripts/release.mjs`. No unfinished work.

User clarified “autosaving like T&A” means **automatic GitHub sync**, not saving object forms while typing. T&A reference code was inspected read-only in `../t-a/assets/js/core/sync.js` and its state/UI.

Settings → Data Sync now has Auto Sync While This App Is Open. It defaults enabled; manual sync remains available. Automatic work requires a configured connection and valid target/hash baseline. Saved changes are debounced 1.2 seconds; visible app startup, foreground return, reconnect and the existing polling interval check for changes. Background work uses browser-tab locks when available and bounded failure backoff up to 60 seconds. Closed/hidden apps do not auto sync.

Local-only changes upload with SHA protection. Remote-only changes download through the existing recovery-copy path, retaining preferences. Conflicts, missing files, first-sync choices and legacy cloud migration remain manual. Auto work is quiet; existing cloud status communicates pending/errors. Disabling the switch, going offline or hiding the app during the remote read prevents an automatic write. Edits during upload stay pending for another pass.

Editor/checklist behavior is unchanged: single-copy numbered containers hidden, Notes beside location fields, Checklists/Tags row, branded checklist labels, Reset, house-location groups and text entries first.

Verification: **156 non-browser checks and 7 release browser flows passed**. New sync tests cover upload/download, recovery, first-sync/missing/conflict guards, disable/hide/offline races, changes during reads/writes and SHA protection. Browser coverage includes automatic switch/reconnect, manual sync/restore, payload privacy, mobile Settings and offline reload. Tests use mocked GitHub; no real token/cloud writes. Updated stale browser assertions for the existing Checklists tab order and schema-7 favorites payload. Diff checks passed. Preview server stopped.

## Constraints and user preferences

- Static, local-first, runtime dependency-free. Preserve Notes, Settings, storage, recovery, backup/import, optional sync and PWA.
- User deploys by pushing main. Release one application batch once; do not commit or push unless explicitly requested.
- At release handoff provide staging, `Version - Description` commit and push commands. Working tree was clean at this batch’s start; every current change belongs to this task.
- Keep this handoff under 500 words. Git and release notes retain history.

## Useful pointers

- `assets/js/inventory-ui.js`: checklist menu, views, Settings controls and object editor membership.
- `assets/js/core/inventory.js`: checklist validation, deleted-reference cleanup and merge conflict handling.
- `assets/js/core/state.js`: Checklists support tab; inventory already participates in backups and cloud sync.
- `tests/checklists.test.mjs`, `tests/browser.test.mjs`: normalization, backup/sync and browser regressions.
- `docs/DEVELOPMENT.md`, `docs/TESTING.md`: release and testing commands.
- Node: `/Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. System `/usr/local/bin/node` is too old for Node test flags.
- Playwright: `/Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Set `PLAYWRIGHT_MODULE` to this and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`. Isolated headless browser and local preview require sandbox escalation here.
