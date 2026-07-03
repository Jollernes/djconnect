import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, ListChecks, BadgeDollarSign, Megaphone, MessagesSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navByRole: Record<
  "client" | "dj" | "admin",
  Array<{ to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }>
> = {
  client: [
    { to: "/client", label: "Oversigt", icon: LayoutDashboard, end: true },
    { to: "/brief", label: "Opret brief", icon: ListChecks },
  ],
  dj: [
    { to: "/dj", label: "Oversigt", icon: LayoutDashboard, end: true },
  ],
  admin: [
    { to: "/admin", label: "Oversigt", icon: LayoutDashboard, end: true },
    { to: "/admin/leads", label: "Leads", icon: ListChecks },
    { to: "/admin/bookings", label: "Bookinger", icon: Calendar },
    { to: "/admin/djs", label: "DJ'er", icon: Users },
    { to: "/admin/pakker", label: "Pakker", icon: BadgeDollarSign },
    { to: "/admin/anmeldelser", label: "Anmeldelser", icon: Megaphone },
    { to: "/admin/indhold", label: "Indhold", icon: MessagesSquare },
  ],
} as const;

export function DashboardLayout() {
  const { profile } = useAuth();
  const role = profile?.role ?? "client";
  const nav = navByRole[role];

  return (
    <div className="min-h-screen bg-muted/20 md:flex">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-background md:flex md:flex-col">
        <div className="border-b border-border/60 px-5 py-5">
          <p className="text-sm font-medium text-muted-foreground">{profile?.full_name ?? "Demo-område"}</p>
          <p className="text-xs text-muted-foreground">{role === "admin" ? "Operations console" : role === "dj" ? "DJ-portal" : "Kundeportal"}</p>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b bg-background md:hidden">
          <div className="container flex min-h-14 items-center gap-4 py-3">
            <p className="text-sm font-medium text-muted-foreground">{profile?.full_name ?? "Demo-område"}</p>
            <div className="ml-auto flex items-center gap-2 overflow-x-auto">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        <div className="container py-6 md:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
