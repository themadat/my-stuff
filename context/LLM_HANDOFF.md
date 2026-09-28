# Current handoff

## State

Release **0.0.1.79** is prepared and verified, uncommitted/unpushed. Version, build, asset queries, manifests, service worker and deployment label were aligned once with `scripts/release.mjs`.

Network Connection Type now includes Zigbee, RF (433 MHz), RF (434 MHz), RF (915 MHz), Bluetooth and Thread. Network View has a sortable Connection Type column and connection grouping. Selecting the existing Smart group or its tags opens Smart Home View, grouped by the first Smart tag on each object; objects appear once.

Footwear, Network and Smart Home share a Group by selector for their unique grouping or Location. Sorting and grouping choices are independent per view for the session. Location sidebar jumps switch to Location grouping. Mixed categories, non-special categories and no filters use standard rows with compact symbols beside Count and more room for names/notes. Empty special results retain the view controls. Existing Footwear, copies, age/cost, archive and property storage behaviors remain intact. Help updated.

Verification: **140 non-browser checks passed**. **8 distinct browser flows passed**, including desktop/mobile special-view switches, mixed/cleared filters, sorting, expanded connection options, Footwear, grouped copies, editor/archive, navigation and service-worker offline reload. The older navigation regression was updated for existing Tech/Cables and filter-chip behavior. Desktop standard/Network screenshots inspected; mobile grouping controls and page width checked. Diff checks passed. Preview stopped.

The initial preview launch hit an automatic approval-review usage limit. User requested continue; the normal approval retry succeeded and browser/release checks completed.

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
