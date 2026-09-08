// Optional browser QA: run against a local preview server; no real GitHub calls.
import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8765';
let browser;
before(async () => { browser = await chromium.launch({ headless: true }); });
after(async () => { await browser?.close(); });

async function fixture(t, options = {}) {
  const context = await browser.newContext({ serviceWorkers: 'block', ...options });
  t.after(() => context.close());
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  let remote = null, status = 200, delay = null;
  const writes = [];
  await context.route('https://api.github.com/**', async route => {
    if (delay) await delay;
    if (status !== 200) return route.fulfill({ status, json: { message: 'Test response' } });
    if (!route.request().url().includes('/contents/')) return route.fulfill({ json: {} });
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      remote = JSON.parse(Buffer.from(body.content, 'base64').toString());
      writes.push(remote);
      return route.fulfill({ json: { content: { sha: 'written-sha' } } });
    }
    return remote ? route.fulfill({ json: { type: 'file', sha: 'remote-sha', content: Buffer.from(JSON.stringify(remote)).toString('base64') } }) : route.fulfill({ status: 404, json: {} });
  });
  await page.goto(base);
  await page.locator('#supportButton').click();
  return { page, context, writes, set remote(value) { remote = value; }, set status(value) { status = value; }, set delay(value) { delay = value; } };
}

