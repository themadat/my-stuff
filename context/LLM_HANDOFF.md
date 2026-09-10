## Latest update — spreadsheet bulk review (0.0.1.15)

Bulk Entry accepts XLSX, CSV, TSV, or pasted cells; users choose a worksheet and correct heading/column mapping before Start Review. Unknown columns become labelled Notes unless remapped to another field or a custom property. `core/spreadsheet-read.js` reads XLSX locally using native ZIP decompression/XML with bounds, shared/inline strings, date styles/epochs, and cached formula values only. Older XLS needs export. `core/bulk-import.js` parses delimited rows, uses Smart Complete for purchase lines, applies explicit mapped values before suggestions, expands quantities into individual copies, and rejects out-of-range rows before starting. Limits: 500 objects/batch, 100 copies/row, 80 columns, 8 MB files and 4 MB text.

`bulk-entry.js` owns the device-only queue at `config.storage.bulkDraftKey` (`myStuff.bulkDraft.v1`). Save & Next uses the existing Add form and stores only the current approved object; Skip preserves the row for Review Skipped, and Pause captures even incomplete form edits for reload/resume. Stable IDs plus reconciliation prevent duplicate saved objects after interruption. Queue writes are conflict-checked across tabs and advancement requires durable inventory and queue writes. Pending queues are excluded from backups/cloud and cleared by erase-all; keep the original spreadsheet until review finishes. Inventory schema and backup/cloud formats are unchanged. Saved objects participate in normal totals, editing, archive and sync.

Suggestions use offline configured rules plus existing tag-group vocabulary, known brands and explicit measurements; imported values override guesses. Suggested group membership/location/properties are labelled above the form, with the original row expandable. Category property presets provide relevant blank fields; prices and dates are never invented. Bulk Smart Complete is optional/collapsed to preserve space for imported details; regular Add keeps the existing expanded Smart Complete layout. More Details remains expanded. No spreadsheet was supplied in this conversation yet.

Verification: 66 parser/model/static checks and 26 isolated Chromium browser checks pass, including XLSX fixture extraction, quoted CSV, ownership overrides, quantities, pause/reload/revisit, duplicate-save reconciliation, storage failures, concurrent queue conflicts, escaped input, desktop/mobile and offline saving. Desktop/light and 320px/dark at 130% text import/review screenshots were inspected; the supplied single-row bulk review fits a 1366×768 desktop without scrolling. Version, query, cache, manifests, workflow, Help, README and testing guidance are aligned. No live cloud writes, commit or push; unrelated staged icons remain excluded. Source checkout is the iCloud GitHub directory; workspace edits are transferred using baseline equality guards.

## Latest update — multiple copies and inventory catalog (0.0.1.14)

The add form has Copies (1–100) with per-copy room overrides for batches; blank overrides use the base location. `inventoryModel.createCopies` normalizes distinct existing-format records, deep-copies properties, resets archive state, and updates Zone/clears Space when a room differs. Price/value are per copy. Capacity is checked before any writes. Add a Copy on a saved item prefills a new draft and requires saving existing edits first. Each copy is independently editable and archivable; there is no new shared type or quantity schema.

Settings → Inventory is a searchable read-only catalog of configured and used locations, grouped tags, common properties, category property groups, and custom property values. It includes current and archived records. `assets/js/inventory-catalog.js` owns catalog derivation/rendering and is in the offline shell. The new Settings tab is allowed in device UI state, without cloud-format changes. Color is a one-click common-property action, and native datalists suggest property names and Color values. Existing category Color rows are reused rather than duplicated.

Preserve Object word actions from 0.0.1.13 and supplied section symbols from 0.0.1.12. Verification: 61 parser/model/static checks and 21 isolated Chromium browser checks pass, including independent copy edits/archive, per-copy totals and room parents, Color reuse, catalog search/custom values/escaping, tab keyboard access, previous word actions, laptop layout, and offline reload. Desktop/light and 320px/dark at 130% text catalog/form screenshots were reviewed. No live cloud writes, commit, or push; staged icon changes remain unrelated. The older cloud-copy diagnosis still awaits its actual structure.

## Latest update — Object word actions (0.0.1.13)

Seller, Brand, and Object placeholders now match their visible titles (Seller replaces Seller / Source). The native Object input supports clicking a whitespace-delimited word to move that occurrence to Brand, appending with a space, and right-clicking to remove that occurrence. Punctuation is retained. Word targeting measures actual rendered text and horizontal scroll rather than relying on the old caret position. Whitespace clicks, modified clicks, and drag-selection preserve normal input behavior. The hint stays alongside Object on desktop and wraps on mobile, preserving the previous no-scroll laptop layout.

