# Customization

## Identity

Edit `identity` in `assets/js/config.js`, then update `index.html`, both manifests, the service-worker cache prefix, and `.github/workflows/deploy-pages.yml`. Create new app-specific state, secret, recovery, install, and sync identifiers whenever the product identity changes.

## Appearance

Theme defaults live in `assets/js/config.js`; light and dark surfaces live in `assets/css/app.css`. Preserve visible focus, contrast, reduced-motion behavior, safe areas, and the `85%`–`130%` text scale.

## Application artwork

Files in `assets/icons/` are placeholders. Replace light and dark application SVGs and regenerate the matching 192px, 512px, maskable, Apple touch, and splash PNG assets. Verify important artwork remains inside maskable safe bounds.

## Content

Help topics, releases, Roadmap items, and shortcuts are configuration arrays. Keep Help truthful, release history chronological, and the Roadmap empty until a real plan exists.

## First feature

Add semantic HTML to the blank workspace, only the state fields it actually needs, and narrow CSS/JavaScript. Keep user text escaped and URLs validated.
