import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  garageId: integer("garage_id").notNull(),
  userId: integer("user_id").notNull(),
  requestId: integer("request_id").notNull().unique(),
  stars: integer("stars").notNull(),
  comment: text("comment"),
  response: text("response"),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRatingSchema = createInsertSchema(ratingsTable).omit({ id: true, createdAt: true });
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratingsTable.$inferSelect;
