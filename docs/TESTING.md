# Testing

## Automated baseline

```sh
for file in assets/js/*.js assets/js/core/*.js sw.js; do node --check "$file" || exit 1; done
node -e "const fs=require('fs'); for (const file of ['manifest.webmanifest','manifest-dark.webmanifest']) JSON.parse(fs.readFileSync(file,'utf8'));"
git diff --check
```

Also verify every local path referenced by HTML, CSS, manifests, configuration, and the service worker exists.

## Browser baseline

Serve the repository locally and check desktop and mobile widths:

- startup has no console errors and the main workspace is blank;
- Notes starts blank, autosaves, survives reload, and restores from JSON;
- every Settings tab opens and remains reachable;
- theme, text size, button style, hints, and keyboard shortcuts work;
- Roadmap shows its useful empty state and What’s New has one release;
- local status, recovery, import/export, and GitHub setup are accurate;
- the install shell reloads offline and the update notice can force refresh;
- focus is visible, reduced motion is honored, and no horizontal overflow appears.

Stop the local server when finished.
