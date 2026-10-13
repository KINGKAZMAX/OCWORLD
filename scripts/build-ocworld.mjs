import {build} from 'esbuild';
import {writeFileSync,readFileSync} from 'node:fs';
await build({entryPoints:['frontend-v4/src/v8/app.jsx'],outfile:'frontend-v4/src/v8/app.js',bundle:true,format:'iife',platform:'browser',target:'es2020',minify:true,jsxFactory:'React.createElement',jsxFragment:'React.Fragment',tsconfigRaw:{compilerOptions:{jsx:'react'}}});
const stamp=Date.now();for(const p of ['frontend-v4/web.html','frontend-v4/index.html']){const html=readFileSync(p,'utf8').replace(/\?v=\d+/g,`?v=${stamp}`);writeFileSync(p,html)}console.log('OCWORLD v8 workspace built');
