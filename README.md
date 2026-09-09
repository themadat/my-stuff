# My Stuff

My Stuff is a static, local-first inventory for personal and household belongings. It has no required build step, runtime dependency, backend, account, or sign-in.

Start in **Stuff I Have**. Smart Complete accepts a purchase line and highlights its date obtained, object, brand, seller, obtaining price, and bracketed value. Leading dates accept US `MM/DD/YY`, `MM/DD/YYYY`, or ISO `YYYY-MM-DD`; two-digit years mean 20xx. Invalid dates remain in Notes for review. Payment/account text and unknown markers remain in Notes. Review and correct the fields; manual corrections survive continued typing. Use explicit annotations such as `brand: Acme; owner: house; obtained: Gift;` for unfamiliar brands or overrides. New items default to **Me** and **Purchased**, with single-click segmented choices. Search zones, rooms, spaces, and tags using the full WISH-001 vocabulary or add custom choices. The wider desktop modal puts Seller, Brand, and Object on one row, with Date Obtained beside the amounts. More Details starts expanded with notes and custom properties. The sample form fits a 1366×768 desktop viewport without scrolling; smaller screens, larger text, and longer property lists retain scrolling for access. Brand, Zone, and Space are stored as existing named properties, preserving the current backup/cloud schema.

Add one entry per physical object, recording whether it belongs to the house or to you, its current room, category tags, obtained date/method/source, current value, obtaining price, and custom properties. Shoes suggest size/color/weight, backpacking gear suggests weight, and cables suggest length. Presets are optional; tags and properties remain editable.

Current counts and known values are split by ownership and room. Unknown values are not treated as zero. Archive an item to **Stuff I Had** with its gone date, reason, and departure notes; days owned are calculated from its obtained date. Archived items leave current totals but retain their details and can be returned. **Stuff I Want** and **Research** are placeholders for later development.

The application keeps its centered support search, one Notes modal, Settings, appearance controls, Help, release notes, shortcuts, recovery, JSON backup/import, optional GitHub Sync, and PWA/offline behavior. No example items are added to your real inventory.

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
assets/js/inventory-ui.js  Inventory workspace, filters, item and archive editors
assets/js/core/inventory.js Item validation, totals, duration, and conservative merge
assets/js/core/            State, storage, backup, sync, components, and PWA modules
assets/icons/              My Stuff application and install artwork
manifest*.webmanifest      Light and dark install metadata
sw.js                      Offline shell cache
```

## Customize

Start with `assets/js/config.js` for identity, colors, Help, releases, category presets, room suggestions, fixed USD currency, and optional GitHub Sync target. All values and prices use USD; existing numeric amounts are retained when reading older copies. The app uses burnt orange accents and Title Case interface labels.

Application artwork comes from the supplied `assets/icons/my-stuff-app-icon.svg`, preserved unchanged in the header and favicon for both themes. Matching PNGs cover ordinary and maskable installation icons, Apple touch icons, and light/dark splash screens. See `docs/CUSTOMIZATION.md` for regeneration.

## Data and privacy

Open Settings → Data Sync for Data & connection, GitHub credentials, sync actions, and the collapsible “JSON sent to GitHub” preview. The preview uses the actual upload payload, updates with inventory and Notes, and renders as read-only escaped text. It is not a full backup or a fetched remote copy. General Settings retains appearance, backup/import, and reset controls.

Inventory, Notes, and preferences use the app-specific `myStuff.*` browser-storage namespace. Full JSON backups include device preferences but exclude the GitHub token. Optional GitHub Sync sends current and archived inventory plus Notes to `themadat/app-data`, branch `main`, at `data/my-stuff.json`; appearance, search, settings, and save metadata stay local. Supply a fine-grained token with Contents read and write access to that repository.

Local backups now use schema 2; schema 1 backups still migrate. Cloud writes use sync version 1/schema 6 so Notes-only clients reject them safely. Update all devices before syncing inventory. Older Notes-only cloud files remain readable and do not erase existing inventory. Importing a full old backup is an explicit replacement and clears inventory absent from that backup, after creating recovery. Distinct item IDs can merge, but different edits to the same item (including archive status) require choosing a copy. There is no automatic last-write-wins deletion.

Settings shows linked repository/file targets and masked saved credentials. Test retains a token after a read check, but explicitly does not verify upload permission or write anything to GitHub. Save stores it and checks the cloud copy. Remember keeps it on this device; otherwise it lasts for the browser tab. Sync Now (or `S`/the floating status) compares copies and asks how to resolve first sync or conflicting Notes, using left-aligned choices with leading symbols. Restore from Cloud requires confirmation and a successful local recovery backup.

If Test passes but upload reports Access Required, check that the fine-grained token selects `themadat/app-data` and grants Contents: Read and write. The token owner must have repository write access, required organization approvals must be complete, and branch rules must allow this direct write. Settings displays GitHub’s rejection details. A readable public repository does not prove write permission; only a successful upload does. After correcting access, save the token again and retry Sync Now.

Cloud sync and Settings incorporate app-template versions `0.0.1.61`–`0.0.1.67`. Older My Stuff cloud files remain readable and compact on explicit sync. Update other devices before syncing the new content-only format; older clients intentionally reject it. No repository provisioning or Git account configuration is changed by this port.

## Versioning

The reset baseline is `0.0.1.1`. Every completed application update increments the fourth number. Keep the version, build id, HTML queries, manifests, service-worker ids, release entry, and deployment workflow label aligned.

## Agent workflow

Repository lifecycle shorthands are documented in `AGENTS.md` and `context/LLM_HANDOFF.md`: `reset`, `wish`, `plan`, `start`, and `cut` never silently advance into one another.
