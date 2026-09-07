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
assets/icons/              Placeholder application and install artwork
manifest*.webmanifest      Light and dark install metadata
sw.js                      Offline shell cache
```

## Customize

Start with `assets/js/config.js` for identity, colors, Help, release notes, and optional GitHub Sync target. Add the first product feature to the blank `<main>` workspace without introducing a backend unless the product requires one.

Application artwork is intentionally retained as a placeholder. Replace the editable SVG and generated PNG assets together, keeping the existing filenames or updating every reference.

## Data and privacy

Notes and preferences use the app-specific `myStuff.*` browser-storage namespace. JSON exports exclude the GitHub token. Optional GitHub Sync targets `themadat/my-stuff`, branch `main`, at `data/my-stuff.json`; a user supplies a fine-grained token with Contents access.

## Versioning

The reset baseline is `0.0.1.1`. Every completed application update increments the fourth number. Keep the version, build id, HTML queries, manifests, service-worker ids, release entry, and deployment workflow label aligned.

## Agent workflow

Repository lifecycle shorthands are documented in `AGENTS.md` and `context/LLM_HANDOFF.md`: `reset`, `wish`, `plan`, `start`, and `cut` never silently advance into one another.
