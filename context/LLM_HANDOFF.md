# Current handoff

## State

Release **0.0.1.99** prepared and verified, uncommitted/unpushed. Working tree was clean at task start; previous release 0.0.1.98 was committed as f651844.

Backpacking now supports per-category inline non-object entries (name, date, price, weight, notes), editable directly in its table. New entries start checked. Objects and entries have bag checkboxes. All/Checked switches available rows; checked items alone drive bag/category counts and weights. Wear remains excluded from total bag weight, with an explicit short label when checked.

Categories show existing targets and signed green/red actual-minus-target differences. Consumable, Wear, Luxury and Uncategorized intentionally have no target (confirmed by user). Unknown weights mark totals/comparisons partial. Free-text Backpacking Subcategory sorts/groups options within each category. Text selection is strong yellow with dark text. The old explanatory Backpacking paragraph is removed.

Version/cache surfaces aligned once via scripts/release.mjs. No further bump needed. No unfinished implementation work.

## Verification

165 non-browser checks passed, including bag normalization, validation, full weight precision, backup/cloud round trips and merge conflicts. Five final browser flows passed: existing Backpacking inline editing; actual-bag/non-object flows at 1440/390/320px; release cache/offline inventory, Notes and bag entry/checkmark reload. Flows cover counts, target differences, draft retention, entry edits/removal, escaping, subcategory sorting and All/Checked. Desktop/mobile rows and mobile entry form screenshots inspected. Diff whitespace passed. Preview stopped.

## Constraints and pointers

- Static local-first, dependency-free; preserve storage/recovery/backup/sync/PWA.
- Bag data: inventory.backpacking {entries,checked}; stable object:/entry: keys. Entries stay separate from inventory.items. Object subcategory uses an existing custom property.
- Cloud payload uses schema 8 when bag data exists, protecting it from older clients; otherwise retains schema 7. Current client accepts both.
- Changes: assets/js/core/inventory.js, core/state.js, inventory-ui.js, assets/css/app.css; tests/inventory-details.test.mjs, sync.test.mjs, browser.test.mjs.
- Release surfaces: config.js, index.html, both manifests, sw.js, deploy-pages.yml.
- Runtime: /Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node; sibling node_modules/playwright/index.mjs.
- Browser: PLAYWRIGHT_CHROMIUM_EXECUTABLE=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser. Local preview/browser require escalation.
- Workflow: docs/DEVELOPMENT.md. Do not commit/push without explicit request; stage only this batch's files.
