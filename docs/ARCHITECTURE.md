# Architecture

My Stuff is a dependency-free static application. Scripts attach focused modules to `window.LocalApp` in the order declared by `index.html`.

## Runtime flow

1. `config.js` establishes public identity, version, storage keys, release data, Help, and optional sync target.
2. `utils.js` provides sanitization, safe URLs, time, ids, hashing, and formatting.
3. `state.js` creates and normalizes the small state model: metadata, one plain-text note, preferences, UI state, Roadmap filters, and sync metadata.
4. `storage.js` loads and autosaves state, keeps recovery copies, and stores the token separately.
5. `components.js` manages dialogs, confirmations, choices, toasts, focus restoration, and long press.
6. `portability.js` validates JSON backup/import and excludes secrets.
7. `sync.js` compares normalized payloads with the configured GitHub file and requires explicit conflict choices.
8. `pwa.js` manages appearance-aware install assets, registration, network state, and update refresh.
9. `app.js` binds the shell, Notes, Settings, search, appearance, shortcuts, diagnostics, and status UI.

The main workspace is deliberately empty. New product features should add the smallest appropriate state and rendering surface while preserving the local-first boundary.
