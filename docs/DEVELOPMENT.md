# Lean development workflow

Run commands from the repository root using Node.js. These development helpers add no runtime dependency or application build step.

## Targeted verification

`node scripts/verify.mjs tests/inventory-details.test.mjs` runs a selected test file.

`node scripts/verify.mjs` runs all non-browser tests. Both print totals and a temporary full-log path; failures also print their diagnostic blocks. Use the log for details rather than repeating a test just to see output.

For browser checks, use the existing commands in [TESTING.md](TESTING.md), with `--test-name-pattern` before the test filename to select relevant scenarios. Use a local preview, redirect server logs to a temporary file, and stop the server afterward. Run desktop/mobile checks where the change affects those layouts. Offline smoke testing belongs at release or when caching/storage changes.

## Release a completed batch

1. Finish related changes and targeted verification. Do not bump the app for documentation/tooling-only changes.
2. Write a temporary release JSON file with `version` (exactly the next build), ISO `date`, `title`, `summary`, and string arrays `features`, `improvements`, `fixes`, `knownIssues`. Keep the notes about the complete batch.
3. Preview: `node scripts/release.mjs /tmp/my-stuff-release.json`.
4. Apply: `node scripts/release.mjs /tmp/my-stuff-release.json --write`.
5. Run `node scripts/verify.mjs`, relevant browser checks including offline reload, and `git diff --check`. Inspect the diff before publishing.

The release helper validates existing version alignment before writing. It updates identity/build, prepends one release entry while preserving older notes, and aligns HTML queries, manifests, service worker and deployment label. It never stages, commits, pushes or deploys. Do not run it twice for the same release. Cache/version alignment remains mandatory before publishing/installing a batch.

## Context hygiene

Keep `context/LLM_HANDOFF.md` under 500 words, replacing stale details instead of appending history. Keep only unfinished work, constraints and useful pointers. Consult Git history and existing app release notes on demand. Read the wish ledger only for wish/plan work. A fresh task after a completed batch can use this handoff without carrying the whole conversation.

Keep Help and historical release content out of routine reads. Splitting those runtime assets is optional future refactoring, not a prerequisite for this workflow.
