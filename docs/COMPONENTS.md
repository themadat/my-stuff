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

The floating status combines local persistence and optional GitHub state. It opens the relevant Settings surface. Sync choices never silently overwrite divergent data.

## Shared dialogs

Import preview, confirmation, choice, message, toast, and loading components share focus restoration and accessible labelling through `assets/js/core/components.js`.
