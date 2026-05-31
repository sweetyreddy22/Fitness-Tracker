import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";

// Pages
import Dashboard from "@/pages/dashboard";
import Activities from "@/pages/activities";
import Workouts from "@/pages/workouts";
import Goals from "@/pages/goals";
import Water from "@/pages/water";
import Bmi from "@/pages/bmi";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/activities" component={Activities} />
        <Route path="/workouts" component={Workouts} />
        <Route path="/goals" component={Goals} />
        <Route path="/water" component={Water} />
        <Route path="/bmi" component={Bmi} />
        <Route path="/reports" component={Reports} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
