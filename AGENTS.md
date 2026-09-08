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

## Agent continuity protocol

Agent work must be resumable across sessions.

### `continue`

When the user sends only `continue`, resume the current task:

1. Read `AGENT_STATUS.md`.
2. Inspect `git status`, the current diff, recent relevant commits, and relevant changed files.
3. Verify `AGENT_STATUS.md` against the actual repository state.
4. Determine whether the current phase is `PLANNING`, `IMPLEMENTING`, `TESTING`, `VERIFYING`, `COMPLETE`, or `BLOCKED`.
5. Continue with the next unfinished work.
6. Do not redo completed work unless repository inspection or verification shows it is necessary.
7. Keep `AGENT_STATUS.md` updated as work progresses.

If `AGENT_STATUS.md` does not exist, infer the current state from the repository, current task context, git history, and working tree, then create it.

### Persistent status

Maintain `AGENT_STATUS.md` in the repository root for any active agent task. Keep it concise and use this structure:

```md
# Goal
Current task.
# Status
PLANNING | IMPLEMENTING | TESTING | VERIFYING | COMPLETE | BLOCKED
# Checkpoint
Current agent checkpoint version and commit, if one exists.
# Completed
- Completed work
# Remaining
- Remaining work
# Verification
- Build: PASS | FAIL | NOT RUN
- Tests: PASS | FAIL | NOT RUN
- Lint: PASS | FAIL | NOT RUN
- Review: PASS | FAIL | NOT RUN
# Next
Exact next action.
# Decisions
- Important implementation decisions or assumptions
```

Update this file after meaningful milestones and before stopping whenever possible. Do not use it as a verbose work log; it should describe the current resumable state.

### Agent checkpoints

A `+X` build suffix represents an agent checkpoint, not a release and not specifically a usage-limit event, for example `1.4.0`, `1.4.0+1`, `1.4.0+2`, and `1.4.0+3`.

For long-running tasks, create checkpoints at useful stable boundaries so another agent can resume without losing significant work. Good boundaries include:

- A meaningful implementation unit is complete.
- Implementation is complete and testing is beginning.
- Testing is complete and verification is beginning.
- Substantial progress has been made before another large unit begins.
- Available agent usage or context appears to be getting low.
- The agent otherwise expects the session may stop soon.

Do not depend on being able to predict exactly when usage or context will run out.

When creating an agent checkpoint:

1. Reach a coherent stopping point.
2. Update `AGENT_STATUS.md`.
3. Find the project’s existing canonical version source.
4. Preserve the normal version and increment only the build metadata, such as `1.4.0` to `1.4.0+1`, then `1.4.0+2`. Do not invent a second versioning system if the repository already has one. If its version format cannot support `+X`, preserve its conventions and record the checkpoint number only in `AGENT_STATUS.md`.
5. Run reasonable validation for the state being checkpointed.
6. Update the `# Checkpoint` entry in `AGENT_STATUS.md`.
7. Commit the checkpoint with `checkpoint: <version> - <short description>`. After committing, ensure `AGENT_STATUS.md` records both the checkpoint version and commit hash, for example `Checkpoint: 1.4.0+2 (a1b2c3d)`.

Do not automatically create a checkpoint commit if unrelated user changes would be included, secrets or generated files that should not be committed are present, the repository is knowingly too broken to provide a useful resume state, or the user has instructed the agent not to commit. Never discard, reset, overwrite, or clean unrelated user changes to create a checkpoint.

This repository’s canonical version is stored in `assets/js/config.js` and mirrored across the version, query, cache, release, manifest, and workflow surfaces described above. Its required `major.minor.patch.build` format does not support `+X`; preserve that format and record checkpoint numbers only in `AGENT_STATUS.md`. The repository’s end-of-turn rule also requires explicit user authorization before any checkpoint commit is run.

### Usage and context awareness

If the environment exposes remaining usage, context, or session limits, check them periodically during long-running work. If remaining capacity appears low:

1. Stop starting new large implementation units.
2. Finish the smallest coherent unit in progress.
3. Run the most relevant available verification.
4. Update `AGENT_STATUS.md`.
5. Create an agent checkpoint if it is safe and authorized to do so.
6. Leave `# Next` with a precise instruction for the next agent.

If remaining usage cannot be determined, rely on regular milestone checkpoints instead.

### Completion standard

Do not mark a task `COMPLETE` merely because coding is finished. `COMPLETE` means:

- Requested functionality is implemented.
- Relevant tests pass.
- Build or typecheck passes where applicable.
- Lint passes where applicable.
- The implementation has been reviewed against the original request.
- No known required work remains.

The expected progression is generally `IMPLEMENTING` → `TESTING` → `VERIFYING` → `COMPLETE`. If implementation is finished but testing is not, use `TESTING`. If tests pass but final review against the request remains, use `VERIFYING`.

When the task is truly complete, set `AGENT_STATUS.md` to `COMPLETE`, clearly record final verification results, and do not create another `+X` checkpoint solely because the task completed unless the repository’s normal release/versioning process requires it.

### Initial setup

After adding this protocol:

1. Inspect the repository’s current versioning mechanism.
2. Do not change the current application version merely to install this protocol.
3. Create `AGENT_STATUS.md` only if there is an active unfinished task; otherwise wait until agent work begins.
4. Briefly report where the canonical project version is stored, whether `+X` build metadata is supported, and whether existing `AGENTS.md` instructions were preserved or merged.

## End of turn

After changing files, provide a concise outcome and verification result, then exactly one copy-paste shell command that stages only task files, commits with subject `Version - Text`, and pushes the current branch. Use `git add .` only when every change belongs to the request. Do not run commit or push unless explicitly requested. If no files changed, do not suggest a commit.
