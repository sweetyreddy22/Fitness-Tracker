import { useListActivities, useCreateActivity } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListActivitiesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";

export default function Activities() {
  const { data: activities, isLoading } = useListActivities();
  const createActivity = useCreateActivity();
  const queryClient = useQueryClient();
  
  const [steps, setSteps] = useState("");
  const [distance, setDistance] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity.mutate({
      data: {
        steps: steps ? parseInt(steps) : undefined,
        distanceKm: distance ? parseFloat(distance) : undefined,
        caloriesBurned: calories ? parseInt(calories) : undefined,
        activityDate: new Date(date).toISOString(),
      }
    }, {
      onSuccess: () => {
        setSteps("");
        setDistance("");
        setCalories("");
        queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Log Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="steps">Steps</Label>
                <Input id="steps" type="number" min="0" value={steps} onChange={e => setSteps(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input id="distance" type="number" step="0.01" min="0" value={distance} onChange={e => setDistance(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories Burned</Label>
                <Input id="calories" type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={createActivity.isPending}>
                {createActivity.isPending ? "Saving..." : "Log Activity"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : activities?.length ? (
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex justify-between items-center p-4 border rounded-lg bg-card">
                    <div>
                      <div className="font-semibold">{format(new Date(activity.activityDate), "MMM d, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.steps || 0} steps • {activity.distanceKm || 0} km • {activity.caloriesBurned || 0} kcal
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No activities logged yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
