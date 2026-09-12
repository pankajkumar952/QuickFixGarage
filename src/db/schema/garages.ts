import { pgTable, text, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const garagesTable = pgTable("garages", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  services: text("services").notNull(),
  phone: text("phone"),
  address: text("address"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  garageImageUrl: text("garage_image_url"),
  govIdUrl: text("gov_id_url"),
  tier: text("tier").notNull().default("silver"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGarageSchema = createInsertSchema(garagesTable).omit({ id: true, createdAt: true });
export type InsertGarage = z.infer<typeof insertGarageSchema>;
export type Garage = typeof garagesTable.$inferSelect;
