# Current handoff

## State

Release **0.0.1.92** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. Version/cache surfaces aligned once via scripts/release.mjs.

Travel and RoadTrip added alongside Volleyball, Golf and Swim. User-supplied airplane/car SVG paths live in shared assets/js/icons.js symbols checklistTravel/checklistRoadTrip. Both lists appear in the item editor, checklist menu and Checklists settings. Existing membership, text entries, completion, reset, storage, backup, sync and offline flows apply. Storage keys are travel and roadtrip. Older data gets empty new lists on normalization; existing lists stay intact. Older app builds do not recognize the new keys, so update devices before syncing new checklist contents.

## Verification

159 non-browser checks passed. Desktop/mobile Travel/RoadTrip flows passed at 1440/390px (objects, text, completion, reset, persistence and safe text). Offline completion/reset/reload passed for Swim, Travel and RoadTrip; service-worker release smoke check passed. Diff whitespace check passed. Preview server stopped.

## Constraints and pointers

- User preference in AGENTS.md: increment build once per completed app batch and provide task-file-only commit/push commands. Do not execute commit/push without explicit request. Do not bump this release again.
- Static local-first, no runtime dependencies; preserve existing data, recovery, backup/import, sync and PWA.
- Changed logic: assets/js/core/inventory.js (normalizeChecklists), assets/js/inventory-ui.js (checklistNames), assets/js/icons.js.
- Tests: tests/checklists.test.mjs and Travel/RoadTrip/offline checklist flows in tests/browser.test.mjs.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
- Playwright: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. Chromium/local preview require sandbox escalation.
- Release commands: docs/DEVELOPMENT.md. Release also modifies config, index, manifests, sw and deployment workflow.
