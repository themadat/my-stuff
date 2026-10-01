# My Stuff — Agent Instructions

Static, local-first HTML/CSS/JavaScript. No required build step, runtime dependencies, backend or sign-in.

## Context and working rules

- At task start, run `git status --short` and read `context/LLM_HANDOFF.md` once. Preserve unrelated/manual edits. On follow-ups, inspect only relevant changes; check status before editing.
- Read `context/WISHES.md` only for wish/plan work or a referenced wish. Read plans, history and diffs only as needed to resume or investigate.
- Keep the handoff under 500 words: current state, unfinished work, constraints, useful file/command pointers. Replace stale content; do not append release narratives. Git and release notes retain history.
- Search narrowly with `rg`; read relevant ranges. Show test summaries and failures, not passing-test listings or server logs. Reuse known helpers. Keep updates and final answers concise.
- Batch related requests. After a completed batch, prefer a fresh task with the short handoff; do not create a new task without the user's request.
- Keep edits narrow and runtime dependency-free. Preserve existing inventory, Notes, Settings, local storage, recovery, backup/import, optional GitHub Sync and PWA behavior. Do not invent data models or restore removed interfaces without a request.
- Use labelled semantic controls, visible focus, escaped user text, safe URLs and shared SVG symbols.
- Identity, storage namespaces and current version live in `assets/js/config.js`. Consult Help/release history only when relevant.

## Development and releases

- Always finalize a completed application batch by incrementing the build once and providing task-file-only commit and push commands at handoff. Do not execute commit or push unless explicitly requested.
- Batch application edits into one release. Do not bump versions or write release notes after each small edit. Documentation/tooling-only changes need no app version bump.
- Before publishing/installing a batch or when asked to `cut`, increment the four-part build once and align every version/cache surface with `scripts/release.mjs`. Keep cache invalidation intact. Reset alone may return to `0.0.1.1`.
- During development, run targeted checks appropriate to the change. Add regression tests for behavior bugs; avoid tests that merely mirror trivial static edits. Inspect screenshots only when they resolve a visual question.
- At release, run the full non-browser suite, relevant desktop/mobile browser flows, offline smoke check, and diff checks. Stop preview servers afterward. See `docs/DEVELOPMENT.md` for concise commands.
- Do not commit or push unless explicitly requested. Provide a task-file-only staging/commit/push command only at release handoff or on request; commit subject `Version - Text`. Never include unrelated changes.

## Lifecycle

- `wish`: record one scoped idea in `context/WISHES.md`; no implementation.
- `plan`: investigate and write `context/WISH-###-slug-PLAN.md`; no implementation.
- `start`: implement the approved plan and update its Resume section; release at the batch boundary.
- `cut`: finalize the batch, align release/version surfaces, close its wish, and run release checks.
- `reset`: follow `docs/RESET.md` for a confirmed copy.
- `continue`: inspect status and relevant unfinished work, then resume. Do not create another tracking file.

Never silently advance lifecycle stages. A direct implementation request authorizes its scoped work.
