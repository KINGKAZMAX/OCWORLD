import {createHmac,timingSafeEqual} from 'node:crypto';
export const grsaiKey=()=>process.env.GRSAI_API_KEY||'';
export const grsaiModel=()=>process.env.GRSAI_IMAGE_MODEL||'nano-banana-2.1';
const base=()=> (process.env.GRSAI_BASE_URL||'https://grsaiapi.com').replace(/\/$/,'');
export function signJob(id,secret,at=Date.now()){
 const payload=Buffer.from(JSON.stringify({id,exp:at+15*60*1000})).toString('base64url');
 return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');
}
export function verifyJob(token,secret,at=Date.now()){
 if(typeof token!=='string'||token.length>600)throw new Error('生成任务凭证不正确。');
 const [payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length)throw new Error('生成任务凭证不正确。');
 const expected=createHmac('sha256',secret).update(payload).digest();const actual=Buffer.from(signature,'base64url');
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new Error('生成任务凭证不正确。');
 const d=JSON.parse(Buffer.from(payload,'base64url').toString());if(typeof d.id!=='string'||d.id.length>128||typeof d.exp!=='number'||d.exp<at)throw new Error('生成任务已过期，请重新生成。');return d.id;
}
export function normalizeResult(response){
 const d=response.data||response;
 if(d.status==='failed')throw new Error('概念图生成失败，请查看服务额度或稍后重试。');
 if(d.status==='succeeded'){
  const url=d.results?.[0]?.url;if(typeof url!=='string'||!url.startsWith('https://'))throw new Error('服务没有返回有效图片。');
  return {status:'succeeded',url};
 }
 return {status:'running',progress:Math.min(99,Math.max(0,Number(d.progress)||0))};
}
async function call(path,body){
 const r=await fetch(base()+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${grsaiKey()}`},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 const d=await r.json().catch(()=>({}));if(!r.ok||d.code&&d.code!==0)throw new Error('香蕉模型服务暂时不可用，请检查账户额度与模型权限。');return d;
}
export async function submitImage(prompt,reference){
 const d=await call('/v1/draw/nano-banana',{model:grsaiModel(),prompt,aspectRatio:'1:1',imageSize:'1K',webHook:'-1',shutProgress:true,...(reference?{urls:[reference]}:{})});
 const id=d.data?.id||d.id;if(typeof id!=='string'||id.length>128)throw new Error('服务未返回生成任务。');return {status:'running',taskToken:signJob(id,grsaiKey()),provider:'grsai',model:grsaiModel()};
}
export async function imageResult(token){
 const id=verifyJob(token,grsaiKey());const result=normalizeResult(await call('/v1/draw/result',{id}));if(result.status!=='succeeded')return result;
 const url=new URL(result.url);if(url.username||url.password||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)||url.hostname.includes(':')||url.hostname.endsWith('.local'))throw new Error('图片地址不正确。');
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});const mime=(response.headers.get('Content-Type')||'').split(';')[0];if(!response.ok||!['image/png','image/jpeg','image/webp'].includes(mime))throw new Error('生成图片暂时无法读取。');
 const reader=response.body.getReader();let length=0;const parts=[];while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>12*1024*1024){await reader.cancel();throw new Error('生成图片超过保存大小限制。');}parts.push(Buffer.from(value));}
 return {status:'succeeded',dataUrl:`data:${mime};base64,${Buffer.concat(parts).toString('base64')}`,source:'grsai',model:grsaiModel()};
}
