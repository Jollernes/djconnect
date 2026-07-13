import { Link, useParams } from "react-router-dom";
import { useMemo, type ReactNode } from "react";
import { useWatch, useForm, type Resolver } from "react-hook-form";
import { CheckCircle2, Save, XCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addAdminNote, approveDJApplication, rejectDJApplication, updateDJ, useStore } from "@/lib/store";
import { availabilityFreshness } from "@/lib/matching";
import { useDanishPageSeo } from "@/lib/seo";

const profileSchema = z.object({
  bio_short: z.string().min(10),
  legal_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  city: z.string().min(2),
  specialties: z.string().min(2),
  photo_url: z.string().optional().or(z.literal("")),
  sample_mix_url: z.string().optional().or(z.literal("")),
  equipment_sound: z.boolean(),
  equipment_lighting: z.boolean(),
  can_handle_speeches: z.boolean(),
  can_provide_mc: z.boolean(),
  roster_layer: z.enum(["core", "extended"] as const),
  status: z.enum(["pending", "approved", "inactive"] as const),
  approved_for_shortlist: z.boolean(),
  profile_quality_score: z.coerce.number().min(0).max(100),
  reliability_score: z.coerce.number().min(0).max(100),
});

const noteSchema = z.object({
  note: z.string().min(2, "Skriv en note."),
});

type ProfileValues = z.infer<typeof profileSchema>;
type NoteValues = z.infer<typeof noteSchema>;

