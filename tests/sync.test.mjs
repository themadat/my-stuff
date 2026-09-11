import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test as nodeTest } from 'node:test';
const test = (name, fn) => nodeTest(name, { timeout: 5000 }, fn);
import vm from 'node:vm';

function harness({ token = 'test-token', online = true } = {}) {
  const events = [], requests = [], toasts = [], replacements = [];
  const listeners = new Map();
  const window = {
    addEventListener(name, callback) { listeners.set(name, callback); },
    dispatchEvent(event) { events.push(event); listeners.get(event.type)?.(event); },
    setInterval() {}, setTimeout() {}
  };
  const context = vm.createContext({ window, navigator: { onLine: online }, document: { addEventListener() {} },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    TextEncoder, TextDecoder, Uint8Array, AbortController, structuredClone, atob, btoa, URL, console,
    fetch: async (url, options) => { requests.push({ url, options }); return h.respond(url, options); }
  });
  for (const file of ['config.js', 'icons.js', 'core/utils.js', 'core/inventory.js', 'core/state.js']) {
    vm.runInContext(readFileSync(new URL('../assets/js/' + file, import.meta.url), 'utf8'), context);
  }
  const App = window.LocalApp;
  let state = App.stateModel.normalize(App.stateModel.createDefaultState({ demo: false }));
  const h = { App, context, events, requests, toasts, replacements, get state() { return state; }, get token() { return token; },
    respond: () => response(500), recoveryWorks: true, confirmation: false, choice: 'cancel', recovery: null, legacy: false, choices: []
  };
  App.storage = {
    getState: () => state, hasSecret: () => Boolean(token), getSecret: () => token,
    setSecret(value) { token = value; return true; }, clearSecret() { token = ''; },
    mutate(callback, options = {}) { callback(state); if (options.touch !== false) App.stateModel.touch(state); state = App.stateModel.normalize(state); },
    saveRecovery() { if (!h.recoveryWorks) return false; h.recovery = structuredClone(state); return true; },
    replace(next, options) { replacements.push(options); state = next; }
  };
  App.components = {
    toast: (message, options) => toasts.push({ message, ...options }),
    message: (title, message) => toasts.push({ title, message }),
    choose: async options => { h.choices.push(options); return h.choice; }, confirm: async () => h.confirmation
  };
  vm.runInContext(readFileSync(new URL('../assets/js/core/sync.js', import.meta.url), 'utf8'), context);
  h.sync = App.sync;
  h.remote = structuredClone(state);
  h.file = () => response(200, { type: 'file', sha: 'remote-sha', content: Buffer.from(JSON.stringify(h.legacy ? h.remote : App.stateModel.syncPayload(h.remote))).toString('base64') });
  h.respond = h.file;
  h.setBaseline = () => Object.assign(state.modules.cloudSync, {
    baselineTarget: 'themadat/app-data/main/data/my-stuff.json', baselineHash: App.stateModel.syncHash(state), baselineSha: 'base-sha'
  });
  return h;
}
function response(status, body = {}) { return { status, ok: status >= 200 && status < 300, json: async () => body }; }
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
function changeNotes(state, text) { state.notes.text = text; state.notes.updatedAt = state.meta.updatedAt; }

function inventoryItem(h, overrides = {}) {
  return h.App.inventoryModel.normalizeItem({ id: 'item-1', name: 'Trail shoes', owner: 'me', room: 'Office', categories: ['Shoes'], obtainedDate: '2024-02-28', obtainedHow: 'Purchased', source: 'Local store', price: 90, value: 100, properties: [{ name: 'Size', value: '9', unit: 'US' }], ...overrides });
}

test('schema 1 backups migrate to inventory without losing Notes, preferences, or credentials configuration', () => {
  const h = harness(), old = structuredClone(h.state);
  delete old.inventory; old.schemaVersion = 1; old.notes.text = 'Existing Notes'; old.preferences.appearance.mode = 'dark';
  const prepared = h.App.stateModel.prepare(old);
  assert.equal(prepared.state.schemaVersion, 2);
  assert.equal(prepared.state.notes.text, 'Existing Notes');
  assert.equal(prepared.state.preferences.appearance.mode, 'dark');
  assert.equal(prepared.state.inventory.items.length, 0);
  assert.equal(prepared.migrations.length, 1);
  assert.throws(() => h.App.stateModel.prepare({ ...old, schemaVersion: 2 }), /missing inventory/);
});

test('inventory totals distinguish ownership, rooms, unknown values, zero values, and archives', () => {
  const h = harness(), items = [inventoryItem(h, { value: 0.1 }), inventoryItem(h, { id: '2', owner: 'house', room: 'office', value: 0.2 }), inventoryItem(h, { id: '3', owner: 'house', value: null, price: null }), inventoryItem(h, { id: '4', room: '', value: 0 }), inventoryItem(h, { id: '5', value: 500, archive: { date: '2024-03-01', reason: 'Broken' } })];
  const totals = h.App.inventoryModel.stats(items);
  assert.equal(totals.all.count, 4); assert.equal(totals.all.valueCents, 30); assert.equal(totals.all.unknown, 1);
  assert.equal(totals.me.count, 2); assert.equal(totals.house.count, 2);
  assert.equal(totals.rooms.length, 2);
  assert.equal(totals.rooms.find(room => room.name === 'Office').all.count, 3);
  assert.equal(totals.rooms.find(room => room.name === 'Unassigned').me.count, 1);
});

