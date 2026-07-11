import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DJLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole("dj");
  } catch {
    redirect("/login");
  }

  const navItems = [
    { href: "/dj", label: "Dashboard" },
    { href: "/dj/onboarding", label: "Onboarding" },
    { href: "/dj/profile", label: "Profil" },
    { href: "/dj/availability", label: "Tilgængelighed" },
    { href: "/dj/tilbud", label: "Tilbud" },
    { href: "/dj/arrangementer", label: "Arrangementer" },
    { href: "/dj/beskeder", label: "Beskeder" },
  ];

  return <DashboardLayout role="dj" navItems={navItems}>{children}</DashboardLayout>;
}
