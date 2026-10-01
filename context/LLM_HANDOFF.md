# Current handoff

## State

Release **0.0.1.93** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. Version/cache surfaces aligned once via scripts/release.mjs.

Dimensions added to Common Properties after Color, with an Add Dimensions button immediately after Color in the item editor. Clicking again focuses the existing Dimensions value instead of duplicating the property. It has no unit control and measurement parsing preserves the entire entered text. Uses existing property storage, catalog, backup and sync paths.

User clarified that “Put UNKNOWN at the top” refers to Unknown Location in Around the House, not Dimensions suggestions. Unknown Location now sorts before configured zones in the location sidebar. Other zones retain their configured order. It appears when the existing result set includes objects without locations; no new empty unknown node was introduced.

## Verification

160 non-browser checks passed. Desktop/mobile Dimensions regressions passed at 1440/390px: button order, no unit, focus/reuse, value persistence and Unknown Location first before/after search. Service-worker offline smoke check passed. Diff whitespace check passed. Preview server stopped.

## Constraints and pointers

- User preference in AGENTS.md: increment the build once per completed app batch and provide task-file-only commit/push commands. Do not execute commit/push without explicit request. Do not bump this release again.
- Static local-first, no runtime dependencies; preserve storage/recovery/backup/sync/PWA behavior.
- Changed logic: assets/js/config.js (commonProperties); assets/js/inventory-ui.js (Dimensions control, unitless properties and location ranking); assets/js/core/inventory.js (measurement).
- Tests: tests/inventory-details.test.mjs and last desktop/mobile tests in tests/browser.test.mjs.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
- Playwright: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. Chromium/local preview require sandbox escalation.
- Release commands: docs/DEVELOPMENT.md. Release also updates index, manifests, sw and deployment workflow.
