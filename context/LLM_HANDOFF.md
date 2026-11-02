# Current handoff

## State

Release **0.0.1.113** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. No unfinished implementation work.

Smart Convert no longer adds payment-account details such as `Chase Prime: 89.81` or recognized account prefixes such as Robinhood to generated item descriptions. Multiple account/amount columns are ignored. Their source spans remain visible as plain text in Smart Convert without being highlighted as Notes destinations. Item prices, values, copy counts, unknown bracket notes and manually entered descriptions are preserved. Existing saved descriptions are not rewritten.

## Verification

191 non-browser checks passed. Eight relevant release browser flows passed: payment omission and ordinary/manual notes preservation at 1440/390px; exact Robinhood/Aqara four-copy line at desktop/mobile; existing Smart Add manual corrections; bulk Smart Complete; bulk inline copy count pause/resume and total preservation; service-worker offline inventory/Notes/Backpacking/Lifetime reload. Regression tests also cover multiple card columns and ordinary notes. Diff whitespace passed. No real GitHub data changed. Preview stopped.

## Pointers and constraints

- Parser: assets/js/core/smart-entry.js, ignored span metadata, payment/account extraction, generated notes filter, and household span forwarding.
- Preview: assets/js/inventory-ui.js, completeSmart() renders ignored spans as plain text.
- Tests: tests/smart-entry.test.mjs, tests/bulk-import.test.mjs, tests/browser.test.mjs. Prior expectations retaining payment details were updated.
- Release/cache surfaces aligned once with scripts/release.mjs. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs.
- Browser log: /tmp/my-stuff-payment-release-browser.log. Non-browser log: /var/folders/0b/9tnrd3bx12d0xymx11rpxgnr0000gn/T/my-stuff-check-imvG8y/results.log.
- docs/DEVELOPMENT.md describes checks. Preserve local-first inventory/Notes/settings/storage/recovery/import/sync/PWA. No commit/push without explicit instruction; stage only this batch's files.
