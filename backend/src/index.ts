/**
 * OC World Backend - AI Character Community
 */
import { Hono } from "hono";
import type { Client } from "@sdk/server-types";
import { tables, buckets } from "@generated";
import { eq, desc, sql, and, or, ne } from "drizzle-orm";
// Doubao API for image generation

// Prompt templates for 9 styles - all with pixel art base
const PIXEL_BASE = "pixel art style, 16-bit retro game character, pixelated, clean pixel edges, limited color palette, game sprite aesthetic";
const PIXEL_SUFFIX = "masterpiece pixel art, clean pixels, no anti-aliasing, retro game style, detailed pixel work, nostalgic 16-bit era";

const PROMPT_TEMPLATES: Record<string, { prefix: string; suffix: string }> = {
  pixel: {
    prefix: `${PIXEL_BASE}, original character portrait, game avatar, RPG character`,
    suffix: `${PIXEL_SUFFIX}, vibrant colors, charming pixel character design`
  },
  anime: {
    prefix: `${PIXEL_BASE}, anime pixel art style, cel shading pixels, vibrant colors, beautiful anime sprite`,
    suffix: `${PIXEL_SUFFIX}, expressive pixel eyes, anime character design`
  },
  cyberpunk: {
    prefix: `${PIXEL_BASE}, cyberpunk pixel art, futuristic, neon pixel lights, high-tech, cyber aesthetic`,
    suffix: `${PIXEL_SUFFIX}, cyberpunk 2077 pixel style, blade runner pixel aesthetic`
  },
  chinese: {
    prefix: `${PIXEL_BASE}, traditional Chinese pixel style, hanfu pixels, ancient China aesthetic, elegant sprite`,
    suffix: `${PIXEL_SUFFIX}, traditional Chinese pixel art, beautiful composition`
  },
  realistic: {
    prefix: `${PIXEL_BASE}, detailed pixel portrait, high pixel detail, professional pixel art`,
    suffix: `${PIXEL_SUFFIX}, sharp pixel focus, natural pixel colors`
  },
  chibi: {
    prefix: `${PIXEL_BASE}, chibi pixel style, cute kawaii pixels, super deformed sprite, big head small body`,
    suffix: `${PIXEL_SUFFIX}, cute chibi pixel art, kawaii pixel aesthetic`
  },
  gothic: {
    prefix: `${PIXEL_BASE}, dark gothic pixel style, mysterious, elegant goth pixel fashion, dark fantasy pixels`,
    suffix: `${PIXEL_SUFFIX}, moody pixel atmosphere, high contrast pixels`
  },
  fantasy: {
    prefix: `${PIXEL_BASE}, fantasy pixel style, magical, mystical pixel character, enchanted pixel atmosphere`,
    suffix: `${PIXEL_SUFFIX}, magical pixel lighting, epic pixel composition`
  },
  urban: {
    prefix: `${PIXEL_BASE}, modern urban pixel style, contemporary pixel fashion, city pixel background`,
    suffix: `${PIXEL_SUFFIX}, natural pixel lighting, urban pixel aesthetic`
  }
};

