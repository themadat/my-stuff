# Current handoff

## State

Release **0.0.1.109** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. No unfinished implementation work.

Clicking Sync Needs Attention or using Sync Now opens a comparison above first-sync/conflict choices. Changed fields show This Device and GitHub values; content present on one side is explicit. Inventory and Lifetime records match by ID; order changes are shown. Notes, checklist and other synced content are included. Legacy omitted sections preserve local content in comparisons, matching actual downloads. Missing GitHub files explain creation. Device settings and credentials are excluded.

Comparison text uses safe DOM text, preserves line breaks and wraps long values. Desktop pairs values side by side; mobile stacks labelled values. Focus starts at the comparison heading. Changing saved content during review blocks the choice and asks for a fresh sync comparison.

## Verification

184 non-browser checks passed. Nine relevant browser flows passed: new diff at 1440/390/320px; desktop/mobile Settings; first-sync choices; upload/restore/export; recovery failure and overwrite; service-worker offline inventory/Notes/Backpacking/Lifetime reload. The upload test's stale schema-7 expectation was updated for existing schema-9 Lifetime data and rerun successfully. Diff whitespace passed. No real GitHub data changed. Preview stopped.

## Pointers and constraints

- Diff generation/review guard: assets/js/core/sync.js, comparison() and syncNow().
- Safe comparison UI: assets/js/core/components.js, index.html, assets/css/app.css.
- Regression tests: tests/sync.test.mjs and tests/browser.test.mjs.
- Build/cache surfaces aligned once using scripts/release.mjs. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs.
- Logs: /tmp/my-stuff-sync-release-browser.log (8 passed, one stale expectation), /tmp/my-stuff-sync-upload-browser.log (corrected check passed); full non-browser log: /var/folders/0b/9tnrd3bx12d0xymx11rpxgnr0000gn/T/my-stuff-check-YHAkjS/results.log.
- docs/DEVELOPMENT.md describes checks. Preserve local-first storage/recovery/import/sync/PWA. No commit/push without explicit instruction; stage only this batch's files.
