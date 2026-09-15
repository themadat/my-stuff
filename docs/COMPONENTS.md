# Components

## Header

The sticky header contains the supplied application artwork, identity/version, centered support search, Notes, and Settings. Clicking the artwork cycles theme; press-and-hold toggles Developer Mode.

## Inventory workspace

`inventory-ui.js` mounts four navigation destinations in `main`: Stuff I Have (default), Stuff I Want (placeholder), Research (placeholder), and Stuff I Had. Shared inline SVG symbols identify navigation and ownership totals. Current inventory has overall/house/personal totals, searchable/filterable item rows, and a room breakdown. The table becomes stacked item rows on narrow screens; summaries always cover all current items regardless of filters.

The labelled item form contains core attributes, comma-separated tags, optional category presets, and editable property/value/unit rows. Unknown prices remain blank. The separate departure form records date/reason/notes and calculated duration. Native dialog focus, cancellation safeguards, validation feedback, and stale-item checks protect drafts. Previous items remain editable and can return to current inventory after confirmation. Item text is escaped, never interpreted as HTML.

## Notes

Notes is a single labelled plain-text textarea. Input is normalized, autosaved locally, and included in backup and sync payloads.

## Settings

Settings uses labelled vertical tabs for Appearance and data settings, Help, What’s New, Roadmap, Shortcuts, and Developer tools. On small screens the tab row scrolls horizontally while the dialog remains one full-height surface.

## Storage and sync status

The floating status combines local persistence and optional GitHub state. It runs Sync Now when available, or opens and focuses the sync credentials in Settings when setup/access is needed. Settings and the floating control share state-specific inline cloud symbols, semantic light/dark tints, and accessible text; only active comparison arrows rotate, with reduced-motion support. Sync choices never silently overwrite divergent data.

Settings includes Sync Now, confirmed Restore from Cloud, safe repository/data-file links, masked saved credentials, and Test/Save/Forget actions. Draft token and remember-checkbox edits survive unrelated renders. On mobile, Settings fills the screen and scrolls as a single surface beneath its sticky close header; tabs and long target details scroll horizontally within their own rows.

The first-sync/conflict choice dialog renders each option as a left-aligned icon-and-copy row. Decorative shared cloud SVGs precede the label and description, including on mobile. Test displays a read-only result dialog rather than claiming upload success. GitHub error details and repository-specific access guidance remain visible below the status in Settings.

## Data Sync section

The `data-sync` tab inside Settings owns Data & connection and the collapsible outgoing JSON preview. It uses the supplied braces SVG from the shared interface-symbol helper. Sync setup events open this tab and focus the token input. Its tab name survives state normalization but is not cloud content.

The native `details` disclosure starts closed. When expanded, `renderSyncPayload` uses `JSON.stringify(stateModel.syncPayload(state()), null, 2)`, matching the data-file serialization used by GitHub uploads. The preview is assigned with `textContent` to a keyboard-focusable, wrapping `pre`/`code` surface; it is never editable HTML. Expanded content refreshes on state changes, closed previews are cleared, and tokens, preferences, and sync metadata are excluded by the content-only model. Opening it never fetches or writes remote content.

## Shared dialogs

Import preview, confirmation, choice, message, toast, and loading components share focus restoration and accessible labelling through `assets/js/core/components.js`.

Seller, Brand, and Object use matching title/placeholder text. Object word actions retain the native input: click moves a whitespace-delimited token to Brand, right-click removes that occurrence, and drag selection or modified clicks retain normal editing. A measured DOM mirror accounts for font shaping and horizontal scroll. Alt+ArrowUp/Alt+Delete act at the caret; Control+Z or Command+Z reverses recent word actions until further manual input. Both affected fields are protected from subsequent Smart Complete suggestions. Brand limits are checked before moving a word, and required Object validation still applies.

At mobile widths (up to 700px), the inventory toolbar uses separate search, dropdown, quick-selection, and ownership/action rows. All/House/Me select ownership; separate chevron buttons toggle totals, with session-local expansion choices. They default to condensed on mobile and expanded elsewhere. Expanded mobile cards wrap with the actions, preserving 44px targets. Room-only item sections precede the named spaces in the same room.

The sidebar divider saves a percentage in device-only preferences.controls.locationSidebarPercent. Desktop resizing restores the proportion with 160–420px bounds; mobile layout does not overwrite it.

### Measurement and Compact Editor Controls

The inventory model exposes `measurement(property)` to split recognized numeric unit suffixes and derive approximate US equivalents without replacing metric values. The editor commits value/unit on change and save; both editor and inventory list display the derived equivalent. Unitless and unrecognized content is preserved. Conversion previews are not stored.

The item editor places Tags beside Notes, uses the full width for custom properties, and keeps copy labels and Shared controls inline. Date Unknown clears the date and disables its control. Hovered object rows accept E for Edit and A for the archive form, with input/dialog/modifier guards. Ownership symbols are centered and cards retain separate selection and expansion controls.

### Table Location Disclosure and Copy Editing

Table location state is session-local and independent of sidebar disclosure. Zone, room and space buttons hide descendants, preserve nested state, and expose aria-expanded. Sidebar jumps reveal the target path. Measurement equivalents remain inline with their property in the object details row.

Copy Shared controls clear disabled override inputs; labels use #1, #2. The tag editor marks brand/Float tags as fixed and supports drag or Alt+Arrow reordering for other tags. Notes stretches alongside the tag search and selected tags on desktop. Command+Enter and Control+Enter call requestSubmit, preserving native form validation. PWA state uses updateReady when supplied and falls back to updateApp otherwise.

### Location Totals and Entry Defaults

The per-path location map aggregates count, integer value cents and unknown-value count across filtered descendant sections. Sidebar values and table section cells consume the same totals; collapsing a branch does not alter them. Mobile headers and object rows share count/value grid widths.

New Weight fields default to oz without overwriting explicit units. Unknown dates use a visual dash overlay on a disabled native date input; the stored date remains empty. Smart Complete resolves configured locationAliases and full room-plus-space prefixes, while ambiguous bare space names remain untouched.

### Sidebar Filters

Right-click, Shift+F10 or the context-menu key on an Around the House location filters by its complete path. Repeating toggles it off; the visible Location filter label and Clear also reset it. Left-click retains location navigation. Category quick controls remain; both former dropdowns are replaced by hidden internal filter values. The mobile toolbar uses three rows.

### Sidebar Numeric Tracks and Property Hints

All location rows share count/value widths derived from the largest displayed totals, with minimum four/nine character tracks. Review dates appear below names. Preset-category controls show an immediate, viewport-clamped tooltip on hover or focus. The tooltip uses textContent and aria-describedby and is mounted inside a dialog when needed.

### Direct Archive Entry

Add in Stuff I Had enables departure fields and saves the normalized archived record directly, bypassing createCopies (which intentionally clears archive state). Smart Complete's archive option recognizes tab-separated departure dates/reasons/notes and a second amount as value. The mode is explicit and does not affect ordinary entry parsing. New archived items require departure date/reason and retain chronology validation.

Normalization maps Nook / Sling Bag to Sling for items and review-date keys. Govee has a brand/company relationship and the supplied inline SVG category symbol.
