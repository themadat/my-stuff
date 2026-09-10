import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
const ctx = vm.createContext({ window: { LocalApp: {} } });
for (const file of ['config', 'core/utils', 'core/inventory', 'core/smart-entry']) vm.runInContext(readFileSync(new URL('../assets/js/' + file + '.js', import.meta.url), 'utf8'), ctx);
const app = ctx.window.LocalApp, parse = text => JSON.parse(JSON.stringify(app.smartEntry.parse(text)));
test('purchase sample maps exact fields and retains account amount and unknown marker', () => {
  const result = parse(app.smartEntry.example.replace(/^08\/03\/26\t/, ""));
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

test('dated purchase lines remove date and price before matching brand and object', () => {
  for (const date of ['08/03/26', '8/3/2026', '2026-08-03']) {
    const text = app.smartEntry.example.replace('08/03/26', date);
    const result = parse(text);
    assert.deepEqual(result.fields, { obtainedDate: '2026-08-03', price: '62.77', value: '65', source: 'Amazon', brand: 'Final Touch', name: 'Whiskey Flight Set with 3 Tasting Glasses & Modern Wood Stand', description: 'Chase Prime: 125.54 · [O]' });
    assert.equal(text.slice(result.spans[0].start, result.spans[0].end), date);
    for (let i = 1; i < result.spans.length; i++) assert.ok(result.spans[i].start >= result.spans[i - 1].end);
  }
});
test('dates validate calendar days and retain invalid dates as notes without swallowing the object', () => {
  assert.equal(parse('02/29/24 $10 Final Touch Glass').fields.obtainedDate, '2024-02-29');
  for (const date of ['02/29/26', '13/03/26', '2026-02-30']) {
    const result = parse(date + '\t($10)\tFinal Touch Glass').fields;
    assert.equal(result.obtainedDate, undefined);
    assert.equal(result.description, date);
    assert.equal(result.price, '10');
    assert.equal(result.brand, 'Final Touch');
    assert.equal(result.name, 'Glass');
  }
});

test('inventory spreadsheet columns extract leading space, tags, date, price, brand, value and volume', () => {
  const text = 'Floating\tWater\t09/22/24\t$12\t\tAmazon - Vapur Flexible, Collapsible Wide Mouth Anti-Bottle with Detachable Carabiner, 23 Ounce, Fire, Pack of 2 [24], Float';
  const result = parse(text);
  assert.equal(result.fields.room, 'Nook'); assert.equal(result.fields.zone, 'Main Level'); assert.equal(result.fields.space, 'Floating');
  assert.equal(result.fields.categories, 'Water, Float'); assert.equal(result.fields.obtainedDate, '2024-09-22');
  assert.equal(result.fields.price, '12'); assert.equal(result.fields.value, '24'); assert.equal(result.fields.brand, 'Vapur'); assert.equal(result.fields.source, 'Amazon');
  assert.equal(result.fields.volume, '23'); assert.equal(result.fields.volumeUnit, 'oz');
  assert.equal(result.fields.name, 'Flexible, Collapsible Wide Mouth Anti-Bottle with Detachable Carabiner, Fire, Pack of 2');
  for (let i = 1; i < result.spans.length; i++) assert.ok(result.spans[i].start >= result.spans[i - 1].end);
  assert.ok(result.spans.some(span => span.field === 'categories')); assert.ok(result.spans.some(span => span.field === 'volume'));
  assert.equal(parse('Office\tCable\t09/22/24\t$10\tUSB extension').fields.room, 'Office');
  assert.equal(parse('Closet\tWater\tBottle').fields.room, undefined, 'ambiguous spaces are not assigned an arbitrary parent');
});
