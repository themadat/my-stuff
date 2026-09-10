# My Stuff — Agent Instructions

Static, local-first HTML/CSS/JavaScript application. There is no required build step, runtime dependency, backend, account, or sign-in. Read `context/LLM_HANDOFF.md` and `context/WISHES.md` before implementation.

## Session start

1. Run `git status --short`; preserve existing and manual edits.
2. Read the handoff and wish ledger.
3. For in-flight work, inspect the latest commits, branch diff, and the plan’s `## Resume` section.

## Working rules

- Search with `rg`, keep edits narrow, and do not reformat unrelated code.
- Keep the runtime static and dependency-free.
- Central identity, versions, storage namespaces, release data, Help, and Roadmap live in `assets/js/config.js`.
- Preserve the focused foundation: header with centered support search, blank main workspace, one Notes modal, Settings, combined local/sync status, recovery, backup/import, optional GitHub Sync, and PWA/offline behavior.
- Do not invent a product data model or restore previously removed interfaces without an explicit request.
- Use semantic HTML, labelled controls, visible focus, safe URLs, escaped user text, and shared inline SVG interface symbols.
- Versions use `major.minor.patch.build`. Every completed application update increments `build`; keep every version, query, cache, release, and workflow surface aligned. Reset alone may return a copy to `0.0.1.1`.
- Verify scripts, manifests, diffs, asset paths, and affected desktop/mobile/offline flows. Stop preview servers before handoff.

## Lifecycle shorthands

- `reset`: follow `docs/RESET.md`; transform a confirmed copy to a clean `0.0.1.1` foundation.
- `wish`: capture one scoped idea in `context/WISHES.md`; do not plan or implement it.
- `plan`: investigate a wish and write `context/WISH-###-slug-PLAN.md`; do not implement it.
- `start`: implement an approved plan, update Resume, advance versions, and verify.
- `cut`: finalize the active line, align release/version surfaces, close the wish, and run the full checklist.

Never silently advance between lifecycle stages.

## `continue`

When the user sends only `continue`, inspect Git status, recent changes, and any existing handoff or plan, then resume unfinished work. Do not create a replacement status file or tracking system.

## End of turn

After changing files, provide a concise outcome and verification result, then exactly one copy-paste shell command that stages only task files, commits with subject `Version - Text`, and pushes the current branch. Use `git add .` only when every change belongs to the request. Do not run commit or push unless explicitly requested. If no files changed, do not suggest a commit.
