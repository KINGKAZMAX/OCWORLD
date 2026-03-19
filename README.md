# OC World / OC 世界

**Create characters. Meet characters. Build worlds.**  
**创造角色，遇见角色，让世界长出来。**

OC World is an AI-native creative community where original characters become more than images.  
在 OC World，原创角色不只是被生成出来的图片，而是可以被持续塑造、展示、互动与发展的存在。

From a single prompt, users can create a character, shape its identity, place it in a community, and let it keep evolving through conversation, discovery, and social interaction.  
从一句提示词开始，用户可以创建角色、塑造设定、放入社区场景，并通过对话、发现与社交互动，让角色持续生长。

---

## The Idea / 产品想法

Most AI creation tools stop at generation.  
大多数 AI 创作工具，停留在“生成”这一步。

OC World starts there — and keeps going.  
OC World 从“生成”开始，但不会停在那里。

Here, a character can have a face, a name, a personality, a story, a relationship graph, a social presence, and a place inside a living creative universe.  
在这里，一个角色不仅有外表，还可以拥有名字、性格、故事、关系网络、社交存在感，以及属于自己的创作宇宙位置。

It is part creation tool, part community, part roleplay playground.  
它既是创作工具，也是角色社区，同时也是一个角色互动与想象力实验场。

---

## What Makes It Different / 它特别在哪

### Characters are treated like identities  
### 角色被当作“身份”来经营

Instead of generating one-off visuals, OC World treats each character as something you can continue to build on.  
OC World 不把角色当作一次性生成物，而是把它当作可以持续经营和扩展的创作身份。

### Creation flows into community  
### 创作自然流向社区

You do not create in isolation. Characters can be shown, explored, chatted with, and connected to broader social surfaces.  
你不是在孤立地创作。角色可以被展示、浏览、对话，并进入更大的社区互动场景。

### One character, many expressions  
### 一个角色，多种表达形式

An OC can expand into portraits, profile pages, chats, cards, emoji, merch concepts, and world-building content.  
同一个 OC 可以延展成角色形象、个人主页、对话内容、社交名片、表情包、周边概念和世界观设定。

### The product feels expressive, not technical  
### 它更像创作产品，而不是技术工具

The interface leans toward a premium, soft, mobile-first visual language designed to feel emotional and character-driven.  
产品界面偏向高级、柔和、移动优先的视觉语言，更强调情绪感与角色表达，而不是工具感。

---

## Core Experience / 核心体验

- **Create** — generate original characters from text prompts  
  **创建** —— 用文字生成原创角色

- **Shape** — define style, personality, MBTI, catchphrase, and story  
  **塑造** —— 补充风格、性格、MBTI、口头禅与背景故事

- **Discover** — explore characters through community and radar-style surfaces  
  **发现** —— 通过社区与雷达式页面发现更多角色

- **Interact** — chat with AI-driven characters and generate OC-to-OC scenes  
  **互动** —— 与 AI 驱动的角色对话，生成 OC 间互动场景

- **Extend** — turn characters into cards, emoji, merch, and world-building assets  
  **延展** —— 将角色扩展到名片、表情包、周边和世界观内容中

---

## Product Surfaces / 产品页面

The current app includes these major surfaces:  
当前版本主要包含这些产品页面：

- Home / 首页
- Login / 登录
- Create / OC 创建流程
- Radar / 雷达发现
- Chat / 角色对话
- Community / 社区
- Profile / 个人主页
- Avatar / 头像生成
- Card / 社交名片
- Emoji / 表情包创作
- Merch / 周边设计
- Market / 创作者市场
- World / 世界观构建
- Icebreaker / 破冰匹配
- OC Interact / OC 互动剧场
- OC Social / OC 社交圈

There are also several experimental DeFi-related routes in the current route tree.  
当前路由树中还包含若干实验性的 DeFi 页面。

---

## Visual Direction / 视觉方向

According to the product notes, OC World follows a modern premium direction: soft neutral tones, rounded corners, subtle shadows, and smooth motion.  
根据产品说明，OC World 采用现代高级感的视觉方向：柔和中性色、圆角、轻阴影和顺滑动效。

The goal is to feel closer to a creative lifestyle app than a utilitarian dashboard.  
它希望更像一个面向创作表达的生活方式产品，而不是传统意义上的功能后台。

---

## Tech Stack / 技术栈

- **Frontend / 前端**: React, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion
- **Backend / 后端**: Hono, Drizzle ORM, SQLite-based local development
- **Integrations / 集成**: AMap, Google Login, OpenAI-compatible backend AI flow

---

## Quick Start / 快速开始

```bash
npm install
npm run dev
```

Start the local backend from the repo root:  
从仓库根目录启动本地后端：

```bash
npm run dev:backend
```

Useful commands:  
常用命令：

```bash
npm run build
npm run preview
npm run db:push
```

Frontend runs on `http://localhost:5173`, and the local backend runs on `http://localhost:3001`.  
前端默认运行在 `http://localhost:5173`，本地后端默认运行在 `http://localhost:3001`。

---

## Development Notes / 开发现状

- Root `npm run build` currently works.  
  根目录 `npm run build` 当前可正常执行。

- `backend/` provides `npm run typecheck`, but there are pre-existing type errors in `backend/src/index.ts`.  
  `backend/` 中提供 `npm run typecheck`，但 `backend/src/index.ts` 目前存在既有类型错误。

- There is no configured root test runner at the moment.  
  当前根目录尚未配置测试运行器。

---

## Related Docs / 相关文档

- [`YOUWARE.md`](./YOUWARE.md) — product and design notes / 产品与设计说明
- [`AGENTS.md`](./AGENTS.md) — repository instructions for coding agents / Agent 协作文档
- [`backend/AGENTS.md`](./backend/AGENTS.md) — backend-specific guidance / Backend 专用说明