export function AdminDJDetailPage() {
  const { id } = useParams();
  const djs = useStore((snapshot) => snapshot.djs);
  const applications = useStore((snapshot) => snapshot.djApplications);
  const notes = useStore((snapshot) => snapshot.adminNotes.filter((note) => note.related_type === "dj" && note.related_id === id));
  const dj = id ? djs.find((item) => item.id === id) ?? null : null;
  const linkedApps = useMemo(() => applications.filter((application) => application.email === dj?.email || application.stage_name === dj?.stage_name), [applications, dj]);
  const freshness = dj ? availabilityFreshness(dj) : null;

  useDanishPageSeo({
    title: dj ? `DJ: ${dj.public_display_name}` : "DJ-detalje",
    description: "Detaljer, profil, kvalitet og tilknyttede ansøgninger.",
    canonical: id ? `/admin/djs/${id}` : "/admin/djs",
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileValues>,
    defaultValues: dj
      ? {
          bio_short: dj.bio_short,
          legal_name: dj.legal_name,
          email: dj.email,
          phone: dj.phone ?? "",
          city: dj.city,
          specialties: dj.specialties.join(", "),
          photo_url: dj.photo_url ?? "",
          sample_mix_url: dj.sample_mix_url ?? "",
          equipment_sound: dj.equipment_sound,
          equipment_lighting: dj.equipment_lighting,
          can_handle_speeches: dj.can_handle_speeches,
          can_provide_mc: dj.can_provide_mc,
          roster_layer: dj.roster_layer,
          status: dj.status,
          approved_for_shortlist: dj.approved_for_shortlist,
          profile_quality_score: dj.profile_quality_score,
          reliability_score: dj.reliability_score,
        }
      : undefined,
  });
  const noteForm = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: { note: "" } });

  const equipmentSound = useWatch({ control: profileForm.control, name: "equipment_sound" }) ?? false;
  const equipmentLighting = useWatch({ control: profileForm.control, name: "equipment_lighting" }) ?? false;
  const canHandleSpeeches = useWatch({ control: profileForm.control, name: "can_handle_speeches" }) ?? false;
  const canProvideMc = useWatch({ control: profileForm.control, name: "can_provide_mc" }) ?? false;
  const approvedForShortlist = useWatch({ control: profileForm.control, name: "approved_for_shortlist" }) ?? false;

  if (!dj) {
    return (
      <Container className="py-10">
        <EmptyState
          title="DJ'en blev ikke fundet"
          description="Vi kunne ikke finde den ønskede DJ."
          action={
            <Button asChild>
              <Link to="/admin/djs">Tilbage til DJs</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const currentDj = dj;
  function onProfileSubmit(values: ProfileValues) {
    updateDJ(currentDj.id, {
      bio_short: values.bio_short,
      legal_name: values.legal_name,
      email: values.email,
      phone: values.phone?.trim() ? values.phone : null,
      city: values.city,
      specialties: values.specialties.split(",").map((item) => item.trim()).filter(Boolean),
      photo_url: values.photo_url?.trim() ? values.photo_url.trim() : null,
      sample_mix_url: values.sample_mix_url?.trim() ? values.sample_mix_url.trim() : null,
      equipment_sound: values.equipment_sound,
      equipment_lighting: values.equipment_lighting,
      can_handle_speeches: values.can_handle_speeches,
      can_provide_mc: values.can_provide_mc,
      roster_layer: values.roster_layer,
      status: values.status,
      approved_for_shortlist: values.approved_for_shortlist,
      profile_quality_score: values.profile_quality_score,
      reliability_score: values.reliability_score,
    });
  }

  function onNoteSubmit(values: NoteValues) {
    addAdminNote({
      related_type: "dj",
      related_id: currentDj.id,
      note: values.note,
    });
    noteForm.reset();
  }

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title={currentDj.public_display_name} description={`${currentDj.city} · ${currentDj.regions.join(", ")}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Profil og kontakt</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Juridisk navn" value={currentDj.legal_name} />
            <InfoRow label="E-mail" value={currentDj.email} />
            <InfoRow label="Telefon" value={currentDj.phone ?? "Ingen telefon"} />
            <InfoRow label="Regioner" value={currentDj.regions.join(", ")} />
            <InfoRow label="Tilgængelighed" value={`${freshness?.score ?? 0}%`} />
            <InfoRow label="Status" value={currentDj.status} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <Badge variant="secondary">Freshed {freshness?.score ?? 0}%</Badge>
            <p className="text-sm text-muted-foreground">{freshness?.isStale ? "Stale — opdatér kalenderen." : "Frisk nok til shortlist."}</p>
            <div className="flex gap-2">
              <Button variant="accent" onClick={() => updateDJ(currentDj.id, { status: "approved" })}>Godkend</Button>
              <Button variant="outline" onClick={() => updateDJ(currentDj.id, { status: "inactive" })}>Inaktiv</Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => updateDJ(currentDj.id, { approved_for_shortlist: !currentDj.approved_for_shortlist })}>
              {currentDj.approved_for_shortlist ? "Fjern fra shortlist" : "Godkend til shortlist"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Redigér profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Field label="Kort bio"><Textarea className="min-h-24" {...profileForm.register("bio_short")} /></Field>
              <Field label="Specialer"><Input {...profileForm.register("specialties")} /></Field>
              <Field label="Prøvemix"><Input {...profileForm.register("sample_mix_url")} /></Field>
              <Field label="Profilfoto"><Input {...profileForm.register("photo_url")} /></Field>
              <Field label="By"><Input {...profileForm.register("city")} /></Field>
              <Field label="Juridisk navn"><Input {...profileForm.register("legal_name")} /></Field>
              <Field label="E-mail"><Input {...profileForm.register("email")} /></Field>
              <Field label="Telefon"><Input {...profileForm.register("phone")} /></Field>
              <Field label="Profilkvalitet"><Input type="number" {...profileForm.register("profile_quality_score")} /></Field>
              <Field label="Pålidelighed"><Input type="number" {...profileForm.register("reliability_score")} /></Field>
              <Field label="Roster layer">
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...profileForm.register("roster_layer")}>
                  <option value="core">Kerne</option>
                  <option value="extended">Ekstra</option>
                </select>
              </Field>
              <Field label="Status">
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...profileForm.register("status")}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
              <div className="md:col-span-2 grid gap-3 rounded-3xl border border-border/60 bg-muted/20 p-4">
                <label className="flex items-center gap-3 text-sm"><Checkbox checked={Boolean(equipmentSound)} onCheckedChange={(checked) => profileForm.setValue("equipment_sound", Boolean(checked), { shouldValidate: true })} /> Lyd</label>
                <label className="flex items-center gap-3 text-sm"><Checkbox checked={Boolean(equipmentLighting)} onCheckedChange={(checked) => profileForm.setValue("equipment_lighting", Boolean(checked), { shouldValidate: true })} /> Lys</label>
                <label className="flex items-center gap-3 text-sm"><Checkbox checked={Boolean(canHandleSpeeches)} onCheckedChange={(checked) => profileForm.setValue("can_handle_speeches", Boolean(checked), { shouldValidate: true })} /> Mikrofon og taler</label>
                <label className="flex items-center gap-3 text-sm"><Checkbox checked={Boolean(canProvideMc)} onCheckedChange={(checked) => profileForm.setValue("can_provide_mc", Boolean(checked), { shouldValidate: true })} /> MC</label>
                <label className="flex items-center gap-3 text-sm"><Checkbox checked={Boolean(approvedForShortlist)} onCheckedChange={(checked) => profileForm.setValue("approved_for_shortlist", Boolean(checked), { shouldValidate: true })} /> Godkendt til shortlist</label>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="accent">
                  <Save className="mr-2 h-4 w-4" />
                  Gem
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Ansøgninger og noter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedApps.map((application) => (
              <div key={application.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                <p className="font-medium">{application.stage_name}</p>
                <p className="text-muted-foreground">{application.city} · {application.email}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="accent" onClick={() => approveDJApplication(application.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectDJApplication(application.id)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Afvis
                  </Button>
                </div>
              </div>
            ))}
            <form className="space-y-3" onSubmit={noteForm.handleSubmit(onNoteSubmit)}>
              <Textarea className="min-h-24" placeholder="Intern note" {...noteForm.register("note")} />
              <div className="flex justify-end">
                <Button type="submit" variant="outline">Gem note</Button>
              </div>
            </form>
            {notes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-border/60 p-3 text-sm">
                {note.note}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
