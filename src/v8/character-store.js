import {PERSONALITIES} from './styles.js';
const KEY='ocworld.v8.characters';
const ACTIVE='ocworld.v8.active';
const now=()=>new Date().toISOString();
const uuid=()=>globalThis.crypto.randomUUID();
const clean=(s,max=800)=>String(s||'').trim().slice(0,max);
const parse=(v,f)=>{try{return JSON.parse(v)||f}catch{return f}};
export function safeAvatar(v){return !v||(/^assets\/[a-zA-Z0-9_./-]+$/.test(v)&&!v.includes('..'))||/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(v)||/^https:\/\//.test(v);}
export function greeting(c){const p=PERSONALITIES.find(p=>p.id===c.personality)||PERSONALITIES[0];return `我是${c.name}。${p.greeting}`;}
function normalize(input,id=uuid()){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('OC 文件格式不正確');
 if(!safeAvatar(input.avatar)||String(input.avatar||'').length>1800000)throw new Error('OC 圖片格式不正確或過大');
 return {characterId:id,name:clean(input.name,40)||'未命名 OC',concept:clean(input.concept||input.prompt),personality:clean(input.personality,60)||'curious',appearance:clean(input.appearance),artDirection:input.artDirection==='aokizy'?'aokizy':'sevnzel',style:clean(input.style||input.artStyle,40)||'anime',sprite:clean(input.sprite,40)||'red_normal',avatar:input.avatar||'assets/zealwish-main-character.webp',avatarFrame:Number.isInteger(input.avatarFrame)&&input.avatarFrame>=0&&input.avatarFrame<8&&input.avatar==='assets/ocworld/inspiration-atlas.png'?input.avatarFrame:null,imageSource:clean(input.imageSource,30)||'preset',createdAt:input.createdAt||now(),updatedAt:now(),memories:[],messages:[],moments:[],worldProgress:null,lore:clean(input.lore,4000),generatedPrompt:clean(input.generatedPrompt,4500),promptVersion:clean(input.promptVersion,60)||(input.artDirection==='aokizy'?'ocworld-aokizy-v1':'ocworld-sevnzel-instagram-v2'),conceptFormat:['fullbody','portrait','sheet'].includes(input.conceptFormat)?input.conceptFormat:'fullbody'};
}
function safeEntries(a,max,kind){return (Array.isArray(a)?a:[]).filter(x=>x&&typeof x.text==='string'&&x.text.trim()).slice(-max).map(x=>({id:clean(x.id,100)||uuid(),text:clean(x.text,kind==='message'?8000:2000),at:typeof x.at==='number'?new Date(x.at).toISOString():clean(x.at,60)||now(),...(kind==='message'?{role:x.role==='user'?'user':'assistant',source:clean(x.source,40)||'imported'}:{source:clean(x.source,40)||'user'})}));}
export function createRepository(storage){
 let records=parse(storage.getItem(KEY),[]);if(!Array.isArray(records))records=[];
 records=records.filter(c=>c&&typeof c.characterId==='string'&&c.name&&safeAvatar(c.avatar));
 const persist=()=>{try{storage.setItem(KEY,JSON.stringify(records))}catch{throw new Error('瀏覽器存儲空間不足，請導出備份或減少圖片大小。')}};
 if(!storage.getItem(KEY)){
  const old=parse(storage.getItem('zealwish.web.passport'),null);
  if(old?.name){const c=normalize(old);const vault=parse(storage.getItem('zealwish.web.vault'),{});c.memories=safeEntries(vault.facts,200,'memory');c.messages=safeEntries(parse(storage.getItem('zealwish.web.chatlog'),[]),160,'message');records=[c];storage.setItem(ACTIVE,c.characterId);}persist();
 }
 const reload=()=>{const latest=parse(storage.getItem(KEY),[]);if(Array.isArray(latest))records=latest.filter(c=>c&&typeof c.characterId==='string'&&c.name&&safeAvatar(c.avatar));};
 const find=id=>{reload();const c=records.find(c=>c.characterId===id);if(!c)throw new Error('找不到這個 OC');return c};
 const syncWorld=id=>{const saved=parse(storage.getItem('ocworld.living.character.v1:'+encodeURIComponent(id)),null);const journal=parse(storage.getItem('ocworld.living.moments.v1:'+encodeURIComponent(id)),[]);const c=find(id);let changed=false;if(saved?.id===id&&JSON.stringify(saved).length<100000){if(JSON.stringify(c.worldProgress)!==JSON.stringify(saved)){c.worldProgress=saved;changed=true;}}const known=new Set(c.moments.map(m=>m.id));const extra=safeEntries(journal,100,'memory').filter(m=>!known.has(m.id));if(extra.length){c.moments=[...c.moments,...extra].slice(-100);changed=true;}if(changed)persist();return c;};
 const mutate=(id,fn)=>{reload();const old=records;records=records.map(c=>c.characterId===id?fn({...c}):c);try{persist()}catch(e){records=old;throw e}return find(id)};
 return {
 list:()=>{reload();return records.map(c=>({...c}))},get:id=>find(id),active:()=>{reload();return records.find(c=>c.characterId===storage.getItem(ACTIVE))||records[0]||null},
 select(id){find(id);storage.setItem(ACTIVE,id)},
 create(input){reload();if(records.length>=12)throw new Error('當前可保存 12 個 OC，請先導出不常用的 OC。');const c=normalize(input);c.messages=[{id:uuid(),role:'assistant',text:greeting(c),source:'greeting',at:now()}];records=[...records,c];try{persist()}catch(e){records=records.filter(x=>x!==c);throw e}storage.setItem(ACTIVE,c.characterId);return c},
 update(id,patch){const original=find(id);const n=normalize({...original,...patch},id);return mutate(id,c=>({...c,...n,createdAt:c.createdAt,messages:c.messages,memories:c.memories,moments:c.moments,worldProgress:c.worldProgress}))},
 addMessage(id,m){return mutate(id,c=>({...c,messages:[...c.messages,...safeEntries([m],1,'message')].slice(-160)}))},
 addMemory(id,m){return mutate(id,c=>({...c,memories:[...c.memories,...safeEntries([m],1,'memory')].slice(-200)}))},
 editMemory(id,mid,text){return mutate(id,c=>({...c,memories:c.memories.map(m=>m.id===mid?{...m,text:clean(text,2000)}:m).filter(m=>m.text)}))},
 forget(id,mid){const next=mutate(id,c=>({...c,memories:c.memories.filter(m=>m.id!==mid),moments:c.moments.filter(m=>m.id!==mid)}));const k='ocworld.living.moments.v1:'+encodeURIComponent(id);const journal=parse(storage.getItem(k),[]);if(Array.isArray(journal))storage.setItem(k,JSON.stringify(journal.filter(m=>m.id!==mid)));return next},
 addMoment(id,m){if(find(id).moments.some(x=>x.id===m.id))return find(id);return mutate(id,c=>({...c,moments:[...c.moments,...safeEntries([{...m,source:'world'}],1,'memory')].slice(-100)}))},
 setProgress(id,progress){if(!progress||progress.id!==id||JSON.stringify(progress).length>100000)throw new Error('世界存檔身份不匹配');return mutate(id,c=>({...c,worldProgress:progress}))},
 syncWorld,
 exportCharacter(id){syncWorld(id);return {format:'ocworld-character',version:8,exportedAt:now(),character:find(id)}},
 importCharacter(payload){reload();const data=payload?.character||payload;if(!data?.name)throw new Error('文件缺少 OC 名字');const id=typeof data.characterId==='string'&&/^[a-zA-Z0-9_-]{6,100}$/.test(data.characterId)?data.characterId:uuid();if(records.some(c=>c.characterId===id))throw new Error('此 OC 已存在，避免覆蓋存檔，請先選擇現有 OC。');if(records.length>=12)throw new Error('最多保存 12 個 OC');const c=normalize(data,id);c.messages=safeEntries(data.messages,160,'message');c.memories=safeEntries(data.memories,200,'memory');c.moments=safeEntries(data.moments,100,'memory');if(data.worldProgress?.id===id&&JSON.stringify(data.worldProgress).length<100000)c.worldProgress=data.worldProgress;records=[...records,c];persist();storage.setItem(ACTIVE,id);return c},
 cardV2(id){const c=find(id);return {spec:'chara_card_v2',spec_version:'2.0',data:{name:c.name,description:c.concept,personality:PERSONALITIES.find(p=>p.id===c.personality)?.voice||c.personality,scenario:c.lore||'OCWORLD：一個與原創 OC 相遇的像素小鎮。',first_mes:greeting(c),mes_example:'',creator_notes:'Exported by OCWORLD',system_prompt:'',post_history_instructions:'',alternate_greetings:[],tags:['OCWORLD'],creator:'OCWORLD',character_version:'8',extensions:{ocworld:{characterId:c.characterId,appearance:c.appearance,style:c.style,artDirection:c.artDirection}}}}}
 };
}
export function recall(c,text){const q=String(text).toLowerCase();const scored=[...c.memories,...c.moments].map(m=>({m,s:[...new Set(m.text.toLowerCase().match(/[a-z]{3,}|[\u3400-\u9fff]{2}/g)||[])].filter(w=>q.includes(w)).length})).sort((a,b)=>b.s-a.s);return (scored.some(x=>x.s>0)?scored.filter(x=>x.s>0):scored.slice(-4)).slice(0,6).map(x=>x.m);}
export function buildSystem(c,text){return [`你是原創 OC${c.name}，不是產品客服。用繁體中文自然回應用戶，保持 OC 性格，但不聲稱現實能力。`,`OC 設定：${c.concept}`,`性格：${PERSONALITIES.find(p=>p.id===c.personality)?.voice||c.personality}`,`固定外觀：${c.appearance}`,`世界設定：${String(c.lore||'原創 OC 在 OCWORLD 小鎮相遇。').slice(0,1800)}`,`已記錄事實（不能編造）：${recall(c,text).map(m=>m.text.slice(0,300)).join('；')||'暫無'}`,`回答簡潔，有具體內容。沒有記錄的事情坦誠說明不知道。`].join('\n');}

export function budgetMessages(messages,max=20000){let used=0;const out=[];for(const m of [...messages].reverse()){const content=String(m.text||m.content||'').slice(0,8000);if(!content||!['user','assistant'].includes(m.role))continue;if(used+content.length>max)break;out.unshift({role:m.role,content});used+=content.length;if(out.length>=24)break;}return out;}
