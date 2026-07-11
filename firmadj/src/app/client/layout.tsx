import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole("client");
  } catch {
    redirect("/login");
  }

  const navItems = [
    { href: "/client", label: "Dashboard" },
    { href: "/client/arrangementer", label: "Arrangementer" },
    { href: "/client/forslag", label: "Forslag" },
    { href: "/client/beskeder", label: "Beskeder" },
    { href: "/client/spoergeskema", label: "Spørgeskema" },
    { href: "/client/dokumenter", label: "Dokumenter" },
    { href: "/client/genbook", label: "Genbook" },
  ];

  return <DashboardLayout role="client" navItems={navItems}>{children}</DashboardLayout>;
}