Alt+ArrowUp moves the word at the caret; Alt+Delete removes it. Control+Z or Command+Z undoes recent word actions (up to 50), including Brand changes. Manual input resets this action history. Both fields are protected against subsequent Smart Complete overwrites. Brand length is checked before moving, an empty Object still fails required validation, and changes stay in the form until Save. No data/schema or cloud behavior changed.

Verification: 58 parser/model/static checks and 19 isolated Chromium browser checks pass. Added real pointer coverage for append, repeated-word removal, whitespace and drag behavior, Smart Complete protection and saved records; narrow/scrolled Unicode word targeting, keyboard/undo, empty Object, and full Brand are covered. Laptop/light and 320px/dark form screenshots were reviewed. Preview server stopped. Existing staged icon changes remain unrelated; no commit, push, or live cloud write was performed. The separate cloud-copy diagnosis still awaits its actual structure.

## Latest update — section symbols (0.0.1.12)

The supplied filled SVGs now identify Stuff I Have (box), Stuff I Want (bag), Research (document and magnifier), and Stuff I Had (archive). Original viewBoxes, path geometry, currentColor, and 0.85 fill opacity are preserved in the shared symbol registry; pasted Markdown namespace links were normalized to valid SVG namespace text. All icons are decorative and nonfocusable, with visible section labels. Related empty states, totals, and archive actions share the supplied symbols; global search retains its own icon.

Previous Stuff is renamed Stuff I Had in navigation, headings, archive messages, Help, and current docs. The internal previous-view identifier and inventory schema are unchanged. Research uses the same heading as its navigation label. Version/cache/manifests/workflow are aligned. Verification: 58 parser/model/static checks and 17 isolated Chromium browser checks pass, including archive/return and offline reload; desktop/light and mobile/dark screenshots were inspected. Preview server stopped. Existing staged icon asset edits are unrelated and must stay excluded from this task's commit. No commit or push performed. The separate cloud diagnosis still awaits its actual JSON structure.

## Latest update — dated purchases and wider form (0.0.1.11)

The reported line beginning `08/03/26` now extracts Date Obtained as `2026-08-03` before matching price and brand, leaving only `Whiskey Flight Set with 3 Tasting Glasses & Modern Wood Stand` as the object. Leading US MM/DD/YY, MM/DD/YYYY, and ISO dates are supported; two-digit years mean 20xx. Invalid calendar dates are retained in Notes. Date participates in source highlighting, destination focus, and manual-edit protection.

The desktop modal is up to 1320px wide. Seller, Brand, and Object share a row; date, amounts, and ownership/acquisition choices share the next. Locations and tags share a row. More Details opens by default on add/edit, with notes and custom properties side by side. The sample fits 1366×768 and 1440×900 at default text size without scrolling. Narrow screens, larger text, and larger property sets retain accessible scrolling and a fixed Save footer.

Verification: 58 parser/model/static checks and 17 isolated browser checks pass, including date persistence, manual-date protection, the no-scroll desktop layout, mobile behavior, and offline reload. Laptop/light and phone/dark screenshots were inspected. The unrelated legacy cloud-copy diagnosis remains pending; no schema or sync changes, commit, push, or deployment are included.

## Latest update — compact smart entry (0.0.1.10)

The add/edit form now offers local Smart Complete with highlighted source spans and destination buttons, manual-edit protection, single-click segmented owner/acquisition controls, and searchable location/tag pickers. New items default to Me/Purchased; older unknown methods remain unknown when editing. All WISH-001 vocabulary is shipped. Custom choices remain allowed. Brand, Zone, and Space are stored as existing named properties so normalization, backup, sync, archive, and older clients retain them. Room remains the current model field and room totals stay grouped by it. Known brand matching includes supplied brands plus brands from saved inventory; explicit `brand: ...;` supports other brands. Payment text and unknown markers go to description/Notes. Notes, date, and custom properties live under More Details. The smart parser is `assets/js/core/smart-entry.js` and is in the offline shell.

Verification: 56 parser/model/static checks and 16 isolated Chromium browser checks pass, including offline. Desktop/light and 320px/dark at 130% text were visually reviewed.

The separate legacy cloud-copy rejection remains unresolved pending the real file structure. No live cloud write, commit, push, or deployment is part of this form update.

# Agent handoff

