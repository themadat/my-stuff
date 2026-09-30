import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const context=vm.createContext({window:{LocalApp:{}},crypto:globalThis.crypto});
for (const file of ['config','core/utils','core/inventory','core/state']) vm.runInContext(readFileSync(new URL('../assets/js/'+file+'.js',import.meta.url),'utf8'),context);
const app=context.window.LocalApp,m=app.inventoryModel;
const item={id:'ball',name:'Volleyball',owner:'me'};
const list={objects:['ball','missing','ball'],entries:[{id:'water',text:' Water <b> '}],checked:['object:ball','text:water','object:missing','text:missing','object:ball']};
const data={currency:'USD',items:[item],checklists:{volleyball:list}};
test('checklists preserve text, object membership and completion across normalization',()=>{
 const saved=m.normalize(data);
 assert.deepEqual(JSON.parse(JSON.stringify(saved.checklists.volleyball)),{objects:['ball'],entries:[{id:'water',text:'Water <b>'}],checked:['object:ball','text:water']});
 assert.equal(JSON.stringify(m.normalize(saved)),JSON.stringify(saved));
 assert.equal(saved.checklists.golf.entries.length,0);
});
test('deleting objects removes stale membership and completion while preserving text',()=>{
 const saved=m.normalize({...data,items:[]});assert.equal(saved.checklists.volleyball.objects.length,0);assert.deepEqual(Array.from(saved.checklists.volleyball.checked),['text:water']);
});
test('malformed checklist entries and duplicate text IDs are rejected',()=>{
 assert.throws(()=>m.normalize({...data,checklists:{volleyball:{...list,entries:[{id:'x',text:''}]}}}),/Invalid checklist/);
 assert.throws(()=>m.normalize({...data,checklists:{volleyball:{...list,entries:[{id:'x',text:'A'},{id:'x',text:'B'}]}}}),/Duplicate checklist/);
});
test('sync merging preserves checklists and requires a choice for conflicting lists',()=>{
 const local=m.normalize(data),empty=m.normalize({currency:'USD',items:[]});
 assert.equal(JSON.stringify(m.merge(local,empty).checklists),JSON.stringify(local.checklists));
 assert.equal(JSON.stringify(m.merge(local,local).checklists),JSON.stringify(local.checklists));
 const remote=m.normalize({...data,checklists:{volleyball:{...list,checked:[]}}});
 assert.throws(()=>m.merge(local,remote),/Checklists differ/);
});
test('backups and cloud payloads retain checklist membership, text and checks',()=>{
 const state=app.stateModel.normalize({inventory:data,ui:{supportTab:'checklists'}});
 assert.equal(state.ui.supportTab,'checklists');
 const backup=app.stateModel.exportEnvelope(state);
 assert.equal(JSON.stringify(app.stateModel.prepare(backup).state.inventory.checklists),JSON.stringify(state.inventory.checklists));
 const payload=app.stateModel.syncPayload(state);
 assert.equal(JSON.stringify(app.stateModel.prepareSync(payload).state.inventory.checklists),JSON.stringify(state.inventory.checklists));
});
