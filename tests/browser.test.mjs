// Optional browser QA: run against a local preview server; no real GitHub calls.
import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8765';
let browser;
before(async () => { browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) }); });
after(async () => { await browser?.close(); });

async function addInventoryItem(page, { name = 'Trail shoes', owner = 'me', room = 'Office', value = '100' } = {}) {
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
  await page.locator('#itemName').fill(name); await page.locator('input[name="itemOwnerChoice"][value="' + owner + '"]').check();
  await page.locator('#itemRoom').fill(room); await page.locator('#itemValue').fill(value);
  await page.locator('#saveItemButton').click();
}

test('inventory editor, category properties, ownership totals, filters, archive duration and return work end to end', { timeout: 30000 }, async t => {
  const { page } = await fixture(t);
  await page.locator('[data-close-dialog="supportDialog"]').click();
  assert.equal(await page.locator('#inventoryTitle').textContent(), 'Stuff I Have');
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  await page.locator('#itemName').fill('Trail shoes <img src=x onerror=alert(1)>');
  await page.locator('#itemDescription').fill('Everyday walking shoes');
  await page.locator('#itemRoom').fill('Office'); await page.locator('#itemValue').fill('129.95');
  await page.locator('#itemPrice').fill('99.95'); await page.locator('#itemObtainedDate').fill('2025-01-15');
  await page.locator('input[name="itemObtainedHowChoice"][value="Purchased"]').check(); await page.locator('#itemSource').fill('Local outdoor shop');
  await page.locator('[data-category-preset="0"]').click();
  await page.locator('[data-property-value]').nth(0).fill('9');
  await page.locator('[data-property-value]').nth(1).fill('Green');
  await page.locator('[data-property-value]').nth(2).fill('300');
  await page.locator('[data-category-preset="1"]').click(); await page.locator('[data-category-preset="2"]').click();
  assert.equal(await page.locator('.item-property').count(), 4);
  await page.getByRole('button', { name: 'Remove Backpacking gear', exact: true }).click(); await page.getByRole('button', { name: 'Remove Cables', exact: true }).click(); await page.locator('#itemTagSearch').fill('Everyday'); await page.locator('#itemTagSearch').press('Enter');
  assert.equal(await page.locator('.item-property').count(), 4, 'removing a category must not erase properties');
  await page.locator('#saveItemButton').click();
  await page.reload();
  assert.equal(await page.locator('#inventoryList img').count(), 0);
  assert.match(await page.locator('#inventoryList').textContent(), /Trail shoes <img/);
  await addInventoryItem(page, { name: 'Desk', owner: 'house', value: '500' });
  await addInventoryItem(page, { name: 'Lamp', owner: 'house', value: '' });
  assert.match(await page.locator('[data-inventory-total="all"]').textContent(), /3objects.*629\.95.*1 not valued/);
  assert.match(await page.locator('[data-inventory-total="house"]').textContent(), /2objects.*500\.00/);
  assert.match(await page.locator('[data-inventory-total="me"]').textContent(), /1objects.*129\.95/);
  assert.match(await page.locator('#roomStats').textContent(), /Office/);
  await page.locator('#inventoryOwnerFilter').selectOption('me');
  assert.equal(await page.locator('[data-edit-item]').count(), 1);
  assert.match(await page.locator('[data-inventory-total="all"]').textContent(), /3objects/);
  await page.locator('#clearInventoryFilters').click();
  await page.locator('#inventorySearch').fill('Green');
  assert.equal(await page.locator('[data-edit-item]').count(), 1);
  await page.locator('[data-edit-item]').click();
  assert.equal(await page.locator('#itemPrice').inputValue(), '99.95');
  await page.locator('#archiveItemButton').click();
  await page.locator('#itemGoneDate').fill('2026-01-15'); await page.locator('#itemGoneReason').selectOption('Broken');
  await page.locator('#itemGoneNotes').fill('Sole separated');
  assert.match(await page.locator('#archiveDuration').textContent(), /365 days/);
  await page.locator('#archiveForm button[type="submit"]').click();
  assert.match(await page.locator('[data-inventory-total="all"]').textContent(), /2objects.*500\.00/);
  await page.locator('#clearInventoryFilters').click();
  await page.locator('[data-inventory-view="previous"]').click();
  assert.match(await page.locator('#inventoryList').textContent(), /Broken.*365 days owned/);
  await page.locator('[data-edit-item]').click();
  assert.equal(await page.locator('.item-property').count(), 4);
  assert.match(await page.locator('#itemArchiveSummary').textContent(), /Sole separated/);
  await page.locator('#restoreItemButton').click(); await page.locator('[data-confirm-action]').click();
  await page.locator('[data-inventory-view="have"]').click();
  assert.equal(await page.locator('[data-edit-item]').count(), 3);
  await page.locator('[data-inventory-view="want"]').click(); assert.match(await page.locator('#inventoryComingSoon').textContent(), /future update/);
  await page.locator('[data-inventory-view="research"]').click(); assert.match(await page.locator('#inventoryComingSoon').textContent(), /comparison/);
});

