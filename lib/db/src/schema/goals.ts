import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  stepGoal: integer("step_goal"),
  calorieGoal: integer("calorie_goal"),
  waterGoalMl: integer("water_goal_ml"),
  workoutGoalPerWeek: integer("workout_goal_per_week"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGoalsSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoals = z.infer<typeof insertGoalsSchema>;
export type Goals = typeof goalsTable.$inferSelect;
