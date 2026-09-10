# Goal
Run visible Smart Complete for every bulk row, parse inventory locations/tags/dates/prices, revise word gestures, style autofilled values white, and add Water Volume.
# Status
COMPLETE
# Checkpoint
Application 0.0.1.16, based on 927b6de (0.0.1.15); no checkpoint commit.
# Completed
- Each bulk review displays its original row in expanded Smart Complete with highlights and destinations.
- Leading locations, tab-separated tags/dates/prices, trailing tags, Vapur brand and bottle Volume parsing.
- Water Volume preset; Floating resolves to Nook/Main Level with the Floating space.
- Right-click moves an Object word to Brand; Control-click deletes; plain clicks position the caret; keyboard/undo retained.
- White autofill text on contrasting fields, with manual edit protection and pause/resume provenance.
- Version/cache/manifests/workflow, release notes, Help, README, tests and handoff aligned.
# Remaining
- None for this request.
# Verification
- Build: PASS (script syntax, manifests, assets and version/cache consistency; no build step)
- Tests: PASS (68 parser/model/static and 27 isolated Chromium browser checks)
- Lint: PASS (task whitespace and source diff checks)
- Review: PASS (supplied sample, desktop/light and 320px/dark at 130% text, persistent footer, offline review)
# Next
Ready for review and optional commit/push of task files only.
# Decisions
- Floating is a space within Nook, Main Level; ambiguous spaces such as Closet require review.
- Pack of 2 remains descriptive text; only an explicit quantity column creates separate records.
- Manual field edits refresh highlights without reapplying other imported values.
- New provenance metadata stays only in the device queue; inventory backup/sync schema is unchanged.
- Preserve staged unrelated icons; no commit, push, or live cloud writes.
