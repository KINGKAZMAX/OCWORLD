import { beforeEach, expect, test, vi } from 'vitest';
import { ARCHE_TRAITS } from '../../sim/data';
import { useLiving } from '../../store/useLiving';
import { loadOc, emitMoment } from '../persist';
const data = new Map<string, string>();
beforeEach(() => { data.clear(); vi.stubGlobal('localStorage', { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => data.set(k, v) }); useLiving.setState({ oc: null }); });
const input = (characterId: string, name = 'Test') => ({ characterId, name, handle: '@test', bio: 'bio', arche: 'creator' as const });
test('rename and switch preserve full character progress by stable ID', async () => {
 const s = useLiving.getState(); s.create(input('character-a')); s.ensureKit(); s.guide('remember this'); s.tameSpirit('puff'); await s.liveADay();
 const a = structuredClone(useLiving.getState().oc!);
 s.create(input('character-b')); s.ensureKit();
 useLiving.setState({ oc: null }); s.create(input('character-a', 'Renamed'));
 const restored = useLiving.getState().oc!;
 expect(restored.id).toBe('character-a'); expect(restored.name).toBe('Renamed'); expect(restored.profile).toEqual(a.profile); expect(restored.memory).toEqual(a.memory); expect(restored.team).toEqual(a.team); expect(restored.bag).toEqual(a.bag);
});
test('malformed legacy storage recovers without deleting it', () => { data.set('zealwish.living-oc.v1', '{bad'); expect(() => loadOc()).not.toThrow(); expect(loadOc()).toBeNull(); expect(data.get('zealwish.living-oc.v1')).toBe('{bad'); });

test('malformed character slot recovers without inheriting another character', () => {
 useLiving.getState().create(input('character-a'));
 data.set('ocworld.living.character.v1:character-b', '{bad');
 useLiving.getState().create(input('character-b'));
 expect(useLiving.getState().oc!.id).toBe('character-b');
 expect(useLiving.getState().oc!.profile.guidance).toEqual([]);
});
test('bridge emits same-origin scoped catch and actual feeding moments and progress', () => {
 const postMessage = vi.fn(); vi.stubGlobal('window', { parent: { postMessage }, location: { origin: 'https://ocworld.test' } });
 const s = useLiving.getState(); s.create(input('character-a')); s.ensureKit(); s.tameSpirit('puff'); s.useBagItem('berry');
 const messages = postMessage.mock.calls.map(([message]) => message);
 expect(messages.filter(m => m.type === 'ocworld:moment')).toHaveLength(2);
 expect(messages.every(m => m.characterId === 'character-a')).toBe(true);
 expect(postMessage.mock.calls.every(([, origin]) => origin === 'https://ocworld.test')).toBe(true);
 vi.unstubAllGlobals();
});

test('standalone interaction journals stable identity and ignores controlled NPCs', () => {
 const standalone: Record<string, unknown> = { location: { origin: 'https://ocworld.test' } }; standalone.parent = standalone; vi.stubGlobal('window', standalone);
 const s = useLiving.getState(); s.create(input('character-a'));
 s.recordInteraction('npc-other', 'NPC hugged someone');
 expect(data.has('ocworld.living.moments.v1:character-a')).toBe(false);
 s.recordInteraction('character-a', 'Test praised a friend');
 const journal = JSON.parse(data.get('ocworld.living.moments.v1:character-a')!);
 expect(journal).toHaveLength(1); expect(journal[0].characterId).toBe('character-a');
 expect(loadOc('character-a')!.memory[0].t).toBe('Test praised a friend');
 s.create(input('character-b')); s.recordInteraction('character-b', 'B invited a friend to eat');
 expect(JSON.parse(data.get('ocworld.living.moments.v1:character-a')!)).toHaveLength(1);
 vi.unstubAllGlobals();
});

test('journal recovers malformed content and retains only 200 scoped moments', () => {
 const s = useLiving.getState(); s.create(input('character-a'));
 const oc = useLiving.getState().oc!; const key = 'ocworld.living.moments.v1:character-a';
 data.set(key, '{bad'); emitMoment(oc, 'recovered');
 expect(JSON.parse(data.get(key)!)).toHaveLength(1);
 for (let i = 0; i < 205; i++) emitMoment(oc, `action ${i}`);
 const journal = JSON.parse(data.get(key)!);
 expect(journal).toHaveLength(200); expect(journal[199].text).toBe('action 204');
 expect(journal.every((m: { characterId: string }) => m.characterId === 'character-a')).toBe(true);
});

test('same identity updates archetype and traits while preserving memories and pets', async () => {
 const s = useLiving.getState(); s.create(input('character-a')); s.ensureKit(); s.guide('keep this'); await s.liveADay();
 const before = structuredClone(useLiving.getState().oc!);
 s.create({ ...input('character-a'), arche: 'helper' });
 const updated = useLiving.getState().oc!;
 expect(updated.arche).toBe('helper');
 expect(updated.traits).toEqual(ARCHE_TRAITS.helper);
 expect(updated.memory).toEqual(before.memory);
 expect(updated.profile).toEqual(before.profile);
 expect(updated.team).toEqual(before.team);
 expect(updated.bag).toEqual(before.bag);
});
