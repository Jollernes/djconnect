import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Disc3, User, LogOut, Users, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { markDJGuideCompleted } from "@/lib/djGuide";
import type { UserRole } from "@/types/domain";

/**
 * Dev/demo tool: a floating switcher that signs in as one of the three
 * seeded demo accounts (admin / DJ / customer) with a single click, so the
 * different role dashboards can be inspected quickly without manual logins.
 *
 * Hidden inside the mobile-preview iframe (`?vp=skip`) to avoid duplication.
 */

const DEMO_PASSWORD = "DJConnect2025!";

const ROLES: {
  role: UserRole;
  label: string;
  email: string;
  home: string;
  Icon: typeof Shield;
  accent: string;
}[] = [
  { role: "admin", label: "Admin", email: "demo-admin@djconnect.example", home: "/admin", Icon: Shield, accent: "text-violet-600" },
  { role: "dj", label: "DJ", email: "alex@djconnect.example", home: "/dj/dashboard", Icon: Disc3, accent: "text-rose-600" },
  { role: "customer", label: "Kunde", email: "demo-customer@djconnect.example", home: "/dashboard", Icon: User, accent: "text-emerald-600" },
];

export function RoleSwitcher() {
  const navigate = useNavigate();
  const { role, signInWithPassword, signOut, isConfigured } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<UserRole | null>(null);

  const skip =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("vp") === "skip";
  if (skip || !isConfigured) return null;

  async function switchTo(entry: (typeof ROLES)[number]) {
    setBusy(entry.role);
    try {
      // Demo DJ skips the mandatory onboarding guide so the switcher lands
      // straight on the dashboard (mirrors the demo login behaviour).
      if (entry.role === "dj") markDJGuideCompleted();
      await signInWithPassword(entry.email, DEMO_PASSWORD);
      toast.success(`Skiftet til ${entry.label}`);
      setOpen(false);
      navigate(entry.home);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke skifte rolle");
    } finally {
      setBusy(null);
    }
  }

  async function handleSignOut() {
    await signOut();
    toast.success("Logget ud");
    setOpen(false);
    navigate("/");
  }

  const current = ROLES.find((r) => r.role === role);

  return (
    <div className="fixed bottom-4 left-4 z-[60] print:hidden">
      {open && (
        <div className="mb-2 w-56 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skift visning
          </div>
          <div className="p-2">
            {ROLES.map((entry) => {
              const active = entry.role === role;
              return (
                <button
                  key={entry.role}
                  type="button"
                  disabled={busy !== null}
                  onClick={() => switchTo(entry)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-muted disabled:opacity-50",
                    active && "bg-muted",
                  )}
                >
                  <entry.Icon className={cn("h-4 w-4 shrink-0", entry.accent)} />
                  <span className="flex-1 font-medium">{entry.label}</span>
                  {busy === entry.role ? (
                    <span className="text-xs text-muted-foreground">…</span>
                  ) : active ? (
                    <span className="text-xs font-medium text-muted-foreground">aktiv</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {role && (
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-muted"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="font-medium">Log ud</span>
              </button>
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium shadow-lg transition hover:bg-muted"
      >
        {current ? (
          <current.Icon className={cn("h-4 w-4", current.accent)} />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
        <span>{current ? current.label : "Vælg rolle"}</span>
        <ChevronUp className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>
    </div>
  );
}
