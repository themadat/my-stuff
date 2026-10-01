# Current handoff

## State

Release 0.0.1.90 is prepared and verified, uncommitted/unpushed. Version/cache surfaces aligned once with scripts/release.mjs. Working tree was clean at task start.

- Cmd/Ctrl-Enter saves before autocomplete can consume Enter or change the selected suggestion. Capture handler preserves validation, composition/repeat guards and nested-dialog handling.
- Save and add new button and Cmd/Ctrl-Shift-Enter save then open a fresh form focused on Smart Complete. Errors retain the current form. Bulk review keeps its existing Save All Copies & Next workflow and hides the new button.
- Smart Complete omits [O] from generated Notes while preserving other unrecognized annotations and account amounts. Existing saved descriptions are unchanged.

## Verification

All 157 non-browser checks and the service-worker offline smoke check passed. New browser regression passed at 1440px and 390px: autocomplete bypass, both shortcuts, validation, button, fresh-form focus and persistence. An older copy-controls browser test fails at its tag/Notes alignment assertion (line 1222), before its shortcut checks; that layout is outside this change. Diff whitespace check passed. Preview server stopped after checks.

## Remaining and pointers

- User preference saved in AGENTS.md: always increment the build once per completed app batch and provide task-file-only commit/push commands. Do not execute commit/push without explicit request. Release 0.0.1.90 is ready; do not increment it again.
- Changed app files: assets/js/inventory-ui.js and assets/js/core/smart-entry.js. Regression tests: tests/browser.test.mjs (last tests) tests/smart-entry.test.mjs and tests/bulk-import.test.mjs.
- Preserve static local-first behavior, existing storage/recovery/backup/sync/PWA paths. Do not commit or push without explicit instruction.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
- Playwright: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs. Chromium/local preview require sandbox escalation.