test('unsaved inventory drafts, nested Escape, invalid input and concurrent edits are protected', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry'); await page.locator('#itemName').fill('Unsaved object');
  await page.keyboard.press('Escape'); await page.locator('[data-confirm-cancel]').click();
  assert.equal(await page.locator('#itemDialog').evaluate(el => el.open), true);
  await page.locator('#itemName').focus(); await page.keyboard.press('Escape');
  await page.locator('[data-confirm-action]').click();
  assert.equal(await page.locator('#itemDialog').evaluate(el => el.open), false);
  assert.equal(await page.locator('[data-edit-item]').count(), 0);
  await addInventoryItem(page);
  await page.locator('[data-edit-item]').click();
  await page.locator('#itemValue').fill('-1'); await page.locator('#saveItemButton').click();
  assert.equal(await page.locator('#itemValue').evaluate(el => el.validity.valid), false);
  await page.locator('#itemValue').fill('200');
  await page.evaluate(() => window.LocalApp.storage.mutate(state => { state.inventory.items[0].room = 'Garage'; }));
  await page.locator('#saveItemButton').click();
  assert.match(await page.locator('#itemFormError').textContent(), /changed while you were editing/);
  assert.equal(await page.evaluate(() => window.LocalApp.storage.getState().inventory.items[0].value), 100);
});

test('inventory sync payload, old-cloud preservation, restore recovery and backup include complete items without secrets', { timeout: 30000 }, async t => {
  const h = await fixture(t), { page } = h;
  await page.locator('[data-close-dialog="supportDialog"]').click(); await addInventoryItem(page);
  await page.locator('#supportButton').click(); await page.locator('#dataSyncTab').click();
  await page.locator('#syncToken').fill('fake-inventory-token'); await page.locator('#saveSyncButton').click();
  await page.locator('#syncNowButton').click(); await page.locator('[data-choice-value="upload"]').click();
  await page.waitForFunction(() => window.LocalApp.sync.getInfo().state === 'upToDate');
  assert.equal(h.writes.length, 1); assert.equal(h.writes[0].data.inventory.items[0].name, 'Trail shoes');
  await page.locator('#syncPayloadDisclosure summary').click();
  await page.waitForFunction(() => document.querySelector('#syncPayloadJson').textContent.includes('Trail shoes'));
  assert.deepEqual(JSON.parse(await page.locator('#syncPayloadJson').textContent()), h.writes[0]);
  assert.doesNotMatch(await page.locator('#syncPayloadJson').textContent(), /fake-inventory-token|preferences/);
  h.remote = { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 5, data: { notes: 'An older device' } };
  await page.locator('#restoreCloudButton').click(); await page.locator('[data-confirm-action]').click();
  await page.waitForFunction(() => window.LocalApp.storage.getState().notes.text === 'An older device');
  assert.equal(await page.evaluate(() => window.LocalApp.storage.getState().inventory.items.length), 1);
  const remote = structuredClone(h.writes[0]); remote.data.inventory.items[0].archive = { date: '2026-01-15', reason: 'Donated', notes: 'A second life' };
  h.remote = remote;
  await page.locator('#restoreCloudButton').click(); await page.locator('[data-confirm-action]').click();
  await page.waitForFunction(() => window.LocalApp.storage.getState().inventory.items[0].archive?.reason === 'Donated');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem(window.LocalApp.config.storage.recoveryKey)).state.inventory.items[0].archive), null);
  await page.locator('#settingsTab').click();
  const download = page.waitForEvent('download'); await page.locator('#exportButton').click();
  const stream = await (await download).createReadStream(), chunks = []; for await (const chunk of stream) chunks.push(chunk);
  const json = Buffer.concat(chunks).toString();
  assert.equal(JSON.parse(json).state.inventory.items[0].archive.reason, 'Donated'); assert.doesNotMatch(json, /fake-inventory-token/);
});

