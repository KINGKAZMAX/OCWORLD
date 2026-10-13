import {checkRequest,respond,bodyOf,rateLimit} from './_lib/ocworld-guard.js';
import {grsaiKey,imageResult} from './_lib/grsai.js';
export default async function handler(req,res){
 const origin=req.headers.origin;const checked=checkRequest(req);if(checked.status!==200)return respond(res,checked.status,{error:checked.error},origin);
 if(!grsaiKey())return respond(res,503,{error:'香蕉模型服务尚未配置。'},origin);
 if(!rateLimit(req,'image-result'))return respond(res,429,{error:'查询次数过多，请稍后重试。'},origin);
 try{return respond(res,200,await imageResult(bodyOf(req).taskToken),origin)}catch(e){return respond(res,400,{error:e.name==='TimeoutError'?'结果查询超时，请稍后重试。':e.message},origin)}
}
