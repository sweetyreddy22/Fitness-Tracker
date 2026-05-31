import { Router, type IRouter } from "express";
import { db, profileTable } from "@workspace/db";
import {
  GetProfileResponse,
  UpsertProfileBody,
  UpsertProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  const [profile] = await db.select().from(profileTable).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(GetProfileResponse.parse({
    ...profile,
    heightCm: profile.heightCm ? Number(profile.heightCm) : null,
    weightKg: profile.weightKg ? Number(profile.weightKg) : null,
  }));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpsertProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(profileTable).limit(1);

  let profile;
  if (existing) {
    [profile] = await db
      .update(profileTable)
      .set(parsed.data)
      .returning();
  } else {
    [profile] = await db
      .insert(profileTable)
      .values(parsed.data)
      .returning();
  }

  res.json(UpsertProfileResponse.parse({
    ...profile,
    heightCm: profile.heightCm ? Number(profile.heightCm) : null,
    weightKg: profile.weightKg ? Number(profile.weightKg) : null,
  }));
});

export default router;
