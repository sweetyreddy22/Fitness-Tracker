import { Router, type IRouter } from "express";
import { db, waterIntakeTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import {
  ListWaterIntakeQueryParams,
  ListWaterIntakeResponse,
  LogWaterIntakeBody,
  GetTodayWaterResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/water", async (req, res): Promise<void> => {
  const queryParsed = ListWaterIntakeQueryParams.safeParse(req.query);
  const limit = queryParsed.success ? (queryParsed.data.limit ?? 30) : 30;

  const records = await db
    .select()
    .from(waterIntakeTable)
    .orderBy(desc(waterIntakeTable.loggedAt))
    .limit(limit);

  res.json(ListWaterIntakeResponse.parse(records));
});

router.post("/water", async (req, res): Promise<void> => {
  const parsed = LogWaterIntakeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db
    .insert(waterIntakeTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(record);
});

router.get("/water/today", async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${waterIntakeTable.amountMl}), 0)` })
    .from(waterIntakeTable)
    .where(sql`DATE(${waterIntakeTable.loggedAt} AT TIME ZONE 'UTC') = ${today}`);

  const totalMl = Number(result[0]?.total ?? 0);
  res.json(GetTodayWaterResponse.parse({ date: today, totalMl }));
});

export default router;
