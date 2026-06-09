import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Globe,
  LogOut,
  Building,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Job Board", href: "/board", icon: Globe },
];

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Sidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  return (
    <div className="flex flex-col w-64 border-r bg-card h-screen shrink-0 sticky top-0">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary">
          <Building className="h-5 w-5" />
          AIHire
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 py-6 overflow-y-auto px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-2">
          Workspace
        </div>
        {navigation.map((item) => {
          const isActive =
            location === item.href ||
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
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User widget */}
      <div className="p-4 border-t">
        {isLoaded && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left group">
                {/* Avatar */}
                <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.fullName ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">
                      {(user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {user.fullName ?? "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-52">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectUrl: `${basePath}/` })}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex w-full items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              <div className="h-2.5 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
