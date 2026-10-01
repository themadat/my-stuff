# Current handoff

## State

Release **0.0.1.91** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. Version/cache surfaces aligned once via scripts/release.mjs.

Ownership costs use current value for items less than one calendar year old in yearly mode, and less than one calendar month old in monthly mode, including same-day purchases. Each threshold is independent. After its threshold, the existing fractional ownership average uses obtaining price (falling back to value). Unknown values remain unavailable; zero remains zero. Combined copies sum current values separately from obtaining prices and keep the earliest-date age behavior. Archive summaries and cost tooltips describe the correct basis.

## Verification

158 non-browser checks passed. Desktop/mobile regressions passed at 1440/390px for yearly/monthly young-item costs and reload persistence. Existing Footwear age-cost desktop/mobile flow and service-worker offline reload passed. Diff whitespace check passed. Preview server stopped.

## Constraints and pointers

- User preference in AGENTS.md: always increment the build once per completed application batch and provide task-file-only commit/push commands at handoff. Do not execute commit/push without explicit request. Do not bump this release again.
- Static local-first, no runtime dependencies; preserve storage, recovery, backup/import, sync and PWA.
- Changed logic: assets/js/core/inventory.js (ownershipAge and ownershipSummary); assets/js/inventory-ui.js (ageCell and archive duration).
- Tests: tests/inventory-copies.test.mjs, tests/inventory-details.test.mjs and final tests in tests/browser.test.mjs.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
- Playwright: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. Chromium/local preview require sandbox escalation.
- Release commands: docs/DEVELOPMENT.md. Prepared release modifies config, index, manifests, sw and deployment workflow.