export async function createApp(
  edgespark: Client<typeof tables>
): Promise<Hono> {
  const app = new Hono();

  // ============================================
  // Public Endpoints (No Auth Required)
  // ============================================

  // Health check
  app.get("/api/public/health", (c) => c.json({ status: "ok", message: "OC World API" }));

  // Get styles list
  app.get("/api/public/styles", (c) => {
    return c.json({
      styles: Object.keys(PROMPT_TEMPLATES).map(id => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1)
      }))
    });
  });

  // Community feed (public characters)
  app.get("/api/public/community", async (c) => {
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");

    const characters = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.isPublic, 1))
      .orderBy(desc(tables.characters.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ characters });
  });

  // Get character detail (public)
  app.get("/api/public/characters/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const character = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .get();

    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }
    return c.json({ character });
  });

  // ============================================
  // Protected Endpoints (Auth Required)
  // ============================================

  // Generate OC images with AI (Doubao API)
  app.post("/api/generate", async (c) => {
    const apiKey = edgespark.secret.get("ARK_API_KEY");
    if (!apiKey) {
      return c.json({ error: "AI service not configured. Please add ARK_API_KEY." }, 500);
    }

    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { styleId, description } = await c.req.json();
    console.log("[API] POST /api/generate - styleId:", styleId, "description:", description);

    if (!styleId || !description) {
      return c.json({ error: "styleId and description are required" }, 400);
    }

    const template = PROMPT_TEMPLATES[styleId];
    if (!template) {
      return c.json({ error: "Invalid style" }, 400);
    }

    const fullPrompt = `${template.prefix}, ${description}, ${template.suffix}`;
    console.log("[API] Full prompt:", fullPrompt);

    try {
      const images: string[] = [];

      // Generate 4 images using Doubao API
      for (let i = 0; i < 4; i++) {
        const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "doubao-seedream-4-5-251128",
            prompt: fullPrompt,
            response_format: "url",
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("[API] Doubao API error:", errorData);
          throw new Error(`Doubao API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.data && data.data.length > 0 && data.data[0].url) {
          images.push(data.data[0].url);
        }
      }

      console.log("[API] Generated", images.length, "images");
      return c.json({ images, prompt: fullPrompt });
    } catch (error: any) {
      console.error("[API] Generation error:", error.message);
      return c.json({ error: "Failed to generate images: " + error.message }, 500);
    }
  });

  // Create character
  app.post("/api/characters", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    console.log("[API] POST /api/characters - userId:", user.id, "body:", body);

    const result = await edgespark.db
      .insert(tables.characters)
      .values({
        userId: parseInt(user.id),
        name: body.name,
        image: body.image,
        thumbnail: body.image,
        styleId: body.styleId,
        description: body.description,
        prompt: body.prompt,
        gender: body.gender,
        mbti: body.mbti,
        personalityTags: JSON.stringify(body.personality || []),
        catchphrase: body.catchphrase,
        story: body.story,
        isPublic: body.isPublic ? 1 : 0,
      })
      .returning();

    console.log("[API] Character created:", result[0]?.id);
    return c.json({ character: result[0] });
  });

  // Get my characters
  app.get("/api/characters/my", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const characters = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.userId, parseInt(user.id)))
      .orderBy(desc(tables.characters.createdAt));

    return c.json({ characters });
  });

  // Update character
  app.put("/api/characters/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();

    // Verify ownership
    const existing = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .get();

    if (!existing || existing.userId !== parseInt(user.id)) {
      return c.json({ error: "Not found or not authorized" }, 404);
    }

    await edgespark.db
      .update(tables.characters)
      .set({
        name: body.name,
        mbti: body.mbti,
        personalityTags: JSON.stringify(body.personality || []),
        catchphrase: body.catchphrase,
        story: body.story,
        isPublic: body.isPublic ? 1 : 0,
      })
      .where(eq(tables.characters.id, id));

    return c.json({ success: true });
  });

  // Delete character
  app.delete("/api/characters/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const existing = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .get();

    if (!existing || existing.userId !== parseInt(user.id)) {
      return c.json({ error: "Not found or not authorized" }, 404);
    }

    await edgespark.db
      .delete(tables.characters)
      .where(eq(tables.characters.id, id));

    return c.json({ success: true });
  });

  // Like character
  app.post("/api/characters/:id/like", async (c) => {
    const id = parseInt(c.req.param("id"));

    await edgespark.db
      .update(tables.characters)
      .set({ likes: sql`${tables.characters.likes} + 1` })
      .where(eq(tables.characters.id, id));

    return c.json({ success: true });
  });

  // Collect character
  app.post("/api/characters/:id/collect", async (c) => {
    const id = parseInt(c.req.param("id"));

    await edgespark.db
      .update(tables.characters)
      .set({ collects: sql`${tables.characters.collects} + 1` })
      .where(eq(tables.characters.id, id));

    return c.json({ success: true });
  });

  // OC Chat - AI chat with a single character
  app.post("/api/chat", async (c) => {
    const apiKey = edgespark.secret.get("GEMINI_API_KEY");
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { characterId, message, history } = await c.req.json();
    console.log("[API] POST /api/chat - characterId:", characterId, "message:", message);

    if (!characterId || !message) {
      return c.json({ error: "characterId and message are required" }, 400);
    }

    // Get character details
    const character = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, parseInt(characterId)))
      .get();

    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    // Build conversation history for context
    const historyText = (history || []).slice(-6).map((h: any) =>
      `${h.sender === "user" ? "用户" : character.name}: ${h.text}`
    ).join("\n");

    const personality = character.personalityTags ? JSON.parse(character.personalityTags) : [];

    const prompt = `你現在扮演一個原創角色(OC)與用戶進行角色扮演對話。

角色資料：
- 名字：${character.name}
- 性格特徵：${personality.join("、") || "友善、活潑"}
- MBTI：${character.mbti || "未知"}
- 口頭禪："${character.catchphrase || ""}"
- 背景故事：${character.story || "一個神秘的角色"}

對話規則：
1. 完全沉浸在角色中，用第一人稱回覆
2. 回覆要符合角色的性格特徵
3. 可以適當使用口頭禪
4. 回覆長度適中（20-80字）
5. 展現角色的獨特魅力和個性
6. 如果角色有特定的說話風格，請保持一致

${historyText ? `最近的對話記錄：\n${historyText}\n` : ""}
用戶說：${message}

請用角色的身份回覆（只回覆角色的對話，不要其他說明）：`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const reply = response.text?.trim() || "...";
      console.log("[API] AI reply:", reply.substring(0, 100));

      return c.json({
        reply,
        character: {
          id: character.id,
          name: character.name,
          image: character.image,
        }
      });
    } catch (error: any) {
      console.error("[API] Chat error:", error.message);
      return c.json({ error: "Failed to generate reply: " + error.message }, 500);
    }
  });

  // OC Interaction - Generate dialogue between characters
  app.post("/api/oc-interact", async (c) => {
    const apiKey = edgespark.secret.get("GEMINI_API_KEY");
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { characters, scenario, saveHistory } = await c.req.json();
    console.log("[API] POST /api/oc-interact - characters:", characters.length, "scenario:", scenario);

    if (!characters || characters.length < 2) {
      return c.json({ error: "At least 2 characters required" }, 400);
    }

    const scenarioDescriptions: Record<string, string> = {
      meeting: "兩個角色在一個神秘的地方偶然相遇，開始互相認識",
      battle: "角色們需要聯手對抗共同的敵人",
      casual: "角色們在輕鬆的環境中閒聊日常",
      conflict: "角色們對某個話題有不同的看法，展開友善的辯論",
      adventure: "角色們一起探索一個未知的地方，發現了有趣的事物",
      dating: "角色們進行一次浪漫的約會",
      teamwork: "角色們一起完成一個共同的目標",
    };

    const characterProfiles = characters.map((char: any) =>
      `- ${char.name}: 性格特徵 [${(char.personality || []).join(", ")}], MBTI: ${char.mbti || "未知"}, 口頭禪: "${char.catchphrase || ""}"`
    ).join("\n");

    const prompt = `你是一位創意編劇。請為以下原創角色(OC)生成一段有趣的互動對話。

角色資料：
${characterProfiles}

場景設定：${scenarioDescriptions[scenario] || scenarioDescriptions.meeting}

要求：
1. 生成 6-8 輪對話
2. 每個角色的對話要符合其性格特徵
3. 對話要自然、有趣，展現角色魅力
4. 可以適當使用角色的口頭禪
5. 對話應該有情感起伏，展現角色間的化學反應

請以以下 JSON 格式回覆（只回覆 JSON，不要其他內容）：
{
  "dialogues": [
    {"character": "角色名", "text": "對話內容", "emotion": "情緒"},
    ...
  ],
  "summary": "一句話總結這次互動"
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      console.log("[API] AI response:", text.substring(0, 200));

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const dialogueData = JSON.parse(jsonMatch[0]);

        // Optionally save to conversation history
        if (saveHistory && characters.length >= 2) {
          const oc1Id = characters[0].id;
          const oc2Id = characters[1].id;

          await edgespark.db.insert(tables.ocConversations).values({
            oc1Id,
            oc2Id,
            scenario: scenario || "meeting",
            summary: dialogueData.summary || null,
            dialogueJson: JSON.stringify(dialogueData.dialogues),
            isAutoGenerated: 0,
          });

          // Update relationship
          await updateOCRelationship(edgespark, oc1Id, oc2Id);
        }

        return c.json(dialogueData);
      }

      return c.json({ error: "Failed to parse AI response" }, 500);
    } catch (error: any) {
      console.error("[API] OC interaction error:", error.message);
      return c.json({ error: "Failed to generate interaction: " + error.message }, 500);
    }
  });

  // ============================================
  // OC Social System APIs
  // ============================================

  // Get OC's social relationships
  app.get("/api/oc/:ocId/relationships", async (c) => {
    const ocId = parseInt(c.req.param("ocId"));

    const relationships = await edgespark.db
      .select()
      .from(tables.ocRelationships)
      .where(eq(tables.ocRelationships.ocId, ocId))
      .orderBy(desc(tables.ocRelationships.affinityScore));

    // Get target OC details
    const targetIds = relationships.map(r => r.targetOcId);
    let targetOCs: any[] = [];

    if (targetIds.length > 0) {
      targetOCs = await edgespark.db
        .select()
        .from(tables.characters)
        .where(sql`${tables.characters.id} IN (${targetIds.join(",")})`);
    }

    const relationsWithOC = relationships.map(rel => ({
      ...rel,
      targetOC: targetOCs.find(oc => oc.id === rel.targetOcId),
    }));

    return c.json({ relationships: relationsWithOC });
  });

  // Create or update OC relationship
  app.post("/api/oc/:ocId/relationship", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const ocId = parseInt(c.req.param("ocId"));
    const { targetOcId, relationshipType } = await c.req.json();

    if (!targetOcId) {
      return c.json({ error: "targetOcId is required" }, 400);
    }

    // Check if relationship exists
    const existing = await edgespark.db
      .select()
      .from(tables.ocRelationships)
      .where(and(
        eq(tables.ocRelationships.ocId, ocId),
        eq(tables.ocRelationships.targetOcId, targetOcId)
      ))
      .get();

    if (existing) {
      await edgespark.db
        .update(tables.ocRelationships)
        .set({
          relationshipType: relationshipType || existing.relationshipType,
          lastInteractionAt: Math.floor(Date.now() / 1000)
        })
        .where(eq(tables.ocRelationships.id, existing.id));
    } else {
      await edgespark.db.insert(tables.ocRelationships).values({
        ocId,
        targetOcId,
        relationshipType: relationshipType || "friend",
        affinityScore: 50,
      });

      // Create reverse relationship
      await edgespark.db.insert(tables.ocRelationships).values({
        ocId: targetOcId,
        targetOcId: ocId,
        relationshipType: relationshipType || "friend",
        affinityScore: 50,
      }).onConflictDoNothing();
    }

    return c.json({ success: true });
  });

  // Get OC's social feed
  app.get("/api/oc/:ocId/feed", async (c) => {
    const ocId = parseInt(c.req.param("ocId"));
    const limit = parseInt(c.req.query("limit") || "20");

    const feeds = await edgespark.db
      .select()
      .from(tables.ocSocialFeeds)
      .where(eq(tables.ocSocialFeeds.ocId, ocId))
      .orderBy(desc(tables.ocSocialFeeds.createdAt))
      .limit(limit);

    return c.json({ feeds });
  });

  // Post OC status (auto-generated or manual)
  app.post("/api/oc/:ocId/status", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const ocId = parseInt(c.req.param("ocId"));
    const { content, feedType, targetOcId } = await c.req.json();

    if (!content) {
      return c.json({ error: "content is required" }, 400);
    }

    await edgespark.db.insert(tables.ocSocialFeeds).values({
      ocId,
      content,
      feedType: feedType || "status",
      targetOcId: targetOcId || null,
    });

    return c.json({ success: true });
  });

  // Get conversation history between two OCs
  app.get("/api/oc/conversations/:oc1Id/:oc2Id", async (c) => {
    const oc1Id = parseInt(c.req.param("oc1Id"));
    const oc2Id = parseInt(c.req.param("oc2Id"));

    const conversations = await edgespark.db
      .select()
      .from(tables.ocConversations)
      .where(or(
        and(eq(tables.ocConversations.oc1Id, oc1Id), eq(tables.ocConversations.oc2Id, oc2Id)),
        and(eq(tables.ocConversations.oc1Id, oc2Id), eq(tables.ocConversations.oc2Id, oc1Id))
      ))
      .orderBy(desc(tables.ocConversations.createdAt))
      .limit(10);

    return c.json({ conversations });
  });

  // Auto-social: Generate random social interaction between OCs
  app.post("/api/oc/auto-social", async (c) => {
    const apiKey = edgespark.secret.get("GEMINI_API_KEY");
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { ocId } = await c.req.json();

    if (!ocId) {
      return c.json({ error: "ocId is required" }, 400);
    }

    // Get the OC
    const oc = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, ocId))
      .get();

    if (!oc) {
      return c.json({ error: "OC not found" }, 404);
    }

    // Find potential friends (public OCs not owned by user)
    const potentialFriends = await edgespark.db
      .select()
      .from(tables.characters)
      .where(and(
        eq(tables.characters.isPublic, 1),
        ne(tables.characters.id, ocId)
      ))
      .limit(10);

    if (potentialFriends.length === 0) {
      return c.json({ error: "No other OCs available for social interaction" }, 400);
    }

    // Pick a random friend
    const friend = potentialFriends[Math.floor(Math.random() * potentialFriends.length)];

    const personality1 = oc.personalityTags ? JSON.parse(oc.personalityTags) : [];
    const personality2 = friend.personalityTags ? JSON.parse(friend.personalityTags) : [];

    const scenarios = ["meeting", "casual", "adventure", "teamwork"];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const prompt = `你是一位創意編劇。請為以下兩個原創角色(OC)生成一段自動社交互動。

角色1：${oc.name}
- 性格特徵：${personality1.join(", ") || "友善"}
- MBTI：${oc.mbti || "未知"}
- 口頭禪：${oc.catchphrase || ""}

角色2：${friend.name}
- 性格特徵：${personality2.join(", ") || "友善"}
- MBTI：${friend.mbti || "未知"}
- 口頭禪：${friend.catchphrase || ""}

場景：${scenario === "meeting" ? "初次相遇" : scenario === "casual" ? "日常閒聊" : scenario === "adventure" ? "冒險旅途" : "合作完成任務"}

請生成：
1. 一段 4-6 輪的對話
2. 一條適合發布到社交動態的內容（從${oc.name}的視角）

請以 JSON 格式回覆：
{
  "dialogues": [{"character": "角色名", "text": "對話", "emotion": "情緒"}],
  "socialPost": "社交動態內容",
  "relationshipChange": "positive/neutral/negative",
  "summary": "互動總結"
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);

        // Save conversation
        await edgespark.db.insert(tables.ocConversations).values({
          oc1Id: oc.id,
          oc2Id: friend.id,
          scenario,
          summary: data.summary || null,
          dialogueJson: JSON.stringify(data.dialogues),
          isAutoGenerated: 1,
        });

        // Post to social feed
        if (data.socialPost) {
          await edgespark.db.insert(tables.ocSocialFeeds).values({
            ocId: oc.id,
            content: data.socialPost,
            feedType: "interaction",
            targetOcId: friend.id,
          });
        }

        // Update relationship
        await updateOCRelationship(edgespark, oc.id, friend.id, data.relationshipChange);

        return c.json({
          success: true,
          dialogues: data.dialogues,
          socialPost: data.socialPost,
          friend: {
            id: friend.id,
            name: friend.name,
            image: friend.image,
          },
          summary: data.summary,
        });
      }

      return c.json({ error: "Failed to generate social interaction" }, 500);
    } catch (error: any) {
      console.error("[API] Auto-social error:", error.message);
      return c.json({ error: "Failed: " + error.message }, 500);
    }
  });

  // Global OC social feed (all public OC interactions)
  app.get("/api/public/social-feed", async (c) => {
    const limit = parseInt(c.req.query("limit") || "30");
    const offset = parseInt(c.req.query("offset") || "0");

    const feeds = await edgespark.db
      .select()
      .from(tables.ocSocialFeeds)
      .orderBy(desc(tables.ocSocialFeeds.createdAt))
      .limit(limit)
      .offset(offset);

    // Get OC details for feeds
    const ocIds = [...new Set(feeds.map(f => f.ocId).concat(feeds.filter(f => f.targetOcId).map(f => f.targetOcId!)))];
    let ocs: any[] = [];

    if (ocIds.length > 0) {
      ocs = await edgespark.db
        .select()
        .from(tables.characters)
        .where(sql`${tables.characters.id} IN (${ocIds.join(",")})`);
    }

    const feedsWithOC = feeds.map(feed => ({
      ...feed,
      oc: ocs.find(o => o.id === feed.ocId),
      targetOC: feed.targetOcId ? ocs.find(o => o.id === feed.targetOcId) : null,
    }));

    return c.json({ feeds: feedsWithOC });
  });

  // Like a social feed post
  app.post("/api/social-feed/:feedId/like", async (c) => {
    const feedId = parseInt(c.req.param("feedId"));

    await edgespark.db
      .update(tables.ocSocialFeeds)
      .set({ likes: sql`${tables.ocSocialFeeds.likes} + 1` })
      .where(eq(tables.ocSocialFeeds.id, feedId));

    return c.json({ success: true });
  });

  // Auto-chat: Continuous AI dialogue between OCs
  app.post("/api/oc/auto-chat", async (c) => {
    const apiKey = edgespark.secret.get("GEMINI_API_KEY");
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

    const { oc1Id, oc2Id, previousDialogues, topic } = await c.req.json();

    if (!oc1Id || !oc2Id) {
      return c.json({ error: "oc1Id and oc2Id are required" }, 400);
    }

    // Get both OCs
    const [oc1, oc2] = await Promise.all([
      edgespark.db.select().from(tables.characters).where(eq(tables.characters.id, oc1Id)).get(),
      edgespark.db.select().from(tables.characters).where(eq(tables.characters.id, oc2Id)).get(),
    ]);

    if (!oc1 || !oc2) {
      return c.json({ error: "OC not found" }, 404);
    }

    const personality1 = oc1.personalityTags ? JSON.parse(oc1.personalityTags) : [];
    const personality2 = oc2.personalityTags ? JSON.parse(oc2.personalityTags) : [];

    const historyText = (previousDialogues || []).slice(-10).map((d: any) =>
      `${d.character}: ${d.text}`
    ).join("\n");

    const prompt = `你是一位角色扮演對話生成器。請為以下兩個OC生成下一輪對話。

