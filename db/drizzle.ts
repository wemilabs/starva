import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "./schema";

const sql = neon(process.env.DATABASE_URL as string);
export const db = drizzle({ client: sql, schema });