test('item normalization preserves custom categories and properties and rejects invalid dates, prices, or duplicates', () => {
  const h = harness(), m = h.App.inventoryModel;
  const item = inventoryItem(h, { categories: ['Shoes', 'shoes', ' My custom tag '], value: '', price: '0', properties: [{ name: 'Color', value: '<script>literal</script>', unit: '' }] });
  assert.equal(item.categories.join(','), 'Shoes,My custom tag');
  assert.equal(item.value, 0); assert.equal(item.price, 0);
  assert.equal(item.properties[0].value, '<script>literal</script>');
  for (const overrides of [{ value: -1 }, { price: Infinity }, { value: {} }, { obtainedDate: '2025-02-29' }, { owner: 'unknown' }, { name: ' ' }, { properties: [{ name: 'Weight' }, { name: 'weight' }] }, { archive: { date: '2023-01-01', reason: 'Lost' } }, { archive: { date: '2026-01-01', reason: '' } }]) assert.throws(() => inventoryItem(h, overrides));
  assert.throws(() => m.normalize({ currency: 'USD', items: [item, item] }), /duplicate/);
  assert.throws(() => m.normalize({ currency: '???', items: [] }), /currency/);
});

test('duration counts calendar days including leap days and distinguishes unknown obtained dates', () => {
  const h = harness(), m = h.App.inventoryModel;
  assert.equal(m.daysOwned(inventoryItem(h, { archive: { date: '2024-03-01', reason: 'Lost' } })), 2);
  assert.equal(m.daysOwned(inventoryItem(h), '2024-02-28'), 0);
  assert.equal(m.daysOwned(inventoryItem(h, { obtainedDate: '' })), null);
});

test('current and archived inventory round trip through backup, cloud and recovery while settings and tokens stay local', async () => {
  const h = harness(), model = h.App.stateModel;
  h.state.inventory.items = [inventoryItem(h), inventoryItem(h, { id: 'archive', archive: { date: '2024-03-01', reason: 'Broken', notes: 'Sole separated' } })];
  const expected = JSON.stringify(h.state.inventory), hash = model.syncHash(h.state);
  assert.equal(JSON.stringify(model.prepare(model.exportEnvelope(h.state)).state.inventory), expected);
  const payload = model.syncPayload(h.state);
  assert.equal(payload.schemaVersion, 6); assert.equal(payload.data.inventory.items.length, 2);
  assert.doesNotMatch(JSON.stringify(payload), /test-token|preferences|cloudSync|baseline/);
  const prepared = model.prepareSync(payload);
  h.remote = prepared.state; h.remote.preferences.appearance.mode = 'dark';
  h.state.inventory.items = [];
  h.confirmation = true;
  await h.sync.restoreFromCloud();
  assert.equal(h.state.inventory.items.length, 2); assert.equal(h.recovery.inventory.items.length, 0);
  assert.equal(h.state.preferences.appearance.mode, 'system'); assert.equal(h.token, 'test-token');
  assert.equal(model.syncHash(h.state), hash);
});

test('old Notes-only cloud restores preserve current inventory and migrate on explicit upload', async () => {
  const h = harness(); h.state.inventory.items = [inventoryItem(h)];
  const old = { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 5, data: { notes: 'Old cloud Notes' } };
  h.respond = () => response(200, { type: 'file', sha: 'old-sha', content: Buffer.from(JSON.stringify(old)).toString('base64') });
  h.confirmation = true; await h.sync.restoreFromCloud();
  assert.equal(h.state.inventory.items.length, 1); assert.equal(h.state.notes.text, 'Old cloud Notes');
  h.choice = 'upload';
  h.respond = (url, options) => options.method === 'PUT' ? response(200, { content: { sha: 'new-sha' } }) : response(200, { type: 'file', sha: 'old-sha', content: Buffer.from(JSON.stringify(old)).toString('base64') });
  await h.sync.syncNow();
  const write = h.requests.find(request => request.options.method === 'PUT');
  assert.equal(JSON.parse(Buffer.from(JSON.parse(write.options.body).content, 'base64').toString()).data.inventory.items.length, 1);
});

test('merge unions distinct items but refuses conflicting edits and archives', () => {
  const h = harness(), model = h.App.stateModel;
  h.state.inventory.items = [inventoryItem(h)];
  h.remote.inventory.items = [inventoryItem(h, { id: '2', name: 'Desk', owner: 'house' })];
  assert.equal(model.merge(h.state, h.remote).inventory.items.length, 2);
  h.remote.inventory.items = [inventoryItem(h, { archive: { date: '2025-01-01', reason: 'Lost' } })];
  assert.equal(model.canMerge(h.state, h.remote), false);
  assert.throws(() => model.merge(h.state, h.remote), /item differs/);
  h.remote.inventory.items = []; h.remote.inventory.currency = 'EUR';
  assert.equal(model.merge(h.state, h.remote).inventory.currency, 'USD');
});

