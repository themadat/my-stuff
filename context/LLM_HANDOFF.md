# Current handoff

## State

Application version: **0.0.1.77**. Latest app batch is committed: Outside location jumps now measure the actual section position instead of pinned headings; Had has a slate-blue page background in both themes. No current application implementation is in progress. Older handoff notes mentioned an unverified live sync-file issue and a Notes-highlighting clarification; their resolution is not established here. Consult history if either is raised again; do not infer a migration.

Completed tooling/documentation change introduces lean task rules, batched releases, `scripts/release.mjs` and `scripts/verify.mjs`. It does not change app runtime or require a version bump. See `docs/DEVELOPMENT.md` for usage. Verification: all 133 checks passed before the final CLI test; all three release-tool tests then passed, including dry-run, write and repeat rejection in temporary copies. Diff checks pass. Changes are uncommitted. Do not append release history here; Git and config release notes retain it.

## Constraints

- Preserve unrelated edits: `tests/inventory-copies.test.mjs`, `tests/static.test.mjs`, and untracked `.claude/` predate this work. Recheck status before editing.
- Static, dependency-free runtime. No backend or required build step. Secrets stay device-local; preserve recovery-before-restore and explicit conflict choices.
- No commit/push without explicit authorization. Release batching does not relax cache/version alignment before publishing.
- Use targeted tests during development; full non-browser and relevant desktop/mobile/offline checks at release. Keep this file under 500 words.

## Useful pointers

- `assets/js/config.js`: identity, current version, locations/tags, Help/releases. Read relevant ranges only.
- `assets/js/inventory-ui.js`, `assets/css/app.css`: views, editors, location navigation/layout.
- `assets/js/core/inventory.js`: normalization, copies/sets, location grouping.
- `assets/js/core/smart-entry.js`, `bulk-import.js`: parsing.
- `tests/browser.test.mjs`: browser fixture and regression scenarios. New Add focuses `itemSmartEntry`; wait for that before filling controls.
- `docs/TESTING.md`: browser prerequisites. `node scripts/verify.mjs`: concise non-browser checks.

On this machine, Node is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`; Playwright module is `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Use these if not on PATH. Preview: `python3 -m http.server 8765 --bind 127.0.0.1`; stop after browser work.
