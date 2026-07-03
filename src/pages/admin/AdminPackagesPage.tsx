import { useMemo, type ReactNode } from "react";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePackage, useStore } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";

export function AdminPackagesPage() {
  useDanishPageSeo({
    title: "Pakker",
    description: "Redigér de pakker, der driver platformens anbefalinger.",
    canonical: "/admin/pakker",
  });

  const packages = useStore((snapshot) => snapshot.packages);
  const sorted = useMemo(() => [...packages].sort((a, b) => a.display_order - b.display_order), [packages]);

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Pakker" description="Pris, inkluderede ydelser og aktiv status." />
      <div className="grid gap-4 xl:grid-cols-3">
        {sorted.map((pkg) => (
          <Card key={pkg.id} className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  updatePackage(pkg.id, {
                    name: String(formData.get("name") ?? pkg.name),
                    description: String(formData.get("description") ?? pkg.description),
                    best_for: String(formData.get("best_for") ?? pkg.best_for),
                    price_from: Number(formData.get("price_from") ?? pkg.price_from),
                    price_to: String(formData.get("price_to") ?? "") ? Number(formData.get("price_to")) : null,
                    hours_included: Number(formData.get("hours_included") ?? pkg.hours_included),
                    sound_included: formData.get("sound_included") === "on",
                    lighting_included: formData.get("lighting_included") === "on",
                    microphone_included: formData.get("microphone_included") === "on",
                    technical_coordination_included: formData.get("technical_coordination_included") === "on",
                    active: formData.get("active") === "on",
                    display_order: Number(formData.get("display_order") ?? pkg.display_order),
                  });
                }}
              >
                <Field label="Navn"><Input name="name" defaultValue={pkg.name} /></Field>
                <Field label="Beskrivelse"><Textarea name="description" className="min-h-24" defaultValue={pkg.description} /></Field>
                <Field label="Best for"><Textarea name="best_for" className="min-h-20" defaultValue={pkg.best_for} /></Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Pris fra"><Input name="price_from" type="number" defaultValue={pkg.price_from} /></Field>
                  <Field label="Pris til"><Input name="price_to" type="number" defaultValue={pkg.price_to ?? ""} /></Field>
                  <Field label="Timer"><Input name="hours_included" type="number" defaultValue={pkg.hours_included} /></Field>
                  <Field label="Rækkefølge"><Input name="display_order" type="number" defaultValue={pkg.display_order} /></Field>
                </div>
                <div className="grid gap-3 rounded-3xl border border-border/60 bg-muted/20 p-4">
                  <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="sound_included" defaultChecked={pkg.sound_included} /> Lyd</label>
                  <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="lighting_included" defaultChecked={pkg.lighting_included} /> Lys</label>
                  <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="microphone_included" defaultChecked={pkg.microphone_included} /> Mikrofon</label>
                  <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="technical_coordination_included" defaultChecked={pkg.technical_coordination_included} /> Teknisk koordinering</label>
                  <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={pkg.active} /> Aktiv</label>
                </div>
                <Button type="submit" variant="accent" className="w-full">Gem</Button>
              </form>
            </CardContent>
          </Card>
        ))}
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
