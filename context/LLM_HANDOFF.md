# Current handoff

## State

Release **0.0.1.102** prepared and verified, uncommitted/unpushed. Working tree was clean at task start.

Around the House has a compact Search rooms input. It filters only location navigation, matching case-insensitive zone/room/space paths, retaining parent branches and revealing matched descendants even when collapsed. Clearing restores the prior collapse state. Enter activates the first matching room using existing location navigation; Escape clears. An empty result shows No matching rooms. Inventory filters/data remain independent.

Backpacking object-and-notes cells show Location: zone › room › space, or Unknown Location. Non-object entries stay location-free. Labels are escaped; existing normalized location data is used.

Version/cache surfaces aligned once with scripts/release.mjs. No additional bump needed. No unfinished implementation work.

## Verification

165 non-browser checks passed. Eleven browser flows verified: new room search and Backpacking full location labels at 1440/390/320px; existing Backpacking editing, bag/entries and classification/focus flows; release cache/offline inventory, Notes and bag reload. New checks cover case-insensitive search, collapsed matches, clearing, no results, Enter navigation, unchanged inventory results, known zone/room/space, unknown location and no overflow. The final location fixture uses the configured Office Desk space (invalid custom spaces are normalized away). Diff whitespace passed. Preview stopped.

## Constraints and pointers

- Static local-first, dependency-free; preserve inventory/Notes/settings/storage/recovery/backup/sync/PWA.
- Changes: assets/js/inventory-ui.js roomSearch handlers, renderLocationNavigation filtering and packObjectCell location label; assets/css/app.css room-search/pack-object-location; tests/browser.test.mjs.
- Release files: assets/js/config.js, index.html, both manifests, sw.js, .github/workflows/deploy-pages.yml.
- Room search is session UI only; lastLocationSections supplies the navigation-only redraw.
- Backpacking remains compact with date/cost and immediate classification moves anchored to the next clicked field. Bag data uses inventory.backpacking {entries,checked}; existing custom property stores object subcategory. Checked items drive totals; Wear excluded from bag weight. Consumable/Wear/Luxury/Uncategorized have no targets.
- Cloud schema 8 protects bag data; states without bags retain schema 7.
- Node: /Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node; sibling node_modules/playwright/index.mjs.
- Browser: PLAYWRIGHT_CHROMIUM_EXECUTABLE=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser. Local preview/browser require escalation.
- Workflow: docs/DEVELOPMENT.md. Do not commit/push without explicit request; stage only this batch's files.
