/**
 * Shared Hono app factory — used by both local-server.ts (SQLite) and
 * the Vercel serverless entry (Neon Postgres).
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { GoogleGenAI } from "@google/genai";
import { eq, desc, sql, and, or, ne, inArray } from "drizzle-orm";

// ---------- Types ----------
type Env = { Variables: { user: { id: string; email: string; name: string } } };
const DEMO_USER = { id: "1", email: "demo@example.com", name: "Demo User" };

function requireAuth(c: any, next: any) {
  c.set("user", DEMO_USER);
  return next();
}

// ---------- Prompt templates ----------
const PIXEL_BASE =
  "pixel art style, 16-bit retro game character, pixelated, clean pixel edges, limited color palette, game sprite aesthetic";
const PIXEL_SUFFIX =
  "masterpiece pixel art, clean pixels, no anti-aliasing, retro game style, detailed pixel work, nostalgic 16-bit era";

const PROMPT_TEMPLATES: Record<string, { prefix: string; suffix: string }> = {
  pixel: {
    prefix: `${PIXEL_BASE}, original character portrait, game avatar, RPG character`,
    suffix: `${PIXEL_SUFFIX}, vibrant colors, charming pixel character design`,
  },
  anime: {
    prefix: `${PIXEL_BASE}, anime pixel art style, cel shading pixels, vibrant colors, beautiful anime sprite`,
    suffix: `${PIXEL_SUFFIX}, expressive pixel eyes, anime character design`,
  },
  cyberpunk: {
    prefix: `${PIXEL_BASE}, cyberpunk pixel art, futuristic, neon pixel lights, high-tech, cyber aesthetic`,
    suffix: `${PIXEL_SUFFIX}, cyberpunk 2077 pixel style, blade runner pixel aesthetic`,
  },
  chinese: {
    prefix: `${PIXEL_BASE}, traditional Chinese pixel style, hanfu pixels, ancient China aesthetic, elegant sprite`,
    suffix: `${PIXEL_SUFFIX}, traditional Chinese pixel art, beautiful composition`,
  },
  realistic: {
    prefix: `${PIXEL_BASE}, detailed pixel portrait, high pixel detail, professional pixel art`,
    suffix: `${PIXEL_SUFFIX}, sharp pixel focus, natural pixel colors`,
  },
  chibi: {
    prefix: `${PIXEL_BASE}, chibi pixel style, cute kawaii pixels, super deformed sprite, big head small body`,
    suffix: `${PIXEL_SUFFIX}, cute chibi pixel art, kawaii pixel aesthetic`,
  },
  gothic: {
    prefix: `${PIXEL_BASE}, dark gothic pixel style, mysterious, elegant goth pixel fashion, dark fantasy pixels`,
    suffix: `${PIXEL_SUFFIX}, moody pixel atmosphere, high contrast pixels`,
  },
  fantasy: {
    prefix: `${PIXEL_BASE}, fantasy pixel style, magical, mystical pixel character, enchanted pixel atmosphere`,
    suffix: `${PIXEL_SUFFIX}, magical pixel lighting, epic pixel composition`,
  },
  urban: {
    prefix: `${PIXEL_BASE}, modern urban pixel style, contemporary pixel fashion, city pixel background`,
    suffix: `${PIXEL_SUFFIX}, natural pixel lighting, urban pixel aesthetic`,
  },
};

// ---------- Mock skills (in-memory) ----------
const MOCK_SKILLS = [
  {
    id: 1,
    name: "D20 Dice Roller",
    description: "Rolls a 20-sided die for RPG checks.",
    author: "System",
    price: 0,
    icon: "\u{1F3B2}",
    version: "1.0.0",
  },
  {
    id: 2,
    name: "Emoji Reactor",
    description: "Automatically reacts to messages with relevant emojis.",
    author: "EmojiMaster",
    price: 0,
    icon: "\u{1F600}",
    version: "1.1.0",
  },
  {
    id: 3,
    name: "Battle Logic V1",
    description: "Basic turn-based combat decision making.",
    author: "DevTeam",
    price: 9.99,
    icon: "\u2694\uFE0F",
    version: "0.9.beta",
  },
];

const MOCK_OC_SKILLS: Record<number, number[]> = {};

// ================================================
// Factory
// ================================================
export function createApp(db: any, tables: any) {
  const app = new Hono<Env>();

  // ---------- Helper: update OC relationship ----------
  async function updateOCRelationship(
    ocId: number,
    targetOcId: number,
    change: string = "positive"
  ) {
    const affinityChange =
      change === "positive" ? 5 : change === "negative" ? -3 : 1;

    // Forward
    const [existing] = await db
      .select()
      .from(tables.ocRelationships)
      .where(
        and(
          eq(tables.ocRelationships.ocId, ocId),
          eq(tables.ocRelationships.targetOcId, targetOcId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(tables.ocRelationships)
        .set({
          affinityScore: Math.min(
            100,
            Math.max(0, (existing.affinityScore || 50) + affinityChange)
          ),
          interactionCount: (existing.interactionCount || 0) + 1,
          lastInteractionAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(tables.ocRelationships.id, existing.id));
    } else {
      await db.insert(tables.ocRelationships).values({
        ocId,
        targetOcId,
        affinityScore: 50 + affinityChange,
        interactionCount: 1,
        lastInteractionAt: Math.floor(Date.now() / 1000),
      });
    }

    // Reverse
    const [reverseExisting] = await db
      .select()
      .from(tables.ocRelationships)
      .where(
        and(
          eq(tables.ocRelationships.ocId, targetOcId),
          eq(tables.ocRelationships.targetOcId, ocId)
        )
      )
      .limit(1);

    if (reverseExisting) {
      await db
        .update(tables.ocRelationships)
        .set({
          affinityScore: Math.min(
            100,
            Math.max(
              0,
              (reverseExisting.affinityScore || 50) + affinityChange
            )
          ),
          interactionCount: (reverseExisting.interactionCount || 0) + 1,
          lastInteractionAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(tables.ocRelationships.id, reverseExisting.id));
    } else {
      await db.insert(tables.ocRelationships).values({
        ocId: targetOcId,
        targetOcId: ocId,
        affinityScore: 50 + affinityChange,
        interactionCount: 1,
        lastInteractionAt: Math.floor(Date.now() / 1000),
      });
    }
  }

  // CORS
  app.use(
    "*",
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ],
      credentials: true,
    })
  );

  // ============================================
  // Auth Endpoints
  // ============================================
  app.get("/api/auth/session", (c) => {
    return c.json({ data: { user: DEMO_USER } });
  });

  app.post("/api/auth/signout", (c) => {
    return c.json({ success: true });
  });

  // ============================================
  // Public Endpoints
  // ============================================
  app.get("/api/public/health", (c) =>
    c.json({ status: "ok", message: "OC World API" })
  );

  app.get("/api/public/styles", (c) => {
    return c.json({
      styles: Object.keys(PROMPT_TEMPLATES).map((id) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    });
  });

  // Community feed
  app.get("/api/public/community", async (c) => {
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");

    const characters = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.isPublic, 1))
      .orderBy(desc(tables.characters.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({ characters });
  });

  // Character detail (public)
  app.get("/api/public/characters/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const [character] = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .limit(1);

    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }
    return c.json({ character });
  });

  // Global social feed
  app.get("/api/public/social-feed", async (c) => {
    const limit = parseInt(c.req.query("limit") || "30");
    const offset = parseInt(c.req.query("offset") || "0");

    const feeds = await db
      .select()
      .from(tables.ocSocialFeeds)
      .orderBy(desc(tables.ocSocialFeeds.createdAt))
      .limit(limit)
      .offset(offset);

    const ocIds = [
      ...new Set(
        feeds
          .map((f: any) => f.ocId)
          .concat(
            feeds.filter((f: any) => f.targetOcId).map((f: any) => f.targetOcId!)
          )
      ),
    ];
    let ocs: any[] = [];

    if (ocIds.length > 0) {
      ocs = await db
        .select()
        .from(tables.characters)
        .where(inArray(tables.characters.id, ocIds));
    }

    const feedsWithOC = feeds.map((feed: any) => ({
      ...feed,
      oc: ocs.find((o: any) => o.id === feed.ocId),
      targetOC: feed.targetOcId
        ? ocs.find((o: any) => o.id === feed.targetOcId)
        : null,
    }));

    return c.json({ feeds: feedsWithOC });
  });

  // ============================================
  // Protected Endpoints
  // ============================================

  // Generate images (Doubao API)
  app.post("/api/generate", requireAuth, async (c) => {
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      return c.json(
        { error: "AI service not configured. Please add ARK_API_KEY to .env" },
        500
      );
    }

    const { styleId, description } = await c.req.json();
    console.log(
      "[API] POST /api/generate - styleId:",
      styleId,
      "description:",
      description
    );

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

      for (let i = 0; i < 4; i++) {
        const response = await fetch(
          "https://ark.cn-beijing.volces.com/api/v3/images/generations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "doubao-seedream-4-5-251128",
              prompt: fullPrompt,
              response_format: "url",
            }),
          }
        );

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
      return c.json(
        { error: "Failed to generate images: " + error.message },
        500
      );
    }
  });

  // Create character
  app.post("/api/characters", requireAuth, async (c) => {
    const user = c.get("user");
    const body = await c.req.json();
    console.log("[API] POST /api/characters - userId:", user.id, "body:", body);

    const result = await db
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
  app.get("/api/characters/my", requireAuth, async (c) => {
    const user = c.get("user");

    const characters = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.userId, parseInt(user.id)))
      .orderBy(desc(tables.characters.createdAt));

    return c.json({ characters });
  });

  // Update character
  app.put("/api/characters/:id", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    const user = c.get("user");
    const body = await c.req.json();

    const [existing] = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .limit(1);

    if (!existing || existing.userId !== parseInt(user.id)) {
      return c.json({ error: "Not found or not authorized" }, 404);
    }

    await db
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
  app.delete("/api/characters/:id", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    const user = c.get("user");

    const [existing] = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .limit(1);

    if (!existing || existing.userId !== parseInt(user.id)) {
      return c.json({ error: "Not found or not authorized" }, 404);
    }

    await db.delete(tables.characters).where(eq(tables.characters.id, id));

    return c.json({ success: true });
  });

  // Like character
  app.post("/api/characters/:id/like", async (c) => {
    const id = parseInt(c.req.param("id"));

    await db
      .update(tables.characters)
      .set({ likes: sql`${tables.characters.likes} + 1` })
      .where(eq(tables.characters.id, id));

    return c.json({ success: true });
  });

  // Collect character
  app.post("/api/characters/:id/collect", async (c) => {
    const id = parseInt(c.req.param("id"));

    await db
      .update(tables.characters)
      .set({ collects: sql`${tables.characters.collects} + 1` })
      .where(eq(tables.characters.id, id));

    return c.json({ success: true });
  });

  // Chat with character (Gemini)
  app.post("/api/chat", requireAuth, async (c) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json(
        { error: "AI service not configured. Add GEMINI_API_KEY to .env" },
        500
      );
    }

    const { characterId, message, history } = await c.req.json();
    console.log(
      "[API] POST /api/chat - characterId:",
      characterId,
      "message:",
      message
    );

    if (!characterId || !message) {
      return c.json({ error: "characterId and message are required" }, 400);
    }

    const [character] = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, parseInt(characterId)))
      .limit(1);

    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    const historyText = (history || [])
      .slice(-6)
      .map(
        (h: any) =>
          `${h.sender === "user" ? "\u7528\u6236" : character.name}: ${h.text}`
      )
      .join("\n");

    const personality = character.personalityTags
      ? JSON.parse(character.personalityTags)
      : [];

    const prompt = `\u4F60\u73FE\u5728\u626E\u6F14\u4E00\u500B\u539F\u5275\u89D2\u8272(OC)\u8207\u7528\u6236\u9032\u884C\u89D2\u8272\u626E\u6F14\u5C0D\u8A71\u3002

\u89D2\u8272\u8CC7\u6599\uFF1A
- \u540D\u5B57\uFF1A${character.name}
- \u6027\u683C\u7279\u5FB5\uFF1A${personality.join("\u3001") || "\u53CB\u5584\u3001\u6D3B\u6F51"}
- MBTI\uFF1A${character.mbti || "\u672A\u77E5"}
- \u53E3\u982D\u7985\uFF1A"${character.catchphrase || ""}"
- \u80CC\u666F\u6545\u4E8B\uFF1A${character.story || "\u4E00\u500B\u795E\u79D8\u7684\u89D2\u8272"}

\u5C0D\u8A71\u898F\u5247\uFF1A
1. \u5B8C\u5168\u6C89\u6D78\u5728\u89D2\u8272\u4E2D\uFF0C\u7528\u7B2C\u4E00\u4EBA\u7A31\u56DE\u8986
2. \u56DE\u8986\u8981\u7B26\u5408\u89D2\u8272\u7684\u6027\u683C\u7279\u5FB5
3. \u53EF\u4EE5\u9069\u7576\u4F7F\u7528\u53E3\u982D\u7985
4. \u56DE\u8986\u9577\u5EA6\u9069\u4E2D\uFF0820-80\u5B57\uFF09
5. \u5C55\u73FE\u89D2\u8272\u7684\u7368\u7279\u9B45\u529B\u548C\u500B\u6027
6. \u5982\u679C\u89D2\u8272\u6709\u7279\u5B9A\u7684\u8AAA\u8A71\u98A8\u683C\uFF0C\u8ACB\u4FDD\u6301\u4E00\u81F4

${historyText ? `\u6700\u8FD1\u7684\u5C0D\u8A71\u8A18\u9304\uFF1A\n${historyText}\n` : ""}\u7528\u6236\u8AAA\uFF1A${message}

\u8ACB\u7528\u89D2\u8272\u7684\u8EAB\u4EFD\u56DE\u8986\uFF08\u53EA\u56DE\u8986\u89D2\u8272\u7684\u5C0D\u8A71\uFF0C\u4E0D\u8981\u5176\u4ED6\u8AAA\u660E\uFF09\uFF1A`;

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
        },
      });
    } catch (error: any) {
      console.error("[API] Chat error:", error.message);
      return c.json(
        { error: "Failed to generate reply: " + error.message },
        500
      );
    }
  });

  // OC Interaction
  app.post("/api/oc-interact", requireAuth, async (c) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

    const { characters, scenario, saveHistory } = await c.req.json();
    console.log(
      "[API] POST /api/oc-interact - characters:",
      characters.length,
      "scenario:",
      scenario
    );

    if (!characters || characters.length < 2) {
      return c.json({ error: "At least 2 characters required" }, 400);
    }

    const scenarioDescriptions: Record<string, string> = {
      meeting:
        "\u5169\u500B\u89D2\u8272\u5728\u4E00\u500B\u795E\u79D8\u7684\u5730\u65B9\u5076\u7136\u76F8\u9047\uFF0C\u958B\u59CB\u4E92\u76F8\u8A8D\u8B58",
      battle:
        "\u89D2\u8272\u5011\u9700\u8981\u806F\u624B\u5C0D\u6297\u5171\u540C\u7684\u6575\u4EBA",
      casual:
        "\u89D2\u8272\u5011\u5728\u8F15\u9B06\u7684\u74B0\u5883\u4E2D\u9592\u804A\u65E5\u5E38",
      conflict:
        "\u89D2\u8272\u5011\u5C0D\u67D0\u500B\u8A71\u984C\u6709\u4E0D\u540C\u7684\u770B\u6CD5\uFF0C\u5C55\u958B\u53CB\u5584\u7684\u8FAF\u8AD6",
      adventure:
        "\u89D2\u8272\u5011\u4E00\u8D77\u63A2\u7D22\u4E00\u500B\u672A\u77E5\u7684\u5730\u65B9\uFF0C\u767C\u73FE\u4E86\u6709\u8DA3\u7684\u4E8B\u7269",
      dating:
        "\u89D2\u8272\u5011\u9032\u884C\u4E00\u6B21\u6D6A\u6F2B\u7684\u7D04\u6703",
      teamwork:
        "\u89D2\u8272\u5011\u4E00\u8D77\u5B8C\u6210\u4E00\u500B\u5171\u540C\u7684\u76EE\u6A19",
    };

    const characterProfiles = characters
      .map(
        (char: any) =>
          `- ${char.name}: \u6027\u683C\u7279\u5FB5 [${(char.personality || []).join(", ")}], MBTI: ${char.mbti || "\u672A\u77E5"}, \u53E3\u982D\u7985: "${char.catchphrase || ""}"`
      )
      .join("\n");

    const prompt = `\u4F60\u662F\u4E00\u4F4D\u5275\u610F\u7DE8\u5287\u3002\u8ACB\u70BA\u4EE5\u4E0B\u539F\u5275\u89D2\u8272(OC)\u751F\u6210\u4E00\u6BB5\u6709\u8DA3\u7684\u4E92\u52D5\u5C0D\u8A71\u3002

\u89D2\u8272\u8CC7\u6599\uFF1A
${characterProfiles}

\u5834\u666F\u8A2D\u5B9A\uFF1A${scenarioDescriptions[scenario] || scenarioDescriptions.meeting}

\u8981\u6C42\uFF1A
1. \u751F\u6210 6-8 \u8F2A\u5C0D\u8A71
2. \u6BCF\u500B\u89D2\u8272\u7684\u5C0D\u8A71\u8981\u7B26\u5408\u5176\u6027\u683C\u7279\u5FB5
3. \u5C0D\u8A71\u8981\u81EA\u7136\u3001\u6709\u8DA3\uFF0C\u5C55\u73FE\u89D2\u8272\u9B45\u529B
4. \u53EF\u4EE5\u9069\u7576\u4F7F\u7528\u89D2\u8272\u7684\u53E3\u982D\u7985
5. \u5C0D\u8A71\u61C9\u8A72\u6709\u60C5\u611F\u8D77\u4F0F\uFF0C\u5C55\u73FE\u89D2\u8272\u9593\u7684\u5316\u5B78\u53CD\u61C9

\u8ACB\u4EE5\u4EE5\u4E0B JSON \u683C\u5F0F\u56DE\u8986\uFF08\u53EA\u56DE\u8986 JSON\uFF0C\u4E0D\u8981\u5176\u4ED6\u5167\u5BB9\uFF09\uFF1A
{
  "dialogues": [
    {"character": "\u89D2\u8272\u540D", "text": "\u5C0D\u8A71\u5167\u5BB9", "emotion": "\u60C5\u7DD2"},
    ...
  ],
  "summary": "\u4E00\u53E5\u8A71\u7E3D\u7D50\u9019\u6B21\u4E92\u52D5"
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "";
      console.log("[API] AI response:", text.substring(0, 200));

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const dialogueData = JSON.parse(jsonMatch[0]);

        if (saveHistory && characters.length >= 2) {
          const oc1Id = characters[0].id;
          const oc2Id = characters[1].id;

          await db.insert(tables.ocConversations).values({
            oc1Id,
            oc2Id,
            scenario: scenario || "meeting",
            summary: dialogueData.summary || null,
            dialogueJson: JSON.stringify(dialogueData.dialogues),
            isAutoGenerated: 0,
          });

          await updateOCRelationship(oc1Id, oc2Id);
        }

        return c.json(dialogueData);
      }

      return c.json({ error: "Failed to parse AI response" }, 500);
    } catch (error: any) {
      console.error("[API] OC interaction error:", error.message);
      return c.json(
        { error: "Failed to generate interaction: " + error.message },
        500
      );
    }
  });

  // ============================================
  // OC Social System
  // ============================================

  // Get OC relationships
  app.get("/api/oc/:ocId/relationships", async (c) => {
    const ocId = parseInt(c.req.param("ocId"));

    const relationships = await db
      .select()
      .from(tables.ocRelationships)
      .where(eq(tables.ocRelationships.ocId, ocId))
      .orderBy(desc(tables.ocRelationships.affinityScore));

    const targetIds = relationships.map((r: any) => r.targetOcId);
    let targetOCs: any[] = [];

    if (targetIds.length > 0) {
      targetOCs = await db
        .select()
        .from(tables.characters)
        .where(inArray(tables.characters.id, targetIds));
    }

    const relationsWithOC = relationships.map((rel: any) => ({
      ...rel,
      targetOC: targetOCs.find((oc: any) => oc.id === rel.targetOcId),
    }));

    return c.json({ relationships: relationsWithOC });
  });

  // Create/update OC relationship
  app.post("/api/oc/:ocId/relationship", requireAuth, async (c) => {
    const ocId = parseInt(c.req.param("ocId"));
    const { targetOcId, relationshipType } = await c.req.json();

    if (!targetOcId) {
      return c.json({ error: "targetOcId is required" }, 400);
    }

    const [existing] = await db
      .select()
      .from(tables.ocRelationships)
      .where(
        and(
          eq(tables.ocRelationships.ocId, ocId),
          eq(tables.ocRelationships.targetOcId, targetOcId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(tables.ocRelationships)
        .set({
          relationshipType: relationshipType || existing.relationshipType,
          lastInteractionAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(tables.ocRelationships.id, existing.id));
    } else {
      await db.insert(tables.ocRelationships).values({
        ocId,
        targetOcId,
        relationshipType: relationshipType || "friend",
        affinityScore: 50,
      });

      // Create reverse relationship
      try {
        await db.insert(tables.ocRelationships).values({
          ocId: targetOcId,
          targetOcId: ocId,
          relationshipType: relationshipType || "friend",
          affinityScore: 50,
        });
      } catch {
        // ignore unique constraint violations
      }
    }

    return c.json({ success: true });
  });

  // Get OC feed
  app.get("/api/oc/:ocId/feed", async (c) => {
    const ocId = parseInt(c.req.param("ocId"));
    const limit = parseInt(c.req.query("limit") || "20");

    const feeds = await db
      .select()
      .from(tables.ocSocialFeeds)
      .where(eq(tables.ocSocialFeeds.ocId, ocId))
      .orderBy(desc(tables.ocSocialFeeds.createdAt))
      .limit(limit);

    return c.json({ feeds });
  });

  // Post OC status
  app.post("/api/oc/:ocId/status", requireAuth, async (c) => {
    const ocId = parseInt(c.req.param("ocId"));
    const { content, feedType, targetOcId } = await c.req.json();

    if (!content) {
      return c.json({ error: "content is required" }, 400);
    }

    await db.insert(tables.ocSocialFeeds).values({
      ocId,
      content,
      feedType: feedType || "status",
      targetOcId: targetOcId || null,
    });

    return c.json({ success: true });
  });

  // Conversation history between two OCs
  app.get("/api/oc/conversations/:oc1Id/:oc2Id", async (c) => {
    const oc1Id = parseInt(c.req.param("oc1Id"));
    const oc2Id = parseInt(c.req.param("oc2Id"));

    const conversations = await db
      .select()
      .from(tables.ocConversations)
      .where(
        or(
          and(
            eq(tables.ocConversations.oc1Id, oc1Id),
            eq(tables.ocConversations.oc2Id, oc2Id)
          ),
          and(
            eq(tables.ocConversations.oc1Id, oc2Id),
            eq(tables.ocConversations.oc2Id, oc1Id)
          )
        )
      )
      .orderBy(desc(tables.ocConversations.createdAt))
      .limit(10);

    return c.json({ conversations });
  });

  // Auto-social
  app.post("/api/oc/auto-social", requireAuth, async (c) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

    const { ocId } = await c.req.json();

    if (!ocId) {
      return c.json({ error: "ocId is required" }, 400);
    }

    const [oc] = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, ocId))
      .limit(1);

    if (!oc) {
      return c.json({ error: "OC not found" }, 404);
    }

    const potentialFriends = await db
      .select()
      .from(tables.characters)
      .where(
        and(eq(tables.characters.isPublic, 1), ne(tables.characters.id, ocId))
      )
      .limit(10);

    if (potentialFriends.length === 0) {
      return c.json(
        { error: "No other OCs available for social interaction" },
        400
      );
    }

    const friend =
      potentialFriends[Math.floor(Math.random() * potentialFriends.length)];

    const personality1 = oc.personalityTags
      ? JSON.parse(oc.personalityTags)
      : [];
    const personality2 = friend.personalityTags
      ? JSON.parse(friend.personalityTags)
      : [];

    const scenarios = ["meeting", "casual", "adventure", "teamwork"];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const prompt = `\u4F60\u662F\u4E00\u4F4D\u5275\u610F\u7DE8\u5287\u3002\u8ACB\u70BA\u4EE5\u4E0B\u5169\u500B\u539F\u5275\u89D2\u8272(OC)\u751F\u6210\u4E00\u6BB5\u81EA\u52D5\u793E\u4EA4\u4E92\u52D5\u3002

\u89D2\u82721\uFF1A${oc.name}
- \u6027\u683C\u7279\u5FB5\uFF1A${personality1.join(", ") || "\u53CB\u5584"}
- MBTI\uFF1A${oc.mbti || "\u672A\u77E5"}
- \u53E3\u982D\u7985\uFF1A${oc.catchphrase || ""}

\u89D2\u82722\uFF1A${friend.name}
- \u6027\u683C\u7279\u5FB5\uFF1A${personality2.join(", ") || "\u53CB\u5584"}
- MBTI\uFF1A${friend.mbti || "\u672A\u77E5"}
- \u53E3\u982D\u7985\uFF1A${friend.catchphrase || ""}

\u5834\u666F\uFF1A${scenario === "meeting" ? "\u521D\u6B21\u76F8\u9047" : scenario === "casual" ? "\u65E5\u5E38\u9592\u804A" : scenario === "adventure" ? "\u5192\u96AA\u65C5\u9014" : "\u5408\u4F5C\u5B8C\u6210\u4EFB\u52D9"}

\u8ACB\u751F\u6210\uFF1A
1. \u4E00\u6BB5 4-6 \u8F2A\u7684\u5C0D\u8A71
2. \u4E00\u689D\u9069\u5408\u767C\u5E03\u5230\u793E\u4EA4\u52D5\u614B\u7684\u5167\u5BB9\uFF08\u5F9E${oc.name}\u7684\u8996\u89D2\uFF09

\u8ACB\u4EE5 JSON \u683C\u5F0F\u56DE\u8986\uFF1A
{
  "dialogues": [{"character": "\u89D2\u8272\u540D", "text": "\u5C0D\u8A71", "emotion": "\u60C5\u7DD2"}],
  "socialPost": "\u793E\u4EA4\u52D5\u614B\u5167\u5BB9",
  "relationshipChange": "positive/neutral/negative",
  "summary": "\u4E92\u52D5\u7E3D\u7D50"
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

        await db.insert(tables.ocConversations).values({
          oc1Id: oc.id,
          oc2Id: friend.id,
          scenario,
          summary: data.summary || null,
          dialogueJson: JSON.stringify(data.dialogues),
          isAutoGenerated: 1,
        });

        if (data.socialPost) {
          await db.insert(tables.ocSocialFeeds).values({
            ocId: oc.id,
            content: data.socialPost,
            feedType: "interaction",
            targetOcId: friend.id,
          });
        }

        await updateOCRelationship(oc.id, friend.id, data.relationshipChange);

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

  // Like social feed post
  app.post("/api/social-feed/:feedId/like", async (c) => {
    const feedId = parseInt(c.req.param("feedId"));

    await db
      .update(tables.ocSocialFeeds)
      .set({ likes: sql`${tables.ocSocialFeeds.likes} + 1` })
      .where(eq(tables.ocSocialFeeds.id, feedId));

    return c.json({ success: true });
  });

  // Auto-chat between OCs
  app.post("/api/oc/auto-chat", async (c) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "AI service not configured" }, 500);
    }

    const { oc1Id, oc2Id, previousDialogues, topic } = await c.req.json();

    if (!oc1Id || !oc2Id) {
      return c.json({ error: "oc1Id and oc2Id are required" }, 400);
    }

    const [[oc1], [oc2]] = await Promise.all([
      db
        .select()
        .from(tables.characters)
        .where(eq(tables.characters.id, oc1Id))
        .limit(1),
      db
        .select()
        .from(tables.characters)
        .where(eq(tables.characters.id, oc2Id))
        .limit(1),
    ]);

    if (!oc1 || !oc2) {
      return c.json({ error: "OC not found" }, 404);
    }

    const personality1 = oc1.personalityTags
      ? JSON.parse(oc1.personalityTags)
      : [];
    const personality2 = oc2.personalityTags
      ? JSON.parse(oc2.personalityTags)
      : [];

    const historyText = (previousDialogues || [])
      .slice(-10)
      .map((d: any) => `${d.character}: ${d.text}`)
      .join("\n");

    const prompt = `\u4F60\u662F\u4E00\u4F4D\u89D2\u8272\u626E\u6F14\u5C0D\u8A71\u751F\u6210\u5668\u3002\u8ACB\u70BA\u4EE5\u4E0B\u5169\u500BOC\u751F\u6210\u4E0B\u4E00\u8F2A\u5C0D\u8A71\u3002

\u89D2\u82721\uFF1A${oc1.name}
- \u6027\u683C\uFF1A${personality1.join(", ") || "\u53CB\u5584"}
- MBTI\uFF1A${oc1.mbti || "\u672A\u77E5"}
- \u53E3\u982D\u7985\uFF1A${oc1.catchphrase || ""}

\u89D2\u82722\uFF1A${oc2.name}
- \u6027\u683C\uFF1A${personality2.join(", ") || "\u53CB\u5584"}
- MBTI\uFF1A${oc2.mbti || "\u672A\u77E5"}
- \u53E3\u982D\u7985\uFF1A${oc2.catchphrase || ""}

${topic ? `\u7576\u524D\u8A71\u984C\uFF1A${topic}` : ""}
${historyText ? `\u4E4B\u524D\u7684\u5C0D\u8A71\uFF1A\n${historyText}` : "\u958B\u59CB\u65B0\u7684\u5C0D\u8A71"}

\u8ACB\u751F\u6210\u63A5\u4E0B\u4F86 2 \u8F2A\u5C0D\u8A71\uFF08\u6BCF\u500B\u89D2\u8272\u8AAA\u4E00\u53E5\uFF09\uFF0C\u78BA\u4FDD\uFF1A
1. \u5C0D\u8A71\u81EA\u7136\u6D41\u66A2\uFF0C\u7B26\u5408\u89D2\u8272\u6027\u683C
2. \u6709\u60C5\u611F\u8868\u9054\u548C\u4E92\u52D5
3. \u53EF\u4EE5\u5F15\u5165\u65B0\u8A71\u984C\u6216\u6DF1\u5165\u7576\u524D\u8A71\u984C

JSON \u683C\u5F0F\u56DE\u8986\uFF1A
{
  "dialogues": [
    {"character": "${oc1.name}", "text": "...", "emotion": "..."},
    {"character": "${oc2.name}", "text": "...", "emotion": "..."}
  ],
  "suggestedTopic": "\u4E0B\u4E00\u500B\u53EF\u80FD\u7684\u8A71\u984C"
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
  // Skills & OpenOC Protocol
  // ============================================

  app.get("/api/skills", (c) => {
    return c.json({ skills: MOCK_SKILLS });
  });

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

  app.get("/api/open-oc/:id/manifest", async (c) => {
    const id = parseInt(c.req.param("id"));

    const [character] = await db
      .select()
      .from(tables.characters)
      .where(eq(tables.characters.id, id))
      .limit(1);

    if (!character) {
      return c.json({ error: "Character not found" }, 404);
    }

    const relationships = await db
      .select()
      .from(tables.ocRelationships)
      .where(eq(tables.ocRelationships.ocId, id));

    const installedSkills = (MOCK_OC_SKILLS[id] || [])
      .map((sid) => MOCK_SKILLS.find((s) => s.id === sid))
      .filter(Boolean);

    const manifest = {
      version: "1.0",
      metadata: {
        name: character.name,
        uid: `did:openoc:${id}`,
        owner: `user_${character.userId}`,
        created_at: character.createdAt,
        updated_at: Math.floor(Date.now() / 1000),
      },
      profile: {
        avatar: character.image,
        description: character.description,
        personality: {
          mbti: character.mbti,
          tags: character.personalityTags
            ? JSON.parse(character.personalityTags)
            : [],
          catchphrase: character.catchphrase,
          story: character.story,
        },
        style: character.styleId,
      },
      skills: installedSkills,
      memory: {
        friend_count: relationships.length,
        affinity_stats: relationships.map((r: any) => ({
          target_id: r.targetOcId,
          score: r.affinityScore,
        })),
      },
      links: {
        origin: `https://oc-world.app/character/${id}`,
        api: `https://api.oc-world.app/api/open-oc/${id}/manifest`,
      },
    };

    return c.json(manifest);
  });

  return app;
}
