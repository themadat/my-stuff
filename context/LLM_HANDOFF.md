# Current handoff

## State

Release **0.0.1.94** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. Version/cache surfaces aligned once via scripts/release.mjs.

Unknown Location now appears first in location-grouped object tables in Have and Had, matching Around the House. locationSections checks unknown versus known paths before configured zone ordering. Configured zones and their room/space ordering remain intact. Existing special views that group by type retain their grouping.

## Verification

161 non-browser checks passed. Desktop/mobile table-order regressions passed at 1440/390px in Have and Had, including search results. Service-worker offline smoke check passed. Diff whitespace check passed. Preview server stopped.

## Constraints and pointers

- User preference in AGENTS.md: increment the build once per completed app batch and provide task-file-only commit/push commands. Do not execute commit/push without explicit request. Do not bump this release again.
- Static local-first, no runtime dependencies; preserve existing storage/recovery/backup/sync/PWA behavior.
- Changed logic: assets/js/core/inventory.js (locationSections comparator).
- Tests: tests/inventory-details.test.mjs and final desktop/mobile tests in tests/browser.test.mjs.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
- Playwright: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. Chromium/local preview require sandbox escalation.
- Release commands: docs/DEVELOPMENT.md. Release also updates config, index, manifests, sw and deployment workflow.
