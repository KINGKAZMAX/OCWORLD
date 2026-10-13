import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completeCharacterDraft,CHARACTER_IDEAS} from '../frontend-v4/src/v8/character-ideas.js';

test('an empty draft becomes a complete character from a selected idea',()=>{
 const draft=completeCharacterDraft({},'starlight');
 assert.ok(draft.name);
 assert.ok(draft.concept);
 assert.ok(draft.appearance);
 assert.ok(draft.personality);
 assert.ok(draft.sprite);
 assert.ok(CHARACTER_IDEAS.some(x=>x.id==='starlight'));
});

test('character completion preserves authored identity and predicts a fitting idea',()=>{
 const draft=completeCharacterDraft({name:'我的小猫',concept:'一只爱冒险的小猫',appearance:'金色眼睛'},'auto');
 assert.equal(draft.name,'我的小猫');
 assert.equal(draft.concept,'一只爱冒险的小猫');
 assert.equal(draft.appearance,'金色眼睛');
 assert.equal(draft.ideaId,'forest');
});
