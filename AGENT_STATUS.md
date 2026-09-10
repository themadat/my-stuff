# Goal
Import spreadsheet objects into a resumable, one-object-at-a-time Add review queue with suggested tags, groups, locations and properties.
# Status
COMPLETE
# Checkpoint
Application 0.0.1.15, based on aabf0c8 (0.0.1.14); no checkpoint commit.
# Completed
- XLSX/CSV/TSV/pasted-cell reader, worksheet and column mapping preview.
- Offline suggestions, explicit-value precedence, category property fields and individual quantity copies.
- Compact existing Add form with Save & Next, Skip, Pause, resume and revisit skipped rows.
- Separate local draft persistence, stable IDs, durable-save checks and concurrent-queue protection.
- Version/cache/manifest/workflow, release notes, Help, README, tests and handoff aligned.
- Task files transferred to the source checkout with baseline equality guards and byte verification.
# Remaining
- None for this request. No source spreadsheet has been supplied yet.
# Verification
- Build: PASS (script syntax, manifests, asset paths and version/cache consistency; static app, no build step)
- Tests: PASS (66 parser/model/static checks and 26 isolated Chromium browser checks; final targeted bulk rerun passes)
- Lint: PASS (task-file whitespace checks)
- Review: PASS (desktop/light and 320px/dark at 130% text screenshots, no-scroll laptop sample, offline saves, scoped diff)
# Next
Ready for review and optional commit/push of task files only. The user can provide the first spreadsheet for preparation.
# Decisions
- Suggestions are editable local rules; explicit spreadsheet values override guesses. No object saves before review.
- Pending queues stay on this device, outside inventory backups/cloud. Keep the source spreadsheet until review is complete.
- Up to 500 objects per batch; prices and values are per object. Saved objects use the existing inventory schema.
- Preserve unrelated staged icons. No commit/push or live cloud writes.
- Legacy cloud rejection diagnosis still awaits the actual cloud file structure.
