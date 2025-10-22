import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your environment variables."
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
