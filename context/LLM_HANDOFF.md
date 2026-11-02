# Current handoff

## State

Release **0.0.1.115** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. No unfinished implementation work.

Add/Edit now fills the available viewport in both dimensions, with a scrolling body between the header and footer. Lifetime uses a one-click Object/Consumable toggle and an adjacent category dropdown. Existing categories, Not included and New category remain available; a new category's name appears in the control while typed. Hidden fields retain the same editor/draft values; no storage schema changed. Consumables require a category before any save or conversion confirmation.

Lifetime categories and item tag groups share hover/click behavior: hover opens, click pins, another click closes, and Escape/outside click closes. Touch toggles without relying on hover. Keyboard focus and menu positioning are preserved. Controls remain side by side at 320px/130% text; narrow-screen category text uses compact readable controls.

## Verification

193 non-browser checks and 16 relevant release browser flows passed. Coverage includes full viewport sizing at 1920/390/320px, 320px at 130% text, mouse hover/pinning, real touch toggles, category/type persistence, new category labels and escaping, required category validation, existing Lifetime object/consumable saves and conversion recovery, bulk pause/resume, tag selection/search/Escape, single-copy editor, wide item form and service-worker offline reload. Desktop and enlarged mobile screenshots inspected. Diff whitespace passed. No real GitHub data changed. Preview stopped.

## Pointers and constraints

- Editor: assets/js/inventory-ui.js, initItemMenu(), positionItemTagPopup(), initChecklists() Lifetime controls, syncItemLifetime(), openItem()/saveItem().
- CSS: assets/css/app.css, item-lifetime-controls/menu plus final #itemDialog viewport rules.
- Tests: tests/browser.test.mjs. Lifetime helpers now operate the toggle and category menu instead of native selects.
- Release/cache surfaces aligned once with scripts/release.mjs. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs.
- Browser log: /tmp/my-stuff-full-add-release-browser.log. Non-browser log: /var/folders/0b/9tnrd3bx12d0xymx11rpxgnr0000gn/T/my-stuff-check-lAHduD/results.log.
- Screenshots: /tmp/my-stuff-full-add-lifetime-{1920,320}.png and /tmp/my-stuff-full-add-tags-{1920,320}.png.
- docs/DEVELOPMENT.md describes checks. Preserve local-first storage/recovery/import/sync/PWA. No commit/push without explicit instruction; stage only this batch's files.
