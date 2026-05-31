import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workoutTable = pgTable("workout", {
  id: serial("id").primaryKey(),
  workoutName: text("workout_name").notNull(),
  durationMinutes: integer("duration_minutes"),
  caloriesBurned: integer("calories_burned"),
  workoutDate: date("workout_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWorkoutSchema = createInsertSchema(workoutTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workoutTable.$inferSelect;
