import { Router, type IRouter } from "express";
import { db, activityTable, workoutTable, waterIntakeTable, profileTable, goalsTable } from "@workspace/db";
import { sql, and } from "drizzle-orm";
import {
  GetDashboardSummaryResponse,
  GetWeeklyReportResponse,
  GetMonthlyReportResponse,
  GetBmiResultResponse,
  GetStreakResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toNum(val: unknown): number {
  return Number(val ?? 0);
}

router.get("/reports/dashboard", async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const [todayActivity] = await db
    .select()
    .from(activityTable)
    .where(sql`${activityTable.activityDate} = ${today}`);

  const [waterResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${waterIntakeTable.amountMl}), 0)` })
    .from(waterIntakeTable)
    .where(sql`DATE(${waterIntakeTable.loggedAt} AT TIME ZONE 'UTC') = ${today}`);

  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const [weeklyWorkoutsResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(workoutTable)
    .where(sql`${workoutTable.workoutDate} >= ${weekStartStr}`);

  const [goals] = await db.select().from(goalsTable).limit(1);

  const todaySteps = toNum(todayActivity?.steps);
  const todayCalories = toNum(todayActivity?.caloriesBurned);
  const todayDistance = toNum(todayActivity?.distanceKm);
  const todayWater = toNum(waterResult?.total);
  const weeklyWorkouts = toNum(weeklyWorkoutsResult?.count);

  const stepGoal = toNum(goals?.stepGoal ?? 10000);
  const calorieGoal = toNum(goals?.calorieGoal ?? 2000);
  const waterGoal = toNum(goals?.waterGoalMl ?? 2000);

  const recentWorkouts = await db
    .select()
    .from(workoutTable)
    .orderBy(sql`${workoutTable.workoutDate} DESC`)
    .limit(5);

  const recentActivities = await db
    .select()
    .from(activityTable)
    .orderBy(sql`${activityTable.activityDate} DESC`)
    .limit(7);

  res.json(GetDashboardSummaryResponse.parse({
    todaySteps,
    todayCalories,
    todayDistanceKm: todayDistance,
    todayWaterMl: toNum(todayWater),
    weeklyWorkouts,
    stepGoalPercent: stepGoal > 0 ? Math.min(100, (todaySteps / stepGoal) * 100) : 0,
    calorieGoalPercent: calorieGoal > 0 ? Math.min(100, (todayCalories / calorieGoal) * 100) : 0,
    waterGoalPercent: waterGoal > 0 ? Math.min(100, (toNum(todayWater) / waterGoal) * 100) : 0,
    recentWorkouts,
    recentActivities: recentActivities.map(a => ({ ...a, distanceKm: a.distanceKm ? Number(a.distanceKm) : null })),
  }));
});

router.get("/reports/weekly", async (req, res): Promise<void> => {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const activities = await db
    .select()
    .from(activityTable)
    .where(and(
      sql`${activityTable.activityDate} >= ${weekStartStr}`,
      sql`${activityTable.activityDate} <= ${weekEndStr}`
    ));

  const workouts = await db
    .select()
    .from(workoutTable)
    .where(and(
      sql`${workoutTable.workoutDate} >= ${weekStartStr}`,
      sql`${workoutTable.workoutDate} <= ${weekEndStr}`
    ));

  const [waterResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${waterIntakeTable.amountMl}), 0)` })
    .from(waterIntakeTable)
    .where(and(
      sql`DATE(${waterIntakeTable.loggedAt} AT TIME ZONE 'UTC') >= ${weekStartStr}`,
      sql`DATE(${waterIntakeTable.loggedAt} AT TIME ZONE 'UTC') <= ${weekEndStr}`
    ));

  const days = [];
  let totalSteps = 0, totalCalories = 0, totalDistance = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const act = activities.find(a => a.activityDate === dateStr);
    const workoutCount = workouts.filter(w => w.workoutDate === dateStr).length;
    const steps = toNum(act?.steps);
    const calories = toNum(act?.caloriesBurned);
    const distKm = toNum(act?.distanceKm);
    totalSteps += steps;
    totalCalories += calories;
    totalDistance += distKm;
    days.push({ date: dateStr, steps, calories, distanceKm: distKm, workoutCount });
  }

  res.json(GetWeeklyReportResponse.parse({
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    totalSteps,
    totalCalories,
    totalDistanceKm: totalDistance,
    totalWorkouts: workouts.length,
    totalWaterMl: toNum(waterResult?.total),
    days,
  }));
});

