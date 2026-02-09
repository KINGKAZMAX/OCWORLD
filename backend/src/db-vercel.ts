import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./pg_schema.js";

const sql = neon(process.env.POSTGRES_URL!);
export const db = drizzle(sql, { schema });
export const tables = schema;
