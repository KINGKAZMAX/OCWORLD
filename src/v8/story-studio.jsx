import {INSPIRATIONS} from './inspirations.js';
import {CharacterArt} from './art.jsx';
import {getLocale} from './i18n.js';

const {useState,useEffect,useRef}=React;
const L=(zh,en)=>getLocale()==='en'?en:zh;
const SEEDS=[
  {id:'harbor',name:'海邊小屋',en:'Seaside cottage',tone:'夕陽與慢生活',enTone:'Sunset and slow living',color:'#eebf82'},
  {id:'night',name:'夜間動物園',en:'Night safari',tone:'微光與好奇',enTone:'Wonder after dark',color:'#6587aa'},
  {id:'market',name:'小販中心',en:'Hawker centre',tone:'煙火氣與相遇',enTone:'Food and chance meetings',color:'#c78f67'},
  {id:'isles',name:'群島淺灘',en:'Shoal isles',tone:'潮汐與冒險',enTone:'Tides and adventure',color:'#77b9b7'},
];
const BEATS=[
  {id:'arrival',name:'抵達',en:'Arrival',camera:'遠景',enCamera:'Wide shot'},
  {id:'encounter',name:'相遇',en:'Encounter',camera:'雙人中景',enCamera:'Two shot'},
  {id:'choice',name:'選擇',en:'Choice',camera:'特寫',enCamera:'Close up'},
  {id:'afterglow',name:'餘韻',en:'Afterglow',camera:'背影遠景',enCamera:'Closing wide'},
];
const key=id=>`ocworld.story-demo.v1:${id}`;
function draftFor(oc,place,idea,partner){
  const subject=(idea||'一次意外的相遇').trim().slice(0,180);
  const scene=SEEDS.find(x=>x.id===place)||SEEDS[0];
  return BEATS.map((beat,i)=>({id:beat.id,title:beat.name,camera:beat.camera,duration:4,
    action:[`${oc.name}來到${scene.name}，帶著「${subject}」的念頭觀察四周。`,
      `${partner.name}出現。${oc.name}的性格與「${subject}」讓這次相遇有了方向。`,
      `${oc.name}需要作出一個小決定；畫面停在表情與手部動作。`,
      `故事暫時落幕，${scene.name}仍在生活。留下可延續的記憶線索。`][i],
    dialogue:[`「今天，好像會有新故事。」`,`${partner.name}：「你也在這裡？」`,`「我想試試看。」`,`「下次再見。」`][i]}));
}
function readDraft(id){try{const value=JSON.parse(localStorage.getItem(key(id))||'null');return value&&Array.isArray(value.shots)?value:null}catch{return null}}
function downloadStoryboard(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`OCWORLD-${data.ocName}-storyboard.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

export function StoryStudio({characters,c,openCreate,openWorld}){
  const cast=characters.length?characters:INSPIRATIONS.filter(x=>x.id==='xiaozhi');
  const [ocId,setOcId]=useState(c?.characterId||cast[0]?.characterId||cast[0]?.id);
  const oc=cast.find(x=>(x.characterId||x.id)===ocId)||cast[0];
  const partners=[...characters,...INSPIRATIONS.filter(x=>x.collection!=='thirty').slice(0,5)].filter(x=>(x.characterId||x.id)!==ocId&&x.name!==oc.name);
  const saved=readDraft(ocId);
  const [readyId,setReadyId]=useState(ocId);
  const [partnerId,setPartnerId]=useState(saved?.partnerId||partners[0]?.characterId||partners[0]?.id);
  const partner=partners.find(x=>(x.characterId||x.id)===partnerId)||partners[0]||oc;
  const [place,setPlace]=useState(saved?.place||'harbor');
  const [idea,setIdea]=useState(saved?.idea||'兩位 OC 在世界裡偶然相遇');
  const [shots,setShots]=useState(saved?.shots||draftFor(oc,place,idea,partner));
  const [active,setActive]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [notice,setNotice]=useState('');
  const timer=useRef(null);
  useEffect(()=>{const next=readDraft(ocId);const first=partners[0];const savedPartner=partners.find(x=>(x.characterId||x.id)===next?.partnerId);const nextPartner=savedPartner||first||oc;const nextPlace=next?.place||'harbor';const nextIdea=next?.idea||'兩位 OC 在世界裡偶然相遇';setPartnerId(nextPartner.characterId||nextPartner.id);setPlace(nextPlace);setIdea(nextIdea);setShots(savedPartner&&next?.shots||draftFor(oc,nextPlace,nextIdea,nextPartner));setActive(0);setPlaying(false);setReadyId(ocId)},[ocId]);
  useEffect(()=>{if(!playing)return;timer.current=setTimeout(()=>{if(active>=shots.length-1){setPlaying(false);setActive(0)}else setActive(active+1)},(shots[active]?.duration||4)*1000);return()=>clearTimeout(timer.current)},[playing,active,shots]);
  useEffect(()=>{if(!ocId||readyId!==ocId)return;try{localStorage.setItem(key(ocId),JSON.stringify({version:1,ocId,ocName:oc.name,partnerId,place,idea,shots,updatedAt:new Date().toISOString()}))}catch{}},[readyId,ocId,partnerId,place,idea,shots]);
  const scene=SEEDS.find(x=>x.id===place)||SEEDS[0];
  const shot=shots[active]||shots[0];
  const revise=(field,value)=>setShots(prev=>prev.map((s,i)=>i===active?{...s,[field]:value}:s));
  const regenerate=()=>{setShots(draftFor(oc,place,idea,partner));setActive(0);setPlaying(false);setNotice(L('已依照目前設定重新排出分鏡。','Storyboard rebuilt from the current brief.'))};
  const addShot=()=>{setShots(prev=>[...prev,{id:`shot-${Date.now()}`,title:'新鏡頭',camera:'中景',duration:4,action:`${oc.name}在${scene.name}繼續探索。`,dialogue:'「故事還沒結束。」'}]);setActive(shots.length)};
  const removeShot=()=>{if(shots.length<=1)return;setShots(prev=>prev.filter((_,i)=>i!==active));setActive(Math.max(0,active-1));setPlaying(false)};
  return <div className="story-studio">
    <header className="page-heading"><span className="eyebrow">07 / OCWORLD STORY STUDIO</span><h1>{L('讓 OC 的日常成為故事。','Turn everyday life into a story.')}</h1><p>{L('選定同一位 OC、世界場景與故事種子，編排可修改的分鏡，再播放動態預覽。','Lock an OC and setting, shape an editable storyboard, then play a motion preview.')}</p></header>
    <div className="story-workflow" aria-label={L('創作流程','Creation workflow')}><span>01 {L('固定 OC','LOCK OC')}</span><span>02 {L('故事簡報','BRIEF')}</span><span>03 {L('分鏡剪輯','STORYBOARD')}</span><span>04 {L('動態預覽','PREVIEW')}</span></div>
    <div className="story-layout"><section className="story-brief"><span className="eyebrow">DIRECTOR'S DESK</span><h2>{L('故事簡報','Story brief')}</h2><label htmlFor="story-oc">{L('主角 OC','Lead OC')}</label><select id="story-oc" value={ocId} onChange={e=>setOcId(e.target.value)}>{cast.map(x=><option key={x.characterId||x.id} value={x.characterId||x.id}>{x.name}</option>)}</select><div className="story-identity"><CharacterArt c={oc}/><div><strong>{oc.name}</strong><small>{oc.concept}</small><span>{L('形象與身份在所有鏡頭保持一致','One identity across every shot')}</span></div></div><label htmlFor="story-partner">{L('相遇的 OC','Second OC')}</label><select id="story-partner" value={partnerId} onChange={e=>setPartnerId(e.target.value)}>{partners.map(x=><option key={x.characterId||x.id} value={x.characterId||x.id}>{x.name}</option>)}</select><label htmlFor="story-place">{L('世界場景','World setting')}</label><select id="story-place" value={place} onChange={e=>setPlace(e.target.value)}>{SEEDS.map(x=><option value={x.id} key={x.id}>{L(x.name,x.en)}</option>)}</select><label htmlFor="story-idea">{L('這一集發生什麼？','What happens in this episode?')}</label><textarea id="story-idea" value={idea} onChange={e=>setIdea(e.target.value)} maxLength={180} rows={4}/>{c?.moments?.length>0&&<button className="quiet" onClick={()=>setIdea(c.moments[c.moments.length-1].text.slice(0,180))}>{L('帶入最近的世界經歷 ↗','Use latest world moment ↗')}</button>}<button className="primary" onClick={regenerate}>{L('生成示範分鏡 ↗','Build demo storyboard ↗')}</button><p className="story-note">{L('前端互動 demo：分鏡文字由本地模板編排，可直接修改；尚未生成 AI 影片。','Interactive front-end demo: editable local storyboard, without AI video rendering.')}</p>{!characters.length&&<button className="quiet" onClick={openCreate}>{L('創建自己的 OC →','Create your OC →')}</button>}</section>
    <section className="story-main"><div className={`story-stage ${playing?'playing':''}`} style={{'--scene-accent':scene.color}}><div className="story-stage-top"><span>OCWORLD / {L(scene.name,scene.en)}</span><span>SHOT {String(active+1).padStart(2,'0')} / {String(shots.length).padStart(2,'0')}</span></div><div className="story-stage-art"><div className="story-orbit orbit-one"/><div className="story-orbit orbit-two"/><div className="story-actors"><CharacterArt c={oc}/><CharacterArt c={partner}/></div><span className="story-stage-word">{L(scene.name,scene.en)}</span></div><div className="story-stage-caption"><span>{L(shot?.camera,BEATS.find(x=>x.id===shot?.id)?.enCamera||shot?.camera)} · {shot?.duration}s</span><strong>{shot?.dialogue}</strong></div></div><div className="story-controls"><button className="secondary" onClick={()=>{setPlaying(false);setActive(Math.max(0,active-1))}} disabled={active===0}>← {L('上一鏡','Previous')}</button><button className="primary" onClick={()=>setPlaying(x=>!x)}>{playing?L('暫停預覽','Pause preview'):L('播放預覽 ▶','Play preview ▶')}</button><button className="secondary" onClick={()=>{setPlaying(false);setActive(Math.min(shots.length-1,active+1))}} disabled={active===shots.length-1}>{L('下一鏡','Next')} →</button></div><div className="story-timeline">{shots.map((s,i)=><button key={s.id} className={i===active?'selected':''} onClick={()=>{setPlaying(false);setActive(i)}} aria-label={`${L('鏡頭','Shot')} ${i+1}: ${s.title}`}><span>{String(i+1).padStart(2,'0')}</span><b>{s.title}</b><small>{s.duration}s</small></button>)}</div><div className="story-editor"><div><span className="eyebrow">SHOT {String(active+1).padStart(2,'0')} / EDIT</span><button className="quiet" onClick={addShot}>＋ {L('加一鏡','Add shot')}</button>{shots.length>1&&<button className="quiet" onClick={removeShot}>{L('刪除此鏡','Remove shot')}</button>}</div><label>{L('鏡頭名稱','Shot title')}<input value={shot?.title||''} onChange={e=>revise('title',e.target.value)} maxLength={30}/></label><label>{L('畫面與動作','Action')}<textarea value={shot?.action||''} onChange={e=>revise('action',e.target.value)} rows={3} maxLength={300}/></label><label>{L('對白','Dialogue')}<input value={shot?.dialogue||''} onChange={e=>revise('dialogue',e.target.value)} maxLength={120}/></label><label>{L('鏡頭秒數','Shot length')}<input type="range" min="2" max="10" value={shot?.duration||4} onChange={e=>revise('duration',Number(e.target.value))}/><small>{shot?.duration}s</small></label></div><div className="story-export"><button className="secondary" onClick={()=>downloadStoryboard({version:1,ocId,ocName:oc.name,partnerId,partnerName:partner.name,identity:{concept:oc.concept,appearance:oc.appearance,style:oc.style},place,idea,shots})}>{L('導出分鏡 JSON ↓','Export storyboard JSON ↓')}</button><button className="quiet" onClick={openWorld}>{L('進入活世界 ↗','Enter living world ↗')}</button><span>{L('草稿自動保存在此瀏覽器','Draft saved in this browser')}</span></div>{notice&&<p className="story-feedback" role="status">{notice}</p>}</section></div>
  </div>;
}
