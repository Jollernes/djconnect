import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Heart,
  Settings,
  BarChart3,
  User,
  ShieldCheck,
  Users,
  DollarSign,
  Star,
  Clapperboard,
  PartyPopper,
  Inbox,
} from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { getCustomerType } from "@/lib/customerType";
import type { Profile, UserRole } from "@/types/domain";

const corporateCustomerNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/requests", label: "My requests", icon: Inbox },
  { to: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { to: "/dashboard/favourites", label: "Favourites", icon: Heart },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const privateCustomerNav = [
  { to: "/dashboard", label: "My event", icon: PartyPopper, end: true },
  { to: "/dashboard/requests", label: "My requests", icon: Inbox },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const djNav = [
  { to: "/dj/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dj/bookings", label: "Bookings", icon: Calendar },
  { to: "/dj/messages", label: "Messages", icon: MessageSquare },
  { to: "/dj/availability", label: "Availability", icon: Calendar },
  { to: "/dj/earnings", label: "Earnings", icon: BarChart3 },
  { to: "/dj/profile", label: "Edit profile", icon: User },
];

const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/verification", label: "Verification queue", icon: ShieldCheck },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/financials", label: "Financials", icon: DollarSign },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/featured", label: "Featured DJs", icon: Clapperboard },
];

function navFor(role: UserRole, profile: Profile) {
  if (role === "dj") return djNav;
  if (role === "admin") return adminNav;
  return getCustomerType(profile) === "corporate" ? corporateCustomerNav : privateCustomerNav;
}

export function DashboardLayout() {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile) return null;
  const nav = navFor(profile.role, profile);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
          <nav className="sticky top-16 space-y-1 p-4">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-accent/15 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          {/* Mobile sub-nav */}
          <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b bg-card p-3 md:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="container py-6 md:py-8" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