角色1：${oc1.name}
- 性格：${personality1.join(", ") || "友善"}
- MBTI：${oc1.mbti || "未知"}
- 口頭禪：${oc1.catchphrase || ""}

角色2：${oc2.name}
- 性格：${personality2.join(", ") || "友善"}
- MBTI：${oc2.mbti || "未知"}
- 口頭禪：${oc2.catchphrase || ""}

${topic ? `當前話題：${topic}` : ""}
${historyText ? `之前的對話：\n${historyText}` : "開始新的對話"}

請生成接下來 2 輪對話（每個角色說一句），確保：
1. 對話自然流暢，符合角色性格
2. 有情感表達和互動
3. 可以引入新話題或深入當前話題

JSON 格式回覆：
{
  "dialogues": [
    {"character": "${oc1.name}", "text": "...", "emotion": "..."},
    {"character": "${oc2.name}", "text": "...", "emotion": "..."}
  ],
  "suggestedTopic": "下一個可能的話題"
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return c.json({
          dialogues: data.dialogues,
          suggestedTopic: data.suggestedTopic,
          oc1: { id: oc1.id, name: oc1.name, image: oc1.image },
          oc2: { id: oc2.id, name: oc2.name, image: oc2.image },
        });
      }

      return c.json({ error: "Failed to generate dialogue" }, 500);
    } catch (error: any) {
      console.error("[API] Auto-chat error:", error.message);
      return c.json({ error: "Failed: " + error.message }, 500);
    }
  });

  // ============================================
  // OpenOC Protocol & Skills (Mock Implementation)
  // ============================================

  // Mock Data Store for Skills (in-memory)
  const MOCK_SKILLS = [
    {
      id: 1,
      name: "D20 Dice Roller",
      description: "Rolls a 20-sided die for RPG checks.",
      author: "System",
      price: 0,
      icon: "🎲",
      version: "1.0.0"
    },
    {
      id: 2,
      name: "Emoji Reactor",
      description: "Automatically reacts to messages with relevant emojis.",
      author: "EmojiMaster",
      price: 0,
      icon: "😀",
      version: "1.1.0"
    },
    {
      id: 3,
      name: "Battle Logic V1",
      description: "Basic turn-based combat decision making.",
      author: "DevTeam",
      price: 9.99,
      icon: "⚔️",
      version: "0.9.beta"
    }
  ];

  const MOCK_OC_SKILLS: Record<number, number[]> = {}; // ocId -> skillIds

  // Get available skills
  app.get("/api/skills", (c) => {
    return c.json({ skills: MOCK_SKILLS });
  });

  // Install skill to OC
  app.post("/api/oc/:id/skills", async (c) => {
    const ocId = parseInt(c.req.param("id"));
    const { skillId } = await c.req.json();

    if (!MOCK_OC_SKILLS[ocId]) {
      MOCK_OC_SKILLS[ocId] = [];
    }

    if (!MOCK_OC_SKILLS[ocId].includes(skillId)) {
      MOCK_OC_SKILLS[ocId].push(skillId);
    }

    return c.json({ success: true, installedSkills: MOCK_OC_SKILLS[ocId] });
  });

  // OpenOC Manifest (Protocol)
  app.get("/api/open-oc/:id/manifest", async (c) => {
    const id = parseInt(c.req.param("id"));

    const character = await edgespark.db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .get();

    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    // Get relationships
    const relationships = await edgespark.db
      .select()
      .from(tables.ocRelationships)
      .where(eq(tables.ocRelationships.ocId, id));

    const installedSkills = (MOCK_OC_SKILLS[id] || []).map(sid =>
      MOCK_SKILLS.find(s => s.id === sid)
    ).filter(Boolean);

    // Format according to OpenOC Protocol Draft
    const manifest = {
      version: "1.0",
      metadata: {
        name: character.name,
        uid: `did:openoc:${id}`, // Placeholder DID
        owner: `user_${character.userId}`,
        created_at: character.createdAt,
        updated_at: Math.floor(Date.now() / 1000),
      },
      profile: {
        avatar: character.image,
        description: character.description,
        personality: {
          mbti: character.mbti,
          tags: character.personalityTags ? JSON.parse(character.personalityTags) : [],
          catchphrase: character.catchphrase,
          story: character.story
        },
        style: character.styleId
      },
      skills: installedSkills,
      memory: {
        friend_count: relationships.length,
        affinity_stats: relationships.map(r => ({
          target_id: r.targetOcId,
          score: r.affinityScore
        }))
      },
      links: {
        origin: `https://oc-world.app/character/${id}`,
        api: `https://api.oc-world.app/api/open-oc/${id}/manifest`
      }
    };

    return c.json(manifest);
  });

  return app;
}

