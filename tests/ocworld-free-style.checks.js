import test from 'node:test';
import assert from 'node:assert/strict';
import {artReference,lockArtDirection} from '../api/_lib/art-direction.js';
import {validateImage} from '../api/_lib/ocworld-guard.js';
import {buildConceptPrompt} from '../frontend-v4/src/v8/styles.js';
import {createRepository} from '../frontend-v4/src/v8/character-store.js';
import {submitImage} from '../api/_lib/grsai.js';

test('free pixel style is genuinely pixel art without a fixed artist lock',()=>{
 const prompt=buildConceptPrompt({name:'像素旅人',style:'pixel',artDirection:'free'});
 assert.match(prompt,/pixel art/i);
 assert.doesNotMatch(prompt,/NOT pixelated|FIXED STYLE LOCK|Sevnzel|Aokizy/i);
 assert.equal(artReference('free'),null);
 assert.doesNotMatch(lockArtDirection(prompt,'free'),/FIXED STYLE LOCK/);
 assert.equal(validateImage({prompt,artDirection:'free'}).artDirection,'free');
});

test('free direction persists in saved characters',()=>{
 const data=new Map();const repo=createRepository({getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)});
 const saved=repo.create({name:'像素旅人',artDirection:'free',style:'pixel'});
 assert.equal(repo.get(saved.characterId).artDirection,'free');
 assert.equal(repo.get(saved.characterId).style,'pixel');
});

test('Nano receives only the user reference for free style',async()=>{
 const fetchBefore=globalThis.fetch;const keyBefore=process.env.GRSAI_API_KEY;
 const payloads=[];process.env.GRSAI_API_KEY='test-only';
 globalThis.fetch=async(_url,options)=>{payloads.push(JSON.parse(options.body));return {ok:true,json:async()=>({data:{id:'test-job'}})}};
 try{await submitImage('pixel art','data:image/png;base64,YQ==','free');assert.deepEqual(payloads[0].urls,['data:image/png;base64,YQ==']);await submitImage('pixel art',undefined,'free');assert.equal('urls' in payloads[1],false)}finally{globalThis.fetch=fetchBefore;if(keyBefore===undefined)delete process.env.GRSAI_API_KEY;else process.env.GRSAI_API_KEY=keyBefore}
});
