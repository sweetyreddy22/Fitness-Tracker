import { useGetGoals, useUpsertGoals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGoalsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Goals() {
  const { data: goals, isLoading } = useGetGoals();
  const upsertGoals = useUpsertGoals();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [steps, setSteps] = useState("");
  const [calories, setCalories] = useState("");
  const [water, setWater] = useState("");
  const [workouts, setWorkouts] = useState("");

  useEffect(() => {
    if (goals) {
      setSteps(goals.stepGoal?.toString() || "");
      setCalories(goals.calorieGoal?.toString() || "");
      setWater(goals.waterGoalMl?.toString() || "");
      setWorkouts(goals.workoutGoalPerWeek?.toString() || "");
    }
  }, [goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertGoals.mutate({
      data: {
        stepGoal: steps ? parseInt(steps) : undefined,
        calorieGoal: calories ? parseInt(calories) : undefined,
        waterGoalMl: water ? parseInt(water) : undefined,
        workoutGoalPerWeek: workouts ? parseInt(workouts) : undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetGoalsQueryKey() });
        toast({ title: "Goals updated successfully" });
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Your Goals</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily & Weekly Targets</CardTitle>
          <CardDescription>Set your fitness targets to track your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="steps">Daily Steps Goal</Label>
                <Input id="steps" type="number" min="0" value={steps} onChange={e => setSteps(e.target.value)} placeholder="e.g. 10000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Daily Calories Burn Goal</Label>
                <Input id="calories" type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g. 500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water">Daily Water Goal (ml)</Label>
                <Input id="water" type="number" min="0" step="100" value={water} onChange={e => setWater(e.target.value)} placeholder="e.g. 2500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workouts">Weekly Workouts Goal</Label>
                <Input id="workouts" type="number" min="0" max="21" value={workouts} onChange={e => setWorkouts(e.target.value)} placeholder="e.g. 4" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={upsertGoals.isPending}>
              {upsertGoals.isPending ? "Saving..." : "Save Goals"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
