聊天接口 Chat Completions
SSE Streaming
Vision Ready
请求详情
请求方式
POST
请求URL
https://back.zaiwenai.com/api/v1/ai/chat/completions
内容类型
application/json
请求 Headers
Header名 类型 是否必填 描述
Authorization string 是 Bearer <YOUR_API_KEY>（您生成的 sk-... 密钥）
Content-Type string 是 application/json
请求参数（Body）
参数名 类型 是否必填 描述
model string 是 使用的模型 ID，见下方列表。
messages list 是 对话消息数组。对于纯文本，格式为 [{ "role": "user", "content": "..." }]。
对于图文混合内容，content 是一个包含文本和图片的数组，见下方说明。
stream bool 否 是否使用流式响应（SSE），默认 false。
其他参数（如 temperature、top_p 等）与 OpenAI 官方接口保持一致。
图文输入支持： 当需要发送图片时，messages 中对应消息的 content 字段应为一个数组，包含文本和图片对象。
"content": [
{ "type": "text", "text": "这张图里有什么？" },
{
"type": "image_url",
"image_url": {
"url": "https://... 或 data:image/jpeg;base64,..."
}
}
]
支持的语言模型（model）
计费基于 Token 数量和模型倍率。输出 Token 的消耗是输入 Token 的 4 倍。

model 值 输入消耗倍率 输出消耗倍率
Claude-Opus-4 2 8
Claude-Opus-4.1 2 8
Claude-Opus-4.5 2 8
Claude-Sonnet-4.5 0.1 0.4
DeepSeek-V3.1 0.2 0.8
DeepSeek-V3.2 0.2 0.8
FLUX-2-Pro 1 4
GLM-4.7 0.2 0.8
GPT-5.1 1 4
GPT-5.1-Codex 5 20
GPT-5.2-Instant 0.2 0.8
GPT-5.2-Pro 5 20
GPT-OSS-120B 0.2 0.8
Gemini-3.0-Flash 0.2 0.8
Gemini-3.0-Pro 0.1 0.4
Gemini-3.0-Pro-Thinking 1 4
Grok-4-Fast-Reasoning 0.2 0.8
Grok-4.1-Fast-Non-Reasoning 0.2 0.8
Grok-4.1-Fast-Reasoning 1 4
Kimi-K2-Thinking 0.2 0.8
Kimi-K2.5-FW 0.2 0.8
MiniMax-M1 0.2 0.8
Mistral-Large-2 1 4
Nano-Banana-Pro 61111 244444
Nano-Banana-Pro-2k 121111 484444
Nano-Banana-Pro-4k 241111 964444
Nova-Pro-1.0 0.2 0.8
Qwen-3-Max 0.2 0.8
claude-haiku-4.5 0.2 0.8
claude-opus-4-6 5 20
claude-sonnet-4-reasoner 2 8
deepseek-reasoner 0.2 0.8
deepseekv3 0.2 0.8
gemini_2_5_flash 0.2 0.8
gemini_2_5_pro 0.2 0.8
gpt-4o 0.2 0.8
gpt-4o-mini 0.2 0.8
gpt-5-codex 5 20
gpt-5-mini 0.2 0.8
gpt-5-nano 0.2 0.8
gpt-5-pro 5 20
gpt-5.2-chat-latest 0.1 0.4
gpt4_1 1 4
gpt_o4_mini 0.2 0.8
grok4 1 4
hunyuan-lite 0.2 0.8
o3 0.3 1.2
响应格式
模式 内容类型 说明
非流式（stream: false） application/json 返回完整 JSON 对象，含 id、model、choices、usage 等字段。
流式（stream: true） text/event-stream 按行推送 data: 事件（每段为 JSON），以 data: [DONE] 结束。
纯文本调用示例
将示例中的 sk-xxxxxxxxxxxxxxxxxxxx 替换为您的 API Key；可根据需要修改 messages 与 model。

语言

cURL
复制代码

# 使用您的 API Key 替换 YOUR_API_KEY

API_KEY="sk-xxxxxxxxxxxxxxxxxxxx"
MODEL_NAME="gpt-4o"

