## Latest update — configured hierarchy and toolbar height (0.0.1.26)

Location choices now come exclusively from the 23 configured rooms and their spaces under Outside, Upstairs and Main Level. Removed the legacy Living room/Bedroom/Bathroom/Closet/Storage fallback list and saved/custom catalog additions. The Single Location interface and custom-location picker choices are removed, superseding 0.0.1.24. Normalization clears unrecognized room/zone/space/area/location values, retains objects and unrelated details, canonicalizes recognized rooms/spaces, and restores configured room parents. Known unambiguous alternate location fields resolve to the hierarchy. This cleanup also applies to old local state, imports, copies and sync normalization; no inventory objects are deleted.

Bags preset Capacity is now Volume (L). Saved Bags Capacity is renamed with its value/unit retained when no Volume property already exists; if both exist they are retained rather than discarding either value. Toolbar ownership cards and Add buttons use a compact 3.2rem height, and search/dropdowns increase to that same height. Ownership icon/label and total row spacing are reduced; narrow-screen cards may expand for wrapped values.

All 82 model/parser/static checks pass, including invalid-location cleanup, retained object amounts, configured parent resolution, and Bags value/unit preservation. Version/build/cache/manifests/HTML/workflow/release align at 0.0.1.26. Browser desktop/mobile/offline review remains pending under the recorded preview-server approval restriction; no server launched. Before-copies are /private/tmp/my-stuff-hierarchy-baseline; source checkout was clean at d8617b1 (0.0.1.25). Transfer uses baseline equality guards and byte verification. No commit or push performed.

## Latest update — unknown dates and power properties (0.0.1.25)

Date Obtained has an explicit Unknown checkbox; new/unparsed dates default to Unknown (stored as the existing empty date). Uncheck it to enter a date, or check it to clear the date with Smart Complete manual-edit protection. Valid parsed dates reveal the date input. Unknown dates display as Unknown in inventory. Invalid mapped bulk dates clear any inferred date and preserve the raw text in Notes/warnings; Unknown/N/A markers are accepted. Saved manual dates remain protected from unrelated parser results. Archive departure-date requirements are unchanged.

Room and Space input clicks clear the current text and run existing input handling, including parent/copy synchronization and Smart Complete protection; dropdown option clicks and keyboard focus do not clear selected choices. Applies to main and copy location inputs. Powerbank offers Battery Capacity (mAh); Power adds Charger with Charge Capacity (W) and Output Ports (free text). There are now 59 configured tags. Units remain editable.

All 81 parser/model/static checks pass, including unknown/malformed mapped dates overriding inferred dates and the new presets. Version/build/cache/manifests/HTML/workflow/release align at 0.0.1.25. Browser desktop/mobile/offline review remains pending under the recorded preview-server approval restriction; no server launched. Before-copies are /private/tmp/my-stuff-date-power-baseline; source checkout was clean at bcd5638 (0.0.1.24). Transfer uses exact equality guards and byte verification. No commit or push performed.

## Latest update — locations, Tech tags and cable details (0.0.1.24)

Missing zones/rooms no longer render Unassigned labels, dropdown options or room-total rows. Settings omits placeholder headings while retaining standalone named rooms/spaces. Inventory records and overall totals remain unchanged. Single Location in the editor hides the main Zone/Space fields and accepts free text in the existing room field; toggling it on clears the current item's parents in the draft. Standalone custom locations reopen in this mode. Empty parent controls on copy rows collapse in this mode; other copies with existing structured locations retain their parents. Bulk draft capture retains the mode. No schema changes.

Tech now includes Laptop, Watch, Phone and Tablet (58 configured tags). Bags offers Capacity with unit L. End A/End B use editable native searchable datalists from config.inventory.cableEnds. Known variants (USB C, USB-C, USB Type C, etc.) standardize on edit/save via inventoryModel.cableEnd; unknown connector values remain allowed. Unedited stored records are not migrated. Add Item and Bulk Add show their words below their supplied symbols; Bulk Add preserves its queue-aware accessible label/title.

