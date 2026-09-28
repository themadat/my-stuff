# Current handoff

## State

Release **0.0.1.82** is prepared and verified, uncommitted/unpushed. All version/cache surfaces aligned once with `scripts/release.mjs`.

Conveyed is recognized case-insensitively as a word, bracketed marker, or explicit acquisition method. Smart entry, household exports, mapped bulk imports and item saves set owner to House and acquisition to Conveyed. Existing defaults remain: price zero and obtained date 2020-12-17. The marker is removed from other saved item fields, preserving surrounding text. Original bulk source text is retained for review. Selecting Conveyed in the editor also selects House. Grouped current copies inherit Conveyed ownership and cleanup when saved.

The shared helper is `App.smartEntry.conveyedFields`; bulk cleanup runs after mapped fields so mapped owner cannot override Conveyed. Current stored data is not migrated wholesale; cleanup applies through parsing/saving.

Verification: **143 non-browser checks and 5 browser flows passed**, covering plain/bracketed/annotated and mapped Conveyed, household Have/Had exports, desktop/mobile saves, grouped copies, bulk review and offline reload. Diff checks passed. Preview server stopped. No unfinished work.

Previous release 81 provides compact multi-select Network connections (including RF brand labels, BLE/UWB/NFC), Group by before Matching, and shared tag editing across grouped copies/pieces.

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
