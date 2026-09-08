# Goal
Apply Title Case, burnt orange accents, fixed USD, and resolve the reported cloud-copy rejection.
# Status
BLOCKED
# Checkpoint
No checkpoint commit. Application update 0.0.1.9 is verified locally; sync migration awaits the actual cloud structure.
# Completed
- Title Case inventory/support labels and burnt orange accents in both themes, including existing saved preferences.
- Fixed USD across forms, totals, normalization, backup, and outgoing sync; existing numeric amounts remain intact.
- Replaced generic legacy cloud rejection with specific workspace/Notes diagnostics; neither copy is overwritten on rejection.
- Aligned version, release, cache, manifests, deployment label, Help, README, and handoff.
# Remaining
- Reproduce and fix the user's actual cloud-copy rejection once its redacted JSON structure is available.
# Verification
- Build: PASS (static runtime syntax and asset/manifest/version consistency; no build step)
- Tests: PASS (53 model/static checks and 14 isolated Chromium browser checks, including offline)
- Lint: PASS (git diff --check; no standalone linter configured)
- Review: PASS (completed UI/USD changes and desktop/mobile visual review; actual cloud migration unverified)
# Next
Inspect the user's redacted data/my-stuff.json. Add a fixture reproducing its rejection, implement a lossless supported migration if possible, verify sync/restore protections, and update release/handoff/status.
# Decisions
- GitHub connector returned 404 for the configured file; asked user for JSON structure. Never guess or strip legacy workspace data.
- Existing supported currency labels normalize to USD without converting numeric amounts.
- App accents override old saved accent colors; display mode/scale and semantic colors remain intact.
- WISH-001 remains Proposed and outside this update.
- Preserved unrelated icon edits; no commit, push, or live cloud write.
