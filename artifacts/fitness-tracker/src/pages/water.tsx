import { useListWaterIntake, useLogWaterIntake, useGetTodayWater, useGetGoals } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListWaterIntakeQueryKey, getGetTodayWaterQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";

export default function Water() {
  const { data: history, isLoading: isLoadingHistory } = useListWaterIntake();
  const { data: todayWater } = useGetTodayWater();
  const { data: goals } = useGetGoals();
  const logWater = useLogWaterIntake();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    logWater.mutate({
      data: { amountMl: parseInt(amount) }
    }, {
      onSuccess: () => {
        setAmount("");
        queryClient.invalidateQueries({ queryKey: getListWaterIntakeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTodayWaterQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  const todayTotal = todayWater?.totalMl || 0;
  const goal = goals?.waterGoalMl || 2000;
  const percent = Math.min(Math.round((todayTotal / goal) * 100), 100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Water Intake</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-secondary">{todayTotal}</span>
                <span className="text-muted-foreground"> / {goal} ml</span>
              </div>
              <Progress value={percent} className="[&>div]:bg-secondary" />
              <p className="text-center text-sm text-muted-foreground">{percent}% of daily goal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Water</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ml)</Label>
                  <Input id="amount" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g. 250" />
                </div>
                <div className="grid grid-cols-3 gap-2 pb-2">
                  {[250, 500, 750].map(val => (
                    <Button key={val} type="button" variant="outline" size="sm" onClick={() => setAmount(val.toString())}>
                      +{val}
                    </Button>
                  ))}
                </div>
                <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white" disabled={logWater.isPending}>
                  {logWater.isPending ? "Logging..." : "Log Water"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : history?.length ? (
              <div className="space-y-4">
                {history.map(record => (
                  <div key={record.id} className="flex justify-between items-center p-4 border rounded-lg bg-card">
                    <div className="font-medium text-secondary">{record.amountMl} ml</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(record.loggedAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No water logged recently.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
