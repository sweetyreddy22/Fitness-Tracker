import { useListWorkouts, useCreateWorkout, useDeleteWorkout } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListWorkoutsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Trash2 } from "lucide-react";

export default function Workouts() {
  const { data: workouts, isLoading } = useListWorkouts();
  const createWorkout = useCreateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkout.mutate({
      data: {
        workoutName: name,
        durationMinutes: duration ? parseInt(duration) : undefined,
        caloriesBurned: calories ? parseInt(calories) : undefined,
        workoutDate: new Date(date).toISOString(),
      }
    }, {
      onSuccess: () => {
        setName("");
        setDuration("");
        setCalories("");
        queryClient.invalidateQueries({ queryKey: getListWorkoutsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this workout?")) {
      deleteWorkout.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWorkoutsQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Log Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Morning Run" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input id="duration" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories Burned</Label>
                <Input id="calories" type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={createWorkout.isPending}>
                {createWorkout.isPending ? "Saving..." : "Log Workout"}
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
            ) : workouts?.length ? (
              <div className="space-y-4">
                {workouts.map(workout => (
                  <div key={workout.id} className="flex justify-between items-center p-4 border rounded-lg bg-card">
                    <div>
                      <div className="font-semibold">{workout.workoutName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(workout.workoutDate), "MMM d, yyyy")} • {workout.durationMinutes || 0} min • {workout.caloriesBurned || 0} kcal
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(workout.id)} disabled={deleteWorkout.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No workouts logged yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
