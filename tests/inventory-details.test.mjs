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
