import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { 
  messagesTable, 
  ratingsTable, 
  serviceRequestsTable, 
  otpsTable, 
  garagesTable, 
  usersTable 
} from "../db/schema";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be specified");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const db = drizzle(pool);

async function reset() {
  console.log("--- STARTING DATABASE RESET ---");
  
  try {
    // Delete in order of potential dependency
    console.log("Deleting messages...");
    await (db as any).delete(messagesTable as any);
    
    console.log("Deleting ratings...");
    await (db as any).delete(ratingsTable as any);
    
    console.log("Deleting service requests...");
    await (db as any).delete(serviceRequestsTable as any);
    
    console.log("Deleting OTPs...");
    await (db as any).delete(otpsTable as any);
    
    console.log("Deleting garages...");
    await (db as any).delete(garagesTable as any);
    
    console.log("Deleting users...");
    await (db as any).delete(usersTable as any);

    console.log("--- DATABASE RESET COMPLETE ---");
  } catch (error) {
    console.error("--- RESET FAILED ---", error);
  } finally {
    await pool.end();
  }
}

reset();
