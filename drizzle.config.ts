import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./backend/src/pg_schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
