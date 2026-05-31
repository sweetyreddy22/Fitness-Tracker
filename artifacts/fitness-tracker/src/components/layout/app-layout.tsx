import { Link, useLocation } from "wouter";
import { 
  Activity, 
  BarChart3, 
  Dumbbell, 
  Droplet, 
  Home, 
  Scale, 
  Target, 
  UserCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/activities", label: "Activities", icon: Activity },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/water", label: "Water", icon: Droplet },
  { href: "/bmi", label: "BMI", icon: Scale },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-sidebar shrink-0 md:h-screen md:sticky md:top-0">
        <div className="p-4 md:p-6 flex items-center justify-between md:block">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-6 w-6 stroke-[3]" />
            <span className="font-bold text-lg tracking-tight uppercase">FITTRACK</span>
          </div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1 px-4 md:px-3 pb-4 md:pb-0 hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
