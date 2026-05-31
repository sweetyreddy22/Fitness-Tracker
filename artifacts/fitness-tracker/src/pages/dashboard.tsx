import { useGetDashboardSummary, useGetGoals, useGetStreak, getGetStreakQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Dumbbell, Droplet, Flame, Target, Zap } from "lucide-react";
import { format } from "date-fns";

function StreakFlame({ count }: { count: number }) {
  const size = Math.min(count, 7);
  return (
    <div className="flex gap-0.5 mt-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i < size ? "bg-orange-400" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: goals, isLoading: isLoadingGoals } = useGetGoals();
  const { data: streak, isLoading: isLoadingStreak } = useGetStreak({
    query: { queryKey: getGetStreakQueryKey() },
  });

  if (isLoadingSummary || isLoadingGoals || isLoadingStreak) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Today's Progress</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;
  const goalHitToday = streak?.goalHitToday ?? false;
  const stepGoal = streak?.stepGoal ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's Progress</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM do")}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Steps</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todaySteps?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {goals?.stepGoal ? `${Math.round(summary?.stepGoalPercent ?? 0)}% of daily goal` : "No goal set"}
            </p>
            {goals?.stepGoal && (
              <Progress value={summary?.stepGoalPercent || 0} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todayCalories?.toLocaleString() || 0} kcal</div>
            <p className="text-xs text-muted-foreground">
              {goals?.calorieGoal ? `${Math.round(summary?.calorieGoalPercent ?? 0)}% of daily goal` : "No goal set"}
            </p>
            {goals?.calorieGoal && (
              <Progress value={summary?.calorieGoalPercent || 0} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplet className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todayWaterMl?.toLocaleString() || 0} ml</div>
            <p className="text-xs text-muted-foreground">
              {goals?.waterGoalMl ? `${Math.round(summary?.waterGoalPercent ?? 0)}% of daily goal` : "No goal set"}
            </p>
            {goals?.waterGoalMl && (
              <Progress value={summary?.waterGoalPercent || 0} className="mt-2 [&>div]:bg-secondary" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance</CardTitle>
            <Target className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todayDistanceKm?.toFixed(2) || "0.00"} km</div>
            <p className="text-xs text-muted-foreground">Total distance today</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak banner */}
      <Card className={`border-2 ${goalHitToday ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : "border-muted"}`}>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${currentStreak > 0 ? "bg-orange-100 dark:bg-orange-900/40" : "bg-muted"}`}>
                <Zap className={`h-5 w-5 ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {currentStreak}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    day{currentStreak !== 1 ? "s" : ""} in a row
                  </span>
                  {goalHitToday && (
                    <span className="text-xs font-semibold text-orange-500 bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-full">
                      Goal hit today
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stepGoal > 0
                    ? `Step goal: ${stepGoal.toLocaleString()} steps/day${!goalHitToday && stepGoal > 0 ? " — keep going!" : ""}`
                    : "Set a step goal to start tracking your streak"}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Best</p>
              <p className="text-lg font-bold">{longestStreak}d</p>
            </div>
          </div>
          <StreakFlame count={currentStreak} />
        </CardContent>
      </Card>

      {/* Recent workouts + activity feed */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <CardDescription>Your latest workout sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.recentWorkouts?.length ? (
              <div className="space-y-4">
                {summary.recentWorkouts.map(workout => (
                  <div key={workout.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Dumbbell className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{workout.workoutName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(workout.workoutDate), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{workout.durationMinutes} min</p>
                      <p className="text-xs text-muted-foreground">{workout.caloriesBurned} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No recent workouts. Time to get moving!
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Your daily activity records</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.recentActivities?.length ? (
              <div className="space-y-4">
                {summary.recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-full">
                        <Activity className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{format(new Date(activity.activityDate), "MMMM do")}</p>
                        <p className="text-xs text-muted-foreground">{activity.steps?.toLocaleString() || 0} steps</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.distanceKm || 0} km</p>
                      <p className="text-xs text-muted-foreground">{activity.caloriesBurned || 0} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No recent activities found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
