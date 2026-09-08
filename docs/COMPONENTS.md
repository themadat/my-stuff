# Components

## Header

The sticky header contains the placeholder application artwork, identity/version, centered support search, Notes, and Settings. Clicking the artwork cycles theme; press-and-hold toggles Developer Mode.

## Blank workspace

`main` contains one semantic blank section. It is the extension point for the first product feature.

## Notes

Notes is a single labelled plain-text textarea. Input is normalized, autosaved locally, and included in backup and sync payloads.

## Settings

Settings uses labelled vertical tabs for Appearance and data settings, Help, What’s New, Roadmap, Shortcuts, and Developer tools. On small screens the tab row scrolls horizontally while the dialog remains one full-height surface.

## Storage and sync status

The floating status combines local persistence and optional GitHub state. It runs Sync Now when available, or opens and focuses the sync credentials in Settings when setup/access is needed. Settings and the floating control share state-specific inline cloud symbols, semantic light/dark tints, and accessible text; only active comparison arrows rotate, with reduced-motion support. Sync choices never silently overwrite divergent data.

Settings includes Sync Now, confirmed Restore from Cloud, safe repository/data-file links, masked saved credentials, and Test/Save/Forget actions. Draft token and remember-checkbox edits survive unrelated renders. On mobile, Settings fills the screen and scrolls as a single surface beneath its sticky close header; tabs and long target details scroll horizontally within their own rows.

The first-sync/conflict choice dialog renders each option as a left-aligned icon-and-copy row. Decorative shared cloud SVGs precede the label and description, including on mobile. Test displays a read-only result dialog rather than claiming upload success. GitHub error details and repository-specific access guidance remain visible below the status in Settings.

## Shared dialogs

Import preview, confirmation, choice, message, toast, and loading components share focus restoration and accessible labelling through `assets/js/core/components.js`.
