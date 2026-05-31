import { Router, type IRouter } from "express";
import { db, goalsTable } from "@workspace/db";
import {
  GetGoalsResponse,
  UpsertGoalsBody,
  UpsertGoalsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/goals", async (req, res): Promise<void> => {
  const [goals] = await db.select().from(goalsTable).limit(1);
  if (!goals) {
    res.status(404).json({ error: "No goals set" });
    return;
  }
  res.json(GetGoalsResponse.parse(goals));
});

router.put("/goals", async (req, res): Promise<void> => {
  const parsed = UpsertGoalsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(goalsTable).limit(1);

  let goals;
  if (existing) {
    [goals] = await db
      .update(goalsTable)
      .set(parsed.data)
      .returning();
  } else {
    [goals] = await db
      .insert(goalsTable)
      .values(parsed.data)
      .returning();
  }

  res.json(UpsertGoalsResponse.parse(goals));
});

export default router;
