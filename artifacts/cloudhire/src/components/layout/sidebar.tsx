import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Calendar,
  Settings,
  Building,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Job Board", href: "/board", icon: Globe },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 border-r bg-card h-screen shrink-0 sticky top-0">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary">
          <Building className="h-5 w-5" />
          AIHire
        </Link>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-2">
          Workspace
        </div>
        {navigation.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
            
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t">
        <button className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Settings className="mr-3 h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
          Settings
        </button>
      </div>
    </div>
  );
}
