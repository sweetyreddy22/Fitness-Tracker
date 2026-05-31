import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  age: integer("age"),
  gender: text("gender"),
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profileTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profileTable.$inferSelect;
