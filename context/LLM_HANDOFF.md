# Current handoff

## State

Release **0.0.1.104** prepared and verified, uncommitted/unpushed. Working tree was clean at task start. No unfinished implementation work.

GitHub Sync now reads files above 1 MiB (or encoding=none) through authenticated raw Git blob requests using the exact metadata SHA. This fixes valid large JSON being misreported as invalid because GitHub omitted inline content.

Sync check/upload/download/merge and automatic local-save failures open a dialog with the actual reason and Retry Sync, Overwrite from GitHub, and Sync Settings. Identical repeated background failures are deduplicated; explicit retries can show the reason again. Connection-test failures use the same dialog without stacking a second message.

Overwrite from GitHub is available in Data Sync, conflict choices, and failure dialogs. It fetches GitHub again and confirms before replacing local content without a recovery backup. If needed, it removes only the older recovery snapshot to reclaim storage. Device settings, credentials, and bulk drafts are retained. Normal restores retain their recovery requirement.

Cloud replacements now save the replacement and baseline persistently before changing in-memory state or reporting success. Unrecoverable storage failures explain the problem and retain the current local content. Network, access, invalid remote data, and unavailable browser storage can still prevent a download; none is silently reported as success.

## Verification

175 non-browser checks passed. Eight release browser flows passed: inventory/cloud/export, Notes restore, state animation/authentication, conflict controls, desktop/mobile Settings, service-worker offline inventory/Notes reload, and actionable failures/large-file overwrite at 1440/390/320px. Final overwrite flow also verified connection-test failure deduplication, quota reclamation, cancellation, latest-source fetch, settings retention, no uploads, and persistence after reload. Diff whitespace passed. Preview stopped. Browser requests mocked; no real GitHub data changed.

## Pointers and constraints

- Runtime changes: assets/js/core/sync.js, assets/js/core/storage.js, assets/js/app.js, index.html.
- Tests: tests/sync.test.mjs, tests/sync-storage.test.mjs, tests/browser.test.mjs.
- Release surfaces aligned once using scripts/release.mjs: config.js, index.html, manifests, sw.js, deployment workflow. Do not bump again for this batch.
- Node: /Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node. Playwright: sibling node/node_modules/playwright/index.mjs; bundled Chromium available.
- Workflow: docs/DEVELOPMENT.md. Preserve local-first inventory/Notes/settings/storage/recovery/import/sync/PWA. No commits or pushes without explicit instruction. Stage only this batch's files.