test('inventory changes affect the sync hash while item ordering and local preferences do not', () => {
  const h = harness(), model = h.App.stateModel;
  h.state.inventory.items = [inventoryItem(h), inventoryItem(h, { id: '2' })];
  const hash = model.syncHash(h.state);
  h.state.inventory.items.reverse(); h.state.preferences.appearance.mode = 'dark';
  assert.equal(model.syncHash(h.state), hash);
  h.state.inventory.items[0].room = 'Garage'; assert.notEqual(model.syncHash(h.state), hash);
});

test('malformed inventory cloud files are rejected rather than silently dropping records', async () => {
  const h = harness(); h.state.inventory.items = [inventoryItem(h)]; const original = JSON.stringify(h.state.inventory);
  for (const inventory of [null, {}, { currency: 'USD', items: [{}] }, { currency: 'USD', items: [inventoryItem(h), inventoryItem(h)] }]) {
    h.respond = () => response(200, { type: 'file', sha: 'bad', content: Buffer.from(JSON.stringify({ syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 6, data: { inventory } })).toString('base64') });
    await h.sync.check(true); assert.equal(h.sync.getInfo().state, 'failed'); assert.equal(JSON.stringify(h.state.inventory), original);
  }
});

test('existing devices switch to app-data without reusing the old repository baseline or losing Notes', async () => {
  const h = harness();
  changeNotes(h.state, 'Keep my existing Notes');
  h.state.modules.cloudSync.repo = 'my-stuff';
  Object.assign(h.state.modules.cloudSync, {
    baselineTarget: 'themadat/my-stuff/main/data/my-stuff.json',
    baselineHash: h.App.stateModel.syncHash(h.state), baselineSha: 'old-repository-sha'
  });
  h.App.storage.mutate(() => {}, { touch: false });
  assert.equal(h.state.modules.cloudSync.repo, 'app-data');
  assert.equal(h.state.notes.text, 'Keep my existing Notes');
  assert.equal(h.token, 'test-token');
  assert.equal(h.App.config.identity.repository.url, 'https://github.com/themadat/my-stuff');
  h.respond = (url, options) => options.method === 'PUT'
    ? response(201, { content: { sha: 'new-data-sha' } })
    : response(url.includes('/contents/') ? 404 : 200);
  const result = await h.sync.testConnection({ ...h.state.modules.cloudSync, token: h.token });
  assert.match(result.message, /themadat\/app-data/);
  await h.sync.syncNow();
  assert.equal(h.sync.getInfo().change, 'first-sync');
  assert.equal(h.requests.some(request => request.options.method === 'PUT'), false);
  h.choice = 'upload';
  await h.sync.syncNow();
  const upload = h.requests.find(request => request.options.method === 'PUT');
  assert.equal(upload.url, 'https://api.github.com/repos/themadat/app-data/contents/data/my-stuff.json');
  const body = JSON.parse(upload.options.body);
  assert.equal(body.branch, 'main');
  assert.equal(body.sha, undefined);
  assert.equal(JSON.parse(Buffer.from(body.content, 'base64').toString()).data.notes, 'Keep my existing Notes');
  assert.ok(h.requests.every(request => /^https:\/\/api\.github\.com\/repos\/themadat\/app-data(?:\/|$)/.test(request.url)));
  assert.equal(h.state.modules.cloudSync.baselineTarget, 'themadat/app-data/main/data/my-stuff.json');
});

const expected = {
  idle: ['icloud', 'neutral', 'Cloud Sync'],
  upToDate: ['checkmark.icloud', 'success', 'Up to Date'],
  syncing: ['arrow.trianglehead.2.clockwise.rotate.90.icloud', 'info', 'Syncing…'],
  uploading: ['icloud.and.arrow.up', 'info', 'Uploading…'],
  downloading: ['icloud.and.arrow.down', 'info', 'Downloading…'],
  pending: ['icloud.dashed', 'neutral', 'Waiting to Sync'],
  disabled: ['icloud.slash', 'neutral', 'Sync Disabled'],
  offline: ['icloud.slash', 'neutral', 'Offline'],
  warning: ['exclamationmark.icloud', 'warning', 'Sync Needs Attention'],
  failed: ['xmark.icloud', 'danger', 'Sync Failed'],
  authenticationRequired: ['key.icloud', 'warning', 'Sign In Required'],
  permissionDenied: ['lock.icloud', 'warning', 'Access Required'],
  connected: ['link.icloud', 'info', 'Connected'],
  shared: ['person.icloud', 'info', 'Shared']
};