# 发起流式请求

curl -X POST https://back.zaiwenai.com/api/v1/ai/chat/completions \
 -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"$MODEL_NAME"'",
"messages": [
{ "role": "user", "content": "你好，请介绍一下你自己。" }
],
"stream": true
}'
提示：如果不需要流式响应，可将 stream 设为 false 并以普通 JSON 读取响应。
图像生成 Images Generation
Tasks + Fetch
请求详情（Images）
生成方式
POST
生成URL
https://back.zaiwenai.com/api/v1/ai/images/generations
内容类型
application/json
拉取方式
POST 或 GET
拉取URL
https://back.zaiwenai.com/api/v1/ai/images/fetch
计费规则（绘图）：生成阶段按模型预扣点数（见下方“绘图模型与点数”）；拉取结果不扣费。余额不足返回 402。
提示：接口内部会以 prompt_tokens = 1 触发扣费，实际扣费金额由所选模型的点数决定。
请求 Headers（Images）
Header名 类型 是否必填 描述
Authorization string 是 Bearer <YOUR_API_KEY>（您的 sk-... 密钥）
Content-Type string 是 application/json（POST 场景）
请求参数（Body，Images 生成）
参数名 类型 是否必填 描述
model string 是 绘图模型名（见下表“绘图模型与点数”）。
prompt string 是 提示词。
ratio string 否 画幅比例，如 1:1、16:9、9:16。默认 1:1。
image_url string | string[] 否 参考图 URL，支持单个或数组（HTTP/HTTPS）。
translate bool 否 是否在上游进行 prompt 翻译，默认 false。
仅使用 image_url 作为参考图字段；不支持本地文件路径。若传多个参考图，请传数组。
绘图模型与点数（预扣，单位：点/次）
以下为 model 可选值及对应的预扣点数：

model 值 预扣点数/次
Flux-2-Klein-9B-Base 10
Flux-2-Turbo 10
Ideogram-v3 2000
Imagen-4 10
Kling-Image-O1 10
Nano-Banana 1000
Qwen-Image 10
Seedream-4.0 300
grok-imagine-image 10
midjourney 5000
nano-banana-2 60000
nano-banana-2-2k 120000
nano-banana-2-4k 240000
playgroundv2.5 10
playgroundv3 10
recraftv3 10
removebackground 10
topazlabs 10
响应与轮询（Images）
生成接口将返回一个任务 ID（task_id）。使用该 task_id 调用 /images/fetch 拉取进度与结果。

接口 方法 参数 说明
/api/v1/ai/images/generations POST 见上文 Body 返回 JSON，包含 task_id 等字段。
/api/v1/ai/images/fetch POST Body: {"task_id":"..."} 返回任务状态与图片地址（上游 JSON 透传）。
/api/v1/ai/images/fetch GET Query: ?task_id=... 同上，GET 便捷形式。
常见状态：IN_PROGRESS（进行中）、SUCCESS（成功，包含 imageUrl/thumb）、FAILURE（失败）。
图像生成与查询示例
将示例中的 sk-xxxxxxxxxxxxxxxxxxxx 替换为您的 API Key；将 MODEL_NAME 替换为上表中的绘图模型。

语言

cURL
复制代码

# 1) 发起生成

API_KEY='sk-xxxxxxxxxxxxxxxxxxxx'
MODEL_NAME='fluxpro11ultra' # 从“绘图模型与点数”中选择
PROMPT='a cozy cabin in the woods, warm lighting, cinematic'

curl -sS -X POST 'https://back.zaiwenai.com/api/v1/ai/images/generations' \
 -H "Authorization: Bearer ${API_KEY}" \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "model": "'"${MODEL_NAME}"'",
"prompt": "'"${PROMPT}"'",
"ratio": "16:9",
"image_url": ["https://example.com/ref.jpg"],
"translate": false
}'

# 假设响应中得到: {"task_id":"img-xxxx"...}

# 2) 拉取结果（GET）

TASK_ID='img-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
curl -sS -G 'https://back.zaiwenai.com/api/v1/ai/images/fetch' \
 -H "Authorization: Bearer ${API_KEY}" \
  --data-urlencode "task_id=${TASK_ID}"

