# Current handoff

## State

Release **0.0.1.81** is prepared and verified, uncommitted/unpushed. Version, build, asset queries, manifests, service worker and deployment label were aligned once with `scripts/release.mjs`.

Network Connection Type uses compact multi-select toggle buttons. RF labels show TempPro (433 MHz), Lutron (434 MHz), Tempest (915 MHz). BLE, UWB and NFC are available. Existing single connections and unknown legacy values remain editable; multiple connections use a pipe-separated property string in the existing storage model. Network View groups devices once by their canonical combined connections, preserving totals.

Group by is now before Matching in the selected category strip and also available when special views are opened through instant filters. Existing view sorting/location behavior remains.

The item editor shows the union of tags across current grouped copies or linked pieces. Saving applies the chosen tags to each member; archived items remain separate. Existing location-derived Float and brand rules remain.

Verification: **141 non-browser checks and 7 browser flows passed**, covering desktop/mobile Network selections, all special views, grouped-copy and named-piece tag add/remove, editor/archive, bulk review, quick categories and offline service-worker reload. Desktop and 320px screenshots inspected; no horizontal overflow. Diff checks passed. No unfinished work.

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