test('inventory and its editor fit narrow screens, large text and dark mode', { timeout: 30000 }, async t => {
  const { page } = await fixture(t, { viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true });
  await page.locator('#textSizeSlider').fill('130'); await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  await page.locator('#itemName').fill('Cable '.repeat(20)); await page.locator('[data-category-preset="2"]').click();
  await page.locator('[data-property-value]').fill('150');
  assert.equal(await page.locator('#itemDialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  assert.equal(await page.locator('#itemForm .dialog-body').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  await page.locator('#saveItemButton').click();
  assert.equal(await page.locator('#inventoryWorkspace').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  assert.equal(await page.locator('#inventoryList').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
});

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
  assert.equal(await page.locator('#syncRepo').getAttribute('href'), 'https://github.com/themadat/app-data');
  assert.equal(await page.locator('#syncPath').getAttribute('href'), 'https://github.com/themadat/app-data/blob/main/data/my-stuff.json');
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
  assert.match(await page.locator('[data-message-title]').textContent(), /Read check passed.*uploads unverified/i);
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
  await page.locator('#choiceDialog').getByRole('button', { name: /Upload This Device/ }).click();
  await page.waitForFunction(() => window.LocalApp.sync.getInfo().state === 'upToDate');
  assert.deepEqual(h.writes[0], { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 6, data: { inventory: { currency: 'USD', items: [] }, notes: 'Local ☁️\n<literal> Notes' } });
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
  assert.equal(await page.locator('#inventorySettingsTab').getAttribute('aria-selected'), 'true'); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#dataSyncTab').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#dataSyncTab [data-symbol="braces"] svg').count(), 1);
  const details = page.locator('#syncPayloadDisclosure');
  assert.equal(await details.evaluate(el => el.open), false);
  await details.locator('summary').focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('#syncPayloadJson').textContent.length > 0);
  const empty = { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 6, data: { inventory: { currency: 'USD', items: [] } } };
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

test('service worker caches this release and inventory and Notes remain available after offline reload', { timeout: 30000 }, async t => {
  const context = await browser.newContext(); t.after(() => context.close());
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(base); await addInventoryItem(page, { name: 'Offline backpack' }); await page.locator('#notesButton').click();
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
  await page.locator('[data-close-dialog="notesDialog"]').click();
  assert.match(await page.locator('#inventoryList').textContent(), /Offline backpack/);
  await page.locator('[data-edit-item]').click();
  await page.locator('#itemRoom').fill('Closet'); await page.locator('#saveItemButton').click();
  await page.reload();
  assert.equal(await page.evaluate(() => window.LocalApp.storage.getState().inventory.items[0].room), 'Closet');
  await page.waitForFunction(() => document.querySelector('#appIcon').complete && document.querySelector('#appIcon').naturalWidth > 0);
  // Chromium can reset navigator.onLine on a worker-controlled navigation;
  // verify the transport is actually offline independently of that indicator.
  assert.equal(await page.evaluate(async () => { try { await fetch('/uncached-offline-probe-' + Date.now()); return false; } catch { return true; } }), true);
  assert.deepEqual(errors, []);
});


test('Title Case labels, USD and burnt orange remain usable in both themes on desktop and mobile', { timeout: 30000 }, async t => {
  const { page } = await fixture(t);
  await page.locator('[data-close-dialog="supportDialog"]').click();
  assert.equal(await page.locator('#inventoryCurrency').count(), 0);
  assert.equal(await page.locator('#inventoryTitle').textContent(), 'Stuff I Have');
  assert.match(await page.locator('#roomOverview').textContent(), /All values and prices are in USD/);
  for (const mode of ['light', 'dark']) {
    await page.locator('#supportButton').click();
    await page.locator('[data-theme-mode="' + mode + '"]').click();
    await page.locator('[data-close-dialog="supportDialog"]').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), mode);
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
      assert.equal(await page.locator('#itemDialogTitle').textContent(), 'Add an Item');
      assert.deepEqual(await page.locator('[data-currency-label]').allTextContents(), ['(USD)', '(USD)']);
      const colors = await page.evaluate(() => {
        const button = document.querySelector('#saveItemButton'), style = getComputedStyle(button);
        return { accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), color: style.color, background: style.backgroundColor, fits: document.documentElement.scrollWidth <= innerWidth };
      });
      assert.equal(colors.accent, '#b44916');
      assert.equal(colors.color, 'rgb(255, 255, 255)');
      assert.equal(colors.background, 'rgb(180, 73, 22)');
      assert.equal(colors.fits, true);
      await page.locator('#itemDialog [data-inv-close]').first().click();
    }
  }
});

test('smart completion preserves manual corrections, searchable locations and multi-tags round trip', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  assert.equal(await page.locator('input[name="itemOwnerChoice"][value="me"]').isChecked(), true);
  assert.equal(await page.locator('input[name="itemObtainedHowChoice"][value="Purchased"]').isChecked(), true);
  await page.locator('#smartExample').click();
  assert.equal(await page.locator('#itemObtainedDate').inputValue(), '2026-08-03');
  assert.equal(await page.locator('#itemName').inputValue(), 'Whiskey Flight Set with 3 Tasting Glasses & Modern Wood Stand');
  assert.equal(await page.locator('#itemMoreDetails').evaluate(el => el.open), true);
  assert.equal(await page.locator('#itemPrice').inputValue(), '62.77');
  assert.equal(await page.locator('#itemValue').inputValue(), '65');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Final Touch');
  assert.equal(await page.locator('#itemSource').inputValue(), 'Amazon');
  assert.equal(await page.locator('[data-smart-target="price"]').getAttribute('title'), '62.77');
  assert.match(await page.locator('#itemDescription').inputValue(), /Chase Prime: 125.54.*\[O\]/);
  await page.locator('#itemPrice').fill('60');
  await page.locator('#itemSmartEntry').fill(await page.locator('#itemSmartEntry').inputValue() + ' owner: house;');
  assert.equal(await page.locator('#itemPrice').inputValue(), '60');
  assert.equal(await page.locator('input[name="itemOwnerChoice"][value="house"]').isChecked(), true);
  await page.locator('#itemRoom').fill('Office');
  await page.locator('#itemRoom').press('ArrowDown'); await page.locator('#itemRoom').press('Enter');
  assert.equal(await page.locator('#itemZone').inputValue(), 'Upstairs');
  await page.locator('#itemSpace').fill('Closet');
  assert.equal(await page.locator('#itemSpaceOptions [role="option"]').count(), 7);
  await page.locator('#itemSpace').press('ArrowDown'); await page.locator('#itemSpace').press('Enter');
  assert.equal(await page.locator('#itemRoom').inputValue(), 'Office');
  await page.locator('#itemRoom').focus(); await page.locator('#itemRoom').press('Escape');
  assert.equal(await page.locator('#itemDialog').evaluate(el => el.open), true);
  assert.equal(await page.locator('#itemRoom').getAttribute('aria-expanded'), 'false');
  await page.locator('#itemTagSearch').fill('Barw'); await page.locator('#itemTagSearch').press('ArrowDown'); await page.locator('#itemTagSearch').press('Enter');
  await page.locator('#itemTagSearch').fill('Glass'); await page.getByRole('option', { name: 'Glassware Other', exact: true }).click();
  await page.locator('#itemTagSearch').fill('Custom Tag');
  await page.locator('#saveItemButton').click();
  await page.reload(); await page.locator('[data-edit-item]').click();
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Final Touch');
  assert.equal(await page.locator('#itemZone').inputValue(), 'Upstairs');
  assert.equal(await page.locator('#itemSpace').inputValue(), 'Closet');
  assert.equal(await page.locator('#itemCategories').inputValue(), 'Barware, Glassware, Custom Tag');
  const item = await page.evaluate(() => window.LocalApp.stateModel.syncPayload(window.LocalApp.storage.getState()).data.inventory.items[0]);
  assert.equal(item.properties.find(p => p.name === 'Brand').value, 'Final Touch');
  assert.equal(item.price, 60);
  assert.equal(item.obtainedDate, '2026-08-03');
});

