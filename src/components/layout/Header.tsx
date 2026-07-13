import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { BrandMark } from "@/components/common/BrandMark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { PLATFORM_NAME } from "@/lib/constants";
import { USE_CASE_CONFIGS } from "@/lib/useCases";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Forside" },
  { to: "/pakker", label: "Pakker" },
  { to: "/saadan-fungerer-det", label: "Sådan fungerer det" },
  { to: "/tryghed-og-kvalitet", label: "Tryghed og kvalitet" },
  { to: "/faq", label: "FAQ" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

const useCaseLinks = Object.values(USE_CASE_CONFIGS).map((config) => ({
  to: config.path,
  label: config.title,
}));

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = profile?.role === "admin" ? "/admin" : profile?.role === "dj" ? "/dj" : "/client";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-semibold text-foreground">
          <BrandMark size="sm" />
          <span className="tracking-tight">{PLATFORM_NAME}</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 xl:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn("text-sm font-medium transition-colors hover:text-foreground", isActive ? "text-foreground" : "text-muted-foreground")
              }
            >
              {link.label}
            </NavLink>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Firmaevents <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64">
              {useCaseLinks.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  <Link to={link.to}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="accent" className="hidden sm:inline-flex">
            <Link to="/brief">Tjek dato</Link>
          </Button>

          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border/60 bg-card px-3 pr-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted/60">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {profile.full_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">Min profil</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{profile.full_name}</span>
                    <span className="text-xs text-muted-foreground">{profile.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Mit område
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/login")}>
                  <User className="mr-2 h-4 w-4" />
                  Skift profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log ud
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Log ind</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Åbn menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border/60 bg-background xl:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-accent/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 rounded-2xl border border-border/60 bg-muted/30 p-3">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Firmaevents</p>
              {useCaseLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block rounded-xl px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex gap-2 px-1">
              <Button asChild variant="accent" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Link to="/brief">Tjek dato</Link>
              </Button>
              {profile ? (
                <Button asChild variant="outline" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Link to={dashboardPath}>Mit område</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Link to="/login">Log ind</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
