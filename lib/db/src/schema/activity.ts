import { pgTable, serial, integer, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  steps: integer("steps"),
  distanceKm: numeric("distance_km", { precision: 6, scale: 3 }),
  caloriesBurned: integer("calories_burned"),
  activityDate: date("activity_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertActivitySchema = createInsertSchema(activityTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activityTable.$inferSelect;
