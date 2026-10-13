import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

function harness() {
  const values = new Map(), events = [];
  const h = { fail: () => false, values, events };
  const localStorage = {
    getItem: key => values.get(key) ?? null,
    removeItem: key => values.delete(key),
    setItem(key, value) { if (h.fail(key)) throw Object.assign(new Error('Full'), { name: 'QuotaExceededError' }); values.set(key, value); }
  };
  const context = vm.createContext({ window: { setTimeout: () => 1, clearTimeout() {}, addEventListener() {}, dispatchEvent: e => events.push(e) }, localStorage, sessionStorage: localStorage,
    setTimeout: () => 1, clearTimeout() {}, Blob, structuredClone,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } }
  });
  for (const file of ['config.js', 'core/utils.js', 'core/inventory.js', 'core/state.js', 'core/storage.js']) {
    vm.runInContext(readFileSync(new URL('../assets/js/' + file, import.meta.url), 'utf8'), context);
  }
  h.app = context.window.LocalApp;
  h.keys = h.app.config.storage;
  h.app.storage.load();
  h.app.storage.mutate(s => { s.notes.text = 'Local'; });
  h.app.storage.saveNow();
  h.next = structuredClone(h.app.storage.getState());
  h.next.notes.text = 'Cloud';
  return h;
}
const options = { saveRecovery: false, requirePersistent: true, touch: false, reason: 'sync-download' };

test('cloud replacement reclaims recovery space only when explicitly discarding and persists before reporting success', () => {
  const h = harness(), { storage } = h.app;
  h.values.set(h.keys.recoveryKey, 'old recovery');
  h.values.set(h.keys.secretKey, 'secret');
  h.values.set(h.keys.bulkDraftKey, 'draft');
  h.fail = key => key === h.keys.stateKey && h.values.has(h.keys.recoveryKey);
  storage.replace(h.next, { ...options, discardRecovery: true });
  assert.equal(storage.getState().notes.text, 'Cloud');
  assert.equal(JSON.parse(h.values.get(h.keys.stateKey)).notes.text, 'Cloud');
  assert.equal(h.values.has(h.keys.recoveryKey), false);
  assert.equal(h.values.get(h.keys.secretKey), 'secret');
  assert.equal(h.values.get(h.keys.bulkDraftKey), 'draft');
  assert.equal(storage.isPersistent(), true);
});

test('failed cloud persistence keeps the local state and saved copy and throws an actionable reason', () => {
  const h = harness(), { storage } = h.app;
  h.values.set(h.keys.recoveryKey, 'recovery');
  const saved = h.values.get(h.keys.stateKey);
  h.fail = key => key === h.keys.stateKey;
  assert.throws(() => storage.replace(h.next, options), /Storage is full.*Overwrite from GitHub/);
  assert.equal(storage.getState().notes.text, 'Local');
  assert.equal(h.values.get(h.keys.stateKey), saved);
  assert.equal(h.values.get(h.keys.recoveryKey), 'recovery');
  assert.equal(storage.isPersistent(), false);
});

test('overwrite still reports failure honestly when storage cannot save after reclaiming recovery space', () => {
  const h = harness(), { storage } = h.app;
  h.values.set(h.keys.recoveryKey, 'recovery');
  h.fail = key => key === h.keys.stateKey;
  assert.throws(() => storage.replace(h.next, { ...options, discardRecovery: true }), /even after removing the recovery backup/);
  assert.equal(storage.getState().notes.text, 'Local');
  assert.equal(JSON.parse(h.values.get(h.keys.stateKey)).notes.text, 'Local');
});

test('overwrite preserves older recovery data when no extra storage is needed', () => {
  const h = harness();
  h.values.set(h.keys.recoveryKey, 'recovery');
  h.app.storage.replace(h.next, { ...options, discardRecovery: true });
  assert.equal(h.values.get(h.keys.recoveryKey), 'recovery');
});