test('smart suggestions escape markup, defaults preserve old unknown methods, and clearing suggestions preserves edits', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  await page.locator('#itemSmartEntry').fill('<img src=x onerror=alert(1)> [0]');
  assert.equal(await page.locator('#smartPreview img, #smartDestinations img').count(), 0);
  await page.locator('#itemName').fill('My Object'); await page.locator('#itemSmartEntry').fill('');
  assert.equal(await page.locator('#itemName').inputValue(), 'My Object');
  assert.equal(await page.locator('#itemValue').inputValue(), '');
  await page.locator('input[name="itemObtainedHowChoice"][value=""]').check();
  await page.locator('#saveItemButton').click(); await page.locator('[data-edit-item]').click();
  assert.equal(await page.locator('input[name="itemObtainedHowChoice"][value=""]').isChecked(), true);
});

test('wide item modal shows the dated sample and expanded details without scrolling on desktop', { timeout: 30000 }, async t => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
    const { page } = await fixture(t, { viewport });
    await page.locator('[data-close-dialog="supportDialog"]').click();
    await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
    await page.locator('#smartExample').click();
    const rows = await Promise.all(['#itemSource', '#itemBrand', '#itemName'].map(id => page.locator(id).boundingBox()));
    assert.ok(rows.every(row => Math.abs(row.y - rows[0].y) < 2), 'seller, brand and object share a row');
    assert.equal(await page.locator('#itemMoreDetails').evaluate(el => el.open), true);
    assert.equal(await page.locator('#itemDescription').isVisible(), true);
    assert.equal(await page.locator('#addPropertyButton').isVisible(), true);
    assert.equal(await page.locator('#itemForm .dialog-body').evaluate(el => el.scrollHeight <= el.clientHeight + 1), true, 'default form fits without scrolling at ' + viewport.width + 'x' + viewport.height);
    await page.locator('#itemObtainedDate').fill('2026-08-04');
    await page.locator('#itemSmartEntry').fill(await page.locator('#itemSmartEntry').inputValue() + ' owner: house;');
    assert.equal(await page.locator('#itemObtainedDate').inputValue(), '2026-08-04', 'manual date correction is preserved');
    await page.locator('#saveItemButton').click(); await page.locator('[data-edit-item]').click();
    assert.equal(await page.locator('#itemMoreDetails').evaluate(el => el.open), true, 'details also open when editing');
  }
});

async function objectWordPoint(page, word, occurrence = 0) {
  return page.locator('#itemName').evaluate((input, { word, occurrence }) => {
    const style = getComputedStyle(input), rect = input.getBoundingClientRect(), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    ctx.font = style.font;
    let index = -1;
    for (let i = 0; i <= occurrence; i++) index = input.value.indexOf(word, index + 1);
    return { x: rect.x + input.clientLeft + parseFloat(style.paddingLeft) + ctx.measureText(input.value.slice(0, index)).width + ctx.measureText(word).width / 2 - input.scrollLeft, y: rect.y + rect.height / 2 };
  }, { word, occurrence });
}