test('all cloud states map to SF Symbols, semantic tints, accessible text, and only active syncing rotates', () => {
  const h = harness();
  assert.deepEqual(Object.keys(h.sync.CloudSyncState).sort(), Object.keys(expected).sort());
  assert.ok(Object.isFrozen(h.sync.CloudSyncState));
  for (const [state, [symbol, kind, title]] of Object.entries(expected)) {
    const info = h.sync.presentation(state);
    assert.deepEqual([info.symbol, info.kind, info.title], [symbol, kind, title]);
    assert.equal(info.accessibilityLabel, title);
    assert.ok(info.help.startsWith(title + '. '));
    assert.equal(info.animation, state === 'syncing' ? 'rotate' : 'none');
    const svg = h.App.icons.markup(symbol);
    assert.match(svg, /<svg class="sf-symbol"/);
    assert.match(svg, /aria-hidden="true"/);
    assert.match(svg, /currentColor/);
  }
  assert.match(h.App.icons.markup(h.sync.presentation('syncing').symbol), /<path class="sync-rotation"/);
  assert.equal(h.sync.presentation('permissionDenied', { hardDenial: true }).kind, 'danger');
  assert.equal(h.sync.presentation('permissionDenied').kind, 'warning');
  assert.equal(h.sync.actions.syncNow.symbol, 'arrow.trianglehead.clockwise.icloud');
  assert.equal(h.sync.actions.restore.symbol, 'arrow.trianglehead.counterclockwise.icloud');
  for (const action of Object.values(h.sync.actions)) {
    assert.ok(action.title && action.help && h.App.icons.markup(action.symbol));
    assert.notEqual(action.symbol, h.sync.presentation('syncing').symbol);
  }
});

test('missing credentials, disabled, offline, and a configured idle connection are distinct', async () => {
  const h = harness({ token: '' });
  assert.equal(h.sync.getInfo().state, 'authenticationRequired');
  await h.sync.syncNow();
  assert.equal(h.events.at(-1).type, 'app:opensyncsettings');
  h.context.navigator.onLine = false;
  assert.equal(h.sync.getInfo().state, 'offline');
  assert.equal(h.sync.getInfo().kind, 'neutral');
  h.state.modules.cloudSync.enabled = false;
  assert.equal(h.sync.getInfo().state, 'disabled');
  assert.equal(harness().sync.getInfo().state, 'connected');
  assert.equal(harness().sync.getInfo().animation, 'none');
});

test('real checks show two-arrow activity, settle to up to date, and classify queued or divergent changes', async () => {
  const h = harness();
  h.setBaseline();
  const pending = deferred(); h.respond = () => pending.promise;
  const checking = h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'syncing');
  assert.equal(h.sync.getInfo().canSync, false);
  await h.sync.syncNow(); await h.sync.testConnection({});
  assert.equal(h.requests.length, 1);
  pending.resolve(h.file()); await checking;
  assert.equal(h.sync.getInfo().state, 'upToDate', h.sync.getInfo().message);
  changeNotes(h.state, 'local edit');
  assert.equal(h.sync.getInfo().state, 'pending');
  assert.equal(h.sync.getInfo().change, 'local');
  h.respond = h.file; changeNotes(h.remote, 'remote edit');
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'warning');
  assert.equal(h.sync.getInfo().change, 'conflict');
  assert.equal(h.sync.getInfo().kind, 'warning');
});

for (const [status, message, state] of [[401, '', 'authenticationRequired'], [403, '', 'permissionDenied'], [403, 'API rate limit exceeded', 'warning'], [404, '', 'warning'], [409, '', 'warning'], [422, '', 'warning'], [429, '', 'warning'], [500, '', 'failed']]) {
  test(`HTTP ${status} ${message} produces ${state} and does not persist a failed test token`, async () => {
    const h = harness();
    h.respond = () => response(status, { message });
    await assert.rejects(h.sync.testConnection({ ...h.state.modules.cloudSync, token: 'unsaved-new-token' }));
    assert.equal(h.sync.getInfo().state, state);
    assert.equal(h.sync.getInfo().animation, 'none');
    assert.equal(h.token, 'test-token');
  });
}

test('a test using unsaved credentials is active and then Connected without an endless spinner', async () => {
  const h = harness({ token: '' }); const pending = deferred();
  h.respond = () => pending.promise;
  const testing = h.sync.testConnection({ ...h.state.modules.cloudSync, token: 'new-token', rememberToken: false });
  assert.equal(h.sync.getInfo().state, 'syncing');
  pending.resolve(h.file()); await testing;
  assert.equal(h.sync.getInfo().state, 'connected');
  assert.equal(h.token, 'new-token');
  assert.equal(h.state.modules.cloudSync.rememberToken, false);
});

test('missing remote is static pending and malformed JSON is a failed attempt', async () => {
  const h = harness(); h.respond = () => response(404);
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'pending');
  assert.equal(h.sync.getInfo().canRestore, false);
  h.respond = () => response(200, { type: 'file', sha: 'sha', content: btoa('invalid json') });
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'failed');
});

test('network unavailability is neutral and reconnect can recover', async () => {
  const h = harness(); h.sync.init();
  h.respond = () => { throw new Error('Failed to fetch'); };
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'offline');
  assert.equal(h.sync.getInfo().kind, 'neutral');
  h.respond = h.file;
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'upToDate', h.sync.getInfo().message);
});

