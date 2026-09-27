# Current handoff

## State

Release **0.0.1.78** is prepared and verified, uncommitted/unpushed. Version, build, asset queries, manifests, service worker and deployment label are aligned with `scripts/release.mjs`. Release notes include the prior Footwear/age/mileage work whose build remained 0.0.1.77.

New work: Footwear has Stack Height and Drop after Weight, defaulting to mm. Stack Height accepts heel-to-toe pairs and combined input `31->25 | 6mm`; Drop works independently. Both columns sort numerically. Network is under Systems with the user-supplied SVG and a Connection Type dropdown (Wi-Fi 2.4 GHz, Wi-Fi 5.0 GHz, Ethernet, Inactive).

Copies in a row and linked copies/pieces now show one ownership summary: earliest obtained date and total obtaining cost, with annual/monthly toggle shared across linked rows within Have or Had. Unknown dates/costs remain unknown. Archived summaries end at the latest known departure. Fields use existing property/copy storage; backup/sync models are unchanged.

Verification: full non-browser suite **138 passed**; **7 distinct browser flows passed**, including desktop/mobile Footwear, geometry, Network persistence, copies/pieces, existing editor/archive/measurement behavior, and service-worker offline reload. Desktop/mobile geometry screenshots inspected. Updated stale test expectations for tag count and the existing unknown-date control. Diff checks passed. Local preview stopped.

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
