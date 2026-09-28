# Current handoff

## State

Release **0.0.1.80** is prepared and verified, uncommitted/unpushed. Version, build, asset queries, manifests, service worker and deployment label were aligned once with `scripts/release.mjs`.

Add and Bulk Add now use tighter section spacing. Obtaining Price and Current Value labels match Date Obtained at .75rem. Property-set buttons show `+ Name [Property,Property]` on one line, aligned with Size and Color; applied sets retain the remove icon. Long property lists ellipsize on narrow screens with full text in the accessible description and tooltip.

Bulk preview entries are one line. The top per-item review container is a compact, keyboard-accessible Details disclosure: suggestions shorten visually; warning and duplicate counts remain visible; expanding reveals full suggestions, notices, copy count and Original Row. Save/pause/review behavior and stored data are unchanged. Help updated.

Verification: **140 non-browser checks passed** and **7 browser flows passed**, covering editor/archive, property controls, bulk disclosure/source/duplicate notices, desktop and 320px/130% text, geometry/Network, offline bulk saving and service-worker offline reload. Desktop/mobile screenshots inspected; diff checks passed. Preview server stopped.

## Constraints and user preferences

- User deploys by pushing `main`. Increment the four-part build once per completed application batch and run release checks before supplying deployment commands.
- After every completed-work summary include `git add .`, a `Version - Description` commit subject, and `git push origin main`. User explicitly prefers staging everything. Provide commands; do not execute commit/push unless requested.
- Runtime stays static and dependency-free. Preserve backup, sync, recovery and local storage.
- Working tree was clean at this batch’s start. Keep this handoff under 500 words.

## Useful pointers

- `assets/js/config.js`: identity, current version, locations/tags, Help/releases. Read relevant ranges only.
- `assets/js/inventory-ui.js`, `assets/css/app.css`: views, editors, location navigation/layout.
- `assets/js/core/inventory.js`: normalization, copies/sets, location grouping.
- `assets/js/core/smart-entry.js`, `bulk-import.js`: parsing.
- `tests/browser.test.mjs`: browser fixture and regression scenarios. New Add focuses `itemSmartEntry`; wait for that before filling controls.
- `docs/TESTING.md`: browser prerequisites. `node scripts/verify.mjs`: concise non-browser checks.

On this machine, Node is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; Playwright module is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Use these if not on PATH. Preview: `python3 -m http.server 8765 --bind 127.0.0.1`; stop after browser work.
