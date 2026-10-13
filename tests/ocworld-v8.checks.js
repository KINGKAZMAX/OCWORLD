import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const path='../frontend-v4/src/v8/character-store.js';
let store;
try {store=await import(path)} catch {store={}}
class MemoryStorage { data=new Map();getItem(k){return this.data.get(k)||null}setItem(k,v){this.data.set(k,v)} }
test('rename preserves characterId, messages and memories',()=>{
 assert.equal(typeof store.createRepository,'function');const r=store.createRepository(new MemoryStorage());const a=r.create({name:'星遥',concept:'旅行者',personality:'curious'});r.addMessage(a.characterId,{role:'user',text:'喜欢红茶'});r.addMemory(a.characterId,{text:'喜欢红茶'});r.update(a.characterId,{name:'小遥',characterId:'changed'});const b=r.get(a.characterId);assert.equal(b.characterId,a.characterId);assert.equal(b.name,'小遥');assert.equal(b.messages.filter(m=>m.role==='user').length,1);assert.equal(b.memories.length,1);
});
test('two characters retain isolated histories after reload',()=>{
 assert.equal(typeof store.createRepository,'function');const storage=new MemoryStorage();const r=store.createRepository(storage);const a=r.create({name:'A'}),b=r.create({name:'B'});r.addMemory(a.characterId,{text:'A秘密'});r.addMessage(b.characterId,{role:'user',text:'B秘密'});const reload=store.createRepository(storage);assert.equal(reload.get(b.characterId).memories.length,0);assert.equal(reload.get(a.characterId).messages.filter(m=>m.role==='user').length,0);assert.equal(reload.get(a.characterId).memories[0].text,'A秘密');
});
test('portable import rejects invalid images and keeps valid character identity',()=>{
 assert.equal(typeof store.createRepository,'function');const r=store.createRepository(new MemoryStorage());assert.throws(()=>r.importCharacter({name:'bad',avatar:'javascript:alert(1)'}));const a=r.create({name:'Echo'});const exported=r.exportCharacter(a.characterId);const imported=store.createRepository(new MemoryStorage()).importCharacter(exported);assert.equal(imported.characterId,a.characterId);
});
test('legacy passport and vault migrate once without losing facts',()=>{
 assert.equal(typeof store.createRepository,'function');const storage=new MemoryStorage();storage.setItem('zealwish.web.passport',JSON.stringify({id:'ZEALWISH-0001',name:'旧角色',prompt:'观察者'}));storage.setItem('zealwish.web.vault',JSON.stringify({facts:[{text:'喜欢猫'}]}));const r=store.createRepository(storage);assert.equal(r.list().length,1);assert.equal(r.list()[0].memories[0].text,'喜欢猫');assert.equal(store.createRepository(storage).list().length,1);
});
test('style prompts include clean concept background and consistent identity anchors',async()=>{
 let styles;try{styles=await import('../frontend-v4/src/v8/styles.js')}catch{styles={}}assert.equal(typeof styles.buildConceptPrompt,'function');const p=styles.buildConceptPrompt({name:'星遥',concept:'星际信使',appearance:'银发、红夹克',style:'guofeng'});assert.match(p,/transparent background.*alpha channel/i);assert.match(p,/no.*watermark/i);assert.match(p,/银发、红夹克/);assert.match(p,/星际信使/);assert.ok(styles.OC_STYLES.length>=8);
});
test('fullscreen world progress and moments join portable export, forgetting remains deleted',()=>{
 const storage=new MemoryStorage(),r=store.createRepository(storage),c=r.create({name:'星遥'});storage.setItem('ocworld.living.character.v1:'+c.characterId,JSON.stringify({id:c.characterId,name:'星遥',bag:{stone:2}}));storage.setItem('ocworld.living.moments.v1:'+c.characterId,JSON.stringify([{id:'moment-1',text:'和朋友约饭',at:1791919938981}]));const portable=r.exportCharacter(c.characterId);assert.equal(portable.character.worldProgress.bag.stone,2);assert.equal(portable.character.moments[0].text,'和朋友约饭');assert.match(portable.character.moments[0].at,/^2026-/);r.forget(c.characterId,'moment-1');assert.equal(r.exportCharacter(c.characterId).character.moments.length,0);
});
test('two tabs cannot revert a rename while synchronizing world progress',()=>{
 const storage=new MemoryStorage(),a=store.createRepository(storage),c=a.create({name:'A'});const b=store.createRepository(storage);storage.setItem('ocworld.living.character.v1:'+c.characterId,JSON.stringify({id:c.characterId,name:'A'}));a.update(c.characterId,{name:'New'});b.syncWorld(c.characterId);assert.equal(store.createRepository(storage).get(c.characterId).name,'New');
});
test('valid long lore and memories remain within chat request budgets',()=>{
 const r=store.createRepository(new MemoryStorage()),c=r.create({name:'A',lore:'世'.repeat(4000)});for(let i=0;i<6;i++)r.addMemory(c.characterId,{text:'记'.repeat(2000)});assert.ok(store.buildSystem(r.get(c.characterId),'你好').length<=6500);assert.equal(typeof store.budgetMessages,'function');const m=store.budgetMessages(Array.from({length:20},(_,i)=>({role:i%2?'assistant':'user',text:'x'.repeat(8000)})));assert.ok(m.reduce((n,x)=>n+x.content.length,0)<=24000);assert.ok(m.length<=24);
});