test('desktop Settings, safe links, appearance controls, and all retained SVGs', { timeout: 30000 }, async t => {
  const { page } = await fixture(t);
  assert.equal(await page.title(), 'My Stuff');
  assert.equal(await page.locator('#syncRepo').getAttribute('href'), 'https://github.com/themadat/my-stuff');
  assert.equal(await page.locator('#syncPath').getAttribute('href'), 'https://github.com/themadat/my-stuff/blob/main/data/my-stuff.json');
  assert.equal(await page.locator('#syncNowButton').isDisabled(), true);
  assert.match(await page.locator('#syncSettingsState').textContent(), /Sign In Required/);
  assert.equal(await page.locator('[data-symbol]').evaluateAll(elements => elements.every(el => el.querySelector('svg'))), true);
  for (const tab of ['data-sync', 'help', 'releases', 'roadmap', 'shortcuts', 'settings']) {
    await page.locator(`[data-support-tab="${tab}"]`).click();
    assert.equal(await page.locator(`[data-support-panel="${tab}"]`).isVisible(), true);
  }
  await page.locator('[data-theme-mode="dark"]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.waitForFunction(() => document.querySelector('#appIcon').complete && document.querySelector('#appIcon').naturalWidth > 0);
  assert.match(await page.locator('#appIcon').getAttribute('src'), /app-icon-dark\.svg\?v=/);
  await page.locator('[data-theme-mode="light"]').click();
  await page.waitForFunction(() => document.querySelector('#appIcon').complete && document.querySelector('#appIcon').naturalWidth > 0);
  assert.match(await page.locator('#appIcon').getAttribute('src'), /app-icon-light\.svg\?v=/);
  await page.locator('[data-button-style="icons"]').click();
  assert.equal(await page.locator('html').getAttribute('data-button-style'), 'icons');
  await page.locator('#textSizeSlider').fill('130');
  assert.equal(await page.locator('#textSizeValue').textContent(), '130%');
  assert.equal(await page.locator('.support-panels').evaluate(el => el.scrollHeight > el.clientHeight), true);
  assert.equal(await page.locator('#supportDialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
});

test('mobile Settings uses one vertical scroller with a visible sticky close button', { timeout: 30000 }, async t => {
  const { page } = await fixture(t, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.locator('#textSizeSlider').fill('130');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const layout = await page.evaluate(() => {
      const dialog = document.querySelector('#supportDialog'), panels = document.querySelector('.support-panels');
      dialog.scrollTop = dialog.scrollHeight;
      return { width: dialog.clientWidth, scrollWidth: dialog.scrollWidth, viewport: innerWidth, panelOverflow: getComputedStyle(panels).overflowY, scrolled: dialog.scrollTop > 0, closeTop: document.querySelector('[data-close-dialog="supportDialog"]').getBoundingClientRect().top };
    });
    assert.equal(layout.width, width); assert.equal(layout.viewport, width);
    assert.ok(layout.scrollWidth <= width); assert.equal(layout.panelOverflow, 'visible');
    assert.ok(layout.scrolled); assert.ok(layout.closeTop >= 0 && layout.closeTop < 100);
  }
  await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#floatingStatus').click();
  await page.waitForFunction(() => document.querySelector('#syncToken') === document.activeElement);
  assert.equal(await page.locator('#syncToken').evaluate(el => el === document.activeElement), true);
});

test('Test retains masked credentials and draft edits survive background renders', { timeout: 30000 }, async t => {
  const h = await fixture(t), { page } = h;
  await page.locator('#dataSyncTab').click();
  await page.locator('#syncToken').fill('fake-test-token');
  await page.locator('#syncRememberToken').uncheck();
  await page.locator('#settingsTab').click();
  await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('#dataSyncTab').click();
  assert.equal(await page.locator('#syncToken').inputValue(), 'fake-test-token');
  assert.equal(await page.locator('#syncRememberToken').isChecked(), false);
  await page.locator('#testSyncButton').click();
  await page.waitForFunction(() => document.querySelector('#storedTokenLabel').textContent === 'Stored for this tab');
  assert.match(await page.locator('[data-message-title]').textContent(), /Read check passed.*uploads unverified/);
  assert.match(await page.locator('[data-message-text]').textContent(), /cannot verify upload permission/);
  await page.locator('[data-message-close]').click();
  assert.equal(await page.locator('#syncToken').getAttribute('type'), 'password');
  assert.equal(await page.locator('#syncToken').inputValue(), 'fake-test-token');
  assert.match(await page.locator('#syncSettingsState').textContent(), /Connected/);
  assert.equal(await page.evaluate(() => localStorage.getItem('myStuff.githubToken.v1')), null);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('myStuff.githubToken.session.v1')), 'fake-test-token');
  await page.locator('#syncToken').fill('unsaved-draft');
  await page.locator('#syncRememberToken').check();
  await page.evaluate(() => window.LocalApp.sync.check(true));
  assert.equal(await page.locator('#syncToken').inputValue(), 'unsaved-draft');
  assert.equal(await page.locator('#syncRememberToken').isChecked(), true);
  await page.locator('#saveSyncButton').click();
  await page.waitForFunction(() => !window.LocalApp.sync.getInfo().busy);
  await page.reload(); await page.locator('#supportButton').click();
  await page.locator('#dataSyncTab').click();
  assert.equal(await page.locator('#syncToken').inputValue(), 'unsaved-draft');
  assert.equal(await page.locator('#storedTokenLabel').textContent(), 'Stored on this device');
  assert.equal(await page.evaluate(() => sessionStorage.getItem('myStuff.githubToken.session.v1')), null);
  assert.doesNotMatch(await page.locator('#developerState').textContent(), /unsaved-draft|fake-test-token/);
  await page.locator('#forgetSyncButton').click(); await page.locator('[data-confirm-action]').click();
  await page.waitForFunction(() => document.querySelector('#syncToken').value === '');
  assert.equal(await page.locator('#storedTokenLabel').textContent(), 'Required');
  assert.equal(await page.evaluate(() => window.LocalApp.storage.hasSecret()), false);
});

test('real controls upload only Notes, confirm cloud restore, retain settings, export without secrets', { timeout: 30000 }, async t => {
  const h = await fixture(t), { page } = h;
  await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#notesButton').click(); await page.locator('#notesTextarea').fill('Local ☁️\n<literal> Notes');
  await page.locator('[data-close-dialog="notesDialog"]').click();
  await page.reload(); await page.locator('#notesButton').click();
  assert.equal(await page.locator('#notesTextarea').inputValue(), 'Local ☁️\n<literal> Notes');
  await page.locator('[data-close-dialog="notesDialog"]').click(); await page.locator('#supportButton').click();
  await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('#dataSyncTab').click();
  await page.locator('#syncToken').fill('fake-secret'); await page.locator('#saveSyncButton').click();
  await page.waitForFunction(() => !window.LocalApp.sync.getInfo().busy);
  await page.locator('#syncNowButton').click();
  await page.locator('#choiceDialog').getByRole('button', { name: /Upload this device/ }).click();
  await page.waitForFunction(() => window.LocalApp.sync.getInfo().state === 'upToDate');
  assert.deepEqual(h.writes[0], { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 5, data: { notes: 'Local ☁️\n<literal> Notes' } });
  h.remote = { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 5, data: { notes: 'Cloud Notes' } };
  await page.locator('#restoreCloudButton').click(); await page.locator('[data-confirm-cancel]').click();
  assert.equal(await page.evaluate(() => window.LocalApp.storage.getState().notes.text), 'Local ☁️\n<literal> Notes');
  await page.locator('#restoreCloudButton').click(); await page.locator('[data-confirm-action]').click();
  await page.waitForFunction(() => window.LocalApp.storage.getState().notes.text === 'Cloud Notes');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  assert.ok(await page.evaluate(() => window.LocalApp.storage.recoveryInfo()));
  await page.locator('#settingsTab').click();
  const downloadPromise = page.waitForEvent('download'); await page.locator('#exportButton').click();
  const download = await downloadPromise, stream = await download.createReadStream();
  let bytes = ''; for await (const chunk of stream) bytes += chunk;
  assert.doesNotMatch(bytes, /fake-secret/);
  assert.equal(JSON.parse(bytes).state.preferences.appearance.mode, 'dark');
});

test('comparison alone animates arrows, reduced motion stops them, and authentication failure has a static symbol', { timeout: 30000 }, async t => {
  const h = await fixture(t), { page } = h;
  await page.locator('#dataSyncTab').click();
  await page.locator('#syncToken').fill('fake-token'); await page.locator('#testSyncButton').click();
  await page.locator('[data-message-close]').click();
  await page.waitForFunction(() => !window.LocalApp.sync.getInfo().busy);
  let release; h.delay = new Promise(resolve => { release = resolve; });
  await page.evaluate(() => { window.LocalApp.sync.check(true); });
  assert.equal(await page.locator('#floatingStatus').getAttribute('data-sync-state'), 'syncing');
  assert.equal(await page.locator('#floatingStatus .sync-rotation').evaluate(el => getComputedStyle(el).animationName), 'spin');
  assert.equal(await page.locator('#floatingStatusMessage').evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('#floatingStatus .sync-rotation').evaluate(el => getComputedStyle(el).animationName), 'none');
  release(); h.delay = null; await page.waitForFunction(() => !window.LocalApp.sync.getInfo().busy);
  h.status = 401;
  await page.evaluate(() => window.LocalApp.sync.check(true));
  assert.equal(await page.locator('#syncSettingsState').getAttribute('data-sync-state'), 'authenticationRequired');
  assert.equal(await page.locator('#syncSettingsState').getAttribute('data-animation'), 'none');
});

test('first-sync options are left-aligned with leading symbols at desktop and mobile widths', { timeout: 30000 }, async t => {
  const h = await fixture(t), { page } = h;
  await page.locator('#dataSyncTab').click();
  h.remote = { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 5, data: { notes: 'Cloud-only notes' } };
  await page.locator('#syncToken').fill('fake-token'); await page.locator('#saveSyncButton').click();
  await page.waitForFunction(() => !window.LocalApp.sync.getInfo().busy);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('#syncNowButton').click();
    await page.locator('#choiceDialog').waitFor({ state: 'visible' });
    const choices = await page.locator('[data-choice-value]').evaluateAll(buttons => buttons.map(button => {
      const icon = button.querySelector('.choice-icon'), copy = button.querySelector('.choice-copy');
      return { value: button.dataset.choiceValue, alignment: getComputedStyle(button).justifyContent, text: getComputedStyle(button).textAlign, icon: !!icon?.querySelector('svg'), iconRight: icon?.getBoundingClientRect().right, copyLeft: copy.getBoundingClientRect().left, overflow: button.scrollWidth > button.clientWidth };
    }));
    assert.deepEqual(choices.map(c => c.value), ['merge', 'upload', 'download']);
    for (const choice of choices) {
      assert.equal(choice.alignment, 'flex-start'); assert.equal(choice.text, 'left');
      assert.ok(choice.icon); assert.ok(choice.iconRight <= choice.copyLeft); assert.equal(choice.overflow, false);
    }
    await page.locator('[data-choice-cancel]').click();
  }
  assert.equal(h.writes.length, 0);
});

