# Current handoff

## State

Release **0.0.1.101** prepared and verified, uncommitted/unpushed. Working tree was clean at task start.

Backpacking rows now have compact Weight and Weight Level columns, consistently sized controls, and pound conversion beside the ounce input (no repeated ounces). Category/Subcategory stay on one line. Date and obtaining Cost are shown for objects, editable for non-object entries. Non-object name/notes occupy one compact object cell; Notes remain multiline-capable with a one-line default height. Desktop add forms use one horizontal row; mobile adapts without overflow.

Classification edits regroup rows immediately. Redraw waits for pointer release/keyboard focus to settle, restores the next field and caret with preventScroll, and anchors that field to its original screen position. If the changed control is still focused, redraw retains scroll rather than chasing the moved item. Add-form drafts/focus are also preserved. A rendering guard prevents duplicate blur saves from re-entering a redraw.

Version/cache surfaces aligned once with scripts/release.mjs. No additional bump needed. No unfinished implementation work.

## Verification

165 non-browser checks passed. Eight final browser flows passed: Backpacking inline editing and row geometry/date/cost; actual-bag/non-object flows at 1440/390/320px; immediate-classification/focus/visible-position flows at those widths; release cache/offline inventory, Notes and bag reload. Flows cover immediate subgroup/category moves, focus in another row and add form, compact non-object rows, same-height controls, inline pound conversion, no overflow and persistence. Desktop/mobile row and entry-form screenshots inspected. Diff whitespace passed. Preview stopped.

## Constraints and pointers

- Static local-first, dependency-free; preserve inventory/Notes/settings/storage/recovery/backup/sync/PWA.
- Changes: assets/js/inventory-ui.js pack rendering/regroupBackpacking and event guards; assets/css/app.css compact rows/forms; tests/browser.test.mjs.
- Release files: assets/js/config.js, index.html, both manifests, sw.js, .github/workflows/deploy-pages.yml.
- Bag data: inventory.backpacking {entries,checked}; object:/entry: keys. Subcategory uses existing Backpacking Subcategory property. Checked items drive totals; Wear excluded from bag weight. Consumable/Wear/Luxury/Uncategorized intentionally have no targets.
- Cloud schema 8 protects bag data; states without bags retain schema 7.
- Node: /Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node; sibling node_modules/playwright/index.mjs.
- Browser: PLAYWRIGHT_CHROMIUM_EXECUTABLE=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser. Local preview/browser require escalation.
- Workflow: docs/DEVELOPMENT.md. Do not commit/push without explicit request; stage only this batch's files.