All 79 model/parser/static tests pass, including connector aliases/custom values, standalone-copy preservation, absent placeholder catalog labels, new Tech tags and Bags capacity. Version/build/cache/manifests/HTML/workflow/release align at 0.0.1.24. Browser desktop/mobile/offline review remains pending under the prior recorded preview-server approval restriction; no server launched. Before-copies for this combined update are at /private/tmp/my-stuff-location-labels-baseline; transfer is guarded against exact baseline equality in the source checkout at e69c087 (0.0.1.23). No commit or push performed.

## Latest update — compact inventory workspace (0.0.1.23)

Removed the visible duplicate workspace heading while retaining the heading as a screen-reader/focus target. Search, Location and Category now sit at the left of the ownership toolbar, with visually hidden labels and equal-height controls. Edit and Archive are adjacent icon-only controls with existing item-specific accessible labels. Room and Space share a flex line beneath Zone. Reduced row padding/detail line spacing; content still wraps as needed. Category cards are 72px (previously 90px), use 2em symbols (previous default 1em), and retain full label tooltips. Only favorite brands appear in the Brands dropdown group and derived quick cards; other category groups remain available. All brands remain available in Settings and the item editor.

All 76 model/parser/static checks pass. Version/build/cache/manifests/HTML/workflow/release align at 0.0.1.23. Desktop/mobile/offline visual checks remain pending under the previously recorded preview-server approval restriction; no server launched. Transfer uses /private/tmp/my-stuff-compact-baseline equality guards against the source checkout at 44058de (0.0.1.22). No commit or push performed.

## Latest update — ownership layout and add controls (0.0.1.22)

All/House/Me cards place their symbol above their word in a left column beside the Everything/Filtered totals. Mobile numeric columns can wrap to retain the left-column layout with enlarged text. The main and empty-state Add buttons read Add Item and use the supplied plus-square SVG. Bulk Add is icon-only using the supplied stacked plus-square SVG; its accessible label/title retain the pending review count when queue status updates. Original SVG viewBoxes and paths, currentColor and 0.85 opacity are retained; pasted Markdown namespaces were normalized. Other plus controls are unchanged.

All 76 automated checks pass; version/build/cache/manifests/HTML/workflow/release align at 0.0.1.22. Visual desktop/mobile/offline review remains pending under the recorded preview-server approval restriction. No preview server, commit or push was run. Transfer uses byte-equality guards against /private/tmp/my-stuff-actions-baseline and the original iCloud GitHub checkout at b2452cd (0.0.1.21).

## Latest update — supplied inventory symbols (0.0.1.21)

Added 51 unique supplied symbols to the shared inline registry. Edit retains its visible text and item-specific accessible label with the supplied pencil. Category cards resolve supplied symbols for matching names and existing vocabulary aliases (including group prefixes, Paddles, Biking, Footware, Apparel, Lighting, Books, Appliances and Barware). Unknown categories keep the box fallback. Existing Water/Cables symbols remain intact. The later Glassware SVG takes precedence over the earlier duplicate; Powercord and Power Chord remain separate supplied entries. Scarf loses fixed dimensions/root ID and uses currentColor for theme compatibility. Supplied path geometry and viewBoxes are preserved; all symbols are decorative and nonfocusable. No vocabulary or stored inventory changes.

Version/build, HTML queries, service-worker cache, manifests, workflow and release entry align at 0.0.1.21. All 76 model/parser/static checks pass using the bundled Node runtime (system Node lacks --test). Parsed 53 category/edit SVG entries and verified accessibility attributes and viewBoxes. Browser/desktop/mobile/offline visual checks remain pending under the prior recorded preview-server approval rejection; no server was launched. No commit, push or cloud write performed.

This workspace has an unborn main branch, every project file was already untracked, and no Git remote is configured. Preserve the pre-existing application work. The nine files changed for this request have before-copies at /private/tmp/my-stuff-symbols-baseline; Git diff alone cannot describe their changes. The nine symbol-update files are being transferred to the canonical iCloud Documents/GitHub/my-stuff checkout after confirming its clean HEAD 4801b8f and exact baseline equality. Commit and push remain user-run steps.

## In progress — grouped copies and global search (0.0.1.20)