My Stuff is a local-first inventory app at version `0.0.1.15`. The main workspace prioritizes Stuff I Have, with item editing, ownership (house/me), rooms, category tags/presets, acquisition details, value/price, custom properties, search/filters, and room/ownership totals. Stuff I Had retains archived objects with gone date, reason, notes, and calendar days owned, and supports returning an item. Want and Research are explicitly labelled placeholders. The responsive header, centered support search, autosaving Notes, Settings, Help, release notes, Developer diagnostics, recovery, backup/import, optional GitHub Sync, and PWA/offline features remain intact.

The supplied storage-box artwork is preserved at `assets/icons/my-stuff-app-icon.svg` and used unchanged by both header themes and the favicon. Install PNGs, maskable variants, Apple touch icons, and splash assets remain aligned. `scripts/generate-icons.mjs` regenerates PNGs with development-only Playwright; see `docs/CUSTOMIZATION.md`. User changes observed during the inventory work deleted six unused App Icon Template reference assets and added `my-stuff-app-icon-wip.svg`; these are unrelated edits, left untouched and excluded from the suggested inventory commit. Runtime remains static and dependency-free. Browser storage keeps the same `myStuff.*` keys; GitHub Sync still targets `themadat/app-data/main/data/my-stuff.json`.

Settings/sync updates from app-template `0.0.1.61` through `0.0.1.67` remain integrated. Local state/backups now use schema 2 and migrate schema 1 without losing Notes/preferences. Cloud writes use sync version 1/schema 6, including inventory (currency plus current and archived records) and Notes, with a `data-v2:` hash and stable item-ID ordering. Older Notes-only cloud copies preserve local inventory on download; full old backup import explicitly replaces everything after a warning/recovery save. Merge unions distinct IDs, but different records for one ID or divergent nonempty Notes require choosing a copy. Update older devices before syncing inventory; older clients intentionally reject schema 6.

Verification covers 47 simulated inventory/sync tests, 3 static consistency/artwork tests, and 13 isolated Chromium browser tests, including real inventory forms, category properties, unknown/zero values, ownership/room totals, archive/return, leap-day duration, stale drafts, nested Escape, cloud/backup privacy and recovery, desktop/mobile (320px at 130% text), and offline persistence. Desktop/mobile screenshots use temporary fixture records in an isolated browser, not actual user data. No real token, live cloud upload, commit, push, or deployment was performed.

## Current update and pending sync diagnosis

Version `0.0.1.9` applies Title Case to inventory and support interface labels and adopts burnt orange (`#b44916`) with light/dark link, selection, hover, and focus colors. Existing saved accents normalize to the app defaults; display mode and text scale remain intact. USD is fixed across normalized state, forms, totals, backups, and outgoing cloud data.

The user reported “This is not a supported My Stuff cloud copy.” This exact error came from legacy whole-state validation (workspace present, missing Notes, or malformed/oversized Notes). The connected GitHub tool returned 404 reading `themadat/app-data/main/data/my-stuff.json`; the actual shape is unverified. Requested a redacted JSON structure from the user. Do not guess a migration or discard unrecognized workspace data. Errors now explain which validation branch rejected the file. The actual sync repair remains pending; resume from AGENT_STATUS.md when the file structure arrives.

Current verification: 53 model/static checks and 14 isolated Chromium browser checks pass, including USD migration, preserved amounts/archive/Notes, replacement protection for rejected cloud files, theme controls at desktop/mobile widths, and offline persistence. Light desktop and dark mobile screenshots were visually inspected. No live cloud write, commit, push, or deployment was performed. WISH-001 remains Proposed.

## Repository map

Inventory model: `assets/js/core/inventory.js`, loaded after utilities and before state. Workspace/forms: `assets/js/inventory-ui.js`, initialized after storage load and before shared dialog bindings. Item edits are explicit saves; Escape/Cancel confirm before dropping drafts. Each entry is one object; rooms/tags are free text with suggestions, presets never remove properties, archived items are excluded from current totals, and unknown value is distinct from zero. Currency is fixed to USD. Older supported currency labels normalize to USD without changing numeric amounts; there is no currency picker. Limits: 5,000 records, 40 properties per item. List filters are session-local. No example items ship in state.

Version 0.0.1.7 corrects the sync target to `themadat/app-data/main/data/my-stuff.json`; application/support links still use `themadat/my-stuff`. Normalization moves existing devices to the configured destination without changing Notes or tokens. Existing reconciliation ignores baselines from the old repository and requires a first-sync choice for differing or missing cloud data. A regression test verifies the target for every read/write request, permission guidance, preserved Notes/token, and confirmation before creating the new file. No live GitHub upload was performed.

