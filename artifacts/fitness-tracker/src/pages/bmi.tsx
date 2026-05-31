import { useGetBmiResult } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Bmi() {
  const { data: bmiResult, isLoading } = useGetBmiResult();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!bmiResult || !bmiResult.heightCm || !bmiResult.weightKg) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">BMI Calculator</h1>
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="text-muted-foreground">
              Please enter your height and weight in your profile to calculate your BMI.
            </div>
            <Link href="/profile">
              <Button>Update Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { bmi, category, heightCm, weightKg } = bmiResult;
  
  // Calculate position on the scale (15 to 40 is a good range for the visual bar)
  const percent = Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 0), 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">BMI Calculator</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Body Mass Index</CardTitle>
          <CardDescription>Based on your height ({heightCm} cm) and weight ({weightKg} kg)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-primary">{bmi.toFixed(1)}</div>
            <div className="text-xl font-medium">{category}</div>
          </div>

          <div className="relative pt-8 pb-12">
            {/* Visual Scale */}
            <div className="h-4 rounded-full flex overflow-hidden">
              <div className="bg-chart-2 w-[14%]" title="Underweight (< 18.5)"></div>
              <div className="bg-primary w-[25.6%]" title="Normal (18.5 - 24.9)"></div>
              <div className="bg-chart-3 w-[20%]" title="Overweight (25.0 - 29.9)"></div>
              <div className="bg-destructive w-[40.4%]" title="Obese (≥ 30)"></div>
            </div>
            
            {/* Marker */}
            <div 
              className="absolute top-6 -ml-2 w-4 h-8 bg-foreground rounded-sm border-2 border-background shadow-sm transition-all duration-1000 ease-out"
              style={{ left: `${percent}%` }}
            >
              <div className="absolute -bottom-6 -left-4 w-12 text-center text-xs font-bold text-foreground">
                {bmi.toFixed(1)}
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-14 left-0 w-full flex justify-between text-xs text-muted-foreground font-medium px-1">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-center">
            <div className="p-2 rounded bg-chart-2/10 text-chart-2 font-medium">Underweight<br/><span className="text-xs">&lt; 18.5</span></div>
            <div className="p-2 rounded bg-primary/10 text-primary font-medium">Normal<br/><span className="text-xs">18.5 - 24.9</span></div>
            <div className="p-2 rounded bg-chart-3/10 text-chart-3 font-medium">Overweight<br/><span className="text-xs">25 - 29.9</span></div>
            <div className="p-2 rounded bg-destructive/10 text-destructive font-medium">Obese<br/><span className="text-xs">&ge; 30</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
