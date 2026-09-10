import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
const ctx = vm.createContext({ window: { LocalApp: {} } });
for (const file of ['config', 'core/utils', 'core/inventory', 'inventory-catalog']) vm.runInContext(readFileSync(new URL('../assets/js/' + file + '.js', import.meta.url), 'utf8'), ctx);
const app = ctx.window.LocalApp;
const item = { id: 'original', name: 'Lamp', owner: 'me', room: 'Den', price: 30, value: 40, categories: ['Lighting'], properties: [{ name: 'Zone', value: 'Main Level' }, { name: 'Space', value: 'Bar' }, { name: 'Color', value: 'Blue' }], archive: null };
test('copies have distinct identities, per-copy amounts, independent properties and different room parents', () => {
  const copies = app.inventoryModel.createCopies(item, 3, ['', 'Office', 'Custom Room']);
  assert.equal(new Set(copies.map(c => c.id)).size, 3);
  assert.ok(copies.every(c => c.id !== item.id));
  assert.equal(copies[0].properties.find(p => p.name === 'Space').value, 'Bar');
  assert.equal(copies[1].room, 'Office');
  assert.equal(copies[1].properties.find(p => p.name === 'Zone').value, 'Upstairs');
  assert.ok(!copies[1].properties.some(p => p.name === 'Space'));
  assert.ok(!copies[2].properties.some(p => ['Zone', 'Space'].includes(p.name)));
  copies[1].properties.find(p => p.name === 'Color').value = 'Red';
  assert.equal(copies[0].properties.find(p => p.name === 'Color').value, 'Blue');
  assert.equal(item.properties[2].value, 'Blue');
  assert.equal(app.inventoryModel.stats(copies).all.valueCents, 12000);
  copies[0].archive = { date: '2026-09-09', reason: 'Sold', notes: '' };
  assert.equal(app.inventoryModel.stats(copies).all.count, 2);
});
test('copy count is bounded and new copies never inherit archived status', () => {
  for (const count of [0, 101, 1.5, NaN]) assert.throws(() => app.inventoryModel.createCopies(item, count));
  const copy = app.inventoryModel.createCopies({ ...item, archive: { date: '2026-09-09', reason: 'Sold' } }, 1)[0];
  assert.equal(copy.archive, null);
});
test('settings catalog preserves hierarchy, all tag groups, category property groups and custom values', () => {
  const catalog = app.inventoryCatalog.data([{ ...item, room: 'Studio', categories: ['Handmade'], properties: [{ name: 'Zone', value: 'Annex' }, { name: 'Space', value: 'Shelf' }, { name: 'Color', value: 'Teal' }, { name: 'Finish', value: 'Matte' }] }]);
  assert.equal(catalog.locations.find(z => z.name === 'Annex').rooms[0].spaces[0], 'Shelf');
  assert.equal(catalog.tagGroups.find(g => g.name === 'Custom Tags').tags[0], 'Handmade');
  for (const group of app.config.inventory.tagGroups) assert.equal(catalog.tagGroups.find(g => g.name === group.name).tags.length, group.tags.length);
  assert.ok(catalog.propertyGroups.find(g => g.name === 'Common Properties').properties.find(p => p.name === 'Color').values.includes('Teal'));
  assert.ok(catalog.propertyGroups.find(g => g.name === 'Shoes').properties.some(p => p.name === 'Weight'));
  assert.equal(catalog.propertyGroups.find(g => g.name === 'Custom Properties').properties[0].name, 'Finish');
});

test('copies have independent spaces, resolve unique spaces and reject conflicting room-space combinations', () => {
 const copies = app.inventoryModel.createCopies(item, 2, [{room:'Nook',space:'Sling Bag'},{room:'Office',space:'Desk'}]);
 assert.equal(copies[0].properties.find(p=>p.name==='Space').value,'Sling Bag');
 assert.equal(copies[1].properties.find(p=>p.name==='Space').value,'Desk');
 assert.equal(copies[1].properties.find(p=>p.name==='Zone').value,'Upstairs');
 assert.equal(app.inventoryModel.createCopies(item,1,[{space:'Sling Bag'}])[0].room,'Nook');
 assert.throws(()=>app.inventoryModel.createCopies(item,1,[{room:'Office',space:'Sling Bag'}]),/matching room/);
 assert.equal(item.properties.find(p=>p.name==='Space').value,'Bar');
});