test('Object pointer actions append to Brand, remove only clicked words, preserve Smart Complete edits and save', { timeout: 30000 }, async t => {
  const { page } = await fixture(t);
  await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  for (const [id, title] of [['itemSource', 'Seller'], ['itemBrand', 'Brand'], ['itemName', 'Object']]) assert.equal(await page.locator('#' + id).getAttribute('placeholder'), title);
  await page.locator('#itemSmartEntry').fill('Acme Acme Lamp');
  await page.locator('#itemBrand').fill('Existing');
  await page.locator('#itemName').fill('Acme Acme Lamp');
  let point = await objectWordPoint(page, ' '); await page.mouse.click(point.x, point.y);
  assert.equal(await page.locator('#itemName').inputValue(), 'Acme Acme Lamp', 'whitespace only positions the caret');
  const dragStart = await objectWordPoint(page, 'Acme'), dragEnd = await objectWordPoint(page, 'Lamp');
  await page.mouse.move(dragStart.x, dragStart.y); await page.mouse.down(); await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 8 }); await page.mouse.up();
  assert.equal(await page.locator('#itemName').inputValue(), 'Acme Acme Lamp', 'dragging selects text without moving it');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Existing');
  point = await objectWordPoint(page, 'Acme'); await page.mouse.click(point.x, point.y);
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Existing Acme');
  assert.equal(await page.locator('#itemName').inputValue(), 'Acme Lamp');
  await page.keyboard.press('Control+z');
  assert.equal(await page.locator('#itemName').inputValue(), 'Acme Acme Lamp');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Existing');
  point = await objectWordPoint(page, 'Acme', 1); await page.mouse.click(point.x, point.y, { button: 'right' });
  assert.equal(await page.locator('#itemName').inputValue(), 'Acme Lamp');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Existing');
  point = await objectWordPoint(page, 'Acme'); await page.mouse.click(point.x, point.y);
  assert.equal(await page.locator('#itemName').inputValue(), 'Lamp');
  await page.locator('#itemSmartEntry').fill('A completely different purchase line');
  assert.equal(await page.locator('#itemName').inputValue(), 'Lamp');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Existing Acme');
  await page.locator('#saveItemButton').click(); await page.reload();
  await page.locator('[data-edit-item]').click();
  assert.equal(await page.locator('#itemName').inputValue(), 'Lamp');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Existing Acme');
});

test('Object actions target scrolled text on mobile, support keyboard undo and refuse Brand overflow', { timeout: 30000 }, async t => {
  const { page } = await fixture(t, { viewport: { width: 320, height: 900 } });
  await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  const value = 'Long object description with several repeated words and ACME® Lamp';
  await page.locator('#itemName').fill(value);
  await page.locator('#itemName').evaluate(input => { input.scrollLeft = input.scrollWidth; });
  const point = await objectWordPoint(page, 'ACME®'); await page.mouse.click(point.x, point.y, { button: 'right' });
  assert.equal(await page.locator('#itemName').inputValue(), value.replace('ACME® ', ''));
  await page.keyboard.press('Meta+z'); assert.equal(await page.locator('#itemName').inputValue(), value);
  await page.locator('#itemName').fill('Acme Lamp');
  await page.locator('#itemName').evaluate(input => input.setSelectionRange(1, 1));
  await page.keyboard.press('Alt+ArrowUp');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Acme');
  assert.equal(await page.locator('#itemName').inputValue(), 'Lamp');
  await page.keyboard.press('Alt+Delete'); assert.equal(await page.locator('#itemName').inputValue(), '');
  assert.equal(await page.locator('#itemName').evaluate(input => input.validity.valueMissing), true);
  await page.keyboard.press('Control+z'); assert.equal(await page.locator('#itemName').inputValue(), 'Lamp');
  await page.locator('#itemBrand').fill('x'.repeat(300)); await page.locator('#itemName').focus();
  await page.locator('#itemName').evaluate(input => input.setSelectionRange(1, 1)); await page.keyboard.press('Alt+ArrowUp');
  assert.equal(await page.locator('#itemName').inputValue(), 'Lamp');
  assert.equal((await page.locator('#itemBrand').inputValue()).length, 300);
  assert.match(await page.locator('#objectWordStatus').textContent(), /Brand is full/);
});