test('Data Sync shows the exact outgoing JSON without credentials and stays current after Notes changes', { timeout: 30000 }, async t => {
  const h = await fixture(t), { page } = h;
  assert.equal(await page.locator('#settingsPanel #storageSyncSettings').count(), 0);
  assert.equal(await page.locator('#dataSyncPanel #storageSyncSettings').count(), 1);
  await page.locator('#settingsTab').focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#dataSyncTab').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#dataSyncTab [data-symbol="braces"] svg').count(), 1);
  const details = page.locator('#syncPayloadDisclosure');
  assert.equal(await details.evaluate(el => el.open), false);
  await details.locator('summary').focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#syncPayloadJson').textContent.length > 0);
  const empty = { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 5, data: {} };
  assert.deepEqual(JSON.parse(await page.locator('#syncPayloadJson').textContent()), empty);
  await page.locator('#syncToken').fill('secret-not-in-json');
  await page.locator('#saveSyncButton').click(); await page.waitForFunction(() => !window.LocalApp.sync.getInfo().busy);
  assert.doesNotMatch(await page.locator('#syncPayloadJson').textContent(), /secret-not-in-json|preferences|cloudSync/);
  const note = 'Actual Notes ☁️\n<img src=x onerror=alert(1)> ' + 'long-note'.repeat(80);
  await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#notesButton').click(); await page.locator('#notesTextarea').fill(note);
  await page.locator('[data-close-dialog="notesDialog"]').click();
  await page.locator('#supportButton').click(); await page.locator('#dataSyncTab').click();
  const json = await page.locator('#syncPayloadJson').textContent();
  assert.equal(JSON.parse(json).data.notes, note);
  assert.equal(await page.locator('#syncPayloadJson img').count(), 0);
  assert.equal(json, await page.evaluate(() => JSON.stringify(window.LocalApp.stateModel.syncPayload(window.LocalApp.storage.getState()), null, 2)));
  await page.locator('#syncNowButton').click();
  await page.locator('[data-choice-value="upload"]').click();
  await page.waitForFunction(() => window.LocalApp.sync.getInfo().state === 'upToDate');
  assert.deepEqual(h.writes[0], JSON.parse(json));
  await page.locator('#settingsTab').click(); await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('#textSizeSlider').fill('130'); await page.locator('#dataSyncTab').click();
  assert.equal(await page.locator('#syncPayloadJson').textContent(), json);
  await page.setViewportSize({ width: 320, height: 844 });
  assert.equal(await page.locator('#supportDialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  assert.equal(await page.locator('#dataSyncPanel').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  await details.locator('summary').click();
  await page.waitForFunction(() => !document.querySelector('#syncPayloadDisclosure').open && document.querySelector('#syncPayloadJson').textContent === '');
});

test('JSON imports distinguish cloud content from full backups and preserve a recovery copy', { timeout: 30000 }, async t => {
  const { page } = await fixture(t);
  await page.locator('[data-theme-mode="dark"]').click();
  const backup = await page.evaluate(() => window.LocalApp.stateModel.exportEnvelope(window.LocalApp.storage.getState()));
  backup.state.notes.text = 'Backup Notes'; backup.state.preferences.appearance.mode = 'light';
  async function importData(data) {
    await page.locator('#importFileInput').setInputFiles({ name: 'test-copy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
    await page.locator('[data-import-confirm]').click();
    await page.locator('[data-confirm-action]').click();
    await page.waitForFunction(() => !document.querySelector('#importPreviewDialog').open);
  }
  await importData({ syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 5, data: { notes: 'Imported cloud Notes' } });
  assert.equal(await page.evaluate(() => window.LocalApp.storage.getState().notes.text), 'Imported cloud Notes');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await importData(backup);
  assert.equal(await page.evaluate(() => window.LocalApp.storage.getState().notes.text), 'Backup Notes');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.ok(await page.evaluate(() => window.LocalApp.storage.recoveryInfo()));
});

test('service worker caches this release and Notes remain available after offline reload', { timeout: 30000 }, async t => {
  const context = await browser.newContext(); t.after(() => context.close());
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base); await page.locator('#notesButton').click();
  await page.locator('#notesTextarea').fill('Offline Notes');
  await page.evaluate(async () => { window.LocalApp.storage.saveNow(); await navigator.serviceWorker.ready; });
  await page.reload();
  assert.ok(await page.evaluate(() => navigator.serviceWorker.controller));
  const expectedCache = await page.evaluate(() => window.LocalApp.config.identity.slug + '-shell-' + window.LocalApp.config.identity.buildId);
  assert.ok((await page.evaluate(() => caches.keys())).includes(expectedCache));
  await context.setOffline(true);
  await page.waitForFunction(() => navigator.onLine === false);
  assert.equal(await page.locator('#floatingStatus').getAttribute('data-sync-state'), 'offline');
  await page.reload(); await page.locator('#notesButton').click();
  assert.equal(await page.locator('#notesTextarea').inputValue(), 'Offline Notes');
  await page.waitForFunction(() => document.querySelector('#appIcon').complete && document.querySelector('#appIcon').naturalWidth > 0);
  // Chromium can reset navigator.onLine on a worker-controlled navigation;
  // verify the transport is actually offline independently of that indicator.
  assert.equal(await page.evaluate(async () => { try { await fetch('/uncached-offline-probe-' + Date.now()); return false; } catch { return true; } }), true);
  assert.deepEqual(errors, []);
});
