import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const context = vm.createContext({ window: { LocalApp: {} } });
vm.runInContext(read('assets/js/config.js'), context);
const config = context.window.LocalApp.config;

test('runtime scripts parse without a build step', () => {
  const files = ['sw.js', ...['assets/js/', 'assets/js/core/'].flatMap(dir => readdirSync(new URL(dir, root)).filter(file => file.endsWith('.js')).map(file => dir + file))];
  for (const file of files) execFileSync(process.execPath, ['--check', new URL(file, root).pathname]);
});

test('release, HTML, install assets, deployment label and offline cache align', () => {
  const version = config.identity.version;
  assert.match(version, /^\d+\.\d+\.\d+\.\d+$/);
  assert.equal(config.identity.buildId, version);
  assert.equal(config.releases[0].version, version);
  const html = read('index.html');
  assert.ok(html.includes('v' + version));
  assert.ok(read('.github/workflows/deploy-pages.yml').includes(version));
  const worker = vm.createContext({ self: { addEventListener() {} } });
  vm.runInContext(read('sw.js'), worker);
  assert.equal(vm.runInContext('ASSET_VERSION', worker), version);
  assert.equal(vm.runInContext('CACHE_NAME', worker), config.identity.slug + '-shell-' + version);
  const paths = [...vm.runInContext('SHELL', worker), ...Object.values(config.identity.assets)];
  for (const manifest of ['manifest.webmanifest', 'manifest-dark.webmanifest']) {
    const source = read(manifest), parsed = JSON.parse(source);
    assert.equal(parsed.name, config.identity.name);
    assert.ok(source.includes(version));
    paths.push(...parsed.icons.map(icon => icon.src));
    for (const match of source.matchAll(/\?v=([^"\s]+)/g)) assert.equal(match[1], version);
  }
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) paths.push(match[1]);
  for (const match of html.matchAll(/\?v=([^"\s]+)/g)) assert.equal(match[1], version);
  for (const path of paths) {
    if (/^https?:/.test(path)) continue;
    assert.ok(existsSync(new URL(path.split('?')[0], root)), 'Missing asset: ' + path);
  }
});
