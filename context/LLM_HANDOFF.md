# Current handoff

## State

Release **0.0.1.85** is prepared and verified, uncommitted/unpushed. Version/cache surfaces were aligned once with `scripts/release.mjs`. No unfinished work.

The object editor now puts Checklists and Tags in one grid row, with selected tag chips to the right of the search input. The reorder hint spans the tag area above search and chips. Total Copies and pricing controls immediately follow this row, then Notes. The old location/tags/notes row-combining step was removed so it cannot undo the requested editor structure. Bracketed Custom Properties preset descriptions use flex alignment to remain vertically centered in their buttons.

Checklist behavior remains unchanged: Volleyball/Golf/Swim, hover/click/keyboard quick menu directly before All, symbol-above-label actions, supplied Golf/Reset symbols, house-location object groups with text entries first, saved checkmarks and reset. Backups, optional sync and offline use retain checklist data.

Verification: **148 non-browser checks and 5 release browser flows passed**: editor save/tag/property/archive behavior, desktop/mobile checklists, existing inventory/Notes offline smoke, and checklist offline completion/reset. Final desktop/mobile editor screenshots inspected. Selected tags are beside search and copy totals follow the checklist/tag row. Diff checks passed. Preview server stopped.

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
