import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { readPersistedEventType } from "@/hooks/useEventContext";
import { slugForEventType } from "@/lib/eventDJsContent";
import {
  BROWSE_GATE_EVENT,
  BrowseDJsGate,
  type OpenBrowseGateDetail,
} from "@/components/event-djs/BrowseDJsGate";

/**
 * "Browse DJs" routes the customer to the event-specific listing page
 * matching whatever event context they've already chosen (or to
 * `/wedding-djs` as the default).
 */
function browseDJsPath(): string {
  return `/${slugForEventType(readPersistedEventType())}`;
}

type NavLinkSpec = {
  to: string;
  label: string;
  highlight?: "primary" | "secondary";
  /**
   * When set, clicking the link triggers the Browse-DJs gate modal instead
   * of navigating. The `to` is still used by NavLink for isActive matching.
   */
  opensBrowseGate?: boolean;
};

const STATIC_LINKS: NavLinkSpec[] = [
  { to: "/get-offers", label: "Få 3 tilbud", highlight: "primary" },
  { to: "/personal-advice", label: "Personlig Rådgivning", highlight: "secondary" },
  { to: "/how-it-works", label: "Sådan fungerer det" },
  { to: "/about", label: "Om os" },
  { to: "/faq", label: "FAQ" },
];

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Recompute the Browse-DJs link target on every navigation so the
  // NavLink's `to` (and therefore its isActive matching) stays in sync
  // with the current event-context, which may have just changed.
  const navLinks = useMemo<NavLinkSpec[]>(
    () => [
      { to: browseDJsPath(), label: "Find DJs", opensBrowseGate: true },
      ...STATIC_LINKS,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
  );

  // Browse-DJs gate state. Opened by the header link, the search icon, or
  // a `djconnect:open-browse-djs-gate` event from anywhere else (e.g. the
  // "Change" link in the listing-page filter bar).
  const [gateOpen, setGateOpen] = useState(false);
  const [gateInitial, setGateInitial] = useState<OpenBrowseGateDetail | undefined>(undefined);

  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<OpenBrowseGateDetail>).detail;
      setGateInitial(detail ?? undefined);
      setGateOpen(true);
    }
    window.addEventListener(BROWSE_GATE_EVENT, onOpen);
    return () => window.removeEventListener(BROWSE_GATE_EVENT, onOpen);
  }, []);

  function openGate(initial?: OpenBrowseGateDetail) {
    setGateInitial(initial);
    setGateOpen(true);
  }

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
                key={link.label}
                to={link.to}
                onClick={
                  link.opensBrowseGate
                    ? (e) => {
                        e.preventDefault();
                        openGate();
                      }
                    : undefined
                }
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    link.highlight === "primary"
                      ? cn(
                          "rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-3.5 py-1.5 text-white shadow-sm hover:from-rose-600 hover:to-rose-700 hover:text-white",
                          isActive && "ring-2 ring-rose-300",
                        )
                      : link.highlight === "secondary"
                        ? cn(
                            "rounded-full border border-foreground/80 bg-background px-3.5 py-1.5 text-foreground shadow-sm hover:bg-foreground hover:text-background",
                            isActive && "bg-foreground text-background",
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
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Søg DJs"
            onClick={() => openGate()}
          >
            <Search className="h-5 w-5" />
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
                  <LayoutDashboard className="h-4 w-4" /> Oversigt
                </DropdownMenuItem>
                {profile.role === "dj" && (
                  <DropdownMenuItem onClick={() => navigate("/dj/profile")}>
                    <User className="h-4 w-4" /> Rediger profil
                  </DropdownMenuItem>
                )}
                {profile.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="h-4 w-4" /> Indstillinger
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4" /> Log ud
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Log ind</Link>
              </Button>
              <Button asChild variant="accent">
                <Link to="/signup">Opret konto</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="container flex flex-col py-3">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="py-2 text-sm font-medium"
                onClick={(e) => {
                  setMobileOpen(false);
                  if (l.opensBrowseGate) {
                    e.preventDefault();
                    openGate();
                  }
                }}
              >
                {l.label}
              </Link>
            ))}
            {!profile && (
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Log ind
                  </Link>
                </Button>
                <Button asChild variant="accent" className="flex-1">
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    Opret konto
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <BrowseDJsGate open={gateOpen} onOpenChange={setGateOpen} initial={gateInitial} />
    </header>
  );
}
