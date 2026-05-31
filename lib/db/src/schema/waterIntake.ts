import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const waterIntakeTable = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  amountMl: integer("amount_ml").notNull(),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWaterIntakeSchema = createInsertSchema(waterIntakeTable).omit({ id: true, createdAt: true });
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export type WaterIntake = typeof waterIntakeTable.$inferSelect;
