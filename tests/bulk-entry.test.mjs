import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
function setup(quantity=2) {
 const elements=new Map(), memory=new Map(); let failSave=false, failQueue=false, writes=0, homes=0;
 const document={querySelector(selector){if(!elements.has(selector))elements.set(selector,{value:'',innerHTML:'',textContent:'',hidden:false,setAttribute(){}});return elements.get(selector);}};
 const ctx=vm.createContext({window:{LocalApp:{}},document,localStorage:{getItem:k=>memory.get(k)??null,setItem(k,v){if(failQueue)throw Error('full');memory.set(k,v);}},clearTimeout(){},setTimeout(){return 1;}});
 for(const file of ['config','core/utils','core/inventory','core/smart-entry','core/bulk-import'])vm.runInContext(readFileSync(new URL('../assets/js/'+file+'.js',import.meta.url),'utf8'),ctx);
 const app=ctx.window.LocalApp,state={inventory:{currency:'USD',items:[]}};
 app.storage={getState:()=>state,mutate(fn){writes++;fn(state);},saveNow:()=>!failSave};app.icons={markup:()=>''};app.components={closeDialog(){}};
 let draft;app.inventoryUI={captureDraft:()=>JSON.parse(JSON.stringify(draft)),openDraft(value){draft=JSON.parse(JSON.stringify(value));},home(){homes++;}};
 const source=readFileSync(new URL('../assets/js/bulk-entry.js',import.meta.url),'utf8').replace('App.bulkEntry = {','App.bulkEntry = { testSet(value) { queue=value; lastJson=null; reviewing=true; }, testRows() { return queue.rows; }, testAdvance:advance,');
 vm.runInContext(source,ctx);
 const rows=app.bulkImport.prepare([['Object','Qty'],['Lamp',String(quantity)]],true,['name','quantity'],[]);
 app.bulkEntry.testSet({version:1,name:'Fixture',rows});app.bulkEntry.testAdvance();
 return {app,state,get draft(){return draft;},get writes(){return writes;},get homes(){return homes;},failSave(value){failSave=value;},failQueue(value){failQueue=value;},item(){return app.inventoryModel.normalizeItem({...draft,id:'draft',archive:null});}};
}
test('spreadsheet quantities open together and save locations and notes in one mutation',()=>{
 const h=setup(3);assert.equal(h.draft._copies,3);
 h.app.bulkEntry.accept(h.item(),3,[{room:'Nook',space:'Sling Bag',notes:'Travel'},{room:'Office',space:'Desk',notes:''},{room:'Den',notes:null}]);
 assert.equal(h.writes,1);assert.equal(h.homes,1);assert.equal(h.state.inventory.items.length,3);
 assert.equal(h.state.inventory.items[0].description,'Travel');assert.equal(h.state.inventory.items[1].description,'');
 assert.ok(h.app.bulkEntry.testRows().every(row=>row.status==='saved'));
 assert.equal(new Set(h.state.inventory.items.map(item=>item.id)).size,3);
});
test('failed inventory persistence retries the entire batch without duplicates',()=>{
 const h=setup(1);h.failSave(true);
 assert.throws(()=>h.app.bulkEntry.accept(h.item(),3,[{room:'Den'},{room:'Office'},{room:'Nook'}]),/only in memory/);
 const ids=h.state.inventory.items.map(item=>item.id);assert.equal(ids.length,3);assert.equal(h.homes,0);
 h.failSave(false);h.app.bulkEntry.accept(h.item(),3,[{room:'Den'},{room:'Office'},{room:'Nook'}]);
 assert.deepEqual(h.state.inventory.items.map(item=>item.id),ids);assert.equal(h.writes,1);assert.equal(h.homes,1);
});
test('queue storage failure prevents inventory writes',()=>{
 const h=setup();h.failQueue(true);assert.throws(()=>h.app.bulkEntry.accept(h.item(),2,[]),/could not be saved/);
 assert.equal(h.state.inventory.items.length,0);assert.equal(h.writes,0);assert.equal(h.homes,0);
});
test('resume reconciles a batch already in inventory after interrupted persistence',()=>{
 const h=setup();h.failSave(true);assert.throws(()=>h.app.bulkEntry.accept(h.item(),2,[]));
 h.failSave(false);h.app.bulkEntry.testAdvance();assert.equal(h.homes,1);assert.equal(h.state.inventory.items.length,2);
 assert.ok(h.app.bulkEntry.testRows().every(row=>row.status==='saved'));
});

test('bulk copies retain different colors and descriptions in one save',()=>{
 const h=setup(2);
 h.app.bulkEntry.accept(h.item(),2,[{color:'Black',notes:'Travel'},{color:'Blue',notes:'Desk'}]);
 assert.deepEqual(h.state.inventory.items.map(item=>item.properties.find(p=>p.name==='Color').value),['Black','Blue']);
 assert.deepEqual(h.state.inventory.items.map(item=>item.description),['Travel','Desk']);
 assert.equal(h.writes,1);assert.equal(h.homes,1);
});
