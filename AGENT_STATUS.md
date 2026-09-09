# Goal
Match Seller/Brand/Object placeholders to their titles and add Object word move/remove actions.
# Status
COMPLETE
# Checkpoint
Verified application version 0.0.1.13; no checkpoint commit.
# Completed
- Updated matching Seller, Brand, and Object titles/placeholders.
- Clicking an Object word appends it to Brand; right-click removes only that occurrence.
- Added caret keyboard actions, undo, Smart Complete protection, scroll-aware hit testing, and Brand length protection.
- Kept normal typing, whitespace caret clicks, drag-selection, existing save/dirty behavior, and the no-scroll laptop layout.
- Aligned version/cache/manifests/workflow, release/Help, component docs, and handoff.
# Remaining
- None for this request.
# Verification
- Build: PASS (static script, manifest, version, and asset checks; no build step)
- Tests: PASS (58 parser/model/static checks and 19 browser checks, including offline)
- Lint: PASS (git diff --check)
- Review: PASS (pointer/keyboard behavior, saved data, laptop/light and 320px/dark screenshots)
# Next
Ready for user review and optional commit/push of task files only.
# Decisions
- Words are whitespace-delimited tokens; preserve punctuation and target only the clicked occurrence.
- Alt+ArrowUp moves and Alt+Delete removes at the caret; Control+Z or Command+Z undoes word actions until manual input.
- No model/schema change, live cloud write, commit, or push; preview server stopped.
- Preserve staged unrelated icon edits. Separate cloud diagnosis still awaits actual JSON structure.