test('upload direction stays static; an edit during upload remains pending after completion', async () => {
  const h = harness(); h.setBaseline(); changeNotes(h.state, 'upload me');
  const writing = deferred(); const started = deferred();
  h.respond = (url, options) => { if (options.method === 'PUT') { started.resolve(); return writing.promise; } return h.file(); };
  const syncing = h.sync.syncNow(); await started.promise;
  assert.equal(h.sync.getInfo().state, 'uploading');
  assert.equal(h.sync.getInfo().animation, 'none');
  changeNotes(h.state, 'newer edit');
  writing.resolve(response(200, { content: { sha: 'new-sha' } })); await syncing;
  assert.equal(h.sync.getInfo().state, 'pending');
});

test('restore cancellation preserves data; confirmation saves recovery and local cloud settings', async () => {
  const h = harness(); changeNotes(h.remote, 'cloud content');
  const cloud = structuredClone(h.state.modules.cloudSync);
  await h.sync.restoreFromCloud();
  assert.equal(h.replacements.length, 0);
  h.confirmation = true;
  await h.sync.restoreFromCloud();
  assert.equal(h.replacements.length, 1);
  assert.ok(h.recovery);
  assert.equal(h.state.notes.text, 'cloud content');
  assert.equal(h.state.modules.cloudSync.rememberToken, cloud.rememberToken);
  assert.equal(h.sync.getInfo().state, 'upToDate', h.sync.getInfo().message);
  assert.ok(h.events.some(event => event.detail?.info?.state === 'downloading'));
});

test('restore refuses replacement when a recovery copy cannot be saved', async () => {
  const h = harness(); h.confirmation = true; h.recoveryWorks = false;
  await h.sync.restoreFromCloud();
  assert.equal(h.replacements.length, 0);
  assert.equal(h.sync.getInfo().state, 'failed');
  assert.match(h.sync.getInfo().message, /recovery copy/);
});

test('forgetting a connection prevents stale errors and a pending restore from applying', async () => {
  const h = harness(); const pending = deferred(); h.respond = () => pending.promise;
  const checking = h.sync.check(true); await h.sync.forget();
  pending.resolve(response(401)); await checking;
  assert.equal(h.sync.getInfo().state, 'authenticationRequired');
  assert.doesNotMatch(h.sync.getInfo().message, /rejected/);
  const r = harness(); const decision = deferred(); const opened = deferred();
  r.App.components.confirm = () => { opened.resolve(); return decision.promise; };
  const restoring = r.sync.restoreFromCloud(); await opened.promise;
  const count = r.requests.length; await r.sync.check(true);
  assert.equal(r.requests.length, count);
  await r.sync.forget(); decision.resolve(true); await restoring;
  assert.equal(r.replacements.length, 0);
});

test('ordinary remote-only sync downloads without writing to GitHub', async () => {
  const h = harness(); h.setBaseline(); changeNotes(h.remote, 'remote-only edit');
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'pending');
  assert.equal(h.sync.getInfo().change, 'remote');
  await h.sync.syncNow();
  assert.equal(h.state.notes.text, 'remote-only edit');
  assert.ok(h.recovery);
  assert.ok(h.requests.every(request => request.options.method !== 'PUT'));
  assert.equal(h.sync.getInfo().state, 'upToDate');
});

test('first upload still requires a choice; a synchronized copy needs no write', async () => {
  const h = harness(); h.respond = (url, options) => options.method === 'PUT' ? response(200, { content: { sha: 'new-sha' } }) : response(404);
  await h.sync.syncNow();
  assert.ok(h.requests.every(request => request.options.method !== 'PUT'));
  h.choice = 'upload'; await h.sync.syncNow();
  assert.ok(h.requests.some(request => request.options.method === 'PUT'));
  assert.equal(h.sync.getInfo().state, 'upToDate');
  const current = harness(); await current.sync.syncNow();
  assert.ok(current.requests.every(request => request.options.method !== 'PUT'));
  assert.equal(current.sync.getInfo().state, 'upToDate');
});


test('empty inventories sync only content, independent of device, UI, or save metadata', () => {
  const h = harness(), model = h.App.stateModel;
  const original = JSON.stringify(model.syncPayload(h.state));
  assert.deepEqual(JSON.parse(original), { syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 6, data: { inventory: { currency: 'USD', items: [] } } });
  assert.ok(Buffer.byteLength(JSON.stringify(model.syncPayload(h.state), null, 2)) < 250);
  h.App.storage.mutate(state => {
    state.preferences.appearance.mode = 'dark'; state.ui.search = 'cloud'; state.ui.supportTab = 'storage';
    state.ui.seenReleaseVersion = 'next-build'; 
     state.modules.roadmap.search = 'filter';
    state.notes.updatedAt = '2000-01-01T00:00:00.000Z';
    state.meta.createdAt = '2000-01-01T00:00:00.000Z'; 
  });
  assert.equal(JSON.stringify(model.syncPayload(h.state)), original);
  assert.equal(model.syncHash(h.state), model.syncHash(model.createDefaultState()));
  const backup = model.exportEnvelope(h.state);
  assert.equal(backup.state.preferences.appearance.mode, 'dark');
  assert.equal(backup.state.ui.search, 'cloud');
});

