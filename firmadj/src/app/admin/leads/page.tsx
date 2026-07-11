"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStore, getEventBriefs, createProposal, updateBrief, createProposalDJ } from "@/lib/server";
import { recommendPackage, matchDJs } from "@/lib/matching";
import { formatDate, statusLabel } from "@/lib/format";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLeadsPage() {
  const [briefs, setBriefs] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getEventBriefs().then(setBriefs);
  }, []);

  async function generateProposal(briefId: string) {
    const store = await getStore();
    const brief = store.eventBriefs.find((b: any) => b.id === briefId);
    if (!brief) return;
    const existing = store.proposals.find((p: any) => p.event_brief_id === briefId);
    if (existing) {
      toast.error("Forslag findes allerede");
      return;
    }
    const pkgRec = await recommendPackage(brief);
    const pkg = store.packages.find((p: any) => p.id === pkgRec.packageId);
    const matches = await matchDJs(brief);
    const proposal = await createProposal({
      event_brief_id: briefId,
      recommended_package_id: pkg?.id,
      status: 'sent',
      price_estimate_from: pkg?.price_from || 0,
      price_estimate_to: pkg?.price_to || (pkg?.price_from || 0) * 1.2,
      vat_note: 'Priser vises ekskl. moms.',
      recommendation_reason: pkgRec.reason,
    });
    matches.forEach(async (m, i) => await createProposalDJ({
      proposal_id: proposal.id,
      dj_id: m.dj.id,
      match_score: m.score,
      match_reasons: m.reasons,
      is_platform_recommended: m.recommended,
      display_order: i + 1,
      hold_status: 'none',
    }));
    await updateBrief(briefId, { status: 'proposal_created' });
    toast.success("Forslag oprettet");
    setBriefs(await getEventBriefs());
  }

  const filtered = briefs.filter((b) => 
    b.event_type.toLowerCase().includes(filter.toLowerCase()) ||
    b.contact_name.toLowerCase().includes(filter.toLowerCase()) ||
    b.city.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
      <Input placeholder="Søg leads..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-md" />
      <div className="grid gap-4">
        {filtered.map((brief) => (
          <Card key={brief.id} className="border-slate-200">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">{statusLabel(brief.status)}</div>
                <h2 className="text-lg font-bold text-slate-900">{brief.event_type} • {formatDate(brief.event_date)}</h2>
                <p className="text-slate-600">{brief.contact_name} • {brief.company_name} • {brief.city} • {brief.guest_count_range} gæster</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => generateProposal(brief.id)} variant="outline" size="sm">Opret forslag</Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/forslag?brief=${brief.id}`}>Se forslag</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
