import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be specified");
}

const getConnectionString = () => {
  let url = process.env.DATABASE_URL as string;
  // Suppress pg v9 SSL warning by adding uselibpqcompat=true if sslmode=require is present
  if (url.includes("sslmode=require")) {
    url = url.replace("sslmode=require", "sslmode=require&uselibpqcompat=true");
  } else if (!url.includes("sslmode=")) {
    url += url.includes("?") ? "&sslmode=verify-full" : "?sslmode=verify-full";
  }
  return url;
};

const createPool = () => {
  return new pg.Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false }, // Avoid SSL errors depending on DB config
    max: 10, // Limit connections per pool
  });
};

const globalForDb = globalThis as unknown as {
  pool: pg.Pool | undefined;
};

const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
