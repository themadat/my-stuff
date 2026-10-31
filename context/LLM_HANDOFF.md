# Current handoff

## State

Release **0.0.1.107** prepared and verified, uncommitted/unpushed. Working tree was clean at task start; 0.0.1.106 had been committed. No unfinished implementation work.

Settings → Show What’s New toggles release announcements and their unread dot. Default is on; off persists on reload, cancels the active dismissal timer, and disables the dismissal-seconds input. Version-button release history remains accessible. This device preference survives backups and cloud replacement but is excluded from cloud content; resetting preferences enables it again.

Lifetime retains the infinity toolbar symbol; its 3D Printer dropdown option now reuses category3DPrint, which exactly matches the user's supplied SVG. Other saved categories retain the infinity icon.

Inventory totals now display All, Filter and Convey. Acquisition choices and object rows display Convey too; stored acquisition values remain Conveyed, preserving import, sync, special defaults, filtering and existing data attributes.

## Verification

180 non-browser checks passed. Fourteen release browser flows passed (one after fixing stale test assumptions): What’s New toggle and persistence at 1440/390/320px, Lifetime sizing/dropdown/icon at those widths, desktop/mobile Settings, offline inventory/Notes/Backpacking/Lifetime reload, inventory detail filtering/totals, Convey acquisition defaults/shared-copy display, and desktop/mobile House totals. Existing tests were corrected to select the intended Bag/Lamp records explicitly and assert current table headers rather than obsolete layout/order. Diff whitespace passed. Preview stopped. Browser requests mocked; no real GitHub data changed.

## Pointers and constraints

- Runtime: assets/js/app.js, assets/js/core/state.js, assets/js/inventory-ui.js, assets/js/lifetime-ui.js, assets/css/app.css, index.html.
- Tests: tests/browser.test.mjs, tests/sync.test.mjs.
- Release surfaces aligned once with scripts/release.mjs. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs.
- docs/DEVELOPMENT.md describes checks. Preserve local-first inventory/Notes/settings/storage/recovery/import/sync/PWA. No commits or pushes without explicit instruction; stage only this batch's files.
