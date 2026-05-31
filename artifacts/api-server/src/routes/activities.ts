import { Router, type IRouter } from "express";
import { db, activityTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  ListActivitiesQueryParams,
  ListActivitiesResponse,
  CreateActivityBody,
  GetActivityParams,
  GetActivityResponse,
  UpdateActivityParams,
  UpdateActivityBody,
  UpdateActivityResponse,
  DeleteActivityParams,
  GetTodayActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toActivityResponse(a: typeof activityTable.$inferSelect) {
  return {
    ...a,
    distanceKm: a.distanceKm ? Number(a.distanceKm) : null,
  };
}

router.get("/activities", async (req, res): Promise<void> => {
  const queryParsed = ListActivitiesQueryParams.safeParse(req.query);
  const limit = queryParsed.success ? (queryParsed.data.limit ?? 30) : 30;
  const offset = queryParsed.success ? (queryParsed.data.offset ?? 0) : 0;

  const activities = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.activityDate))
    .limit(limit)
    .offset(offset);

  res.json(ListActivitiesResponse.parse(activities.map(toActivityResponse)));
});

router.get("/activities/today", async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const [activity] = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.activityDate, today));

  if (!activity) {
    res.status(404).json({ error: "No activity for today" });
    return;
  }

  res.json(GetTodayActivityResponse.parse(toActivityResponse(activity)));
});

router.post("/activities", async (req, res): Promise<void> => {
  const parsed = CreateActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [activity] = await db
    .insert(activityTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(GetActivityResponse.parse(toActivityResponse(activity)));
});

router.get("/activities/:id", async (req, res): Promise<void> => {
  const params = GetActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [activity] = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.id, params.data.id));

  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }

  res.json(GetActivityResponse.parse(toActivityResponse(activity)));
});

router.patch("/activities/:id", async (req, res): Promise<void> => {
  const params = UpdateActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [activity] = await db
    .update(activityTable)
    .set(parsed.data)
    .where(eq(activityTable.id, params.data.id))
    .returning();

  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }

  res.json(UpdateActivityResponse.parse(toActivityResponse(activity)));
});

router.delete("/activities/:id", async (req, res): Promise<void> => {
  const params = DeleteActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(activityTable)
    .where(eq(activityTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