test('download and subsequent release dismissal, Settings, filter, and theme changes stay up to date', async () => {
  const h = harness(); h.setBaseline(); changeNotes(h.remote, 'cloud content');
  h.App.storage.mutate(state => { state.preferences.appearance.mode = 'dark'; state.ui.search = 'local search';  });
  await h.sync.syncNow();
  assert.equal(h.state.notes.text, 'cloud content');
  assert.equal(h.state.preferences.appearance.mode, 'dark');
  assert.equal(h.state.ui.search, 'local search');
  h.App.storage.mutate(state => { state.ui.seenReleaseVersion = '0.0.1.3'; state.ui.supportTab = 'help'; state.modules.roadmap.search = 'done'; });
  assert.equal(h.sync.getInfo().state, 'upToDate');
  await h.sync.syncNow();
  assert.ok(h.requests.every(request => request.options.method !== 'PUT'));
  changeNotes(h.state, 'actual edit');
  assert.equal(h.sync.getInfo().state, 'pending');
  changeNotes(h.state, 'cloud content');
  assert.equal(h.sync.getInfo().state, 'upToDate');
});

test('legacy whole-state files migrate without false conflicts and compact on explicit Sync Now', async () => {
  const h = harness(); h.legacy = true;
  h.state.modules.cloudSync.baselineTarget = 'themadat/app-data/main/data/my-stuff.json';
  h.state.modules.cloudSync.baselineHash = 'old-whole-state-hash';
  h.remote.preferences.appearance.mode = 'dark'; h.remote.ui.search = 'another computer';
  h.respond = (url, options) => options.method === 'PUT' ? response(200, { content: { sha: 'compact-sha' } }) : h.file();
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().state, 'upToDate');
  assert.match(h.state.modules.cloudSync.baselineHash, /^data-v2:/);
  assert.ok(h.requests.every(request => request.options.method !== 'PUT'));
  await h.sync.syncNow();
  const written = JSON.parse(Buffer.from(JSON.parse(h.requests.find(r => r.options.method === 'PUT').options.body).content, 'base64').toString());
  assert.deepEqual(written.data, { inventory: { currency: 'USD', items: [] } });
  assert.equal(written.syncVersion, 1);
  assert.equal(h.state.preferences.appearance.mode, 'system');
});

test('unchanged legacy SHA migrates the baseline even when local content changed', async () => {
  const h = harness(); h.legacy = true; h.setBaseline();
  h.state.modules.cloudSync.baselineHash = 'old-hash'; h.state.modules.cloudSync.baselineSha = 'remote-sha';
  changeNotes(h.state, 'unsynced note');
  await h.sync.check(true);
  assert.equal(h.sync.getInfo().change, 'local');
});

test('legacy restore retains actual content and local preferences; empty cloud clears Notes', async () => {
  const h = harness(); h.legacy = true; h.confirmation = true;
  changeNotes(h.remote, 'old notes'); h.remote.preferences.appearance.mode = 'dark';
  await h.sync.restoreFromCloud();
  assert.equal(h.state.notes.text, 'old notes');
  assert.equal(h.state.preferences.appearance.mode, 'system');
  h.legacy = false; h.remote = h.App.stateModel.createDefaultState();
  await h.sync.restoreFromCloud();
  assert.equal(h.state.notes.text, '');
  assert.equal(h.sync.getInfo().state, 'upToDate');
});

test('multiline Unicode and literal HTML round trip as plain-text Notes', () => {
  const h = harness(), model = h.App.stateModel;
  const notes = 'Cloud ☁️\n<literal> & "text"';
  changeNotes(h.state, notes);
  assert.equal(model.syncPayload(h.state).data.notes, notes);
  assert.equal(model.syncHash(model.prepareSync(model.syncPayload(h.state)).state), model.syncHash(h.state));
});

test('merges combine disjoint content while preserving device settings; differing items require a choice', async () => {
  const h = harness(), model = h.App.stateModel;
  changeNotes(h.state, 'local notes'); h.state.preferences.appearance.mode = 'dark';
  assert.equal(model.canMerge(h.state, h.remote), true);
  const merged = model.merge(h.state, h.remote);
  assert.equal(merged.notes.text, 'local notes');
  assert.equal(merged.preferences.appearance.mode, 'dark');
  changeNotes(h.remote, 'different notes');
  assert.equal(model.canMerge(h.state, h.remote), false);
  await h.sync.syncNow();
  assert.ok(h.choices[0].choices.every(choice => choice.value !== 'merge'));
  assert.equal(h.replacements.length, 0);
  assert.throws(() => model.merge(h.state, h.remote), /Notes differ/);
});

test('merge refuses to replace data or upload when recovery cannot be saved', async () => {
  const h = harness(); h.choice = 'merge'; h.recoveryWorks = false;
  changeNotes(h.state, 'keep locally');
  await h.sync.syncNow();
  assert.equal(h.replacements.length, 0);
  assert.ok(h.requests.every(request => request.options.method !== 'PUT'));
  assert.equal(h.sync.getInfo().state, 'failed');
});

