# Current state

Build 0.0.1.117 is prepared, verified, and uncommitted. Checklists and Lifetime share a horizontal row in the object editor at all widths; Tags occupies its own full-width row below. Existing desktop/mobile editor tests assert section alignment and Tags placement at 1920, 390, and 320 pixels (including enlarged text).

Prior uncommitted build 0.0.1.116 changes are preserved: Infrared (IR) Network choice, current Help update, and save/reload browser coverage.

Verification: all 193 non-browser tests and 4 browser checks passed (three editor sizes and service-worker offline reload). `git diff --check` passed. Preview server stopped. No commit or push performed.

# Constraints and pointers

Static local-first app; no runtime dependencies or required build. Preserve storage, recovery/import, optional GitHub Sync and PWA behavior. Follow AGENTS.md. Do not commit/push without explicit request.

Connection choices and Help: `assets/js/config.js`. Network normalization: `assets/js/core/inventory.js`. Tests: `tests/inventory-details.test.mjs`, `tests/browser.test.mjs`. Verification and release commands: `docs/DEVELOPMENT.md`.

Node runtime: `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. Playwright module: `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Browser checks need local preview on port 8765 and escalation for localhost/Chromium in this environment.

No unfinished implementation work.
