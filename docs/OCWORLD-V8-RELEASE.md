# OCWORLD v8

Live frontend: https://kingkazmax.github.io/OCWORLD/
API backend: https://ocworld-api-v8.vercel.app/api

## Experience

Define name/concept/personality → select preset, upload art, or generate clean-background concept art when an image model is available → birth card → chat/world. Characters retain stable UUID identity across renames. Memories and messages are isolated per character. World interactions and fullscreen progress join exports. Device-local persistence is explicit; full JSON import/export enables portability, while Character Card V2 export carries public character definition.

Eight art-technique templates: cel anime, semi-painterly, contemporary guofeng, chibi, watercolor, graphic comic ink, futuristic techwear, 16-bit pixel. Full-body, portrait and three-view sheet compositions all request a plain light background. Templates preserve explicit appearance anchors; they do not promise visual identity consistency from text alone. The original 星遥 preset was generated for this release and inspected.

## Research grounding

Domestic artist examples were reviewed for character-sheet layout, outfit construction, proportions, line/shading techniques and stable identifying details. No artist's name or copied image is used in generation prompts.

- https://www.zcool.com.cn/work/ZNjc0NDgwOTI=.html — game character turnaround
- https://www.zcool.com.cn/work/ZNjQwNDMxMzY=.html — chibi guofeng 3D hand-painted character
- https://www.zcool.com.cn/work/ZNzExNjczMjg=.html — OC painterly commission example
- https://chuoooo.com/detailpage?id=14761 — semi-painterly illustration
- https://github.com/a16z-infra/ai-town — world/simulation architecture reference
- https://docs.sillytavern.app/usage/core-concepts/worldinfo/ — separation of character and world lore
- https://github.com/kwaroran/Risuai — roleplay memory and group scene reference
- https://github.com/moeru-ai/airi — future character expression reference

## AI runtime

Server-only credential configuration; static GitHub Pages contains only the public API URL. CORS allowlist, request validation, upstream timeout, count=1 image generation, bounded chat context, and per-instance best-effort IP limits. These limits are not a durable global billing quota; set a hard provider token quota before broader promotion.

User-selected relay: https://www.abc-ai.cn/v1, documented at https://abc-ai.cn/docs. Exact chat model Qwen-flash verified against available models and a real successful completion. The supplied key currently exposes Qwen, DeepSeek and HappyHorse video models; no GPT Image model appears in /v1/models. Direct gpt-image-2 generation test returned HTTP 503, model_not_found / distributor.no_available_channel; no image was returned. Image endpoint discovers GPT Image 2/1/1-mini automatically and returns a clear unavailable response until one is enabled by the relay. API failures never fabricate an image or a character response. No API key is committed.

## Deployment and maintenance

`npm run test:ocworld` runs repository/API checks and world tests. `npm run build:ocworld` builds the workspace plus living world into frontend-v4. Publish frontend-v4 to the OCWORLD gh-pages branch (only selected runtime assets are needed). Original ZEALWISH-WEB3 remains intact; OCWORLD source lives on release/ocworld-v8.

API deployment includes only api/chat.js, api/generate-image.js, api/health.js and the two ocworld helper modules. Required Vercel variables: CHAT_API_KEY, CHAT_BASE_URL, CHAT_MODEL, IMAGE_GEN_API_KEY, IMAGE_GEN_BASE_URL; IMAGE_GEN_MODEL optional when image availability is enabled. Key contents must remain server-side. Re-deploy backend after changing production environment variables.

The world is a browser-hosted scripted simulation. It pauses when closed. Global multiplayer requires configured Supabase; cloud account sync, persistent server simulation, Live2D/voice and wallet minting are outside this release. Base map/sprite notices and third-party asset attributions remain shipped with the world; this release is a noncommercial prototype.
