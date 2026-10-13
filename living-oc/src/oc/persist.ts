import type { OC } from './oc';

const KEY = 'zealwish.living-oc.v1';

export function serializeOc(oc: OC): string { return JSON.stringify(oc); }
export function deserializeOc(json: string): OC { return JSON.parse(json) as OC; }
const ACTIVE = 'ocworld.living.active.v1';
const characterKey = (id: string) => 'ocworld.living.character.v1:' + encodeURIComponent(id);
export function postProgress(oc: OC) {
  if (typeof window !== 'undefined' && window.parent !== window) window.parent.postMessage({ type: 'ocworld:progress', characterId: oc.characterId || oc.id, oc: JSON.parse(serializeOc(oc)) }, window.location.origin);
}
export function emitMoment(oc: OC, text: string) {
  const characterId = oc.characterId || oc.id;
  const moment = { type: 'ocworld:moment', characterId, text: text.trim().slice(0, 2000), at: Date.now(), id: crypto.randomUUID() };
  if (!moment.text) return;
  const key = 'ocworld.living.moments.v1:' + encodeURIComponent(characterId);
  try {
    let journal: unknown = [];
    try { journal = JSON.parse(localStorage.getItem(key) || '[]'); } catch { /* Recover a malformed journal. */ }
    const previous = Array.isArray(journal) ? journal.filter(m => m && m.characterId === characterId && typeof m.text === 'string' && typeof m.at === 'number' && typeof m.id === 'string') : [];
    localStorage.setItem(key, JSON.stringify([...previous.slice(-199), moment]));
  } catch { /* Keep iframe delivery available when storage is unavailable. */ }
  if (typeof window !== 'undefined' && window.parent !== window) window.parent.postMessage(moment, window.location.origin);
}
export function saveOc(oc: OC) {
  try { localStorage.setItem(characterKey(oc.id), serializeOc(oc)); localStorage.setItem(ACTIVE, oc.id); } catch { /* Storage may be unavailable; keep the in-memory character. */ }
  postProgress(oc);
}
export function loadOc(characterId?: string): OC | null {
  try {
    const id = characterId || localStorage.getItem(ACTIVE);
    const raw = id ? localStorage.getItem(characterKey(id)) : localStorage.getItem(KEY);
    if (!raw) return null;
    const oc = deserializeOc(raw);
    if (!oc || typeof oc.id !== 'string' || (characterId && oc.id !== characterId) || typeof oc.name !== 'string' || !Array.isArray(oc.memory) || !oc.profile || !Array.isArray(oc.profile.guidance) || !Array.isArray(oc.profile.insights) || typeof oc.profile.daysLived !== 'number' || !oc.traits || !oc.needs) return null;
    return oc;
  } catch { return null; }
}
export function exportOcFile(oc: OC) {
  const blob = new Blob([serializeOc(oc)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${oc.name}-${oc.handle.replace('@', '')}.json`; a.click();
  URL.revokeObjectURL(url);
}
