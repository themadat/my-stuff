import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const context=vm.createContext({window:{LocalApp:{}},crypto:globalThis.crypto});
for(const file of ['config','core/utils','core/inventory','core/smart-entry']) vm.runInContext(readFileSync(new URL('../assets/js/'+file+'.js',import.meta.url),'utf8'),context);
const app=context.window.LocalApp,m=app.inventoryModel;
const base={id:'weather',name:'Weather station',owner:'house',obtainedDate:'2020-12-17',price:100,value:100};
test('linked pieces retain names, dates, room locations and exact allocated money',()=>{
 const pieces=m.createCopies(base,3,[{piece:'Display',room:'Kitchen',obtainedDate:'2021-01-01',price:33.34,value:33.34},{piece:'Outside sensor',room:'Yard',obtainedDate:'',price:33.33,value:33.33},{piece:'Inside sensor',room:'Office',obtainedDate:'2022-01-01',price:33.33,value:33.33}]);
 assert.equal(new Set(pieces.map(p=>p.copyGroup)).size,1);assert.equal(new Set(pieces.map(p=>p.id)).size,3);assert.equal(pieces.reduce((sum,p)=>sum+Math.round(p.price*100),0),10000);assert.equal(pieces[1].obtainedDate,'');assert.equal(pieces[2].room,'Office');assert.equal(pieces[0].properties.find(p=>p.name==='Set Piece').value,'Display');assert.equal(m.sameObject(pieces[0],pieces[1]),true);
 const other=m.createCopies(base,1,[{piece:'Other station'}])[0];assert.equal(m.sameObject(pieces[0],other),false);
 assert.throws(()=>m.createCopies(base,1,[{obtainedDate:'2021-02-30'}]),/calendar/);
});
test('unknown departure retains Had status without inventing duration and Replaced is valid',()=>{
 const item=m.normalizeItem({...base,archive:{date:'',reason:'Replaced',notes:'Date not known'}});assert.ok(item.archive);assert.equal(m.daysOwned(item),null);assert.equal(m.ownershipAge(item),null);assert.equal(m.stats([item]).all.count,0);
 assert.throws(()=>m.normalizeItem({...base,archive:{date:'2019-01-01',reason:'Replaced'}}),/before/);
});
test('Conveyed parsing supplies the specified acquisition defaults',()=>{
 const f=app.smartEntry.parse('Outside\t\t\t$25\t\t[CONVEYED] Green hose').fields;assert.equal(f.obtainedHow,'Conveyed');assert.equal(f.price,'0');assert.equal(f.value,'25');assert.equal(f.obtainedDate,'2020-12-17');
 assert.equal(m.normalizeItem({...base,obtainedHow:'Conveyed'}).obtainedHow,'Conveyed');
 assert.equal(app.config.inventory.categories.find(c=>c.name==='Glassware').properties[0].unit,'oz');
});

test('inventory display orders zones like the sidebar and keeps named pieces separate in one room',()=>{
 const pieces=m.createCopies(base,2,[{piece:'Base',room:'Kitchen'},{piece:'Sensor',room:'Kitchen'}]);assert.equal(m.groupRows(pieces).length,2);
 const items=['Office','Kitchen','Yard'].map((room,i)=>m.normalizeItem({...base,id:'order'+i,room}));
 assert.deepEqual(Array.from(m.locationSections(items,true),s=>s.path[0]),['Outside','Main Level','Upstairs']);
});

test('zone-only and room-only sections precede their descendants',()=>{
 const paths=[['Outside','Yard',''],['Outside','',''],['Main Level','Nook','Go Bag'],['Main Level','Nook','']];
 const items=paths.map(([zone,room,space],i)=>m.normalizeItem({...base,id:'parent'+i,room,properties:[{name:'Zone',value:zone},{name:'Space',value:space}]}));
 assert.deepEqual(Array.from(m.locationSections(items,true),s=>Array.from(s.path)),[paths[1],paths[0],paths[3],paths[2]]);
 assert.ok(app.config.inventory.locations.find(l=>l.room==='Primary Bedroom').spaces.includes('Memory Box'));
});

