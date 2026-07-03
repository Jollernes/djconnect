import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { availabilityFreshness } from "@/lib/matching";
import { setDJAvailabilityOverride, updateBookingStatus, updateDJ, useStore } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { formatDanishDateShort } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { DJAvailabilityStatus, VibeTag } from "@/types/domain";

const profileSchema = z.object({
  bio_short: z.string().min(10, "Skriv en kort bio."),
  specialties: z.string().min(2, "Skriv mindst ét speciale."),
  sample_mix_url: z.string().optional().or(z.literal("")),
  photo_url: z.string().optional().or(z.literal("")),
  equipment_sound: z.boolean(),
  equipment_lighting: z.boolean(),
  can_handle_speeches: z.boolean(),
  can_provide_mc: z.boolean(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function DJDashboardPage() {
  const { profile } = useAuth();
  const dj = useStore((snapshot) => (profile?.role === "dj" ? snapshot.djs.find((item) => item.id === profile.id) ?? null : null));
  const bookings = useStore((snapshot) => (dj ? snapshot.bookings.filter((booking) => booking.selected_dj_id === dj.id).sort((a, b) => b.created_at.localeCompare(a.created_at)) : []));
  const briefs = useStore((snapshot) => snapshot.eventBriefs);
  const availabilityRows = useStore((snapshot) => {
    if (!dj) return [];
    const rows: Array<{ date: string; status: DJAvailabilityStatus; updated_at: string }> = [];
    const base = new Date();
    for (let offset = 0; offset < 70; offset += 1) {
      const date = new Date(base.getTime() + offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const override = snapshot.djAvailabilityOverrides.find((item) => item.dj_id === dj.id && item.date === date);
      rows.push({
        date,
        status: (override?.status ?? "available") as DJAvailabilityStatus,
        updated_at: override?.updated_at ?? dj.last_availability_update,
      });
    }
    return rows;
  });

  useDanishPageSeo({
    title: "DJ-dashboard",
    description: "Tilgængelighed, bookinger og profil for partner-DJ'en.",
    canonical: "/dj",
  });

  const freshness = useMemo(() => (dj ? availabilityFreshness(dj) : null), [dj]);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: dj
      ? {
          bio_short: dj.bio_short,
          specialties: dj.specialties.join(", "),
          sample_mix_url: dj.sample_mix_url ?? "",
          photo_url: dj.photo_url ?? "",
          equipment_sound: dj.equipment_sound,
          equipment_lighting: dj.equipment_lighting,
          can_handle_speeches: dj.can_handle_speeches,
          can_provide_mc: dj.can_provide_mc,
        }
      : {
          bio_short: "",
          specialties: "",
          sample_mix_url: "",
          photo_url: "",
          equipment_sound: true,
          equipment_lighting: true,
          can_handle_speeches: true,
          can_provide_mc: false,
        },
  });

  const equipmentSound = useWatch({ control: profileForm.control, name: "equipment_sound" }) ?? false;
  const equipmentLighting = useWatch({ control: profileForm.control, name: "equipment_lighting" }) ?? false;
  const canHandleSpeeches = useWatch({ control: profileForm.control, name: "can_handle_speeches" }) ?? false;
  const canProvideMc = useWatch({ control: profileForm.control, name: "can_provide_mc" }) ?? false;

  if (!dj || !profile || profile.role !== "dj") {
    return (
      <Container className="py-10">
        <EmptyState
          title="DJ-profilen blev ikke fundet"
          description="Denne demo-DJ kunne ikke indlæses."
          action={
            <Button asChild>
              <Link to="/login">Log ind igen</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const completeness = Math.round(
    [
      dj.bio_short,
      dj.specialties.length > 0,
      Boolean(dj.sample_mix_url),
      dj.equipment_sound,
      dj.equipment_lighting,
      dj.can_handle_speeches,
    ].filter(Boolean).length * (100 / 6),
  );
  const currentDj = dj;

  function cycleStatus(status: DJAvailabilityStatus): DJAvailabilityStatus {
    const statuses: DJAvailabilityStatus[] = ["available", "tentative", "booked", "unavailable"];
    return statuses[(statuses.indexOf(status) + 1) % statuses.length];
  }

  function onProfileSubmit(values: ProfileValues) {
    updateDJ(currentDj.id, {
      bio_short: values.bio_short.trim(),
      specialties: values.specialties.split(",").map((item) => item.trim()).filter(Boolean),
      sample_mix_url: values.sample_mix_url?.trim() ? values.sample_mix_url.trim() : null,
      photo_url: values.photo_url?.trim() ? values.photo_url.trim() : null,
      equipment_sound: values.equipment_sound,
      equipment_lighting: values.equipment_lighting,
      can_handle_speeches: values.can_handle_speeches,
      can_provide_mc: values.can_provide_mc,
      vibe_tags: currentDj.vibe_tags as VibeTag[],
    });
  }

  return (
    <Container className="py-8 lg:py-10">
      <div className="space-y-8">
        <SectionHeading eyebrow="DJ-dashboard" title={dj.public_display_name} description="Tilgængelighed, eventforespørgsler og profil på ét sted." />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Profilstatus" value={`${completeness}%`} caption="Kvalitet og fuldendthed" />
          <StatCard title="Tilgængelighed" value={`${freshness?.score ?? 0}%`} caption={freshness?.isStale ? "Opdatér din tilgængelighed" : "Frisk tilgængelighed"} />
          <StatCard title="Rostertype" value={currentDj.roster_layer === "core" ? "Kerne" : "Ekstra"} caption="Aktiv i partnernetværket" />
          <StatCard title="Tildelte events" value={`${bookings.length}`} caption="Bookinger i demoen" />
        </div>

        <Card className="border-border/60 bg-muted/20 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Opdatér din tilgængelighed</p>
              <p className="text-sm text-muted-foreground">{freshness?.tooStale ? "Din seneste opdatering er for gammel — det er tid til at opdatere kalenderen." : "Hold kalenderen frisk, så matchene bliver bedre."}</p>
            </div>
            <Button asChild variant="accent">
              <a href="#availability">Åbn kalender</a>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card id="availability" className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Tilgængelighed</CardTitle>
              <CardDescription>Skift status på datoer de næste 10 uger.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availabilityRows.map((row) => (
                <div key={row.date} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{formatDanishDateShort(row.date)}</p>
                    <p className="text-sm text-muted-foreground">Opdateret {formatDanishDateShort(row.updated_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AvailabilityBadge status={row.status} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setDJAvailabilityOverride({
                          id: `${currentDj.id}_${row.date}`,
                          dj_id: currentDj.id,
                          date: row.date,
                          status: cycleStatus(row.status),
                          notes: null,
                          updated_at: new Date().toISOString(),
                        })
                      }
                    >
                      Skift status
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Eventforespørgsler</CardTitle>
                <CardDescription>Bookinger der er koblet til din profil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookings.length ? (
                  bookings.map((booking) => {
                    const brief = briefs.find((item) => item.id === booking.event_brief_id);
                    return (
                      <div key={booking.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{booking.company_name}</p>
                            <p className="text-muted-foreground">{brief ? `${formatDanishDateShort(brief.event_date)} · ${brief.city}` : "Eventdetaljer mangler"}</p>
                          </div>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <p className="mt-2 text-muted-foreground">Prisestimat: {booking.final_price.toLocaleString("da-DK")} kr. ekskl. moms</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="accent" onClick={() => updateBookingStatus(booking.id, "confirmed")}>
                            Accepter
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, "cancelled")}>
                            Afvis
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">Ingen tildelte bookinger endnu.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Din offentlige profil</CardTitle>
                <CardDescription>Opdatér det, som kunderne kan se.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="bio_short">Kort bio</Label>
                    <Textarea id="bio_short" className="min-h-28" {...profileForm.register("bio_short")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialer</Label>
                    <Input id="specialties" {...profileForm.register("specialties")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sample_mix_url">Prøvemix URL</Label>
                    <Input id="sample_mix_url" {...profileForm.register("sample_mix_url")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo_url">Profilbillede URL</Label>
                    <Input id="photo_url" {...profileForm.register("photo_url")} />
                  </div>
                  <div className="grid gap-3 rounded-3xl border border-border/60 bg-muted/20 p-4">
                    <label className="flex items-center gap-3 text-sm">
                      <Checkbox checked={equipmentSound} onCheckedChange={(checked) => profileForm.setValue("equipment_sound", Boolean(checked), { shouldValidate: true })} />
                      Lyd
                    </label>
                    <label className="flex items-center gap-3 text-sm">
                      <Checkbox checked={equipmentLighting} onCheckedChange={(checked) => profileForm.setValue("equipment_lighting", Boolean(checked), { shouldValidate: true })} />
                      Lys
                    </label>
                    <label className="flex items-center gap-3 text-sm">
                      <Checkbox checked={canHandleSpeeches} onCheckedChange={(checked) => profileForm.setValue("can_handle_speeches", Boolean(checked), { shouldValidate: true })} />
                      Mikrofon og taler
                    </label>
                    <label className="flex items-center gap-3 text-sm">
                      <Checkbox checked={canProvideMc} onCheckedChange={(checked) => profileForm.setValue("can_provide_mc", Boolean(checked), { shouldValidate: true })} />
                      MC
                    </label>
                  </div>
                  <Button type="submit" variant="accent" className="w-full">
                    Gem profil
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}

function StatCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-2 p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  );
}

function AvailabilityBadge({ status }: { status: DJAvailabilityStatus }) {
  const classes: Record<DJAvailabilityStatus, string> = {
    available: "border-emerald-200 bg-emerald-50 text-emerald-800",
    tentative: "border-amber-200 bg-amber-50 text-amber-800",
    booked: "border-sky-200 bg-sky-50 text-sky-800",
    unavailable: "border-slate-200 bg-slate-100 text-slate-700",
  };
  return <Badge variant="outline" className={classes[status]}>{status}</Badge>;
}
