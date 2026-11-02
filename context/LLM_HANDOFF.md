# Current handoff

## State

Release **0.0.1.111** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. No unfinished implementation work.

Smart Add correctly parses `2026-10-08 ($606.17) Robinhood Aqara - Camera Hub G5 Pro, Wi-Fi, White (4) [200] [O]`: date 2026-10-08, obtaining price 606.17, current value 200, four copies, seller/brand Aqara, clean camera name, Robinhood in Notes. [O] remains excluded. Robinhood is configured as a payment account; Aqara is in known brands. Trailing parenthesized copy counts are recognized only on priced purchase lines, bounded to 1–100; model years and other parentheses stay intact.

Manual copy edits survive Smart Add updates. Generated copy controls and pricing refresh when automatic counts change. Bulk inline counts create grouped review rows in Total mode and survive pause/resume. Explicit spreadsheet quantity and per-object amounts retain precedence, including mixed inline-total/explicit amounts. Saving four cameras keeps total cost $606.17 and total value $200, allocated exactly to cents.

Camera is available in the Smart group with the user's supplied SVG through shared icons. Existing Smart group/filter/view behavior is retained.

## Verification

189 non-browser checks passed. Eight relevant browser flows passed: exact Aqara line/copies/manual corrections/Camera menu and icon at 1440/390px, bulk inline count pause/resume and total preservation, existing Smart Add corrections/escaping, bulk Smart Complete, Smart category ordering and service-worker offline reload. One old browser assertion expected [O] in Notes; corrected to established marker-removal behavior and rerun successfully. Diff whitespace passed. No real GitHub data changed. Preview stopped.

## Pointers and constraints

- Parser: assets/js/core/smart-entry.js, trailing copy-count/payment-account handling.
- UI copy destination/manual guards: assets/js/inventory-ui.js, smartLabels/completeSmart.
- Bulk totals and explicit columns: assets/js/core/bulk-import.js, prepare().
- Camera/Aqara/Robinhood configuration: assets/js/config.js. Supplied SVG/shared mapping: assets/js/icons.js.
- Tests: tests/smart-entry.test.mjs, tests/bulk-import.test.mjs, tests/browser.test.mjs.
- Release/cache surfaces aligned once with scripts/release.mjs. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs.
- Logs: /tmp/my-stuff-camera-release-browser.log and /tmp/my-stuff-camera-manual-recheck.log. Non-browser log: /var/folders/0b/9tnrd3bx12d0xymx11rpxgnr0000gn/T/my-stuff-check-jnrZuW/results.log.
- docs/DEVELOPMENT.md describes checks. Preserve local-first storage/recovery/import/sync/PWA. No commit/push without explicit instruction; stage only this batch's files.
