import { Link, useSearchParams } from "react-router-dom";
import type { SetURLSearchParams } from "react-router-dom";
import { Filter, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { formatDanishDateShort } from "@/lib/utils";
import { useDanishPageSeo } from "@/lib/seo";
import { EVENT_TYPE_OPTIONS, REGION_OPTIONS } from "@/lib/constants";
import { BOOKING_STATUS_META, type BookingStatus } from "@/types/domain";

const STATUS_OPTIONS = Object.entries(BOOKING_STATUS_META) as Array<[keyof typeof BOOKING_STATUS_META, (typeof BOOKING_STATUS_META)[keyof typeof BOOKING_STATUS_META]]>;

export function AdminLeadsPage() {
  useDanishPageSeo({
    title: "Leads",
    description: "Kort overblik over alle indkomne brief og deres status.",
    canonical: "/admin/leads",
  });

  const [params, setParams] = useSearchParams();
  const briefs = useStore((snapshot) => snapshot.eventBriefs);
  const proposals = useStore((snapshot) => snapshot.proposals);
  const statusFilter = params.get("status") ?? "all";
  const regionFilter = params.get("region") ?? "all";
  const eventTypeFilter = params.get("eventType") ?? "all";

  const filtered = useMemo(() => {
    return briefs.filter((brief) => {
      if (statusFilter !== "all" && brief.status !== statusFilter) return false;
      if (regionFilter !== "all" && brief.region !== regionFilter) return false;
      if (eventTypeFilter !== "all" && brief.event_type !== eventTypeFilter) return false;
      return true;
    });
  }, [briefs, statusFilter, regionFilter, eventTypeFilter]);

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Leads" description="Event briefs og tilhørende forslag." />

      <Card className="border-border/60 shadow-sm">
        <CardContent className="grid gap-3 p-5 md:grid-cols-4">
          <Select value={statusFilter} onValueChange={(value) => updateParams(setParams, params, "status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statusser</SelectItem>
              {STATUS_OPTIONS.map(([status, meta]) => (
                <SelectItem key={status} value={status}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={(value) => updateParams(setParams, params, "region", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle regioner</SelectItem>
              {REGION_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={eventTypeFilter} onValueChange={(value) => updateParams(setParams, params, "eventType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Eventtype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle eventtyper</SelectItem>
              {EVENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setParams({})}>
            <Filter className="mr-2 h-4 w-4" />
            Nulstil filtre
          </Button>
        </CardContent>
      </Card>

      {filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((brief) => {
            const proposal = proposals.find((item) => item.event_brief_id === brief.id) ?? null;
            return (
              <Card key={brief.id} className="border-border/60 shadow-sm">
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{brief.company_name}</h3>
                      {brief.status === "archived" ? <Badge variant="outline">Arkiveret</Badge> : <BookingStatusBadge status={brief.status as BookingStatus} />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {brief.event_type} · {brief.region} · {brief.city} · {formatDanishDateShort(brief.event_date)}
                    </p>
                    <p className="text-sm text-muted-foreground">{brief.guest_count_range} · {brief.budget_band}</p>
                    {proposal ? <Badge variant="secondary">Proposal oprettet</Badge> : <Badge variant="outline">Ingen proposal endnu</Badge>}
                  </div>
                  <Button asChild variant="accent">
                    <Link to={`/admin/leads/${brief.id}`}>Åbn lead</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Ingen leads matcher filtrene"
          description="Prøv at nulstille eller ændre filtrene."
          action={
            <Button variant="accent" onClick={() => setParams({})}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Nulstil filtre
            </Button>
          }
        />
      )}
    </Container>
  );
}

function updateParams(setParams: SetURLSearchParams, current: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(current);
  if (value === "all") {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  setParams(next);
}
