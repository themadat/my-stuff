# Current handoff

## State

Release **0.0.1.83** is prepared and verified, uncommitted/unpushed. Version/cache surfaces were aligned once with `scripts/release.mjs`. No unfinished work.

Checklists quick action appears before All, with Volleyball, Golf and Swim. The supplied checklist and sport symbols are shared SVG assets (Golf reuses its existing supplied symbol). The menu supports hover, click/touch, keyboard ArrowDown and Escape. Selected checklist views show text items first, then inventory objects, with saved checkboxes and a Reset List action immediately before Checklists. All and normal navigation exit checklist mode.

Settings → Checklists adds/removes text items and chooses object membership. Object editor checklist choices apply to saved objects/copies. Membership uses stable item IDs; deleting objects removes stale membership and completion. Archived members retain access. Checklist content and completion live in inventory, survive JSON backup/cloud payloads and work offline. Conflicting cloud checklist versions use the existing explicit copy-choice flow.

Verification: **148 non-browser checks and 6 relevant browser flows passed** (desktop/mobile checklists, editor/Settings compatibility, existing inventory/Notes offline smoke and checklist offline completion/reset). Final checklist navigation changes also passed the 3 checklist browser flows. Diff checks passed. Preview server stopped.

## Constraints and user preferences

- Static, local-first, runtime dependency-free. Preserve Notes, Settings, storage, recovery, backup/import, optional sync and PWA.
- User deploys by pushing main. Release one application batch once; do not commit or push unless explicitly requested.
- At release handoff provide staging, `Version - Description` commit and push commands. Working tree was clean at this batch’s start; every current change belongs to this task.
- Keep this handoff under 500 words. Git and release notes retain history.

## Useful pointers

- `assets/js/inventory-ui.js`: checklist menu, views, Settings controls and object editor membership.
- `assets/js/core/inventory.js`: checklist validation, deleted-reference cleanup and merge conflict handling.
- `assets/js/core/state.js`: Checklists support tab; inventory already participates in backups and cloud sync.
- `tests/checklists.test.mjs`, `tests/browser.test.mjs`: normalization, backup/sync and browser regressions.
- `docs/DEVELOPMENT.md`, `docs/TESTING.md`: release and testing commands.
- Node: `/Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. System `/usr/local/bin/node` is too old for Node test flags.
- Playwright: `/Users/adamlauer/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Set `PLAYWRIGHT_MODULE` to this and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`. Isolated headless browser and local preview require sandbox escalation here.
