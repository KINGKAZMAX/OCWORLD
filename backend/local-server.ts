/**
 * Local development server - standalone, no Edgespark dependency
 * Run with: npx tsx local-server.ts
 */
import "dotenv/config";
import { serve } from "@hono/node-server";
import { db, tables } from "./src/db.js";
import { createApp } from "./app.js";

const app = createApp(db, tables);

const port = 3001;
console.log(`Local backend server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
