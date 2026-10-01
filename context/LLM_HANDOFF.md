# Current handoff

## State

Release **0.0.1.96** prepared and verified, uncommitted/unpushed. Prior 0.0.1.95 Seller→Brand work was still uncommitted at task start and is preserved. Version/cache surfaces aligned once for this batch via scripts/release.mjs; commit/push commands include both pending batches' files.

- Object name, Seller and ownership edits now apply to all current copies in the editor, alongside changed Brand. Archived edits remain individual. Other per-copy properties are preserved.
- House ownership card shows Everything, Conveyed, New, Filtered. Conveyed/New report counts and known current values for the full House inventory in the current Have/Had view. New means acquisition method is anything except Conveyed, including Gift, Inherited and unknown. Search affects Filtered only. Existing expansion/collapse behavior is retained.
- Mobile checklist button supports tap open/close, keeps the menu open during touch interaction, selects lists by tap and dismisses outside. Desktop hover/keyboard behavior is preserved.
- Prior pending work: Seller→Brand arrow copies trimmed Seller, marks Brand manual and focuses it; changing/clearing Brand applies across current copies while unchanged Brand preserves other copies.

## Verification

162 non-browser checks passed. Eight final browser flows passed: desktop/mobile shared identity and House totals (including row layout/search/Have/Had), 390/320px touch checklist open/close/select/dismiss, offline completion/reset for Swim/Travel/RoadTrip and release service-worker reload. Diff whitespace check passed. Preview server stopped.

## Constraints and pointers

- AGENTS.md: increment build once per completed app batch and provide task-file-only commit/push commands. Do not execute commit/push without explicit request. Do not bump this release again.
- Static local-first, no runtime dependencies; preserve storage/recovery/backup/sync/PWA.
- New changes: core/inventory.js stats; inventory-ui.js copy saving, House rows, checklist menu; app.css House grid rows. Pending files also include icons.js Seller arrow and tests/browser.test.mjs.
- Tests: tests/inventory-details.test.mjs and final flows in tests/browser.test.mjs.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
- Playwright: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. Chromium/local preview require sandbox escalation.
- Release workflow: docs/DEVELOPMENT.md.
