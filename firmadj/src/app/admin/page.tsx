import { Card, CardContent } from "@/components/ui/card";
import { getAdminDashboard } from "@/lib/server";
import { statusLabel, formatDate } from "@/lib/format";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Nye leads", value: data.counts.leads, href: "/admin/leads" },
          { label: "Forslag", value: data.counts.proposals, href: "/admin/forslag" },
          { label: "Bookinger", value: data.counts.bookings, href: "/admin/bookinger" },
          { label: "DJs", value: data.counts.djs, href: "/admin/djs" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="border-slate-200 hover:border-amber-300 transition">
              <CardContent className="p-6">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="text-3xl font-bold text-slate-900">{item.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nye leads</h2>
            <div className="space-y-3">
              {data.recentBriefs.map((brief: any) => (
                <div key={brief.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{brief.event_type}</div>
                    <div className="text-xs text-slate-500">{brief.contact_name} • {brief.company_name}</div>
                  </div>
                  <div className="text-sm text-slate-500">{statusLabel(brief.status)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Kommende bookinger</h2>
            <div className="space-y-3">
              {data.upcomingBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{statusLabel(booking.status)}</div>
                    <div className="text-xs text-slate-500">{formatDate(booking.event_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
