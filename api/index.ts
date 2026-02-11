import { handle } from "hono/vercel";
import { db, tables } from "../backend/src/db-vercel.js";
import { createApp } from "../backend/app.js";

const app = createApp(db, tables);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
