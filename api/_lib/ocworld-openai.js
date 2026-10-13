export function chatKey(){return process.env.CHAT_API_KEY||process.env.OPENAI_API_KEY||'';}
export function imageKey(){return process.env.IMAGE_GEN_API_KEY||process.env.OPENAI_API_KEY||'';}
export const chatBase=()=> (process.env.CHAT_BASE_URL||process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');
export const imageBase=()=> (process.env.IMAGE_GEN_BASE_URL||process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');
let cache={at:0,models:[]};
export async function modelCapabilities(){
 if(!imageKey())return{imageModel:null};
 if(Date.now()-cache.at>120000){try{const r=await fetch(`${imageBase()}/models`,{headers:{Authorization:`Bearer ${imageKey()}`},signal:AbortSignal.timeout(8000)});const d=await r.json();if(!r.ok)throw new Error();cache={at:Date.now(),models:(d.data||[]).map(m=>m.id)};}catch{return{imageModel:null}}}
 const configured=process.env.IMAGE_GEN_MODEL;
 const model=configured?(cache.models.includes(configured)?configured:null):['gpt-image-2','gpt-image-1','gpt-image-1-mini'].find(m=>cache.models.includes(m));
 return {imageModel:model||null};
}
export async function upstream(path,payload,timeout=50000,kind='chat'){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(`${kind==='image'?imageBase():chatBase()}/${path}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${kind==='image'?imageKey():chatKey()}`},body:JSON.stringify(payload),signal:controller.signal});const data=await response.json().catch(()=>({}));if(!response.ok){const code=data.error?.code;const error= new Error([402,429].includes(response.status)?'生成额度或请求频率已达限制，请稍后再试。':response.status===401?'服务端 API 凭据无效。':response.status===403?'当前 API Key 无权使用这个模型。':'AI 服务暂时不可用，请稍后重试。');error.status=[402,429].includes(response.status)?429:502;error.upstreamCode=code;throw error;}return data;}finally{clearTimeout(timer)}}
