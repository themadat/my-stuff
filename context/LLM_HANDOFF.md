# Current handoff

## State

Backpacking release **0.0.1.89** prepared and verified, uncommitted/unpushed. Version/cache surfaces aligned once with `scripts/release.mjs`. Working tree was clean at task start; current changes belong to this task.

Select the Backpacking tag/filter to open its specialized view. Each physical inventory copy has its own row with editable weight in ounces, both oz/lb displayed together, category selector and colored weight-level selector. Click the item name to open its existing editor. Data uses existing Weight, Backpacking Category and Weight Level properties, preserving normal storage/backup/sync paths.

Categories, in order: Consumable, Wear, Equipment (6 lb target), Emergency (1), Food/Water (1), Clothing (2), Other (1), Luxury; unassigned items appear under Uncategorized. Category totals and targets are displayed. Total Pack Weight reflects shown/filtered items. User explicitly confirmed excluding Wear while including Consumable and Food/Water. Missing/invalid weights are flagged as partial totals. Units oz/lb/g/kg and supported fractions convert without changing stored source weights until edited. Weight levels: Ultralight yellow, Middleweight yellow-orange, Heavy orange, Cold blue.

## Verification

157 non-browser checks and 4 release browser flows passed: Backpacking edits/persistence at desktop and 390/320px, Footwear sorting, Network/Smart views and service-worker offline reload. Preview server stopped. Diff whitespace check passed. User requested commit/push commands; commands provided for task files only.

## Constraints and pointers

- Static local-first, no runtime dependencies. Preserve unrelated edits, inventory, Notes, Settings, storage/recovery, sync and PWA.
- Do not commit or push without explicit instruction. Batch one build increment via `scripts/release.mjs` when cutting/publishing.
- Core helpers: `assets/js/core/inventory.js` (`packCategories`, `packLevels`, `packCategory`, `weightOunces`, `packTotal`). UI: `assets/js/inventory-ui.js` (`renderBackpacking` and `data-pack-property` handler). Styles at end of `assets/css/app.css`.
- Tests: `tests/inventory-details.test.mjs` and Backpacking browser test at end of `tests/browser.test.mjs`.
- Runtime: `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.
- Playwright module: sibling `../node_modules/playwright/index.mjs`; bundled Chromium works with sandbox escalation. `docs/DEVELOPMENT.md` has verification/release commands.
