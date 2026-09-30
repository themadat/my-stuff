# Current handoff

## State

Release **0.0.1.87** is prepared and verified, uncommitted/unpushed. Version/cache surfaces were aligned once with `scripts/release.mjs`. No unfinished work.

Notes/Description now shares the Zone/Room/Space row on desktop and mobile. Checklists and Tags still share the next row, with selected tags to the right of search; Total Copies/pricing follow it. Bracketed Custom Properties descriptions remain vertically centered.

Single-copy items hide the numbered per-copy containers and named-piece choice. Increasing count above one reveals the copy UI. Hidden single-copy save data uses primary location/notes/date/color/size/value fields, retaining any named-piece metadata needed for existing one-piece sets. Copy controls may remain in hidden DOM for serialization, but no numbered container is displayed. Multi-copy and named-set editing remain intact.

Prior checklist behavior retained: Checklists tab below Inventory; brand names in object labels and immediate label refresh after brand edits; Reset label; house-location object groups with text entries first; saved checks, backup/sync and offline use.

Verification: **148 non-browser checks and 8 release browser flows passed**, covering desktop/mobile single-copy visibility, location/notes saves, normal inventory editing, multi-copy/named-piece flows, grouped tags, inventory/Notes offline smoke and checklist offline use. Final desktop/mobile screenshots inspected. Diff checks passed. Preview server stopped.

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
