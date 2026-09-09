import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
const ctx = vm.createContext({ window: { LocalApp: {} } });
for (const file of ['config', 'core/utils', 'core/inventory', 'core/smart-entry']) vm.runInContext(readFileSync(new URL('../assets/js/' + file + '.js', import.meta.url), 'utf8'), ctx);
const app = ctx.window.LocalApp, parse = text => JSON.parse(JSON.stringify(app.smartEntry.parse(text)));
test('purchase sample maps exact fields and retains account amount and unknown marker', () => {
  const result = parse(app.smartEntry.example);
  assert.deepEqual(result.fields, { price: '62.77', value: '65', source: 'Amazon', brand: 'Final Touch', name: 'Whiskey Flight Set with 3 Tasting Glasses & Modern Wood Stand', description: 'Chase Prime: 125.54 · [O]' });
  for (let i = 1; i < result.spans.length; i++) assert.ok(result.spans[i].start >= result.spans[i - 1].end);
});
test('plain names and unfamiliar brands remain intact; explicit annotations override defaults', () => {
  assert.equal(parse('Unknown Maker 3 Glasses').fields.name, 'Unknown Maker 3 Glasses');
  const result = parse('brand: Acme; Whiskey Set [0] owner: house; obtained: Gift; seller: Local Shop;');
  assert.deepEqual(result.fields, { value: '0', brand: 'Acme', owner: 'house', obtainedHow: 'Gift', source: 'Local Shop', name: 'Whiskey Set' });
  assert.equal(parse('Desk [50] Lamp').fields.name, 'Desk Lamp');
  assert.deepEqual(parse('').fields, {});
});
test('all wish locations and grouped tags are present with repeated spaces scoped to rooms', () => {
  const c = app.config.inventory;
  assert.equal(c.locations.length, 23);
  assert.equal(new Set(c.locations.map(l => l.zone)).size, 3);
  assert.equal(c.locations.reduce((n,l) => n + l.spaces.length, 0), 16);
  assert.equal(c.tagGroups.length, 8);
  assert.equal(c.tagGroups.reduce((n,g) => n + g.tags.length, 0), 54);
  assert.equal(c.locations.filter(l => l.spaces.includes('Closet')).length, 6);
});
