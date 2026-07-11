import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole("admin");
  } catch {
    redirect("/login");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/forslag", label: "Forslag" },
    { href: "/admin/bookinger", label: "Bookinger" },
    { href: "/admin/djs", label: "DJs" },
    { href: "/admin/pakker", label: "Pakker" },
    { href: "/admin/anmeldelser", label: "Anmeldelser" },
    { href: "/admin/beskeder", label: "Beskeder" },
  ];

  return <DashboardLayout role="admin" navItems={navItems}>{children}</DashboardLayout>;
}
