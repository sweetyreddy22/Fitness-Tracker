import { Router, type IRouter } from "express";
import { db, workoutTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  ListWorkoutsQueryParams,
  ListWorkoutsResponse,
  CreateWorkoutBody,
  GetWorkoutParams,
  GetWorkoutResponse,
  UpdateWorkoutParams,
  UpdateWorkoutBody,
  UpdateWorkoutResponse,
  DeleteWorkoutParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/workouts", async (req, res): Promise<void> => {
  const queryParsed = ListWorkoutsQueryParams.safeParse(req.query);
  const limit = queryParsed.success ? (queryParsed.data.limit ?? 30) : 30;
  const offset = queryParsed.success ? (queryParsed.data.offset ?? 0) : 0;

  const workouts = await db
    .select()
    .from(workoutTable)
    .orderBy(desc(workoutTable.workoutDate))
    .limit(limit)
    .offset(offset);

  res.json(ListWorkoutsResponse.parse(workouts));
});

router.post("/workouts", async (req, res): Promise<void> => {
  const parsed = CreateWorkoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [workout] = await db
    .insert(workoutTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(GetWorkoutResponse.parse(workout));
});

router.get("/workouts/:id", async (req, res): Promise<void> => {
  const params = GetWorkoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [workout] = await db
    .select()
    .from(workoutTable)
    .where(eq(workoutTable.id, params.data.id));

  if (!workout) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  res.json(GetWorkoutResponse.parse(workout));
});

router.patch("/workouts/:id", async (req, res): Promise<void> => {
  const params = UpdateWorkoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateWorkoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [workout] = await db
    .update(workoutTable)
    .set(parsed.data)
    .where(eq(workoutTable.id, params.data.id))
    .returning();

  if (!workout) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  res.json(UpdateWorkoutResponse.parse(workout));
});

router.delete("/workouts/:id", async (req, res): Promise<void> => {
  const params = DeleteWorkoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(workoutTable)
    .where(eq(workoutTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
