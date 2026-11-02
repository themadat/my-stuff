# Current handoff

## State

Release **0.0.1.112** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. No unfinished implementation work.

Network Connection Type now includes **Matter (Wi-Fi)** and **Matter (Thread)**; Thread is no longer offered separately. Existing Thread tokens, including lowercase legacy values, normalize to Matter (Thread). Duplicate Thread/Matter (Thread) tokens collapse while preserving other known/custom connections. Normalization carries the rename through local load, backup/import and GitHub Sync without a schema change. Current Help lists the new names; historical release notes stay intact.

## Verification

190 non-browser checks passed. Five relevant release browser flows passed: Matter legacy-load migration, both types selected together, save/reload and sync payload at 1440/390px; existing Network toggle editor; Network/Smart Home grouping/sorting; service-worker offline inventory/Notes/Backpacking/Lifetime reload. Diff whitespace passed. No real GitHub data changed. Preview stopped.

## Pointers and constraints

- Options/current Help: assets/js/config.js, connectionTypes and inventory-details Help entry.
- Legacy alias and canonical property values: assets/js/core/inventory.js, normalizeItem()/connectionTypes().
- Tests: tests/inventory-details.test.mjs and tests/browser.test.mjs (Matter network types plus updated prior option/group expectations).
- Release/cache surfaces aligned once with scripts/release.mjs. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs.
- Browser log: /tmp/my-stuff-matter-release-browser.log. Non-browser log: /var/folders/0b/9tnrd3bx12d0xymx11rpxgnr0000gn/T/my-stuff-check-f1Lt2D/results.log.
- docs/DEVELOPMENT.md describes checks. Preserve local-first inventory/Notes/settings/storage/recovery/import/sync/PWA. No commit/push without explicit instruction; stage only this batch's files.
