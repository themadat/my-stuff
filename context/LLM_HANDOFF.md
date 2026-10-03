# Current handoff

## State

Release **0.0.1.97** prepared and verified, uncommitted/unpushed. Working tree was clean at task start.

House-owned objects now appear first within each room/space location section in Have and Had. Brand/object order remains within each ownership group. Specialty views grouped by location retain house priority ahead of the chosen sort; type-grouped specialty views retain their existing sort.

Version/cache surfaces aligned once with scripts/release.mjs. No further bump is needed for this batch. No unfinished implementation work.

## Verification

163 non-browser checks passed. Three browser checks passed: ownership order on desktop (1440px) and mobile (390px), both Have/Had; release service-worker caching and offline inventory/Notes reload. Diff whitespace check passed. Preview server stopped.

## Constraints and pointers

- Static local-first, no runtime dependencies; preserve storage/recovery/backup/sync/PWA.
- Changes: assets/js/core/inventory.js ownership comparator; assets/js/inventory-ui.js row ordering; tests/inventory-details.test.mjs and tests/browser.test.mjs regressions.
- Release files: assets/js/config.js, index.html, manifest.webmanifest, manifest-dark.webmanifest, sw.js, .github/workflows/deploy-pages.yml.
- Node: /Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
- Playwright: /Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs
- Browser checks use PLAYWRIGHT_CHROMIUM_EXECUTABLE=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser; bundled browser is unavailable. Local preview/browser launch require escalation.
- Workflow: docs/DEVELOPMENT.md. Do not commit/push without explicit request; stage only this batch's files.
