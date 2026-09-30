# Current handoff

## State

Release **0.0.1.86** is prepared and verified, uncommitted/unpushed. Version/cache surfaces were aligned once with `scripts/release.mjs`. No unfinished work.

Checklists appears immediately below Inventory in the Settings tabs. Checklist object labels now include Brand properties before the object name, both in checklist views and the Settings object picker. The shared helper is `checklistObjectName` in `assets/js/inventory-ui.js`; Settings render caching includes this label so brand edits refresh immediately. Labels remain escaped. Reset List is now named Reset.

Retained editor layout: Checklists and Tags share a row, selected tags appear right of search, Total Copies/pricing follow the row, then Notes. Bracketed Custom Properties descriptions are vertically centered. Checklist objects remain grouped by the existing house-location order; text entries remain first. Backups, optional sync, saved checks/reset and offline use remain intact.

Verification: **148 non-browser checks and 5 release browser flows passed**: Settings, desktop/mobile checklist labels, inventory/Notes offline smoke and checklist offline completion/reset. The final brand-refresh adjustment also passed both desktop/mobile checklist flows, including a changed brand containing HTML-like text. Diff checks passed. Preview server stopped.

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
