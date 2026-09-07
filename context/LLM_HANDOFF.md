# Agent handoff

My Stuff is a clean local-first foundation at version `0.0.1.2`. The repository contains a responsive header with centered support search, intentionally blank semantic workspace, one autosaving plain-text Notes modal, vertical Settings, Appearance, Help, What’s New, an empty Roadmap, shortcut reference, Developer diagnostics, combined local/GitHub status, recovery, JSON backup/import, optional GitHub Sync, and PWA/offline support. Its compact interface-symbol helper embeds the original SVG artwork required by every retained control without depending on removed product data.

Application artwork is retained as a placeholder. The runtime is static and dependency-free. Browser data uses the app-specific `myStuff.*` namespace; GitHub Sync targets `themadat/my-stuff`, branch `main`, at `data/my-stuff.json`.

## Repository map

- `index.html`: shell, blank workspace, Notes, Settings, and shared dialogs.
- `assets/css/app.css`: themes, components, responsive layout, safe areas, and reduced motion.
- `assets/js/config.js`: identity, version, storage/sync settings, Help, releases, Roadmap, and shortcuts.
- `assets/js/icons.js`: small inline interface-symbol helper.
- `assets/js/app.js`: shell rendering, Notes, Settings, search, appearance, and shortcuts.
- `assets/js/core/`: state, storage, components, portability, sync, utilities, and PWA behavior.
- `assets/icons/`: placeholder application and install assets.
- `manifest*.webmanifest`, `sw.js`, `.github/workflows/deploy-pages.yml`: install, offline, and hosting surfaces.

## Invariants

- Keep the runtime static, backend-free, and usable on an ordinary static host.
- Preserve the blank main workspace until an explicit feature request replaces it.
- Preserve one plain-text Notes surface, Settings, combined storage/sync status, recovery, JSON portability, optional GitHub Sync, and offline support.
- Secrets remain device-local and excluded from exports and normalized diagnostics.
- Imported state cannot redirect the configuration-fixed GitHub target.
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
python3 -m http.server 8000
```

Check desktop/mobile startup, no console errors or horizontal overflow, blank workspace, Notes autosave, all Settings tabs, appearance, empty Roadmap, Help/release search, shortcuts, backup/import, recovery, combined status, GitHub setup, PWA registration/update/offline reload, visible focus, and reduced motion. Stop the server afterward.

## End of turn

After edits, summarize outcome and verification, then provide exactly one copy-paste command that stages only request files, commits with `Version - Text`, and pushes the current branch. Do not run it unless explicitly requested.
