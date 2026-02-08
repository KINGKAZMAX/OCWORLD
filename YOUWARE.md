# OC World - AI Character Community

AI-driven Original Character (OC) creation community Web application. Users generate OC character images via text descriptions, supporting LBS map matching and AI character dialogue.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Zustand, Tailwind CSS, shadcn/ui
- **Backend**: Youbase (Hono + Drizzle + SQLite)
- **AI**: Nano Banana Pro API (via Backend)
- **Map**: Amap (Gaode Map) Web API
- **Real-time**: WebSocket / Polling

## Design Style

- **Theme**: Modern Premium (Soft Neutral Tones)
- **Colors**: Deep Charcoal, Muted Teal, Warm Gold, Soft Grays
- **Font**: ZCOOL QingKe HuangYou, system fonts
- **Visuals**: Glass morphism, subtle shadows, smooth animations, rounded corners

## Core Features

1.  **User System**: Email auth, Profile.
2.  **AI Character Generation**: 8 styles, text-to-image.
3.  **Character Management**: Create, Edit, Delete, List.
4.  **Community**: Waterfall flow, Likes, Collects.
5.  **LBS Map**: Nearby OCs, Real-time location.
6.  **OC Chat**: AI-driven roleplay chat between OCs.

## Project Structure

- `src/pages/`: Route components
- `src/components/`: Reusable UI components
- `src/store/`: Zustand state
- `src/lib/`: Utilities and API clients
- `backend/`: Youbase backend

## Development Status

- [x] Project Initialization
- [x] Backend Setup (Youbase)
- [x] Database Schema
- [x] Frontend Pages (All pages implemented)
- [x] Design Overhaul (Modern Premium)
- [x] Mobile Tabbar Navigation
- [x] Authentication (Login/Register/Logout)
- [x] API Integration
- [x] OC AI Chat (Chat.tsx with real AI dialogue)
- [x] Radar Integration (Real character data from API)
- [x] OC Social System (Auto social, auto chat, relationships)
- [x] Social Feed (Global OC social updates)

## Implemented Pages

1. **首页 (Home)** - `/` - 主页展示
2. **创建 (Create)** - `/create` - 5步OC创建向导
3. **雷达 (Radar)** - `/radar` - LBS雷达地图，发现附近OC
4. **对话 (Chat)** - `/chat/:ocId` - OC自动对话
5. **社区 (Community)** - `/community` - 社区互动，作品流和创作者
6. **OC社交圈 (OCSocial)** - `/oc-social` - OC自动社交、自动对话、关系管理
7. **OC互动剧场 (OCInteraction)** - `/oc-interact` - OC间互动场景生成
8. **个人 (Profile)** - `/profile` - 个人中心，我的OC
9. **头像 (Avatar)** - `/avatar` - 游戏头像生成
10. **名片 (Card)** - `/card` - 社交名片，二维码
11. **表情包 (Emoji)** - `/emoji` - 表情包创作
12. **周边 (Merch)** - `/merch` - 周边设计
13. **市场 (Market)** - `/market` - 创作者市场
14. **世界观 (World)** - `/world` - 世界观构建
15. **破冰 (Icebreaker)** - `/icebreaker` - 线下破冰匹配
16. **登录 (Login)** - `/login` - 用户登录/注册页面