Latest steering implemented locally: Settings up to 1800px wide; rooms with inline spaces; catalog labels/values/groups close Settings and open Have with a structured filter (space includes its zone+room). Favorite stars remain separate controls. Tag/property group filters match any member. Category dropdown has selectable group parents and indented tags; cards share group/tag matching, including brand properties. Ownership cards are wider with aligned Everything/Filtered count+value grids. Table columns are Object and Properties/Notes, Zone/Room/Space, Count, Value, Obtained/Departure, Actions. Brand/name share a title line; other properties/seller/notes/tags follow beneath. Added pure catalog filter coverage and a browser regression for routing/layout. Browser review is still blocked by the existing credit-related approval rejection; The user subsequently requested transfer; all 16 task files are now copied and byte-verified in the source checkout.

Workspace implementation adds same-name/brand/owner grouping by room, Count before combined Value, unioned properties/notes/sellers/dates, independent departure history, and matching-copy editing across rooms. Copy rows are horizontal Zone/Room/Space controls using shared autocomplete; typed known rooms and unique spaces resolve parents. Zone-only/custom parent overrides persist. Color, End A and End B omit unit inputs; other units remain optional. Inventory navigation moves into the top bar and global search includes current/archived inventory, catalog, Notes, settings, full help and releases. Canonical version/query/cache/manifests/workflow moved to 0.0.1.20.

76 model/parser/static checks pass. Added grouping/parent tests and two browser regressions; updated Count header expectation. Browser tests and visual/mobile/offline review have NOT run for this update. Review caught and fixed the new picker callback accidentally receiving forEach index arguments. No server is running.

Automatic approval review rejected preview-server launch because workspace credits are exhausted and requires owner refill. Do not bypass it. The 16 task files were transferred to the GitHub source checkout on explicit user request; byte verification and git diff --check passed. Source HEAD remains f44bee2 with uncommitted 0.0.1.20 changes. Baseline: /private/tmp/my-stuff-20-baseline. Resume after credits refill: run full browser suite (38 tests) against local preview, inspect desktop/mobile grouped rows/copy pickers/header/search, fix regressions, then transfer any further fixes with destination checks and verify whitespace/version consistency. Do not commit/push. No agent-status file created.

## Latest update — instant filters and ownership age (0.0.1.19)

Main inventory amounts render in whole dollars without changing stored cents or form precision. Rows place Properties between Object and Notes and offer Edit plus a far-right archive action. Displayed details and room totals are exact, composable filters; Clear Filters resets them. Overall current All/House/Me totals remain visible across views, with filtered counts and values below. Object names now filter; Edit opens the object. Custom properties precede Notes in the editor too.

`inventoryModel.ownershipAge` returns calendar years/months/days and annual obtaining-price cost (current value fallback). Month/year anniversaries clamp to the last valid day, covering leap dates. The archive form shows age, total days and annual average, updating with the departure date; missing dates/amounts and same-day ownership have no annual average. Direct row archive uses the same stale-record protection and save flow.

Settings Inventory has three columns for locations, tags and properties, stacking on narrow screens. Star controls use a shared SVG. Favorite brands sort first in catalog brand lists and the searchable Brand picker. `preferences.favoriteBrands` is normalized device state included in full backups and excluded from inventory cloud payloads. Brand selection retains manual Smart Complete protection.

Verification: 73 parser/model/static checks and 35 isolated browser checks pass, with final focused regressions also passing. Tested whole-dollar display vs stored cents, exact filters and fixed/filtered totals, direct archive, calendar edge cases, brand ordering/reload, mobile layout, and offline flows. Desktop/mobile screenshots inspected; version/cache/manifest/workflow and script/asset/whitespace checks aligned. Source baseline HEAD c0ea390 (0.0.1.18). No commit, push, live cloud writes, or agent-status files.

## Latest update — compact inventory filters (0.0.1.18)

Inventory fills the available horizontal space. All/House/Me totals are compact header buttons, replacing the ownership dropdown. Category dropdown and horizontal square cards share one filter; configured and used categories are available. Location filtering uses grouped native options for zones, indented rooms and their spaces; zones and spaces are selectable. The Add Room picker exposes the same hierarchy. Supplied Me/House/Water/Cables SVG paths and viewBoxes are retained in the shared symbol registry.

