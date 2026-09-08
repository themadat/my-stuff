# Architecture

My Stuff is a dependency-free static application. Scripts attach focused modules to `window.LocalApp` in the order declared by `index.html`.

## Runtime flow

1. `config.js` establishes public identity, version, storage keys, release data, Help, and optional sync target.
2. `utils.js` provides sanitization, safe URLs, time, ids, hashing, and formatting.
3. `core/inventory.js` validates items, dates, money, properties, and archive details, calculates ownership/room totals and days owned, and merges distinct records conservatively. `state.js` creates and normalizes the state model: inventory, metadata, one plain-text note, preferences, UI state, Roadmap filters, and sync metadata.
4. `storage.js` loads and autosaves state, keeps recovery copies, and stores the token separately.
5. `components.js` manages dialogs, confirmations, choices, toasts, focus restoration, and long press.
6. `portability.js` validates JSON backup/import and excludes secrets.
7. `sync.js` compares content-only hashes with the configured GitHub file, exposes shared semantic cloud states, and requires explicit first-sync/conflict choices. Confirmed restores require a successful recovery copy.
8. `pwa.js` manages appearance-aware install assets, registration, network state, and update refresh.
9. `inventory-ui.js` initializes the inventory workspace and item/archive dialogs before shared component bindings; it rerenders lists/totals only when inventory content changes. `app.js` binds the shell, Notes, Settings, search, appearance, shortcuts, diagnostics, and status UI.

The main workspace prioritizes current inventory. Ownership (`house`/`me`) is independent of room. Each record represents one object; categories and named value/unit properties are per item. `archive` is null or a date/reason/notes record; archives are never hard-deleted by the item UI. Current totals exclude archives and count missing monetary values separately. Currency is inventory-wide and synced; changing it relabels amounts rather than performing conversion. List filters are session-only and never change overall totals.

## Cloud data boundary

Local state and full JSON backups use schema version 2, with a migration from schema 1 that preserves existing Notes and settings. GitHub writes use `{ syncFormat: "local-first-app-data", syncVersion: 1, schemaVersion: 6, data: { inventory: { currency: "USD", items: [] }, notes: "…" } }`; empty Notes omit the `notes` field. Schema 6 prevents Notes-only clients from dropping inventory content. Unknown cloud content, unsupported versions, malformed Notes/items, duplicate IDs/properties, invalid dates/amounts, and foreign legacy workspace files are rejected before replacement or upload.

`syncHash` fingerprints this stable content envelope with a `data-v2:` prefix, sorting items by ID. Appearance, UI, Roadmap filters, tokens, and sync metadata cannot create cloud changes. `applySync` replaces inventory and Notes while retaining local preferences and configuration. Older Notes-only cloud copies are marked `syncNotesOnly` during preparation: their downloads replace Notes but preserve local inventory. This transient marker is never normalized into local state or exported. Full old backups still replace the entire state after an explicit warning and recovery save.

Merge unions distinct item IDs and keeps identical records; differing item content, archive status, or nonempty Notes cannot auto-merge. No edit timestamps silently decide conflicting data. Legacy My Stuff whole-state copies remain readable; equal content or an unchanged baseline SHA upgrades the comparison baseline, and explicit Sync Now upgrades a matching legacy copy. Form snapshots prevent saving over an item that changed during editing, and Escape/Cancel ask before discarding unsaved drafts.

The sync engine and cloud symbols are ported from app-template `c1ff33f` (`0.0.1.67`), covering the Settings/sync line beginning at `0.0.1.61`. My Stuff retains its own identity, fixed cloud target, plain-text Notes model, and dependency-free runtime.

Currency is fixed to USD. Normalization accepts previously supported currency labels for compatibility and emits USD while preserving numeric amounts; no exchange-rate conversion occurs. The currency picker has been removed. Appearance normalization adopts the configured burnt orange accents, preserving mode, scale, and semantic status colors. Legacy cloud rejections distinguish workspace data, missing Notes structure, and invalid/oversized Notes; validation still prevents writes and replacements.