# 2') 拉取结果（POST）

curl -sS -X POST 'https://back.zaiwenai.com/api/v1/ai/images/fetch' \
 -H "Authorization: Bearer ${API_KEY}" \
  -H 'Content-Type: application/json' \
  --data-raw '{"task_id":"'"${TASK_ID}"'"}'

# 3) 轮询直到完成（需要 jq）

# sudo apt-get update && sudo apt-get install -y jq

while true; do
RESP=$(curl -sS -G 'https://back.zaiwenai.com/api/v1/ai/images/fetch' \
    -H "Authorization: Bearer ${API_KEY}" \
    --data-urlencode "task_id=${TASK_ID}")
STATUS=$(echo "$RESP" | jq -r '.info.status // .status // empty')
echo "status: $STATUS"
  if [ "$STATUS" = "SUCCESS" ]; then
echo "$RESP" | jq -r '.info.imageUrl[]?'
    break
  elif [ "$STATUS" = "FAILURE" ]; then
echo "failed: $(echo "$RESP" | jq -r '.info.msg // .status.msg // "unknown error"')"
exit 1
fi
sleep 3
done
提示：不同模型对参考图与比例的支持可能不同，建议先阅读上游文档或尝试默认参数。
错误码（Images）
HTTP 状态码 含义 说明
401 未认证 缺少或错误的 Authorization 头。
402 余额不足 预扣费失败（先扣费策略）。
422 参数错误 例如缺少必要字段、模型名不在支持列表。
502 上游错误 上游绘图服务返回错误。
504 网关超时 无法连接到上游绘图/查询服务或超时。
文字转语音 Text-to-Speech (TTS)
Audio Streaming
请求详情（TTS）
请求方式
POST
请求URL
https://back.zaiwenai.com/api/v1/ai/audio/speech
请求体类型
application/json
响应类型
audio/mpeg（MP3 流式返回）
计费规则：计费按 Token 计：prompt_tokens = 文本长度 × 4，completion_tokens = 0。余额不足返回 402。
请求 Headers（TTS）
Header名 类型 是否必填 描述
Authorization string 是 Bearer <YOUR_API_KEY>（您的 sk-... 密钥）
Content-Type string 是 application/json
请求参数（Body，TTS）
参数名 类型 是否必填 描述
input string 是 需要合成的文本。支持使用 \n 换行进行分段更自然的停顿。
voice string 否 音色，默认 Lovely_Girl。必须为下方允许列表之一。
speed number 否 语速，范围 [0, 2]，默认 1.0。
可选音色（ALLOWED_VOICES）：
Wise_Woman
Friendly_Person
Inspirational_girl
Deep_Voice_Man
Calm_Woman
Casual_Guy
Lively_Girl
Patient_Man
Young_Knight
Determined_Man
Lovely_Girl
Decent_Boy
Imposing_Manner
Elegant_Man
Abbess
Sweet_Girl_2
Exuberant_Girl
响应格式（TTS）
内容类型 传输方式 说明
audio/mpeg HTTP 流 返回 MP3 音频字节流。请使用 --output 或在客户端将响应写入文件。
cURL 示例使用 --output out.mp3 将音频保存为本地文件；在代码示例中请以流式方式写入文件。
TTS 调用示例
将示例中的 sk-xxxxxxxxxxxxxxxxxxxx 替换为您的 API Key。以下示例直接将音频保存为 out.mp3。

语言

cURL
复制代码

# 使用您的 API Key 替换 YOUR_API_KEY

API_KEY='sk-xxxxxxxxxxxxxxxxxxxx'

# 将音频保存到 out.mp3

curl -X POST 'https://back.zaiwenai.com/api/v1/ai/audio/speech' \
 -H "Authorization: Bearer ${API_KEY}" \
 -H 'Content-Type: application/json' \
 --output out.mp3 \
 --data-raw '{"input":"第一段文本\n第二段文本","voice":"Deep_Voice_Man","speed":1.2}'
提示：请确保使用英文半角引号与反斜杠，避免“智能引号”导致命令无法执行。