// Helper function to update OC relationship
async function updateOCRelationship(
  edgespark: Client<typeof tables>,
  ocId: number,
  targetOcId: number,
  change: string = "positive"
) {
  const affinityChange = change === "positive" ? 5 : change === "negative" ? -3 : 1;

  // Update or create relationship for oc -> target
  const existing = await edgespark.db
    .select()
    .from(tables.ocRelationships)
    .where(and(
      eq(tables.ocRelationships.ocId, ocId),
      eq(tables.ocRelationships.targetOcId, targetOcId)
    ))
    .get();

  if (existing) {
    await edgespark.db
      .update(tables.ocRelationships)
      .set({
        affinityScore: Math.min(100, Math.max(0, (existing.affinityScore || 50) + affinityChange)),
        interactionCount: (existing.interactionCount || 0) + 1,
        lastInteractionAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(tables.ocRelationships.id, existing.id));
  } else {
    await edgespark.db.insert(tables.ocRelationships).values({
      ocId,
      targetOcId,
      affinityScore: 50 + affinityChange,
      interactionCount: 1,
      lastInteractionAt: Math.floor(Date.now() / 1000),
    });
  }

  // Also update reverse relationship
  const reverseExisting = await edgespark.db
    .select()
    .from(tables.ocRelationships)
    .where(and(
      eq(tables.ocRelationships.ocId, targetOcId),
      eq(tables.ocRelationships.targetOcId, ocId)
    ))
    .get();

  if (reverseExisting) {
    await edgespark.db
      .update(tables.ocRelationships)
      .set({
        affinityScore: Math.min(100, Math.max(0, (reverseExisting.affinityScore || 50) + affinityChange)),
        interactionCount: (reverseExisting.interactionCount || 0) + 1,
        lastInteractionAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(tables.ocRelationships.id, reverseExisting.id));
  } else {
    await edgespark.db.insert(tables.ocRelationships).values({
      ocId: targetOcId,
      targetOcId: ocId,
      affinityScore: 50 + affinityChange,
      interactionCount: 1,
      lastInteractionAt: Math.floor(Date.now() / 1000),
    });
  }
}
