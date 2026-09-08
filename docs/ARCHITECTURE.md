# Architecture

My Stuff is a dependency-free static application. Scripts attach focused modules to `window.LocalApp` in the order declared by `index.html`.

## Runtime flow

1. `config.js` establishes public identity, version, storage keys, release data, Help, and optional sync target.
2. `utils.js` provides sanitization, safe URLs, time, ids, hashing, and formatting.
3. `state.js` creates and normalizes the small state model: metadata, one plain-text note, preferences, UI state, Roadmap filters, and sync metadata.
4. `storage.js` loads and autosaves state, keeps recovery copies, and stores the token separately.
5. `components.js` manages dialogs, confirmations, choices, toasts, focus restoration, and long press.
6. `portability.js` validates JSON backup/import and excludes secrets.
7. `sync.js` compares content-only hashes with the configured GitHub file, exposes shared semantic cloud states, and requires explicit first-sync/conflict choices. Confirmed restores require a successful recovery copy.
8. `pwa.js` manages appearance-aware install assets, registration, network state, and update refresh.
9. `app.js` binds the shell, Notes, Settings, search, appearance, shortcuts, diagnostics, and status UI.

The main workspace is deliberately empty. New product features should add the smallest appropriate state and rendering surface while preserving the local-first boundary.

## Cloud data boundary

Local state and full JSON backups retain schema version 1. GitHub writes use `{ syncFormat: "local-first-app-data", syncVersion: 1, schemaVersion: 5, data: { notes: "…" } }`; empty Notes omit the `notes` field. Schema 5 is a guard against older whole-state clients, not a local-state migration. Unknown fields, unsupported versions, malformed Notes, and foreign legacy workspace files are rejected before replacement or upload.

`syncHash` fingerprints this stable content envelope with a `data-v1:` prefix. Timestamps, appearance, UI, Roadmap filters, tokens, and sync metadata cannot create cloud changes. `applySync` replaces Notes while retaining local preferences and configuration. Different nonempty Notes cannot auto-merge. Legacy My Stuff whole-state copies are read safely; equal content or an unchanged baseline SHA upgrades the comparison baseline, and explicit Sync Now compacts a matching legacy copy.

The sync engine and cloud symbols are ported from app-template `c1ff33f` (`0.0.1.67`), covering the Settings/sync line beginning at `0.0.1.61`. My Stuff retains its own identity, fixed cloud target, plain-text Notes model, and dependency-free runtime.