test('invalid or future cloud data is rejected without replacing or uploading content', async () => {
  for (const transform of [p => ({ ...p, syncVersion: 2 }), p => ({ ...p, schemaVersion: 1 }), p => ({ ...p, data: { notes: [] } }), p => ({ ...p, data: { notes: 'a'.repeat(250001) } }), p => ({ ...p, data: { unknown: 'content' } }), p => ({ ...p, data: { iconOverrides: [{}] } }), () => ({ schemaVersion: 1 }), () => ({ schemaVersion: 1, notes: { text: [] } }), () => ({ schemaVersion: 1, notes: { text: '' }, workspace: {} }), () => null]) {
    const h = harness(); h.confirmation = true;
    const invalid = transform(h.App.stateModel.syncPayload(h.state));
    h.respond = () => response(200, { type: 'file', sha: 'sha', content: Buffer.from(JSON.stringify(invalid)).toString('base64') });
    await h.sync.restoreFromCloud();
    assert.equal(h.sync.getInfo().state, 'failed');
    assert.equal(h.replacements.length, 0);
    assert.ok(h.requests.every(request => request.options.method !== 'PUT'));
  }
});

test('failed token storage does not report a successful save or connection test', async () => {
  const h = harness(); h.App.storage.setSecret = () => false;
  const settings = { ...h.state.modules.cloudSync, token: 'cannot-store' };
  assert.throws(() => h.sync.saveConfiguration(settings), /could not store/);
  await assert.rejects(h.sync.testConnection(settings), /could not store/);
  assert.equal(h.token, 'test-token');
  assert.equal(h.sync.getInfo().state, 'failed');
});

test('imported configuration cannot redirect the fixed target and compact imports are marked content-only', () => {
  const h = harness(), model = h.App.stateModel;
  const backup = model.exportEnvelope(h.state);
  Object.assign(backup.state.modules.cloudSync, { owner: 'other', repo: 'other', path: 'other.json' });
  const imported = model.prepare(backup).state;
  assert.equal(imported.modules.cloudSync.owner, h.App.config.cloudSync.owner);
  assert.equal(imported.modules.cloudSync.repo, h.App.config.cloudSync.repo);
  assert.equal(imported.modules.cloudSync.path, h.App.config.cloudSync.path);
  assert.equal(model.prepare(model.syncPayload(h.state)).contentOnly, true);
});

test('read-only Test never claims write verification and reproduces a later upload denial', async () => {
  const h = harness();
  const result = await h.sync.testConnection({ ...h.state.modules.cloudSync, token: h.token });
  assert.equal(result.ok, true); assert.equal(result.writeVerified, false);
  assert.match(result.title, /uploads unverified/i);
  assert.match(result.message, /Contents: Read and write/);
  assert.ok(h.requests.every(r => !r.options.method || r.options.method === 'GET'));
  h.choice = 'upload'; changeNotes(h.state, 'Upload me');
  h.respond = (url, options) => options.method === 'PUT' ? response(403, { message: 'Resource not accessible by personal access token' }) : h.file();
  await h.sync.syncNow();
  assert.equal(h.sync.getInfo().state, 'permissionDenied');
  assert.match(h.sync.getInfo().message, /denied the upload to themadat\/app-data/);
  assert.match(h.sync.getInfo().message, /Resource not accessible by personal access token/);
  assert.match(h.sync.getInfo().message, /passing read test does not verify uploads/);
  assert.equal(h.state.notes.text, 'Upload me');
});

test('missing cloud files do not make Test promise that an upload will succeed', async () => {
  const h = harness();
  h.respond = url => url.includes('/contents/') ? response(404) : response(200);
  const result = await h.sync.testConnection({ ...h.state.modules.cloudSync, token: h.token });
  assert.equal(result.remoteExists, false); assert.equal(result.writeVerified, false);
  assert.match(result.message, /missing or not accessible/);
  assert.ok(h.requests.every(r => r.options.method !== 'PUT'));
});

test('known read-only repositories fail Test without saving a replacement token', async () => {
  for (const metadata of [{ archived: true }, { disabled: true }, { permissions: { push: false } }]) {
    const h = harness(); h.respond = () => response(200, metadata);
    await assert.rejects(h.sync.testConnection({ ...h.state.modules.cloudSync, token: 'new-token' }), /read-only/);
    assert.equal(h.sync.getInfo().state, 'permissionDenied'); assert.equal(h.token, 'test-token');
    assert.ok(h.requests.every(r => r.options.method !== 'PUT'));
  }
});

test('branch-rule rejections are not misreported as stale content conflicts', async () => {
  const h = harness(); h.setBaseline(); changeNotes(h.state, 'New note');
  h.respond = (url, options) => options.method === 'PUT' ? response(422, { message: 'Changes must be made through a pull request' }) : h.file();
  await h.sync.syncNow();
  assert.equal(h.sync.getInfo().state, 'permissionDenied');
  assert.match(h.sync.getInfo().message, /pull request/);
  assert.match(h.sync.getInfo().message, /branch rules/);
});