Settings now has a dedicated `data-sync` tab with the supplied braces SVG. Data & connection moved there; appearance and backup/reset remain in general Settings. The native collapsed-by-default JSON disclosure shows `JSON.stringify(stateModel.syncPayload(state()), null, 2)` via textContent, updates while expanded, and excludes credentials/device settings. It describes the outgoing local file rather than a fetched cloud copy. Sync setup events route directly to this tab. Tests cover keyboard navigation, narrow/mobile layouts, escaping, preview/upload equality, and token exclusion.

Current sync UX: first-sync/conflict options are left-aligned with leading shared cloud symbols. Test uses GET requests only and labels its result “Read check passed — uploads unverified”; it rejects known archived/disabled/read-only repositories but never claims that read access proves Contents write permission. Access failures retain GitHub’s message and show repository-specific guidance in Settings. Branch-rule denials are distinguished from stale-content conflicts. Tests reproduce successful reads followed by a denied upload; no real token permissions or repository rules were changed. The earlier Notes-highlighting clarification remains unresolved and no Notes changes have been made.

- `index.html`: shell, inventory mount point, Notes, Settings, and shared dialogs.
- `assets/css/app.css`: themes, components, responsive layout, safe areas, and reduced motion.
- `assets/js/config.js`: identity, version, storage/sync settings, Help, releases, Roadmap, and shortcuts.
- `assets/js/icons.js`: small inline interface-symbol helper.
- `assets/js/app.js`: shell rendering, Notes, Settings, search, appearance, and shortcuts.
- `assets/js/core/`: state, storage, components, portability, sync, utilities, and PWA behavior.
- `assets/icons/`: supplied application artwork and generated install assets.
- `manifest*.webmanifest`, `sw.js`, `.github/workflows/deploy-pages.yml`: install, offline, and hosting surfaces.

## Invariants

- Keep the runtime static, backend-free, and usable on an ordinary static host.
- Keep current inventory as the primary workspace; Want/Research remain placeholders until requested.
- Preserve one plain-text Notes surface, Settings, combined storage/sync status, recovery, JSON portability, optional GitHub Sync, and offline support.
- Secrets remain device-local and excluded from exports and normalized diagnostics.
- Imported state cannot redirect the configuration-fixed GitHub target.
- Cloud restores preserve device preferences and require a successful recovery write. Unknown cloud content is rejected, and unequal nonempty Notes require an explicit copy choice.
- Use shared inline SVGs for standard controls, semantic elements, labelled inputs, visible focus, safe URLs, escaped text, safe areas, and reduced motion.
- Application versions use four parts. Keep config identity/build, HTML queries, manifests, service-worker cache/version, release entry, and deployment workflow name identical.
- GitHub Pages uses the checked-in Actions workflow as its only publishing path.

## Workflows

### `reset`

Read and follow `docs/RESET.md`. Confirm the target copy and identity before broad deletion. Retain the reusable shell and remove product-specific runtime, state, data, styles, docs, examples, and plans. Reset all version surfaces to `0.0.1.1`. Do not alter Git history, remotes, repositories, Pages settings, or deployments.

### `wish`

Record the next `WISH-###` in `context/WISHES.md` with status Proposed, priority, effort, target, affected modules, behavior, rationale, acceptance criteria, constraints, and material open questions. Do not plan or implement.

### `plan`

Create or revise `context/WISH-###-slug-PLAN.md` with a first `## Resume` section, decisions, scope, non-goals, file map, accessibility/responsive considerations, tests, and open questions. Mark the wish Planned. Do not edit runtime or versions.

### `start`

Implement an approved plan, mark the wish Active, maintain Resume, add only required architecture, advance the build number, align every version surface, add the dated release entry, and verify affected behavior.

### `cut`

Confirm the release number, align every version/release/cache surface, mark the wish Shipped with date/version, archive its plan when useful, and run the full verification baseline.

Never silently advance between stages.

## Verification baseline

```sh
for file in assets/js/*.js assets/js/core/*.js sw.js; do node --check "$file" || exit 1; done
node -e "const fs=require('fs'); for (const file of ['manifest.webmanifest','manifest-dark.webmanifest']) JSON.parse(fs.readFileSync(file,'utf8'));"
git diff --check
node --test tests/sync.test.mjs tests/static.test.mjs
python3 -m http.server 8000
```

Check desktop/mobile startup, no console errors or horizontal overflow, empty/populated inventory, item fields and archive/return, totals/filters, Notes autosave, Settings, appearance, Help/release search, shortcuts, backup/import, recovery, GitHub setup, PWA/offline reload and edits, visible focus, and reduced motion. Stop the server afterward.

## End of turn

After edits, summarize outcome and verification, then provide exactly one copy-paste command that stages only request files, commits with `Version - Text`, and pushes the current branch. Do not run it unless explicitly requested.
