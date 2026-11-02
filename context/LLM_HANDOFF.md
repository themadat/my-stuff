# Current state

Build 0.0.1.118 is prepared, verified, and uncommitted. Removed the object Lifetime helper text (“Choose a category to include the obtaining price in Lifetime.”). Consumable guidance still appears for consumables. Checklists now stretches to match Lifetime's height in their shared row. Tags remains below.

Verification: all 193 non-browser tests and 4 browser checks passed (editor at 1920, 390, and 320 pixels with equal-height assertions, plus service-worker offline reload). `git diff --check` passed. Preview server stopped. Version/cache surfaces aligned once with `scripts/release.mjs`. No commit or push performed.

# Constraints and pointers

Static local-first app; no runtime dependencies or required build. Preserve storage, recovery/import, optional GitHub Sync and PWA behavior. Follow AGENTS.md. Do not commit/push without explicit request.

Connection choices and Help: `assets/js/config.js`. Network normalization: `assets/js/core/inventory.js`. Tests: `tests/inventory-details.test.mjs`, `tests/browser.test.mjs`. Verification and release commands: `docs/DEVELOPMENT.md`.

Node runtime: `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. Playwright module: `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Browser checks need local preview on port 8765 and escalation for localhost/Chromium in this environment.

No unfinished implementation work.
