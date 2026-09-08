# Agent handoff

My Stuff is a clean local-first foundation at version `0.0.1.6`. The repository contains a responsive header with centered support search, intentionally blank semantic workspace, one autosaving plain-text Notes modal, vertical Settings, Appearance, Help, What’s New, an empty Roadmap, shortcut reference, Developer diagnostics, combined local/GitHub status, recovery, JSON backup/import, optional GitHub Sync, and PWA/offline support. Its compact interface-symbol helper embeds the original SVG artwork required by every retained control without depending on removed product data.

The supplied storage-box app artwork is preserved at `assets/icons/my-stuff-app-icon.svg` and used unchanged by both header themes and the favicon. Install PNGs, padded maskable variants, opaque Apple touch icons, and themed splash SVG/PNG assets are aligned. `scripts/generate-icons.mjs` regenerates PNGs with development-only Playwright; see `docs/CUSTOMIZATION.md`. Unused template reference files remain untouched. The runtime is static and dependency-free. Browser data uses the app-specific `myStuff.*` namespace; GitHub Sync targets `themadat/my-stuff`, branch `main`, at `data/my-stuff.json`.

Settings/sync updates from app-template `0.0.1.61` through `0.0.1.67` (`c1ff33f`, verified remote HEAD) are integrated. This includes compact appearance/target controls, safe repository/file links, masked stored tokens and dirty-field retention, saved successful tests, explicit Sync Now/Restore actions, shared cloud symbols/tints, safe conflict/recovery handling, and single-scroller mobile Settings. Sync sends Notes only; local state/backups remain schema 1, while the compact cloud envelope uses sync version 1/schema 5. Legacy My Stuff files remain readable, with explicit compaction on sync. Update older devices before syncing the new envelope. No upstream icon-library product state, reset provisioning workflow, or Git account routing was imported.

Verification: 37 simulated sync tests, 3 static consistency/artwork tests, and 9 isolated Chromium browser tests pass, including desktop/mobile (320px at 130% text), theme-specific icon loading, imports, export privacy, masked token persistence, cloud restore recovery, reduced motion, and offline reload. The supplied SVG is preserved byte-for-byte; install dimensions, maskable foreground padding, and opaque Apple touch assets were checked. GitHub responses are mocked in tests; no live cloud upload or deployment was performed. The existing root-level button-style click handler was narrowed to actual buttons after it was found to interfere with remember-token checkbox edits.

## Repository map

Settings now has a dedicated `data-sync` tab with the supplied braces SVG. Data & connection moved there; appearance and backup/reset remain in general Settings. The native collapsed-by-default JSON disclosure shows `JSON.stringify(stateModel.syncPayload(state()), null, 2)` via textContent, updates while expanded, and excludes credentials/device settings. It describes the outgoing local file rather than a fetched cloud copy. Sync setup events route directly to this tab. Tests cover keyboard navigation, narrow/mobile layouts, escaping, preview/upload equality, and token exclusion.

Current sync UX: first-sync/conflict options are left-aligned with leading shared cloud symbols. Test uses GET requests only and labels its result “Read check passed — uploads unverified”; it rejects known archived/disabled/read-only repositories but never claims that read access proves Contents write permission. Access failures retain GitHub’s message and show repository-specific guidance in Settings. Branch-rule denials are distinguished from stale-content conflicts. Tests reproduce successful reads followed by a denied upload; no real token permissions or repository rules were changed. The earlier Notes-highlighting clarification remains unresolved and no Notes changes have been made.

- `index.html`: shell, blank workspace, Notes, Settings, and shared dialogs.
- `assets/css/app.css`: themes, components, responsive layout, safe areas, and reduced motion.
- `assets/js/config.js`: identity, version, storage/sync settings, Help, releases, Roadmap, and shortcuts.
- `assets/js/icons.js`: small inline interface-symbol helper.
- `assets/js/app.js`: shell rendering, Notes, Settings, search, appearance, and shortcuts.
- `assets/js/core/`: state, storage, components, portability, sync, utilities, and PWA behavior.
- `assets/icons/`: supplied application artwork and generated install assets.
- `manifest*.webmanifest`, `sw.js`, `.github/workflows/deploy-pages.yml`: install, offline, and hosting surfaces.

## Invariants

- Keep the runtime static, backend-free, and usable on an ordinary static host.
- Preserve the blank main workspace until an explicit feature request replaces it.
- Preserve one plain-text Notes surface, Settings, combined storage/sync status, recovery, JSON portability, optional GitHub Sync, and offline support.
- Secrets remain device-local and excluded from exports and normalized diagnostics.
- Imported state cannot redirect the configuration-fixed GitHub target.
- Cloud restores preserve device preferences and require a successful recovery write. Unknown cloud content is rejected, and unequal nonempty Notes require an explicit copy choice.
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
node --test tests/sync.test.mjs tests/static.test.mjs
python3 -m http.server 8000
```

Check desktop/mobile startup, no console errors or horizontal overflow, blank workspace, Notes autosave, all Settings tabs, appearance, empty Roadmap, Help/release search, shortcuts, backup/import, recovery, combined status, GitHub setup, PWA registration/update/offline reload, visible focus, and reduced motion. Stop the server afterward.

## End of turn

After edits, summarize outcome and verification, then provide exactly one copy-paste command that stages only request files, commits with `Version - Text`, and pushes the current branch. Do not run it unless explicitly requested.
