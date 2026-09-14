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

test('app artwork is preserved across themes and install PNGs have the declared dimensions', () => {
  const source = read('assets/icons/my-stuff-app-icon.svg');
  for (const file of ['app-icon-light.svg', 'app-icon-dark.svg', 'favicon.svg']) assert.equal(read('assets/icons/' + file), source);
  assert.doesNotMatch(source, /<script|<foreignObject|(?:href|src)=["']https?:/i);
  for (const suffix of ['', '-dark']) {
    for (const [file, size] of [['icon-192' + suffix, 192], ['icon-512' + suffix, 512], ['icon-512-maskable' + suffix, 512], ['apple-touch-icon' + suffix, 180], ['splash-' + (suffix ? 'dark' : 'light'), 1170]]) {
      const png = readFileSync(new URL('assets/icons/' + file + '.png', root));
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.equal(png.readUInt32BE(16), size, file);
      assert.equal(png.readUInt32BE(20), size, file);
    }
  }
});

test('Update checks the worker and refreshes only after saving; offline/save failures stay put', async () => {
 for (const mode of ['update','offline','save-failure']) {
  const messages=[],notices=[],timers=new Map(),navigations=[]; let checks=0,saves=0;
  const registration={waiting:{postMessage:m=>messages.push(m)},update:async()=>{checks++;}};
  const app={config:{},storage:{saveNow:()=>{saves++;return mode!=='save-failure';}},components:{toast:m=>notices.push(m)}};
  const sandbox=vm.createContext({URL,Date,location:{href:'https://example.com/my-stuff/',protocol:'https:',replace:url=>navigations.push(url)},navigator:{onLine:mode!=='offline',serviceWorker:{getRegistration:async()=>registration}},window:{LocalApp:app,setTimeout:fn=>{const id=timers.size+1;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)}});
  vm.runInContext(read('assets/js/core/pwa.js'),sandbox);
  await app.pwa.checkForUpdates();
  if (mode==='update') {
   assert.equal(saves,1); assert.ok(checks>=1); assert.equal(messages[0].type,'SKIP_WAITING');
   for (const callback of timers.values()) callback();
   assert.ok(new URL(navigations[0]).searchParams.has('force-refresh'));
  } else { assert.equal(checks,0); assert.equal(timers.size,0); assert.equal(notices.length,1); }
 }
});

test('a waiting service worker changes Update artwork and activation clears the indicator', async () => {
 const listeners={},attributes={},symbol={};
 const button={dataset:{},querySelector:()=>symbol,setAttribute:(k,v)=>attributes[k]=v,addEventListener(){}};
 const registration={waiting:{},addEventListener(){}};
 const app={config,storage:{getState:()=>({preferences:{appearance:{mode:'light'}}})},icons:{markup:name=>name,set:(target,name)=>{target.name=name;}},components:{toast(){throw new Error("Update availability must not create a bottom notification");}}};
 const sandbox=vm.createContext({location:{protocol:'https:'},navigator:{serviceWorker:{controller:{},register:async()=>registration,addEventListener:(name,fn)=>listeners[name]=fn}},document:{documentElement:{dataset:{}},querySelector:selector=>selector==='#updateAppButton'?button:null},window:{LocalApp:app,addEventListener(){},matchMedia:()=>({matches:false,addEventListener(){}})}});
 vm.runInContext(read('assets/js/core/pwa.js'),sandbox); app.pwa.init();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(button.dataset.updateAvailable,'true'); assert.equal(symbol.name,'updateReady');
 assert.match(attributes['aria-label'],/new version available/);
 listeners.controllerchange();
 assert.equal(button.dataset.updateAvailable,'false'); assert.equal(symbol.name,'updateApp');
});

 test('both update states have a concrete SVG symbol', () => {
   const context=vm.createContext({window:{}}); vm.runInContext(read('assets/js/icons.js'),context);
   for (const name of ['updateApp','updateReady']) {
     const svg=context.window.LocalApp.icons.markup(name);
     assert.match(svg,/<svg[^>]+viewBox=/); assert.match(svg,/<path/);
   }
 });
