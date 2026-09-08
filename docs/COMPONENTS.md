# Components

## Header

The sticky header contains the supplied application artwork, identity/version, centered support search, Notes, and Settings. Clicking the artwork cycles theme; press-and-hold toggles Developer Mode.

## Inventory workspace

`inventory-ui.js` mounts four navigation destinations in `main`: Stuff I Have (default), Stuff I Want (placeholder), Research (placeholder), and Previous Stuff. Shared inline SVG symbols identify navigation and ownership totals. Current inventory has overall/house/personal totals, searchable/filterable item rows, and a room breakdown. The table becomes stacked item rows on narrow screens; summaries always cover all current items regardless of filters.

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