`inventoryModel.tags` canonicalizes Cable/cables aliases to Cables. Its preset retains Length and adds End A / End B. `normalizeItem` fills either missing amount from the other while preserving zero, different explicit amounts, and both-unknown. Existing records/imports receive the same normalization; no schema change. Form fallback runs after blur without modifying the focused input, and bulk preparation fills amounts for review. Finishing bulk review closes its dialogs, clears filters and returns to Stuff I Have; skipped rows stay in the local queue.

Saved current items now expose Total Copies and per-copy location rows. Increasing adds independent records, decreasing confirms permanent deletion of trailing rows; the opened item is first. Delete Item confirms permanent removal for current or archived records. Other copies keep their own details. All affected snapshots are checked for concurrent edits before saving/deleting. New optional `copyGroup` IDs survive normalization, backups/sync and bulk draft capture; ungrouped legacy records with identical non-location details are recognized together. Archived records are excluded from copy totals. Older clients may strip this optional link, so update all devices. No schema bump; absent group fields remain absent on legacy normalized records.

Verification: 71 parser/model/static checks and 33 isolated browser checks pass. Coverage includes copy-group persistence, per-copy location edits, confirmed/canceled reductions and deletion, stale-edit rejection, combined filters, amount fallback, supplied SVGs, desktop/mobile and offline behavior. Desktop/mobile home and copy editor screenshots were inspected; script, asset, manifest, cache, version and whitespace checks pass. Source HEAD is now 4474e43 (the user committed 0.0.1.17); only 0.0.1.18 changes need staging. No agent-status protocol, commit, push or live cloud writes.

## Latest update — copy locations and property set toggles (0.0.1.17)

Sling Bag is a configured space under Nook, Main Level. Smart Complete now accepts only known vocabulary as inferred trailing tags; Float and other unknown trailing text remain in Notes. Existing saved records are not silently rewritten. Item input and textarea text stays white on contrasting fields after manual edits; placeholders are gray.

Property-set buttons use aria-pressed, a highlighted border and × when the tag and all set properties are present. Clicking × removes the tag and set fields, retaining properties shared by another selected set. Removing the set also protects its fields against Smart Complete reapplication. This avoids treating Backpacking as selected merely because Shoes already supplied Weight.

Copies in Add now has a room and space per copy. `createCopies` accepts legacy room strings or `{room,space}` overrides, resolves unique known spaces and validates room/space combinations before saving. Different rooms clear inherited spaces and update the parent zone. Bulk review enables Copies as well: expansion persists adjacent independent queue entries before saving the first, resets the current copy count to one for safe retries, and reviews each additional copy. Quantity and per-copy location drafts survive pause/resume. Limits and existing inventory schema stay intact.

Verification: 69 parser/model/static checks and 29 isolated browser checks, including new normal/bulk per-copy spaces, Float correction, white manual values, property toggle/overlap behavior, and desktop/mobile/offline flows. Version/cache/manifests/workflow and Help/docs aligned. No agent-status system was recreated; no commit or push.

## Latest update — Smart Complete every bulk object (0.0.1.16)

Every new bulk draft now carries its original row in `_smartEntry`; the Add form expands Smart Complete and renders source highlights/destination buttons on each review. Mapped spreadsheet fields retain precedence; manual changes update the highlight comparison without reapplying other parsed values. Draft `_reviewed`, `_smartManual`, `_smartApplied`, and `_autoProperties` preserve corrections and autofill styling across pause/reload. These are queue-only metadata, excluded from saved inventory. Older queue rows without source text receive their stored source without replacing existing field edits.

The parser uses tab offsets to recognize leading configured rooms or unique spaces, tags, dates and dollar prices. Floating resolves to Nook/Main Level/space Floating. Ambiguous Closet does not choose an arbitrary parent. Known Vapur brand is stripped from Object; tags after a bracketed value (Float in the supplied row) join leading Water. Water is a category property preset with Volume, and explicit bottle measurements populate oz/mL/L. Pack of 2 remains descriptive text unless a quantity column explicitly expands copies. Supplied sample parses price 12, value 24, date 2024-09-22, Amazon, Vapur, Volume 23 oz, Water/Float tags, and the cleaned object name.

