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
 assert.equal(bulk.parseDelimited(Array(81).fill('x').join(','))[0].length,81);
});
test('bulk inventory row retains its source for Smart Complete and Water includes Volume', () => {
 const source = 'Floating\tWater\t09/22/24\t$12\t\tAmazon - Vapur Flexible, Collapsible Wide Mouth Anti-Bottle with Detachable Carabiner, 23 Ounce, Fire, Pack of 2 [24], Float';
 const result = bulk.prepare(bulk.parseDelimited(source),false,[],[]);
 assert.equal(result.length, 1); const d = result[0].draft;
 assert.equal(d._smartEntry,source); assert.equal(d.room,'Nook'); assert.deepEqual(plain(d.categories),['Water Bottles','Float']);
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

test('household Had export parses all supplied rows without mixing ignored columns into the object',()=>{
 const source=readFileSync(new URL('./fixtures/household-had.tsv',import.meta.url),'utf8');
 const cells=bulk.parseDelimited(source), rows=bulk.prepare(cells,false,[],[],{archive:true});
 assert.equal(rows.length,21);
 const expectedReasons=['Broken','Broken','Lost','Trashed','Other','Other','Other','Other','Other','Broken','Lost','Broken','Broken','Trashed','Trashed','Trashed','Replaced','Replaced','Replaced','Replaced','Broken'];
 rows.forEach((row,index)=>{
  const d=row.draft, raw=cells[index];
  assert.equal(d.room,'Kitchen');assert.equal(d.value,raw[3].slice(1));assert.equal(d.price,d.value);
  assert.equal(d.archive.notes,raw[11]);assert.equal(d.archive.reason,expectedReasons[index]);
  assert.equal(d.archive.date,app.inventoryModel.dateOnly(raw[9].replace(/(\d+)\/(\d+)\/(\d+)/,(_,m,d,y)=>'20'+y+'-'+m+'-'+d)));
  assert.equal(d.obtainedDate,raw[2]?raw[2].replace(/(\d+)\/(\d+)\/(\d+)/,(_,m,d,y)=>'20'+y+'-'+m+'-'+d):'');
  assert.ok(!d.name.includes(raw[11]));assert.ok(!/\d+y \d+m \d+d/.test(d.name));
  const saved=app.inventoryModel.normalizeItem({...d,id:row.id});assert.equal(saved.archive.notes,raw[11]);
 });
 assert.equal(rows[1].draft.source,'Home Depot');assert.equal(rows[1].draft.brand,'GE Profile');
 assert.match(rows[1].draft.name,/Model PDT715SFN3DS; Serial FS858403B$/);
 assert.equal(rows[2].draft.brand,'Gatorade');assert.equal(rows[2].draft.source,'Dicks Sporting Goods');
 assert.ok(rows[0].draft.categories.includes('Appliances'));assert.ok(rows[2].draft.categories.includes('Water Bottles'));
 assert.equal(rows[4].draft.brand,'CamelBak');assert.match(rows[4].draft.name,/\(1 of 5\)$/);
 assert.equal(rows[20].draft.brand,'Nordic');
});

test('long import fields survive preparation and model round trips; ignored columns never override value',()=>{
 const name='Long object '+ 'x'.repeat(13000), notes='Reason '+ 'y'.repeat(6000);
 const cells=['Kitchen','Appliance','','$200','',name,'ignored text','$999','08/08/20','12/15/25','2y 1m 1d',notes];
 const d=bulk.prepare([cells],false,[],[],{archive:true})[0].draft;
 assert.equal(d.name,name);assert.equal(d.value,'200');assert.equal(d.obtainedDate,'');assert.equal(d.archive.notes,notes);
 const saved=app.inventoryModel.normalizeItem({...d,id:'long'});assert.equal(saved.name,name);assert.equal(saved.archive.notes,notes);
 assert.equal(bulk.parseDelimited(Array(100).fill('cell').join('\t'))[0].length,100);
 const withProperties=bulk.prepare([['Object','Seller','Notes','Custom'],[name,'s'.repeat(600),'n'.repeat(6000),'p'.repeat(1000)]],true,['name','source','description','property'],[])[0].draft;
 const round=app.inventoryModel.normalizeItem({...withProperties,id:'long-props'});
 assert.equal(round.source.length,600);assert.ok(round.description.length>6000);assert.equal(round.properties.find(p=>p.name==='Custom').value.length,1000);
});

test('household layout supports extra category cells and surfaces invalid dates for review',()=>{
 const row=['Kitchen','Appliance','Smart','02/30/25','$20','Leviton Switch','','','999','02/30/26','','Replaced with something better'];
 const d=bulk.prepare([row],false,[],[],{archive:true})[0];
 assert.deepEqual(plain(d.draft.categories),['Appliances','Smart']);
 assert.equal(d.draft.obtainedDate,'');assert.equal(d.draft.archive.date,'');assert.equal(d.warnings.length,2);
 assert.match(d.draft.description,/02\/30\/25/);assert.match(d.draft.description,/02\/30\/26/);
 assert.equal(d.draft.value,'20');assert.equal(d.draft.name,'Switch');
});

test('household Have examples preserve column values, zones, seller/brand and warranty notes',()=>{
 const cells=bulk.parseDelimited(readFileSync(new URL('./fixtures/household-have.tsv',import.meta.url),'utf8'));
 const rows=bulk.prepare(cells,false,[],[]);assert.equal(rows.length,15);
 rows.forEach((row,i)=>{const d=row.draft;assert.equal(d.value,cells[i][3].slice(1));assert.equal(d.price,[9,10].includes(i)?'0':d.value);assert.ok(d.properties.some(p=>p.name==='Zone'&&p.value==='Outside'));assert.equal(d.room,'');assert.ok(!d.archive);assert.ok(!d.name.startsWith('Outside'));});
 const d=rows.map(r=>r.draft);
 assert.deepEqual(plain(d[0].categories),['Lights','Strip','Smart']);assert.equal(d[0].brand,'Govee');assert.equal(d[0].source,'Govee');assert.equal(d[0].obtainedDate,'2026-07-01');
 assert.ok(d[2].categories.includes('Climate'));assert.equal(d[2].brand,'American Standard');assert.equal(d[2].source,'SetPoint');assert.match(d[2].name,/Serial# 232824KMHF/);assert.doesNotMatch(d[2].name,/Compressor/);assert.match(d[2].description,/07\/27\/2035.*07\/27\/2033/);
 assert.equal(d[4].source,'Apple');assert.equal(d[4].brand,'Logitech');assert.match(d[6].name,/Cash to Jake/);
 assert.equal(d[8].obtainedDate,'');assert.equal(d[8].name,'Doormat, Wipe Your Paws');
 for(const i of [9,10]) {assert.equal(d[i].obtainedHow,'Conveyed');assert.equal(d[i].obtainedDate,'2020-12-17');assert.match(d[i].description,/CONVEYED/);assert.doesNotMatch(d[i].name,/CONVEYED/);}
 assert.equal(d[12].source,'Amazon');assert.equal(d[12].brand,'Walensee');assert.match(d[12].description,/Home Improvement/);assert.match(d[12].name,/Back/);assert.match(d[13].name,/Front/);assert.equal(d[14].brand,'Ryobi');
 const invalid=app.smartEntry.parse('Outside\tSmart\t02/30/26\t$20\t\tGovee - Lamp');assert.match(invalid.warnings[0],/Date Obtained/);
});
