# Goal
Support matching objects in separate rooms, a Settings catalog of inventory options, and reusable Color properties.
# Status
COMPLETE
# Checkpoint
Application 0.0.1.14, based on 792832c (0.0.1.13); no checkpoint commit.
# Completed
- Multiple copies with optional per-copy rooms and independent existing-format item records.
- Add a Copy from saved items with unsaved-edit protection and no inherited archive status.
- Searchable Inventory Settings catalog: configured/custom locations, tag groups, property groups and values.
- Common Color action, reusable Color suggestions, and property-name autocomplete.
- Version/cache/manifest/workflow, Help, README, tests and handoff updated.
# Remaining
- None for this request.
# Verification
- Build: PASS (static syntax, manifests, assets, version/cache consistency; no build step)
- Tests: PASS (61 parser/model/static checks and 21 isolated Chromium browser checks, including offline)
- Lint: PASS (diff whitespace checks)
- Review: PASS (desktop/light and 320px/dark at 130% text catalog and copies form screenshots; independent copies and scoped changes verified)
# Next
Ready for review and optional commit/push of task files only; unrelated staged icons must remain excluded.
# Decisions
- Each copy is an independent physical item, preserving existing backup/sync/archive semantics and per-item amounts.
- Settings is a catalog; custom choices are entered in item forms and reflected automatically.
- Color is optional and available across all categories.
- Preserve staged unrelated icon edits and existing Object word actions; no commit/push or live cloud write.
- Separate legacy cloud rejection diagnosis remains pending actual file structure.