test('every first-sync choice supplies a shared SVG symbol', async () => {
  const h = harness(); changeNotes(h.remote, 'Cloud-only note');
  await h.sync.syncNow();
  assert.deepEqual(Array.from(h.choices[0].choices, c => c.value), ['merge', 'upload', 'download']);
  for (const choice of h.choices[0].choices) assert.match(h.App.icons.markup(choice.symbol), /<svg/);
  const missing = harness(); missing.respond = () => response(404);
  await missing.sync.syncNow();
  assert.equal(missing.choices[0].choices[0].symbol, 'icloud.and.arrow.up');
});

test('Data Sync tab is retained by normalization without affecting the sync payload', () => {
  const h = harness(), model = h.App.stateModel;
  const before = model.syncHash(h.state);
  h.state.ui.supportTab = 'data-sync';
  assert.equal(model.normalize(h.state).ui.supportTab, 'data-sync');
  assert.equal(model.syncHash(h.state), before);
});


test('USD normalization preserves amounts, archive details, and Notes across old backups and cloud copies', () => {
  const h = harness(), model = h.App.stateModel;
  const old = structuredClone(h.state);
  old.inventory.currency = 'EUR';
  old.inventory.items = [inventoryItem(h, { archive: { date: '2025-01-01', reason: 'Sold' } })];
  old.notes.text = 'Keep my Notes';
  for (const state of [model.prepare(old).state, model.prepareSync({ syncFormat: 'local-first-app-data', syncVersion: 1, schemaVersion: 6, data: { inventory: old.inventory, notes: old.notes.text } }).state]) {
    assert.equal(state.inventory.currency, 'USD');
    assert.equal(state.inventory.items[0].price, 90);
    assert.equal(state.inventory.items[0].value, 100);
    assert.equal(state.inventory.items[0].archive.reason, 'Sold');
    assert.equal(state.notes.text, old.notes.text);
    assert.equal(model.syncPayload(state).data.inventory.currency, 'USD');
    assert.equal(model.exportEnvelope(state).state.inventory.currency, 'USD');
  }
});

test('existing saved accents adopt burnt orange while preserving display preferences', () => {
  const h = harness(), old = structuredClone(h.state);
  Object.assign(old.preferences.appearance, { accent: '#315f73', accent2: '#b86b4b', mode: 'dark', textScale: 1.3 });
  const next = h.App.stateModel.normalize(old);
  assert.equal(next.preferences.appearance.accent, '#b44916');
  assert.equal(next.preferences.appearance.accent2, '#c65d24');
  assert.equal(next.preferences.appearance.mode, 'dark');
  assert.equal(next.preferences.appearance.textScale, 1.3);
});

test('legacy rejection identifies the incompatible structure and never replaces either copy', async () => {
  for (const [file, message] of [
    [{ schemaVersion: 1, notes: { text: '' }, workspace: {} }, /legacy workspace data/],
    [{ schemaVersion: 1 }, /missing the Notes structure/],
    [{ schemaVersion: 1, notes: { text: [] } }, /invalid or oversized Notes/]
  ]) {
    const h = harness(); h.confirmation = true;
    h.state.inventory.items = [inventoryItem(h)]; changeNotes(h.state, 'Keep these Notes');
    const original = JSON.stringify(h.state);
    h.respond = () => response(200, { type: 'file', sha: 'sha', content: Buffer.from(JSON.stringify(file)).toString('base64') });
    await h.sync.syncNow();
    assert.match(h.sync.getInfo().message, message);
    await h.sync.restoreFromCloud();
    assert.match(h.sync.getInfo().message, message);
    assert.equal(h.replacements.length, 0);
    assert.equal(JSON.stringify(h.state), original);
    assert.ok(h.requests.every(request => request.options.method !== 'PUT'));
  }
});

test('Cable aliases merge and missing prices/values mirror without replacing distinct or zero amounts', () => {
 const h=harness();
 const item=inventoryItem(h,{categories:['Cable','Cables','cable'],price:12,value:null});
 assert.equal(item.categories.join(','),'Cables'); assert.equal(item.value,12);
 assert.equal(inventoryItem(h,{value:15,price:null}).price,15);
 assert.equal(inventoryItem(h,{value:0,price:12}).value,0);
 const different=inventoryItem(h,{price:10,value:20}); assert.equal(different.price,10); assert.equal(different.value,20);
 const unknown=inventoryItem(h,{price:null,value:null}); assert.equal(unknown.price,null); assert.equal(unknown.value,null);
});

test('favorite brands survive device-state normalization without entering the inventory sync payload', () => {
 const {App}=harness(); const state=App.stateModel.createDefaultState();
 state.preferences.favoriteBrands=['Ryobi','OXO','Ryobi'];
 const normalized=App.stateModel.normalize(state);
 assert.deepEqual(Array.from(normalized.preferences.favoriteBrands),['Ryobi','OXO']);
 assert.deepEqual(Array.from(App.stateModel.normalize(JSON.parse(JSON.stringify(normalized))).preferences.favoriteBrands),['Ryobi','OXO']);
 assert.equal(JSON.stringify(App.stateModel.syncPayload(normalized)).includes('favoriteBrands'),false);
});
