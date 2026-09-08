# Customization

## Identity

Edit `identity` in `assets/js/config.js`, then update `index.html`, both manifests, the service-worker cache prefix, and `.github/workflows/deploy-pages.yml`. Create new app-specific state, secret, recovery, install, and sync identifiers whenever the product identity changes.

## Appearance

Theme defaults live in `assets/js/config.js`; light and dark surfaces live in `assets/css/app.css`. Preserve visible focus, contrast, reduced-motion behavior, safe areas, and the `85%`–`130%` text scale.

## Application artwork

The supplied artwork is preserved at `assets/icons/my-stuff-app-icon.svg`; `app-icon-light.svg`, `app-icon-dark.svg`, and `favicon.svg` are identical copies. Both themes retain its original colors. Splash SVGs embed the same artwork on the appropriate theme background. Unused `App Icon Template` files are reference assets, not active application artwork.

After editing the source, align those SVG copies and the embedded splash SVGs, then run `node scripts/generate-icons.mjs` using a development-only Playwright/Chromium installation (`PLAYWRIGHT_MODULE` can point to an external `index.mjs`). This regenerates the checked-in 192px/512px icons, 180px Apple touch icons, 512px maskable icons, and 1170px splash PNGs. It adds no runtime dependency. The current maskable foreground is scaled to 72% over an opaque blue background to keep the key artwork inside platform masks; Apple touch icons have opaque corners. Review the maskable layout if the source composition changes.

## Content

Help topics, releases, Roadmap items, and shortcuts are configuration arrays. Keep Help truthful, release history chronological, and the Roadmap empty until a real plan exists.

## First feature

Add semantic HTML to the blank workspace, only the state fields it actually needs, and narrow CSS/JavaScript. Keep user text escaped and URLs validated.
