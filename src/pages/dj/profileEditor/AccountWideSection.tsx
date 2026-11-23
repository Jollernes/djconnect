import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_TYPES, SETUP_SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DJProfileEditorState } from "./useEditorState";

/**
 * Collapsed-by-default "Account-wide details" section. Identical across all
 * three variants — these fields apply to every sub-profile so the DJ
 * doesn't have to repeat them.
 */
export function AccountWideSection({ state }: { state: DJProfileEditorState }) {
  const [open, setOpen] = useState(false);
  const {
    stageName, setStageName,
    bio, setBio,
    equipment, setEquipment,
    setupSize, setSetupSize,
    travelRadius, setTravelRadius,
    priceFrom, setPriceFrom,
    priceOnRequest, setPriceOnRequest,
    selectedEventTypes, toggleEventType,
    profilePhotoUrl,
    equipmentPhotoUrls,
  } = state;

  return (
    <Card>
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Deles på tværs af alle underprofiler
            </p>
            <h2 className="mt-1 text-lg font-semibold">Kontoomfattende detaljer</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Kunstnernavn, foto, udstyr, prissætning og rejse — disse forbliver de samme uanset eventtype.
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-5 border-t border-border/60 px-6 py-5">
                {profilePhotoUrl && (
                  <div className="flex items-center gap-3">
                    <img
                      src={profilePhotoUrl}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dette er det foto, kunder ser i søgningen og på hver underprofil.
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="stageName">Kunstnernavn</Label>
                  <Input id="stageName" value={stageName} onChange={(e) => setStageName(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="generalBio">Standardbio</Label>
                  <Textarea id="generalBio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    En kort generisk bio. Hver underprofil har sin egen bio, som kunder ser for den eventtype.
                  </p>
                </div>

                {equipmentPhotoUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {equipmentPhotoUrls.slice(0, 6).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="aspect-square w-full rounded-md object-cover ring-1 ring-border"
                      />
                    ))}
                  </div>
                )}
                <div>
                  <Label htmlFor="equipment">Udstyrsbeskrivelse</Label>
                  <Textarea id="equipment" rows={4} value={equipment} onChange={(e) => setEquipment(e.target.value)} />
                </div>
                <div>
                  <Label>Opsætningsstørrelse</Label>
                  <Select value={setupSize} onValueChange={(v) => setSetupSize(v as typeof setupSize)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SETUP_SIZES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label} — {s.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Eventtyper du accepterer</Label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {EVENT_TYPES.map((et) => (
                      <label key={et.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                        <Checkbox
                          checked={selectedEventTypes.includes(et.id)}
                          onCheckedChange={() => toggleEventType(et.id)}
                        />
                        {et.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm">Pris på forespørgsel</span>
                      <Switch checked={priceOnRequest} onCheckedChange={setPriceOnRequest} />
                    </label>
                    {!priceOnRequest && (
                      <div className="mt-3">
                        <Label htmlFor="priceFrom">Standard startpris (kr.)</Label>
                        <Input
                          id="priceFrom"
                          type="number"
                          min={0}
                          value={priceFrom}
                          onChange={(e) => setPriceFrom(Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="travelRadius">Rejseradius (km)</Label>
                    <Input
                      id="travelRadius"
                      type="number"
                      min={0}
                      value={travelRadius}
                      onChange={(e) => setTravelRadius(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
