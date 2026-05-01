import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, User, LogOut, LayoutDashboard, Settings, Shield } from "lucide-react";
import { BrandMark } from "@/components/common/BrandMark";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/search", label: "Browse DJs" },
  { to: "/get-offers", label: "Get 3 offers", highlight: true },
  { to: "/how-it-works", label: "How it works" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
];

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    profile?.role === "admin" ? "/admin" : profile?.role === "dj" ? "/dj/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-2.5 font-semibold">
            <BrandMark size="sm" className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" />
            <span className="text-lg tracking-tight">{PLATFORM_NAME}</span>
          </Link>
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    link.highlight
                      ? cn(
                          "rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-3.5 py-1.5 text-white shadow-sm hover:from-rose-600 hover:to-rose-700 hover:text-white",
                          isActive && "ring-2 ring-rose-300",
                        )
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Link to="/search" aria-label="Search DJs">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border p-0.5 pr-3 transition-colors hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
                    <AvatarFallback>
                      {profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{profile.full_name.split(" ")[0]}</span>
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
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                {profile.role === "dj" && (
                  <DropdownMenuItem onClick={() => navigate("/dj/profile")}>
                    <User className="h-4 w-4" /> Edit profile
                  </DropdownMenuItem>
                )}
                {profile.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="accent">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="container flex flex-col py-3">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            {!profile && (
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button asChild variant="accent" className="flex-1">
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