test('multiple copies save independently across rooms and Color is reusable without duplicate properties', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#addItemButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  await page.locator('#itemName').fill('Matching Lamp'); await page.locator('#itemRoom').fill('Den');
  await page.locator('#itemValue').fill('40'); await page.locator('#itemPrice').fill('30');
  await page.locator('#addColorButton').click(); await page.locator('[data-property-value]').fill('Teal');
  await page.locator('#addColorButton').click(); assert.equal(await page.locator('.item-property').count(), 1);
  assert.equal(await page.locator('[data-property-value]').getAttribute('list'), 'inventoryColorValues');
  await page.locator('#itemCopies').fill('3');
  await page.locator('[data-copy-room]').nth(1).fill('Office');
  await page.locator('[data-copy-room]').nth(2).fill('Guest Room');
  await page.locator('#saveItemButton').click();
  let items = await page.evaluate(() => window.LocalApp.storage.getState().inventory.items);
  assert.equal(items.length, 3); assert.equal(new Set(items.map(i => i.id)).size, 3);
  assert.deepEqual(items.map(i => i.room), ['Den', 'Office', 'Guest Room']);
  assert.equal(items[1].properties.find(p => p.name === 'Zone').value, 'Upstairs');
  assert.ok(items.every(i => i.properties.find(p => p.name === 'Color').value === 'Teal'));
  assert.match(await page.locator('[data-inventory-total="all"]').textContent(), /3objects.*120.00/);
  await page.locator('[data-edit-item]').first().click(); await page.locator('#copyItemButton').click();
  await page.waitForFunction(() => document.activeElement.id === 'itemSmartEntry');
  assert.equal(await page.locator('#itemDialogTitle').textContent(), 'Add a Copy');
  await page.locator('#itemRoom').fill('Kitchen'); await page.locator('[data-property-value]').fill('White');
  await page.locator('#saveItemButton').click(); await page.reload();
  items = await page.evaluate(() => window.LocalApp.storage.getState().inventory.items);
  assert.equal(items.length, 4); assert.equal(items.filter(i => i.properties.find(p => p.name === 'Color').value === 'Teal').length, 3);
  await page.locator('[data-edit-item]').first().click(); await page.locator('#archiveItemButton').click();
  await page.locator('#itemGoneReason').selectOption('Sold'); await page.locator('#archiveForm button[type="submit"]').click();
  assert.match(await page.locator('[data-inventory-total="all"]').textContent(), /3objects.*120.00/);
  const payload = await page.evaluate(() => window.LocalApp.stateModel.syncPayload(window.LocalApp.storage.getState()));
  assert.equal(payload.data.inventory.items.length, 4);
  assert.equal(payload.data.inventory.items.filter(i => i.archive).length, 1);
});
test('inventory settings shows full hierarchy, grouped properties and custom values, supports search and keyboard', { timeout: 30000 }, async t => {
  const { page } = await fixture(t, { viewport: { width: 320, height: 844 } });
  await page.locator('#settingsTab').focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#inventorySettingsTab').getAttribute('aria-selected'), 'true');
  const text = await page.locator('#inventoryCatalog').textContent();
  for (const label of ['Upstairs', 'Main Level', 'Outside', 'Primary Bathroom', 'Water Closet', 'Pickle Bag', 'Tag Groups', 'Common Properties', 'Color', 'Shoes', 'Backpacking gear', 'Cables', 'Length']) assert.ok(text.includes(label), label);
  await page.evaluate(() => window.LocalApp.storage.mutate(state => { state.inventory.items.push(window.LocalApp.inventoryModel.normalizeItem({ id: 'custom-catalog', name: 'Art', owner: 'me', room: 'Studio', categories: ['Unique Tag'], properties: [{ name: 'Zone', value: 'Annex' }, { name: 'Space', value: 'Shelf' }, { name: 'Color', value: 'Teal' }, { name: 'Finish', value: '<img src=x>' }] })); }));
  assert.match(await page.locator('#inventoryCatalog').textContent(), /Annex.*Studio.*Shelf/);
  assert.match(await page.locator('#inventoryCatalog').textContent(), /Unique Tag/);
  assert.match(await page.locator('#inventoryCatalog').textContent(), /Finish/);
  assert.equal(await page.locator('#inventoryCatalog img').count(), 0);
  await page.locator('#inventoryCatalogSearch').fill('Teal');
  assert.match(await page.locator('#inventoryCatalog').textContent(), /Color.*Teal/);
  assert.doesNotMatch(await page.locator('#inventoryCatalog').textContent(), /Water Closet/);
  assert.equal(await page.locator('#inventorySettingsPanel').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  assert.equal(await page.evaluate(() => window.LocalApp.stateModel.normalize(window.LocalApp.storage.getState()).ui.supportTab), 'inventory');
  await page.evaluate(() => window.LocalApp.storage.saveNow());
  await page.reload(); await page.locator('#supportButton').click(); await page.locator('#inventorySettingsTab').click();
  assert.match(await page.locator('#inventoryCatalog').textContent(), /Teal/);
});

test('bulk review suggests fields, saves only approved objects, resumes edits and revisits skipped rows', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#bulkEntryButton').click();
  await page.locator('#bulkPaste').fill('Object,Price,Date,Color,Qty\nFinal Touch Whiskey Glass,12.50,08/03/26,Blue,1\nTrail Backpack 300 g,30,08/04/26,Red,2');
  await page.locator('#readBulkPaste').click();
  assert.match(await page.locator('#bulkPreview').textContent(), /3 objects/);
  assert.equal(await page.locator('[data-edit-item]').count(), 0);
  await page.locator('#startBulkReview').click(); await page.waitForFunction(() => document.activeElement.id === 'itemName');
  assert.equal(await page.locator('#itemName').inputValue(), 'Whiskey Glass');
  assert.equal(await page.locator('#itemBrand').inputValue(), 'Final Touch');
  assert.equal(await page.locator('#itemRoom').inputValue(), 'Den');
  assert.match(await page.locator('#bulkReviewInfo').textContent(), /Barware \(Other\)/);
  assert.equal(await page.locator('#saveItemButton').textContent(), 'Save & Next');
  await page.locator('#itemName').fill('Reviewed Glass'); await page.locator('#saveItemButton').click();
  await page.waitForFunction(() => document.querySelector('#itemName').value === 'Trail Backpack 300 g');
  assert.equal(await page.locator('[data-edit-item]').count(), 1);
  await page.locator('#itemDescription').fill('Keep this review edit');
  await page.locator('[data-inv-close="itemDialog"]').filter({ hasText: 'Pause' }).click();
  await page.reload(); await page.locator('#bulkEntryButton').click(); await page.locator('#resumeBulkButton').click();
  await page.waitForFunction(() => document.activeElement.id === 'itemName');
  assert.equal(await page.locator('#itemDescription').inputValue(), 'Keep this review edit');
  await page.locator('#skipBulkRow').click();
  await page.waitForFunction(() => document.querySelector('#bulkReviewInfo').textContent.includes('Copy 2 of 2'));
  await page.locator('#saveItemButton').click();
  await page.waitForFunction(() => document.querySelector('#bulkDialog').open);
  assert.match(await page.locator('#bulkQueueStatus').textContent(), /2 saved.*0 awaiting review.*1 skipped/);
  await page.locator('#reviewSkippedButton').click();
  await page.waitForFunction(() => document.activeElement.id === 'itemName');
  assert.equal(await page.locator('#itemDescription').inputValue(), 'Keep this review edit');
  await page.locator('#saveItemButton').click();
  await page.waitForFunction(() => document.querySelector('#bulkDialog').open);
  assert.match(await page.locator('#bulkQueueStatus').textContent(), /3 saved.*0 awaiting review.*0 skipped/);
  const result = await page.evaluate(() => window.LocalApp.stateModel.syncPayload(window.LocalApp.storage.getState()));
  assert.equal(result.data.inventory.items.length, 3);
  assert.equal(new Set(result.data.inventory.items.map(i => i.id)).size, 3);
  assert.doesNotMatch(JSON.stringify(result), /bulkDraft|suggestions|Spreadsheet Row/);
});

