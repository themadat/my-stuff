# Testing

## Automated baseline

```sh
for file in assets/js/*.js assets/js/core/*.js sw.js; do node --check "$file" || exit 1; done
node -e "const fs=require('fs'); for (const file of ['manifest.webmanifest','manifest-dark.webmanifest']) JSON.parse(fs.readFileSync(file,'utf8'));"
git diff --check
node --test tests/sync.test.mjs tests/static.test.mjs tests/smart-entry.test.mjs
```

Also verify every local path referenced by HTML, CSS, manifests, configuration, and the service worker exists.

The dependency-free sync suite uses simulated GitHub responses and storage. It covers state symbols, HTTP failures, token persistence, conflicts, recovery requirements, uploads/restores, stale requests, content-only hashes, and legacy cloud migration. Static tests verify script syntax, release/cache/version alignment, manifest parsing, and asset paths.

Optional browser regression tests require a development-only Playwright installation with Chromium, not an application dependency. Start `python3 -m http.server 8765 --bind 127.0.0.1`, then run `node --test tests/browser.test.mjs`. Set `PLAYWRIGHT_MODULE` to an absolute Playwright `index.mjs` if it is installed outside this repository, and optionally `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an installed Chromium executable. Set `TEST_BASE_URL` if using another local port. Tests use isolated browser contexts and mocked GitHub responses; they never touch a real token or cloud file. Coverage includes desktop/mobile Settings at 320px–130% text, credentials and draft retention, real sync/restore controls, export privacy, reduced motion, and service-worker offline reload.

## Browser baseline

Serve the repository locally and check desktop and mobile widths:

- startup has no console errors and opens an empty current inventory without fabricated items;
- add/edit items, multi-tag category presets, custom properties, ownership/room filters, and known/unknown-value totals work;
- archive records date/reason/notes and correct calendar-day duration, excludes items from current totals, and supports returning an item;
- unsaved forms ask before discarding, invalid amounts/dates cannot save, and stale edits cannot overwrite changed items;
- inventory and Notes round trip through backup/cloud/recovery, old Notes-only cloud restores preserve inventory, and conflicts never silently discard item details;
- Notes starts blank, autosaves, survives reload, and restores from JSON;
- every Settings tab opens and remains reachable;
- theme, text size, button style, hints, and keyboard shortcuts work;
- Roadmap shows its useful empty state and What’s New shows the current release first;
- local status, recovery, import/export, and GitHub setup are accurate;
- Data Sync owns Data & connection; its braces icon renders, sync setup focuses this tab, and the collapsible JSON matches actual upload content without credentials or device preferences;
- the install shell reloads offline, inventory remains editable and persistent, and the update notice can force refresh;
- focus is visible, reduced motion is honored, and no horizontal overflow appears.

Stop the local server when finished.
