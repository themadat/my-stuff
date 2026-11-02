# Current handoff

## State

Release **0.0.1.114** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. No unfinished implementation work.

Parenthesized counts now work with bracketed totals even without a separate obtaining price: `Aqara - Camera (2) [400]` saves two copies at $200 each. Automatic inline counts select Total mode; explicit/manual counts retain their guards. Single-copy summaries use entered amounts and normal price/value fallback, preserve zero and distinct values, and refresh when fallback fills a field.

Item entry has tag group dropdowns from the existing catalog beside quick search on desktop, wrapping below it on mobile. Native details/checkbox controls support multi-selection, Escape, outside closing, and existing custom tags/presets. Dropdown selection clears a pending search fragment; selected tags and quick search stay synchronized. Menus and search suggestions avoid covering the group buttons and fit the modal. No storage schema changed.

Backpacking missing weights have red input borders for objects and non-object entries. The indicator updates while typing and after save/reload; zero is a known weight.

## Verification

193 non-browser checks passed. Seventeen relevant release browser flows passed: tag dropdowns/copy totals at 1440/390/320px (320px at 130% text); single-copy amounts at desktop/mobile; missing/zero Backpacking weights at desktop/mobile; existing single-copy editor, Backpacking editing/actual-bag flows, exact Robinhood/Aqara parsing, bulk copy totals, and service-worker offline reload. Tag tests were rerun after correcting their Settings cleanup for an already closed setup dialog. Desktop and enlarged mobile screenshots inspected. Diff whitespace passed. No real GitHub data changed. Preview stopped.

## Pointers and constraints

- Parser: assets/js/core/smart-entry.js, parenthesized copies and bracket-only totals.
- Editor: assets/js/inventory-ui.js, completeSmart(), fillMissingAmount()/renderPricing(), renderItemTagGroups()/positionItemTagPopup(), initChecklists() group controls.
- Backpacking: renderBackpacking() missing-weight attribute and inventory input listener.
- CSS: assets/css/app.css, item-tag-browse/menu and pack-weight rules.
- Tests: tests/smart-entry.test.mjs, tests/bulk-import.test.mjs, tests/browser.test.mjs.
- Release/cache surfaces aligned once with scripts/release.mjs. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs.
- Logs: /tmp/my-stuff-entry-pack-release-browser.log and /tmp/my-stuff-entry-tags-final.log. Non-browser: /var/folders/0b/9tnrd3bx12d0xymx11rpxgnr0000gn/T/my-stuff-check-BRZwjf/results.log.
- docs/DEVELOPMENT.md describes checks. Preserve local-first storage/recovery/import/sync/PWA. No commit/push without explicit instruction; stage only this batch's files.