test('monthly mileage totals, thresholds, validation and property round trip',()=>{
 for (const [total,tone] of [[0,'green'],[299.9,'green'],[300,'yellow'],[400,'orange'],[500,'red']]) assert.equal(m.mileage(JSON.stringify([{month:'2026-01',miles:total}])).tone,tone);
 const value=JSON.stringify([{month:'2026-01',miles:125.5},{month:'2026-02',miles:180}]);
 const item=m.normalizeItem({...base,properties:[{name:'Mileage',value}]});
 assert.equal(m.mileage(item.properties[0].value).total,305.5);
 for(const entries of [[{month:'2026-13',miles:1}],[{month:'2026-01',miles:-1}],[{month:'2026-01',miles:1},{month:'2026-01',miles:2}]]) assert.throws(()=>m.mileage(JSON.stringify(entries)));
 assert.throws(()=>m.mileage('not a log'));
});

test('weight display retains precision in storage and row sorting uses numeric values and units',()=>{
 const weight={name:'Weight',value:'5.8',unit:'oz'};
 assert.equal(m.propertyLabel(weight),'5.80 oz'); assert.equal(weight.value,'5.8');
 assert.equal(m.propertyLabel({name:'Weight',value:'250g',unit:''}),'250.00 g');
 assert.equal(m.propertyLabel({name:'Weight',value:'Unknown',unit:''}),'Unknown');
 const row=(id,weight,size='10',value=null)=>[m.normalizeItem({...base,id,name:id,value,price:value,properties:[{name:'Weight',value:weight},{name:'Size',value:size}]})];
 const light=row('Light','5.8 oz','9'), heavy=row('Heavy','200 g'), missing=row('Unknown','');
 assert.ok(m.compareRows(light,heavy,'weight','ascending')<0);
 assert.ok(m.compareRows(light,heavy,'weight','descending')>0);
 assert.ok(m.compareRows(light,heavy,'size','ascending')<0);
 for(const direction of ['ascending','descending']) assert.ok(m.compareRows(missing,light,'weight',direction)>0);
 assert.ok(m.compareRows(row('Cheap','', '10',5),row('Costly','','10',100),'value','ascending')<0);
 assert.ok(m.compareRows([...light,...heavy],light,'count','ascending')>0);
});

test('shoe geometry preserves heel-to-toe stacks and independent drop measurements',()=>{
 const stack=m.measurement({name:'Stack Height',value:'31->25',unit:'mm'});
 assert.equal(stack.value,'31→25');assert.equal(stack.unit,'mm');assert.equal(stack.imperial,'');
 assert.equal(m.measurement({name:'Stack Height',value:'31.5 → 25.5 mm',unit:''}).value,'31.5→25.5');
 assert.equal(m.measurement({name:'Drop',value:'6mm',unit:''}).value,'6');
 const shoe=m.normalizeItem({...base,categories:['Footwear'],properties:[{name:'Stack Height',value:'',unit:'mm'},{name:'Drop',value:'6',unit:'mm'}]});
 assert.equal(shoe.properties[0].value,'');assert.equal(shoe.properties[1].value,'6');
 const row=value=>[m.normalizeItem({...base,properties:[{name:'Stack Height',value,unit:'mm'}]})];
 assert.ok(m.compareRows(row('9->5'),row('31->25'),'stack height','ascending')<0);
 assert.deepEqual(Array.from(app.config.inventory.connectionTypes),['Wi-Fi 2.4 GHz','Wi-Fi 5.0 GHz','Ethernet','Zigbee','RF (433 MHz)','RF (434 MHz)','RF (915 MHz)','Bluetooth','Thread','BLE','UWB','NFC','Inactive']);
 assert.ok(app.config.inventory.tagGroups.find(g=>g.name==='Systems').tags.includes('Network'));
});

test('copies and pieces share one age and combined cost without inventing missing data',()=>{
 const rows=[m.normalizeItem({...base,id:'a',obtainedDate:'2024-01-01',price:60,value:60}),m.normalizeItem({...base,id:'b',obtainedDate:'2024-07-01',price:40,value:40})];
 const summary=m.ownershipSummary(rows,'2025-01-01');assert.equal(summary.years,1);assert.equal(summary.months,0);assert.equal(summary.annualValue,100);
 assert.equal(m.ownershipSummary([rows[0],{...rows[1],obtainedDate:''}],'2025-01-01'),null);
 assert.equal(m.ownershipSummary([rows[0],{...rows[1],price:null,value:null}],'2025-01-01').annualValue,null);
 assert.equal(m.ownershipSummary([{...rows[0],price:0,value:0}],'2025-01-01').annualValue,0);
 assert.equal(m.ownershipSummary(rows,'2024-01-01').annualValue,null);
 const gone=rows.map(row=>({...row,archive:{date:'2025-01-01',reason:'Sold'}}));
 assert.equal(m.ownershipSummary(gone).annualValue,100);
 assert.equal(m.ownershipSummary([{...gone[0],archive:{date:'',reason:'Sold'}},gone[1]]),null);
});

