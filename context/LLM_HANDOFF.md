# Current handoff

## State

Release **0.0.1.84** is prepared and verified, uncommitted/unpushed. Version/cache surfaces were aligned once with `scripts/release.mjs`. No unfinished work.

Checklists and Reset List are grouped directly before All in quick actions, using the symbol-above-label layout. Golf now uses the user's supplied circular golfer symbol, distinct from the inventory Golfing category. Reset uses the supplied two-empty-circles symbol. Shared SVGs remain in `assets/js/icons.js`.

Checklist objects are grouped by existing inventory location paths (zone, room, space), in house-location order via `m.locationSections(items,true)`, then alphabetically within each location. Non-object text entries stay above all object groups. Unassigned objects form their own group.

Existing Volleyball/Golf/Swim checklist behavior is retained: hover/click/keyboard menu, object membership through the editor and Settings, text management in Settings → Checklists, persisted checkmarks, Reset List, backups, optional sync and offline use.

Verification: **148 non-browser checks passed**, plus desktop/mobile placement and location-order regressions, checklist offline completion/reset, Settings compatibility and inventory/Notes offline smoke. Final CSS adjustment passed all 3 checklist browser flows; the other 2 release browser flows already passed. Desktop/mobile screenshots inspected. Diff checks passed. Preview server stopped.

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
