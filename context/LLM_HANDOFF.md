# Current handoff

## State

Release **0.0.1.103** prepared and verified, uncommitted/unpushed. Working tree was clean at task start.

Around the House outlines the currently filtered location button in white and exposes aria-current=location. Exact path filters select their matching zone/room/space; plain room filters select the room. Clearing filters removes the selection.

Press ; outside editable controls/dialogs to focus room search when the sidebar is available. The input advertises aria-keyshortcuts and the shortcut is listed in Settings. Semicolons typed in inputs remain normal text.

Header uses a compact flex row: Around the House and review percentage bottom-align, with reduced spacing before the search bar. The old independently sticky h2/margins are overridden to keep alignment correct.

Version/cache surfaces aligned once with scripts/release.mjs. No additional bump needed. No unfinished implementation work.

## Verification

165 non-browser checks passed. Five final browser flows passed: sidebar exact-path context-menu filtering; room search/shortcut/active-border/header geometry and Backpacking locations at 1440/390/320px; release cache/offline inventory, Notes and bag reload. Checks cover semicolon shortcut and typing, selected white outline/aria-current, clearing, bottom alignment, compact search gap, navigation and no overflow. Diff whitespace passed. Preview stopped.

## Constraints and pointers

- Static local-first, dependency-free; preserve inventory/Notes/settings/storage/recovery/backup/sync/PWA.
- Changes: assets/js/inventory-ui.js shortcut and selected location markup; assets/css/app.css compact header/outline; assets/js/config.js shortcut list; tests/browser.test.mjs room search flow.
- Release files also include index.html, both manifests, sw.js, .github/workflows/deploy-pages.yml.
- Room search filters navigation only and preserves collapse state when cleared; Enter opens first matching room, Escape clears. Backpacking object-and-notes cells show normalized zone/room/space.
- Backpacking has compact date/cost rows and immediate classification moves anchored to the next clicked field. Bag entries/checkmarks live in inventory.backpacking; object subcategories use existing custom properties. Checked items drive totals; Wear excluded from bag weight. Consumable/Wear/Luxury/Uncategorized have no targets. Cloud schema 8 protects bag data; bag-free states retain schema 7.
- Node: /Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node; sibling node_modules/playwright/index.mjs.
- Browser: PLAYWRIGHT_CHROMIUM_EXECUTABLE=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser. Local preview/browser require escalation.
- Workflow: docs/DEVELOPMENT.md. Do not commit/push without explicit request; stage only this batch's files.
