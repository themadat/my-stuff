# Current handoff

## State

Application version: **0.0.1.77**. The initial Footwear/age/mileage implementation is now in the clean baseline (working tree was clean when this follow-up began).

Pending follow-up: yearly cost is now the default under Age; clicking toggles monthly/yearly. Shoe color pills preserve exact color/shade names, then scan words from the end, so “Blue Lagoon Bristol Blue” uses blue. Footwear column headers toggle ascending/descending sorting within Type/location groups, with a mobile selector. Sorting handles natural numeric sizes, weight-unit conversion, copy counts, combined values, dates and ages; missing values stay last. Numeric weight labels show two decimals without changing stored values. Help updated.

Verification: 13 targeted non-browser checks passed (inventory-details and static); 3 desktop/mobile browser flows passed (existing inventory editor/archive, Footwear/mileage/age/color/weight, and sorting). Diff checks passed. Preview server stopped. No version bump, commit, push or release in this follow-up. Full release/offline checks remain for cut.

## Constraints

- Static, dependency-free runtime. Preserve backup, sync, recovery and local storage behavior.
- No commit/push without explicit authorization. Version/cache alignment remains mandatory before publishing.
- Current changes belong to this follow-up; no unrelated working-tree edits were present at start.
- Handoff stays under 500 words. Use targeted checks during development; full suite and relevant browser/offline checks at release.

## Useful pointers

- `assets/js/config.js`: identity, current version, locations/tags, Help/releases. Read relevant ranges only.
- `assets/js/inventory-ui.js`, `assets/css/app.css`: views, editors, location navigation/layout.
- `assets/js/core/inventory.js`: normalization, copies/sets, location grouping.
- `assets/js/core/smart-entry.js`, `bulk-import.js`: parsing.
- `tests/browser.test.mjs`: browser fixture and regression scenarios. New Add focuses `itemSmartEntry`; wait for that before filling controls.
- `docs/TESTING.md`: browser prerequisites. `node scripts/verify.mjs`: concise non-browser checks.

On this machine, Node is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; Playwright module is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Use these if not on PATH. Preview: `python3 -m http.server 8765 --bind 127.0.0.1`; stop after browser work.
