import { useState, useEffect } from 'react';
import { useLiving } from '../store/useLiving';
import type { Archetype } from '../sim/types';
import ZealwishTopbar from './ZealwishTopbar';
import PersonalSpace from './PersonalSpace';
import WorldView from './WorldView';

// ?embed=1:被 ZEALWISH 工作台 World 模块 iframe 内嵌(隐藏自身顶栏,导航交给外壳)。
// ?visit=1:访客观光模式(只读串门,无需登录)——同样直接进世界、自动建世界、隐藏顶栏。
const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const EMBED = params?.get('embed') === '1';
const VISIT = params?.get('visit') === '1';
const WORLD_ONLY = EMBED || VISIT;

// ── 工作台「创建角色 → 化为像素小人 → 进入世界」交接 ──
// 工作台 CreateView 把所选人设写进共享 localStorage(同源),并以 ?spawn=<ts> 加载本 iframe;
// 当前意图先于最后使用的角色恢复;重复进入按 characterId 幂等更新。
const SPAWN_KEY = 'zealwish.world.spawn.v1';
const SPAWN_SPRITES = ['red_normal', 'green_normal', 'boy', 'lass', 'youngster', 'beauty', 'gentleman', 'fat_man'];
const SPAWN_ARCHES = ['creator', 'trader', 'helper', 'worker', 'socialite', 'gambler', 'saver'];
type SpawnIntent = { characterId?: string; name?: string; bio?: string; arche?: string; sprite?: string; ts?: number };
function readSpawn(): SpawnIntent | null { try { const s = localStorage.getItem(SPAWN_KEY); return s ? (JSON.parse(s) as SpawnIntent) : null; } catch { return null; } }

export default function App() {
  useLiving((s) => s.version);
  const oc = useLiving.getState().oc;
  const create = useLiving((s) => s.create);
  const load = useLiving((s) => s.load);
  const view = useLiving((s) => s.view);
  const setView = useLiving((s) => s.setView);
  const [name, setName] = useState('小智');
  useEffect(() => {
    if (WORLD_ONLY) {
      document.documentElement.classList.add('oc-embed');
      const spawnTs = params?.get('spawn');
      const intent = readSpawn();
      if (!VISIT && spawnTs && intent && String(intent.ts) === spawnTs) {
        // 按稳定身份恢复完整养成进度,仅更新工作台提交的显示资料。
        const sprite = intent.sprite && SPAWN_SPRITES.includes(intent.sprite) ? intent.sprite : 'red_normal';
        const arche = (intent.arche && SPAWN_ARCHES.includes(intent.arche) ? intent.arche : 'creator') as Archetype;
        const nm = (intent.name || '小智').toString().trim().slice(0, 80) || '小智';
        const bio = (intent.bio || '').toString().trim().slice(0, 2000) || '一个待沉淀的灵魂,在海边自由生活';
        create({ characterId: typeof intent.characterId === "string" && intent.characterId.length <= 128 ? intent.characterId : undefined, name: nm, handle: '@' + nm, bio, arche, sprite });

      } else {
        load();
        if (!useLiving.getState().oc) {
          create({ name: '小智', handle: '@xiaozhi', bio: '一个待沉淀的灵魂,在海边自由生活', arche: 'creator', sprite: 'red_normal' });
        }
      }
      setView('world');
    } else load();
  }, []);

  // 嵌入态 / 访客观光态:只渲染世界本身,顶栏/导航由外壳或观光 HUD 提供
  if (WORLD_ONLY) return oc ? <WorldView /> : null;

  if (!oc) {
    return (
      <>
        <ZealwishTopbar view={view} setView={setView} />
        <div className="app create">
          <div className="create-kicker">CREATE · GROW · OWN YOUR AI CHARACTER</div>
          <h1>OCWORLD <span>by ZEALWISH</span></h1>
          <p>创建一个属于你的 OC——它有自己的身份与钱包,会自己过日子,你看着它成长。</p>
          <div className="create-row">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="给它起个名字" />
            <button className="btn primary" onClick={() => create({ name, handle: '@' + name, bio: '一个待沉淀的灵魂', arche: 'creator' })}>诞生 ✦</button>
          </div>
          <div className="create-tag">A companion becomes real when it <b>lives</b>.</div>
        </div>
      </>
    );
  }
  return (
    <>
      <ZealwishTopbar view={view} setView={setView} />
      {view === 'room' ? <PersonalSpace /> : <WorldView />}
    </>
  );
}
