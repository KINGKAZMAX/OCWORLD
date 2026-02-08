# OpenClaw Integration: Agentic OC & Open Protocol

> **Vision**: Transform OCs from static images into programmable, cross-platform AI Agents.

## 1. Agentic OC (Agent 化角色)
Transform OCs into independent agents with a "Skill System".

### Skill System Architecture
-   **Skill Definition**: A skill is a modular capability (e.g., "Tarot Reading", "Battle Logic", "Emoji Reactor").
-   **Skill Marketplace**: A platform for creators to publish and monetize skills.
-   **Execution**: OCs "install" skills which extend their prompt context or provide executable tools.

### Database Schema Changes
```sql
CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  author_id INTEGER NOT NULL, -- Creator
  price REAL DEFAULT 0, -- 0 for free
  version TEXT DEFAULT '1.0.0',
  code_url TEXT, -- URL to the skill logic (e.g., a serverless function or script)
  config_schema TEXT, -- JSON schema for user configuration
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE oc_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  oc_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  config TEXT, -- JSON configuration for this specific OC
  acquired_at INTEGER DEFAULT (unixepoch())
);
```

## 2. OpenOC Protocol (开放协议)
Standardized format for OC portability.

### Manifest Specification (Draft)
Endpoint: `GET /api/oc/:id/manifest`

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Luna",
    "uid": "did:openoc:123456789",
    "owner": "user_123",
    "created_at": 1715423000
  },
  "profile": {
    "avatar": "https://...",
    "description": "A cyberpunk hacker...",
    "personality": {
      "mbti": "INTJ",
      "traits": ["Cool", "Tech-savvy"],
      "catchphrase": "Systems normal."
    }
  },
  "assets": {
    "pixel_sprite": "https://...",
    "vrm_model": null
  },
  "skills": [
    {
      "id": "skill_dice_roll",
      "name": "D20 Roller",
      "endpoint": "https://api.openoc.world/skills/dice"
    }
  ],
  "memory": {
    "summary": "Met 5 friends, loves coffee.",
    "affinity_stats": { "friend_count": 12 }
  }
}
```

## 3. Implementation Plan (Hackathon Demo)

### Phase 1: Core Agent Features (Now)
- [ ] **Schema Update**: Add `skills` and `oc_skills` tables.
- [ ] **API**: Implement `/api/oc/:id/manifest` for cross-platform data syncing.
- [ ] **Skill Demo**: Implement a "Dice Roller" skill that the AI can invoke during chat.

### Phase 2: Decentralization & Market (Future)
- [ ] **DID**: Integration with Polygon/Solana for identity.
- [ ] **Marketplace**: UI for browsing and buying skills.
