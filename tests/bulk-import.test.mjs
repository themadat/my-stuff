import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
const ctx = vm.createContext({ window: { LocalApp: {} } });
for (const file of ['config', 'core/utils', 'core/inventory', 'core/smart-entry', 'core/bulk-import']) vm.runInContext(readFileSync(new URL('../assets/js/' + file + '.js', import.meta.url), 'utf8'), ctx);
const app = ctx.window.LocalApp, bulk = app.bulkImport;
const plain = value => JSON.parse(JSON.stringify(value));
test('CSV respects quoted commas, multiline cells, escaped quotes, BOM, and TSV', () => {
 assert.deepEqual(plain(bulk.parseDelimited('\uFEFFObject,Notes\r\n"Glass, blue","Two\nlines and ""quotes"""')), [['Object','Notes'], ['Glass, blue','Two\nlines and "quotes"']]);
 assert.deepEqual(plain(bulk.parseDelimited('Object\tColor\nLamp\tBlue')), [['Object','Color'],['Lamp','Blue']]);
 assert.throws(() => bulk.parseDelimited('Object,Notes\n"missing quote'));
});
test('unheaded purchase rows parse the supplied format and suggest editable tags and location', () => {
 const rows = bulk.prepare([[app.smartEntry.example]], false, [], []);
 const d = rows[0].draft;
 assert.equal(d.name, 'Whiskey Flight Set with 3 Tasting Glasses & Modern Wood Stand');
 assert.equal(d.price, '62.77'); assert.equal(d.value, '65'); assert.equal(d.obtainedDate, '2026-08-03');
 assert.ok(d.categories.includes('Barware')); assert.ok(d.categories.includes('Glassware'));
 assert.equal(d.room, 'Den'); assert.ok(rows[0].suggestions.some(s => s.includes('Other')));
 assert.match(d.description, /Chase Prime: 125.54.*\[O\]/);
});
test('explicit spreadsheet fields beat guesses and quantities produce independent review drafts', () => {
 const rows = [['Object','Price','Value','Date','Room','Tags','Color','Qty','Memo'], ['Black whiskey glass','($12.50)','20','08/03/26','Office','Gift Collection','Blue','2','Keep me']];
 const out = bulk.prepare(rows, true, bulk.mapping(rows[0]), []);
 assert.equal(out.length, 2); assert.notEqual(out[0].id, out[1].id);
 assert.equal(out[0].draft.room, 'Office'); assert.deepEqual(plain(out[0].draft.categories), ['Gift Collection']);
 assert.equal(out[0].draft.properties.find(p => p.name === 'Color').value, 'Blue');
 assert.equal(out[0].draft.price, 12.5); assert.match(out[0].draft.description, /Memo: Keep me/);
 out[0].draft.name='Edited'; assert.equal(out[1].draft.name,'Black whiskey glass');
});
test('invalid fields remain visible for review and oversized quantities cannot disappear', () => {
 const rows = [['Object','Price','Date'], ['Lamp','not a number','02/30/26']];
 const out = bulk.prepare(rows, true, bulk.mapping(rows[0]), []);
 assert.equal(out[0].warnings.length, 2); assert.equal(out[0].draft.price,''); assert.equal(out[0].draft.obtainedDate,'');
 assert.match(out[0].draft.description,/not a number/);
 assert.throws(() => bulk.prepare([['Object','Qty'],['Lamp','0']],true,['name','quantity'],[]));
 assert.throws(() => bulk.prepare(Array.from({length:501},()=>['Lamp']),false,[],[]));
});
test('bulk raw annotations retain ownership and acquisition, and vocabulary suggestions use whole words', () => {
 const d = bulk.prepare([['Blue sensor; owner: house; obtained: Gift;']], false, [], [])[0].draft;
 assert.equal(d.owner, 'house'); assert.equal(d.obtainedHow, 'Gift'); assert.ok(d.categories.includes('Sensor'));
 assert.ok(!bulk.prepare([['Nightstand']], false, [], [])[0].draft.categories.includes('Night'));
 assert.throws(() => bulk.parseDelimited(Array(81).fill('x').join(',')), /80 columns/);
});
test('bulk inventory row retains its source for Smart Complete and Water includes Volume', () => {
 const source = 'Floating\tWater\t09/22/24\t$12\t\tAmazon - Vapur Flexible, Collapsible Wide Mouth Anti-Bottle with Detachable Carabiner, 23 Ounce, Fire, Pack of 2 [24], Float';
 const result = bulk.prepare(bulk.parseDelimited(source),false,[],[]);
 assert.equal(result.length, 1); const d = result[0].draft;
 assert.equal(d._smartEntry,source); assert.equal(d.room,'Nook'); assert.deepEqual(plain(d.categories),['Water Bottles']);
 assert.deepEqual(plain(d.properties.find(p=>p.name==='Volume')),{name:'Volume',value:'23',unit:'oz'});
 assert.ok(app.config.inventory.categories.find(c=>c.name==='Water Bottles').properties.some(p=>p.name==='Volume'));
});

test('unknown or unparsed mapped dates override inferred dates without inventing a date', () => {
 for (const date of ['Unknown','N/A','not a date','02/30/26']) {
  const rows = [['Object','Date'], ['08/03/26 Lamp',date]];
  const result = bulk.prepare(rows,true,bulk.mapping(rows[0]),[])[0];
  assert.equal(result.draft.obtainedDate, '');
  if (['not a date','02/30/26'].includes(date)) assert.ok(result.draft.description.includes(date));
 }
 const noDate = bulk.prepare([['Object'],['Lamp']],true,['name'],[])[0];
 assert.equal(noDate.draft.obtainedDate, '');
});

test('bulk rows use separate Seller and Brand with explicit column precedence', () => {
 const rows=[['Object','Seller','Brand'],['Apple - Magic Mouse','Amazon','Beats']];
 const draft=bulk.prepare(rows,true,bulk.mapping(rows[0]),[])[0].draft;
 assert.equal(draft.source,'Amazon');assert.equal(draft.properties.find(p=>p.name==='Brand').value,'Beats');
 const inferred=bulk.prepare([['Amazon - Beats Studio Pro']],false,[],[])[0].draft;
 assert.equal(inferred.source,'Amazon');assert.equal(inferred.properties.find(p=>p.name==='Brand').value,'Beats');
});
