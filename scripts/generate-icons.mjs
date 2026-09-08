// Development-only asset generation. The deployed application has no dependencies.
// PLAYWRIGHT_MODULE may point to an external Playwright index.mjs installation.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const root = new URL('../assets/icons/', import.meta.url);
const artwork = readFileSync(new URL('my-stuff-app-icon.svg', root), 'utf8');
// Scale the foreground inside the central safe circle; keep the blue full-bleed.
const background = '<rect width="1024" height="1024" rx="220" fill="url(#bg)"/>';
if (!artwork.includes(background)) throw new Error('Review maskable layout for the changed source artwork.');
const inner = artwork.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(background, '');
const maskable = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="url(#bg)"/><g transform="translate(143.36 143.36) scale(.72)">' + inner + '</g></svg>';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.route('**/*', route => route.abort());
  async function render(svg, size, file) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent('<!doctype html><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}body>svg{display:block;width:100%;height:100%}</style>' + svg);
    await page.screenshot({ path: new URL(file, root).pathname, omitBackground: true });
  }
  for (const mode of ['light', 'dark']) {
    const suffix = mode === 'dark' ? '-dark' : '';
    for (const size of [192, 512]) await render(artwork, size, 'icon-' + size + suffix + '.png');
    await render(maskable, 512, 'icon-512-maskable' + suffix + '.png');
    // Apple applies its own corner mask; provide opaque edge pixels.
    await render(artwork.replace(background, background.replace(' rx="220"', '')), 180, 'apple-touch-icon' + suffix + '.png');
    await render(readFileSync(new URL('splash-' + mode + '.svg', root), 'utf8'), 1170, 'splash-' + mode + '.png');
  }
} finally { await browser.close(); }
