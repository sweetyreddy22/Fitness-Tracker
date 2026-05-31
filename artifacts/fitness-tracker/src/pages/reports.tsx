import { useGetWeeklyReport, useGetMonthlyReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

export default function Reports() {
  const { data: weekly, isLoading: isLoadingWeekly } = useGetWeeklyReport();
  const { data: monthly, isLoading: isLoadingMonthly } = useGetMonthlyReport();

  if (isLoadingWeekly || isLoadingMonthly) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  const formatWeekDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEE');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight">Activity Reports</h1>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Steps</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{weekly?.totalSteps?.toLocaleString() || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Calories Burned</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{weekly?.totalCalories?.toLocaleString() || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distance (km)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{weekly?.totalDistanceKm?.toFixed(1) || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Workouts</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{weekly?.totalWorkouts || 0}</div></CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Steps</CardTitle>
                <CardDescription>Steps taken over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly?.days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" tickFormatter={formatWeekDate} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Bar dataKey="steps" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calories Burned</CardTitle>
                <CardDescription>Calories burned over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly?.days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" tickFormatter={formatWeekDate} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    <Bar dataKey="calories" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Steps</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{monthly?.totalSteps?.toLocaleString() || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Calories Burned</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{monthly?.totalCalories?.toLocaleString() || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distance (km)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{monthly?.totalDistanceKm?.toFixed(1) || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Workouts</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{monthly?.totalWorkouts || 0}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Activity breakdown by week</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly?.weeks || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" name="Steps" dataKey="steps" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" name="Calories" dataKey="calories" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
