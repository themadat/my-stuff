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

test('copy groups persist through normalization while older records remain compatible', () => {
 const copies = app.inventoryModel.createCopies(item,2);
 assert.ok(copies[0].copyGroup); assert.equal(copies[0].copyGroup,copies[1].copyGroup);
 assert.equal(app.inventoryModel.normalize({currency:'USD',items:copies}).items[1].copyGroup,copies[0].copyGroup);
 assert.equal(Object.hasOwn(app.inventoryModel.normalizeItem(item),'copyGroup'),false);
});

test('ownership age uses calendar anniversaries and annual cost handles unknown and same-day dates', () => {
 const base = app.inventoryModel.normalizeItem({...item,obtainedDate:'2023-09-10',price:30});
 const age = app.inventoryModel.ownershipAge(base,'2026-09-10');
 assert.deepEqual([age.years,age.months,age.days,age.annualValue],[3,0,0,10]);
 const leap = app.inventoryModel.ownershipAge({...base,obtainedDate:'2024-02-29'},'2025-02-28');
 assert.deepEqual([leap.years,leap.months,leap.days],[1,0,0]);
 const month = app.inventoryModel.ownershipAge({...base,obtainedDate:'2024-01-31'},'2024-03-01');
 assert.deepEqual([month.years,month.months,month.days],[0,1,1]);
 assert.equal(app.inventoryModel.ownershipAge(base,'2023-09-10').annualValue,null);
 assert.equal(app.inventoryModel.ownershipAge({...base,obtainedDate:''},'2026-09-10'),null);
 assert.equal(app.inventoryModel.ownershipAge({...base,price:null,value:null},'2026-09-10').annualValue,null);
});

test('same-room matching objects group without merging storage or hiding separate rooms and brands', () => {
 const copies=app.inventoryModel.createCopies(item,3,['Den','Den','Office']);
 copies[1].properties.find(p=>p.name==='Color').value='White';
 assert.deepEqual(Array.from(app.inventoryModel.groupRows(copies),g=>g.length),[2,1]);
 assert.equal(copies.length,3);
 const other=app.inventoryModel.normalizeItem({...copies[0],id:'brand',properties:[{name:'Brand',value:'Different'}]});
 assert.equal(app.inventoryModel.groupRows([...copies,other]).length,3);
 assert.equal(app.inventoryModel.sameObject(copies[0],copies[1]),true);
 assert.equal(app.inventoryModel.sameObject(copies[0],other),false);
 copies[0].archive={date:'2026-09-10',reason:'Sold',notes:''};
 copies[1].archive={date:'2026-09-10',reason:'Sold',notes:''};
 assert.equal(app.inventoryModel.groupRows(copies).length,3,'departure histories remain individual');
});

test('copy overrides preserve zone-only and custom room parents', () => {
 const zone=app.inventoryModel.createCopies(item,1,[{zone:'Upstairs'}])[0];
 assert.equal(zone.room,''); assert.equal(zone.properties.find(p=>p.name==='Zone').value,'Upstairs');
 assert.equal(zone.properties.some(p=>p.name==='Space'),false);
 const custom=app.inventoryModel.createCopies(item,1,[{zone:'Annex',room:'Studio',space:'Shelf'}])[0];
 assert.equal(custom.properties.find(p=>p.name==='Zone').value,'Annex');
 const known=app.inventoryModel.createCopies(item,1,[{zone:'Wrong',room:'Office',space:'Desk'}])[0];
 assert.equal(known.properties.find(p=>p.name==='Zone').value,'Upstairs');
});

test('catalog filters respect location parents, tag groups, properties and property values', () => {
 const entry=app.inventoryModel.normalizeItem({...item,room:'Nook',categories:['Water'],properties:[{name:'Space',value:'Sling Bag'},{name:'Brand',value:'OXO'},{name:'Color',value:'Blue'}]});
 const matches=app.inventoryCatalog.matches;
 assert.equal(matches(entry,{kind:'zone',value:'Main Level'}),true);
 assert.equal(matches(entry,{kind:'space',value:'Sling Bag',room:'Nook',zone:'Main Level'}),true);
 assert.equal(matches(entry,{kind:'space',value:'Sling Bag',room:'Office',zone:'Upstairs'}),false);
 assert.equal(matches(entry,{kind:'tags',values:['Water','Fire']}),true);
 assert.equal(matches(entry,{kind:'tags',values:['OXO'],brands:true}),true);
 assert.equal(matches(entry,{kind:'properties',values:['color','weight']}),true);
 assert.equal(matches(entry,{kind:'property',name:'Color',value:'Blue'}),true);
 assert.equal(matches(entry,{kind:'property',name:'Color',value:'Red'}),false);
});
