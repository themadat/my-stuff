# Current handoff

## State

Application version: **0.0.1.77**. Pending development batch adds a Footwear table view with right-aligned Color/Size/Weight columns before tag icons, color pills, and Type grouping when Footwear is the only filter. Footwear editor order is Type, Color, Size, Weight. Type containing “Running” adds a monthly Mileage editor; totals use green / yellow (300) / orange (400) / red (500). Logs live in the existing Mileage property as JSON, retaining normal backup/sync storage. All inventory rows show calendar age and a clickable monthly/yearly obtaining-price average; archived age ends at departure. Help updated. No version bump, release, commit or push.

Verification: 42 targeted non-browser checks passed (inventory, copies, details, static); existing inventory editor/archive flow and new Footwear desktop/mobile flow passed. Desktop screenshot checked; mobile heading visibility and page overflow asserted. Preview server stopped. Release-wide and offline checks remain for cut. Browser tests require sandbox escalation for Chromium on this Mac.

Earlier handoff mentioned pending 3D Print and tooling changes, but they were already clean in git at this task’s start. Older live sync-file and Notes-highlighting concerns remain unverified; investigate only if raised.

## Constraints

- Preserve unrelated edits: `tests/inventory-copies.test.mjs`, `tests/static.test.mjs`, and untracked `.claude/` predate this work. Only the Footwear property-order assertion in the copies test belongs to this batch. Recheck status before editing.
- Static, dependency-free runtime. No backend or required build step. Secrets stay device-local; preserve recovery-before-restore and explicit conflict choices.
- No commit/push without explicit authorization. Release batching does not relax cache/version alignment before publishing.
- Use targeted tests during development; full non-browser and relevant desktop/mobile/offline checks at release. Keep this file under 500 words.

## Useful pointers

- `assets/js/config.js`: identity, current version, locations/tags, Help/releases. Read relevant ranges only.
- `assets/js/inventory-ui.js`, `assets/css/app.css`: views, editors, location navigation/layout.
- `assets/js/core/inventory.js`: normalization, copies/sets, location grouping.
- `assets/js/core/smart-entry.js`, `bulk-import.js`: parsing.
- `tests/browser.test.mjs`: browser fixture and regression scenarios. New Add focuses `itemSmartEntry`; wait for that before filling controls.
- `docs/TESTING.md`: browser prerequisites. `node scripts/verify.mjs`: concise non-browser checks.

On this machine, Node is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; Playwright module is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Use these if not on PATH. Preview: `python3 -m http.server 8765 --bind 127.0.0.1`; stop after browser work.