router.get("/reports/monthly", async (req, res): Promise<void> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const activities = await db
    .select()
    .from(activityTable)
    .where(and(
      sql`${activityTable.activityDate} >= ${monthStart}`,
      sql`${activityTable.activityDate} <= ${monthEnd}`
    ));

  const workouts = await db
    .select()
    .from(workoutTable)
    .where(and(
      sql`${workoutTable.workoutDate} >= ${monthStart}`,
      sql`${workoutTable.workoutDate} <= ${monthEnd}`
    ));

  const [waterResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${waterIntakeTable.amountMl}), 0)` })
    .from(waterIntakeTable)
    .where(and(
      sql`DATE(${waterIntakeTable.loggedAt} AT TIME ZONE 'UTC') >= ${monthStart}`,
      sql`DATE(${waterIntakeTable.loggedAt} AT TIME ZONE 'UTC') <= ${monthEnd}`
    ));

  let totalSteps = 0, totalCalories = 0, totalDistance = 0;
  activities.forEach(a => {
    totalSteps += toNum(a.steps);
    totalCalories += toNum(a.caloriesBurned);
    totalDistance += toNum(a.distanceKm);
  });

  const weeks: { weekLabel: string; steps: number; calories: number; workouts: number }[] = [];
  let weekNum = 1;
  let weekStartDate = new Date(year, month - 1, 1);
  while (weekStartDate.getMonth() === month - 1) {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    const weekEndClamped = new Date(Math.min(weekEndDate.getTime(), new Date(year, month - 1, lastDay).getTime()));
    const weekStartStr = weekStartDate.toISOString().split("T")[0];
    const weekEndStr = weekEndClamped.toISOString().split("T")[0];

    const weekActivities = activities.filter(a => a.activityDate >= weekStartStr && a.activityDate <= weekEndStr);
    const weekWorkouts = workouts.filter(w => w.workoutDate >= weekStartStr && w.workoutDate <= weekEndStr);

    weeks.push({
      weekLabel: `Week ${weekNum}`,
      steps: weekActivities.reduce((s, a) => s + toNum(a.steps), 0),
      calories: weekActivities.reduce((s, a) => s + toNum(a.caloriesBurned), 0),
      workouts: weekWorkouts.length,
    });

    weekNum++;
    weekStartDate.setDate(weekStartDate.getDate() + 7);
  }

  res.json(GetMonthlyReportResponse.parse({
    month,
    year,
    totalSteps,
    totalCalories,
    totalDistanceKm: totalDistance,
    totalWorkouts: workouts.length,
    totalWaterMl: toNum(waterResult?.total),
    weeks,
  }));
});

router.get("/reports/streak", async (req, res): Promise<void> => {
  const [goals] = await db.select().from(goalsTable).limit(1);
  const stepGoal = toNum(goals?.stepGoal ?? 0);

  // Fetch all activities ordered by date descending (enough history for longest streak)
  const activities = await db
    .select({ activityDate: activityTable.activityDate, steps: activityTable.steps })
    .from(activityTable)
    .orderBy(sql`${activityTable.activityDate} DESC`);

  const today = new Date().toISOString().split("T")[0];

  // Build a set of dates where step goal was hit
  const goalHitDates = new Set<string>();
  if (stepGoal > 0) {
    for (const a of activities) {
      if (toNum(a.steps) >= stepGoal) {
        goalHitDates.add(a.activityDate);
      }
    }
  }

  const goalHitToday = goalHitDates.has(today);

  // Compute current streak: consecutive days ending today (or yesterday if today not hit yet)
  let currentStreak = 0;
  if (stepGoal > 0) {
    const startDate = goalHitToday ? today : (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    })();
    const cursor = new Date(startDate);
    while (true) {
      const dateStr = cursor.toISOString().split("T")[0];
      if (goalHitDates.has(dateStr)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Compute longest streak by scanning all dates in order
  let longestStreak = 0;
  if (stepGoal > 0 && goalHitDates.size > 0) {
    const sortedDates = Array.from(goalHitDates).sort();
    let run = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) {
        run++;
      } else {
        longestStreak = Math.max(longestStreak, run);
        run = 1;
      }
    }
    longestStreak = Math.max(longestStreak, run);
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  res.json(GetStreakResponse.parse({
    currentStreak,
    longestStreak,
    stepGoal,
    goalHitToday,
  }));
});

router.get("/reports/bmi", async (req, res): Promise<void> => {
  const [profile] = await db.select().from(profileTable).limit(1);

  if (!profile || !profile.heightCm || !profile.weightKg) {
    res.status(400).json({ error: "Height and weight must be set in profile to calculate BMI" });
    return;
  }

  const heightM = Number(profile.heightCm) / 100;
  const weightKg = Number(profile.weightKg);
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  let category = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  res.json(GetBmiResultResponse.parse({
    bmi: rounded,
    category,
    heightCm: Number(profile.heightCm),
    weightKg: Number(profile.weightKg),
  }));
});

export default router;