test('bulk queue guards against duplicate saves after interruption and escapes imported cells', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#bulkEntryButton').click();
  await page.locator('#bulkPaste').fill('Object,Notes\n"<img src=x>","<script>alert(1)</script>"');
  await page.locator('#readBulkPaste').click(); await page.locator('#startBulkReview').click();
  await page.waitForFunction(() => document.activeElement.id === 'itemName');
  assert.equal(await page.locator('#bulkReviewInfo img, #bulkPreview img').count(), 0);
  const key = await page.evaluate(() => window.LocalApp.config.storage.bulkDraftKey);
  const pending = await page.evaluate(k => localStorage.getItem(k), key);
  await page.locator('#saveItemButton').click();
  await page.waitForFunction(() => document.querySelector('#bulkDialog').open);
  await page.evaluate(({key,pending}) => localStorage.setItem(key,pending), {key,pending});
  await page.reload(); await page.locator('#bulkEntryButton').click();
  assert.match(await page.locator('#bulkQueueStatus').textContent(), /1 saved.*0 awaiting review/);
  assert.equal(await page.locator('[data-edit-item]').count(), 1);
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ version: 1, name: 'Damaged queue', rows: [null] })), key);
  await page.reload(); await page.locator('#bulkEntryButton').click();
  assert.match(await page.locator('#bulkError').textContent(), /saved review queue could not be read/);
  assert.equal(await page.locator('#resumeBulkButton').isVisible(), false);
  assert.equal(await page.locator('[data-edit-item]').count(), 1);
});