test('special views activate only for selections within their category',()=>{
 assert.equal(m.specialView([]),'');assert.equal(m.specialView(['Network']),'network');assert.equal(m.specialView(['Footwear']),'footwear');
 assert.equal(m.specialView(['group:Smart']),'smart');assert.equal(m.specialView(['Lights','Sensor']),'smart');
 assert.equal(m.specialView(['Footwear','Network']),'');assert.equal(m.specialView(['Network','Tools']),'');assert.equal(m.specialView(['group:Systems']),'');
});

test('Network and Smart Home grouping preserve every object once and include unknown connections',()=>{
 const make=(id,categories,connection)=>m.normalizeItem({...base,id,categories,properties:connection?[{name:'Connection Type',value:connection}]:[]});
 const items=[make('a',['Network','Lights','Sensor'],'Thread'),make('b',['Network','Sensor'],'Zigbee'),make('c',['Network','Lights'],'')];
 const sections=m.specialSections(items,'network');assert.deepEqual(Array.from(sections,s=>s.path[0]),['Thread','Unknown Connection Type','Zigbee']);
 const smart=m.specialSections(items,'smart');assert.deepEqual(Array.from(smart,s=>[s.path[0],s.items.length]),[['Lights',2],['Sensor',1]]);
 assert.equal(new Set(smart.flatMap(s=>s.items.map(item=>item.id))).size,3);
});

test('multiple network connections normalize order and group each device once',()=>{
 assert.deepEqual(Array.from(m.connectionTypes('BLE | Ethernet | BLE')),['Ethernet','BLE']);
 assert.equal(m.connectionLabel('RF (433 MHz)'),'RF (433 MHz) [TempPro]');
 assert.equal(m.connectionLabel('RF (434 MHz)'),'RF (434 MHz) [Lutron]');
 assert.equal(m.connectionLabel('RF (915 MHz)'),'RF (915 MHz) [Tempest]');
 const items=['BLE | Ethernet','Ethernet | BLE'].map((value,i)=>m.normalizeItem({...base,id:String(i),properties:[{name:'Connection Type',value,unit:''}]}));
 const groups=m.specialSections(items,'network');
 assert.equal(groups.length,1);assert.equal(groups[0].path[0],'Ethernet + BLE');assert.equal(groups[0].items.length,2);
 assert.deepEqual(Array.from(m.connectionTypes('Custom radio')),['Custom radio']);
});

test('Conveyed in plain text and annotations only populates acquisition and House ownership',()=>{
 for(const text of ['Conveyed Green hose','Conveyed - Green hose','Green hose [CONVEYED] conveyed','owner: me; obtained: Conveyed; Green hose','seller: Conveyed; Green hose']) {
  const f=app.smartEntry.parse(text).fields;
  assert.equal(f.owner,'house');assert.equal(f.obtainedHow,'Conveyed');assert.equal(f.name,'Green hose');
  for(const [key,value] of Object.entries(f)) if(key!=='obtainedHow') assert.doesNotMatch(String(value),/conveyed/i);
 }
});

test('backpacking totals convert units, count copies and flag missing or invalid weights',()=>{
 const item=(value,unit='oz',category='Equipment')=>m.normalizeItem({...base,properties:[{name:'Weight',value,unit},{name:'Backpacking Category',value:category},{name:'Weight Level',value:'Cold'}]});
 assert.equal(m.specialView(['Backpacking']),'backpacking');
 assert.equal(m.specialView(['Backpacking','Footwear']),'');
 for(const [value,unit,expected] of [['16','oz',16],['1','lbs',16],['453.59237','g',16],['0.45359237','kg',16],['1/2 lb','',8],['0','oz',0]]) assert.ok(Math.abs(m.weightOunces(item(value,unit))-expected)<1e-8);
 for(const [value,unit] of [['','oz'],['bad','oz'],['-1','oz'],['1','fl oz']]) assert.equal(m.weightOunces(item(value,unit)),null);
 const rows=[item('16'),item('16'),item(''),item('32','oz','Wear')];
 const total=m.packTotal(rows.filter(i=>m.packCategory(i)!=='Wear'));
 assert.equal(total.ounces,32);assert.equal(total.unknown,1);
 assert.equal(m.packCategory(item('1','oz','unknown')),'Uncategorized');
 assert.equal(item('1').properties.find(p=>p.name==='Weight Level').value,'Cold');
});
