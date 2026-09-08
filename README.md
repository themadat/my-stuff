# My Stuff

My Stuff is a clean, static, local-first application foundation. It has no required build step, runtime dependency, backend, account, or sign-in.

The starter keeps a responsive application header, centered support search, blank semantic workspace, one plain-text Notes modal, vertical Settings, appearance controls, Help, What’s New, an empty Roadmap, shortcuts, local persistence and recovery, JSON backup/import, optional GitHub Sync, and PWA/offline behavior.

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Serving over HTTP enables service-worker and offline checks that do not run from a direct `file:` URL.

## Project structure

```text
index.html                 Semantic shell and dialogs
assets/css/app.css         Theme, layout, components, and responsive styles
assets/js/config.js        Identity, version, help, releases, and roadmap data
assets/js/icons.js         Small inline interface-symbol helper
assets/js/app.js           Rendering, events, Notes, Settings, and shortcuts
assets/js/core/            State, storage, backup, sync, components, and PWA modules
assets/icons/              My Stuff application and install artwork
manifest*.webmanifest      Light and dark install metadata
sw.js                      Offline shell cache
```

## Customize

Start with `assets/js/config.js` for identity, colors, Help, release notes, and optional GitHub Sync target. Add the first product feature to the blank `<main>` workspace without introducing a backend unless the product requires one.

Application artwork comes from the supplied `assets/icons/my-stuff-app-icon.svg`, preserved unchanged in the header and favicon for both themes. Matching PNGs cover ordinary and maskable installation icons, Apple touch icons, and light/dark splash screens. The unused `App Icon Template` reference files are retained separately. See `docs/CUSTOMIZATION.md` for regeneration.

## Data and privacy

Open Settings → Data Sync for Data & connection, GitHub credentials, sync actions, and the collapsible “JSON sent to GitHub” preview. The preview uses the actual upload payload, updates with local Notes, and renders as read-only escaped text. It is not a full backup or a fetched remote copy. General Settings retains appearance, backup/import, and reset controls.

Notes and preferences use the app-specific `myStuff.*` browser-storage namespace. Full JSON backups include device preferences but exclude the GitHub token. Optional GitHub Sync sends Notes only to `themadat/my-stuff`, branch `main`, at `data/my-stuff.json`; appearance, search, settings, and save metadata stay local. Supply a fine-grained token with Contents read and write access to that repository.

Settings shows linked repository/file targets and masked saved credentials. Test retains a token after a read check, but explicitly does not verify upload permission or write anything to GitHub. Save stores it and checks the cloud copy. Remember keeps it on this device; otherwise it lasts for the browser tab. Sync Now (or `S`/the floating status) compares copies and asks how to resolve first sync or conflicting Notes, using left-aligned choices with leading symbols. Restore from Cloud requires confirmation and a successful local recovery backup.

If Test passes but upload reports Access Required, check that the fine-grained token selects `themadat/my-stuff` and grants Contents: Read and write. The token owner must have repository write access, required organization approvals must be complete, and branch rules must allow this direct write. Settings displays GitHub’s rejection details. A readable public repository does not prove write permission; only a successful upload does. After correcting access, save the token again and retry Sync Now.

Cloud sync and Settings incorporate app-template versions `0.0.1.61`–`0.0.1.67`. Older My Stuff cloud files remain readable and compact on explicit sync. Update other devices before syncing the new content-only format; older clients intentionally reject it. No repository provisioning or Git account configuration is changed by this port.

## Versioning

The reset baseline is `0.0.1.1`. Every completed application update increments the fourth number. Keep the version, build id, HTML queries, manifests, service-worker ids, release entry, and deployment workflow label aligned.

## Agent workflow

Repository lifecycle shorthands are documented in `AGENTS.md` and `context/LLM_HANDOFF.md`: `reset`, `wish`, `plan`, `start`, and `cut` never silently advance into one another.