test('bulk XLSX reads selected worksheets, shared strings, date styles and cached formula values locally', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  const outbound = []; page.on('request', request => { if (request.url().includes('never-fetch')) outbound.push(request.url()); });
  await page.locator('#bulkEntryButton').click();
  await page.locator('#bulkFile').setInputFiles(new URL('./fixtures/bulk-import.xlsx', import.meta.url).pathname);
  await page.waitForFunction(() => document.querySelectorAll('#bulkSheet option').length === 2);
  await page.locator('#bulkSheet').selectOption('1');
  assert.match(await page.locator('#bulkPreview').textContent(), /2 objects/);
  await page.locator('#startBulkReview').click(); await page.waitForFunction(() => document.activeElement.id === 'itemName');
  assert.equal(await page.locator('#itemName').inputValue(), 'Blue sensor');
  assert.equal(await page.locator('#itemPrice').inputValue(), '62.77');
  assert.equal(await page.locator('#itemObtainedDate').inputValue(), '2026-08-03');
  assert.equal(await page.locator('[data-property-value]').inputValue(), 'Teal');
  assert.match(await page.locator('#itemDescription').inputValue(), /Formula has no cached value/);
  assert.match(await page.locator('#bulkReviewInfo').textContent(), /Sensor \(Tech\)/);
  await page.locator('#saveItemButton').click();
  await page.waitForFunction(() => document.querySelector('#itemName').value === 'USB cable');
  assert.equal(await page.locator('#itemPrice').inputValue(), '');
  assert.equal(await page.locator('#itemObtainedDate').inputValue(), '2026-08-04');
  assert.match(await page.locator('#itemDescription').inputValue(), /Keep this note/);
  assert.deepEqual(outbound, []);
  await page.locator('[data-inv-close="itemDialog"]').filter({ hasText: 'Pause' }).click();
  await page.locator('#bulkEntryButton').click();
  await page.locator('#bulkFile').setInputFiles({ name: 'old.xls', mimeType: 'application/vnd.ms-excel', buffer: Buffer.from('old') });
  await page.waitForFunction(() => !document.querySelector('#bulkError').hidden);
  assert.match(await page.locator('#bulkError').textContent(), /Export older XLS/);
  assert.equal(await page.locator('#startBulkReview').isDisabled(), true);
  await page.locator('#bulkFile').setInputFiles({ name: 'broken.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from('broken zip') });
  await page.waitForFunction(() => document.querySelector('#bulkError').textContent.includes('not a supported XLSX'));
  assert.equal(await page.locator('#startBulkReview').isDisabled(), true);
  assert.match(await page.locator('#bulkQueueStatus').textContent(), /1 saved.*1 awaiting review/);
});

test('bulk queue refuses storage failures and concurrent replacement without losing the pending review', { timeout: 30000 }, async t => {
  const { page } = await fixture(t); await page.locator('[data-close-dialog="supportDialog"]').click();
  await page.locator('#bulkEntryButton').click(); await page.locator('#bulkPaste').fill('Object\nLamp\nChair');
  await page.locator('#readBulkPaste').click(); await page.locator('#startBulkReview').click();
  await page.waitForFunction(() => document.activeElement.id === 'itemName');
  await page.evaluate(() => {
    window.originalStorageSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { if (key === window.LocalApp.config.storage.stateKey) throw new DOMException('Full', 'QuotaExceededError'); return window.originalStorageSet.call(this, key, value); };
  });
  await page.locator('#saveItemButton').click();
  assert.match(await page.locator('#itemFormError').textContent(), /only in memory/);
  assert.equal(await page.locator('#itemName').inputValue(), 'Lamp');
  await page.locator('[data-inv-close="itemDialog"]').filter({ hasText: 'Pause' }).click();
  await page.locator('#bulkEntryButton').click();
  assert.match(await page.locator('#bulkError').textContent(), /not reached browser storage/);
  assert.match(await page.locator('#bulkQueueStatus').textContent(), /0 saved.*2 awaiting/);
  await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSet; });
  await page.locator('#resumeBulkButton').click(); await page.waitForFunction(() => document.querySelector('#itemName').value === 'Chair');
  const key = await page.evaluate(() => window.LocalApp.config.storage.bulkDraftKey);
  await page.evaluate(key => { const other = JSON.parse(localStorage.getItem(key)); other.name = 'Changed in another tab'; localStorage.setItem(key, JSON.stringify(other)); }, key);
  await page.locator('#saveItemButton').click();
  assert.match(await page.locator('#itemFormError').textContent(), /changed in another tab/);
  assert.equal(await page.locator('[data-edit-item]').count(), 1);
  assert.equal(await page.locator('#itemName').inputValue(), 'Chair');
});

test('bulk review stays usable on desktop and enlarged mobile screens and saves offline', { timeout: 30000 }, async t => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } }); t.after(() => context.close());
  const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(base); await page.evaluate(async () => { await navigator.serviceWorker.ready; }); await page.reload();
  await context.setOffline(true); await page.reload();
  await page.locator('#bulkEntryButton').click(); await page.locator('#bulkPaste').fill('08/03/26\t($62.77)\tChase Prime: 125.54\tAmazon Mktplace - Final Touch Whiskey Flight Set with 3 Tasting Glasses & Modern Wood Stand [65] [O]');
  await page.locator('#readBulkPaste').click();
  await page.screenshot({ path: '/private/tmp/my-stuff-bulk-desktop-import.png' });
  await page.locator('#startBulkReview').click(); await page.waitForFunction(() => document.activeElement.id === 'itemName');
  assert.equal(await page.locator('#itemDialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  assert.equal(await page.locator('#itemForm .dialog-body').evaluate(el => el.scrollHeight <= el.clientHeight + 1), true, 'the sample bulk review fits without desktop scrolling');
  await page.screenshot({ path: '/private/tmp/my-stuff-bulk-desktop-review.png' });
  await page.locator('[data-inv-close="itemDialog"]').filter({ hasText: 'Pause' }).click();
  await page.setViewportSize({ width: 320, height: 844 });
  await page.locator('#supportButton').click(); await page.locator('#textSizeSlider').fill('130'); await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('[data-close-dialog="supportDialog"]').click(); await page.locator('#bulkEntryButton').click();
  assert.equal(await page.locator('#bulkDialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  await page.screenshot({ path: '/private/tmp/my-stuff-bulk-mobile-import.png' });
  await page.locator('#resumeBulkButton').click(); await page.waitForFunction(() => document.activeElement.id === 'itemName');
  assert.equal(await page.locator('#itemDialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  assert.equal(await page.locator('#itemForm .dialog-body').evaluate(el => el.scrollWidth <= el.clientWidth), true);
  await page.screenshot({ path: '/private/tmp/my-stuff-bulk-mobile-review.png' });
  await page.locator('#itemRoom').fill('Kitchen'); await page.locator('#saveItemButton').click();
  await page.waitForFunction(() => document.querySelector('#bulkDialog').open); await page.reload();
  assert.equal(await page.evaluate(() => window.LocalApp.storage.getState().inventory.items[0].room), 'Kitchen');
  assert.deepEqual(errors, []);
});
