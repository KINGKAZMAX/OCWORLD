import test from 'node:test';import assert from 'node:assert/strict';
import {lockArtDirection,artReference} from '../api/_lib/art-direction.js';
import {buildConceptPrompt} from '../frontend-v4/src/v8/styles.js';
import {validateImage} from '../api/_lib/ocworld-guard.js';
test('artist directions remain separate in client, server and reference selection',()=>{for(const direction of ['aokizy','sevnzel']){const name=direction==='aokizy'?'Aokizy':'Sevnzel';const other=direction==='aokizy'?'Sevnzel':'Aokizy';const p=buildConceptPrompt({name:'原创',artDirection:direction});assert.ok(p.includes(name));assert.ok(!p.includes(other));assert.ok(lockArtDirection('subject',direction).includes(name));assert.ok(artReference(direction).includes(direction==='aokizy'?'style-test-v1':'sevnzel-ig-v2'));assert.equal(validateImage({prompt:'subject',artDirection:direction}).artDirection,direction)}assert.throws(()=>validateImage({prompt:'subject',artDirection:'random'}));});