Object gestures are now right-click → append to Brand, Control-click → delete, plain click → caret. Context-menu Control-click supports macOS as well as ordinary Control-click events. Keyboard Alt+ArrowUp/Alt+Delete and Control/Command+Z still work. Autofilled inputs/properties/tags use white text on a contrasting dark field background in both themes; manual edits remove provenance styling. More Details remains expanded; visible Smart Complete content may require scrolling for bulk rows.

Verification: 68 parser/model/static checks and 27 isolated Chromium browser checks pass, including the new inventory sample, per-row visible highlighting, Volume persistence, manual-field preservation, revised gestures, responsive UI and offline review. Version/release/cache/manifests/workflow, Help, README and testing guidance are aligned. No commit/push or live cloud writes; unrelated staged icon files remain excluded.

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

My Stuff is a local-first inventory app at version `0.0.1.18`. The main workspace prioritizes Stuff I Have, with item editing, ownership (house/me), rooms, category tags/presets, acquisition details, value/price, custom properties, search/filters, and room/ownership totals. Stuff I Had retains archived objects with gone date, reason, notes, and calendar days owned, and supports returning an item. Want and Research are explicitly labelled placeholders. The responsive header, centered support search, autosaving Notes, Settings, Help, release notes, Developer diagnostics, recovery, backup/import, optional GitHub Sync, and PWA/offline features remain intact.

The supplied storage-box artwork is preserved at `assets/icons/my-stuff-app-icon.svg` and used unchanged by both header themes and the favicon. Install PNGs, maskable variants, Apple touch icons, and splash assets remain aligned. `scripts/generate-icons.mjs` regenerates PNGs with development-only Playwright; see `docs/CUSTOMIZATION.md`. User changes observed during the inventory work deleted six unused App Icon Template reference assets and added `my-stuff-app-icon-wip.svg`; these are unrelated edits, left untouched and excluded from the suggested inventory commit. Runtime remains static and dependency-free. Browser storage keeps the same `myStuff.*` keys; GitHub Sync still targets `themadat/app-data/main/data/my-stuff.json`.

Settings/sync updates from app-template `0.0.1.61` through `0.0.1.67` remain integrated. Local state/backups now use schema 2 and migrate schema 1 without losing Notes/preferences. Cloud writes use sync version 1/schema 6, including inventory (currency plus current and archived records) and Notes, with a `data-v2:` hash and stable item-ID ordering. Older Notes-only cloud copies preserve local inventory on download; full old backup import explicitly replaces everything after a warning/recovery save. Merge unions distinct IDs, but different records for one ID or divergent nonempty Notes require choosing a copy. Update older devices before syncing inventory; older clients intentionally reject schema 6.

Verification covers 47 simulated inventory/sync tests, 3 static consistency/artwork tests, and 13 isolated Chromium browser tests, including real inventory forms, category properties, unknown/zero values, ownership/room totals, archive/return, leap-day duration, stale drafts, nested Escape, cloud/backup privacy and recovery, desktop/mobile (320px at 130% text), and offline persistence. Desktop/mobile screenshots use temporary fixture records in an isolated browser, not actual user data. No real token, live cloud upload, commit, push, or deployment was performed.

## Current update and pending sync diagnosis

Version `0.0.1.9` applies Title Case to inventory and support interface labels and adopts burnt orange (`#b44916`) with light/dark link, selection, hover, and focus colors. Existing saved accents normalize to the app defaults; display mode and text scale remain intact. USD is fixed across normalized state, forms, totals, backups, and outgoing cloud data.

The user reported “This is not a supported My Stuff cloud copy.” This exact error came from legacy whole-state validation (workspace present, missing Notes, or malformed/oversized Notes). The connected GitHub tool returned 404 reading `themadat/app-data/main/data/my-stuff.json`; the actual shape is unverified. Requested a redacted JSON structure from the user. Do not guess a migration or discard unrecognized workspace data. Errors now explain which validation branch rejected the file. The actual sync repair remains pending; resume from this handoff and the relevant repository changes when the file structure arrives.

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
