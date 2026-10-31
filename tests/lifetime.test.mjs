import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const context = vm.createContext({window:{LocalApp:{}},crypto:globalThis.crypto});
for (const file of ['config','core/utils','core/inventory','core/state']) vm.runInContext(readFileSync(new URL('../assets/js/'+file+'.js',import.meta.url),'utf8'),context);
const m = context.window.LocalApp.stateModel;
const purchase = {id:'filament',name:'PLA <blue>',amount:24.95,kind:'consumable',date:'2026-10-30',seller:'Shop',notes:'1 kg'};
const lifetime = {categories:[{id:'printer',name:'3D Printer',purchases:[purchase]}]};
const state = () => m.normalize({lifetime,notes:{text:'Keep my notes'},ui:{supportTab:'lifetime'}});
const plain = value => JSON.parse(JSON.stringify(value));
test('Lifetime retains consumables outside inventory through normalization, backups, preferences reset and sync',()=>{
 const saved=state();
 assert.equal(saved.inventory.items.length,0); assert.equal(saved.ui.supportTab,'lifetime');
 for(const restored of [m.normalize(saved),m.prepare(m.exportEnvelope(saved)).state,m.resetPreferences(saved),m.prepareSync(m.syncPayload(saved)).state]) assert.deepEqual(plain(restored.lifetime),lifetime);
 assert.equal(m.syncPayload(saved).schemaVersion,9);
 const changed=state(); changed.lifetime.categories[0].purchases[0].amount=30;
 assert.notEqual(m.syncHash(changed),m.syncHash(saved));
});
test('older cloud copies preserve local Lifetime records; current cloud replacement can clear them',()=>{
 const local=state(), old=m.prepareSync({syncFormat:'local-first-app-data',syncVersion:1,schemaVersion:7,data:{inventory:{currency:'USD',items:[]},favoriteBrands:[]}}).state;
 assert.deepEqual(plain(m.applySync(local,old).lifetime),lifetime);
 assert.deepEqual(plain(m.merge(local,old).lifetime),lifetime);
 const empty=m.prepareSync(m.syncPayload(m.normalize({}))).state;
 assert.equal(m.applySync(local,empty).lifetime.categories.length,0);
 assert.throws(()=>m.prepareSync({...m.syncPayload(local),schemaVersion:8}),/unsupported content/);
});
test('Lifetime merges independent categories and refuses conflicting purchase edits',()=>{
 const local=state(), remote=state(); remote.lifetime.categories[0].purchases[0].amount=50;
 assert.equal(m.canMerge(local,remote),false); assert.throws(()=>m.merge(local,remote),/Lifetime purchases differ/);
 remote.lifetime.categories[0].id='bike'; remote.lifetime.categories[0].name='Bike';
 assert.equal(m.merge(local,remote).lifetime.categories.length,2);
 assert.deepEqual(plain(m.merge(local,local).lifetime),lifetime);
});
test('invalid Lifetime amounts, dates, types and duplicate IDs cannot replace saved records',()=>{
 for(const invalid of [{amount:-1},{amount:'2'},{amount:Infinity},{date:'2026-02-30'},{kind:'invented'},{name:' '},{id:'  duplicate'}]) {
  const next=structuredClone(lifetime); Object.assign(next.categories[0].purchases[0],invalid); assert.throws(()=>m.normalize({lifetime:next}),/Lifetime/);
 }
 const duplicate=structuredClone(lifetime); duplicate.categories[0].purchases.push(purchase); assert.throws(()=>m.normalize({lifetime:duplicate}),/Lifetime/);
 assert.throws(()=>m.normalize({lifetime:{categories:[...lifetime.categories,...lifetime.categories]}}),/Lifetime/);
 assert.deepEqual(plain(state().lifetime),lifetime);
});
