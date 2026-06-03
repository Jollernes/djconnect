import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DemoDJSubProfile } from "@/lib/demoDJProfile";

/**
 * Pure text-fields half of a sub-profile editor: tagline / bio / music style
 * / signature tracks / approach / starting price. Re-used by all 3 variants.
 */
export function SubProfileTextFields({
  value,
  onChange,
  eventLabel,
  compact = false,
}: {
  value: DemoDJSubProfile;
  onChange: <K extends keyof DemoDJSubProfile>(field: K, v: DemoDJSubProfile[K]) => void;
  eventLabel: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <Label htmlFor={`tagline-${eventLabel}`}>Slogan</Label>
        <Input
          id={`tagline-${eventLabel}`}
          maxLength={80}
          placeholder={`f.eks. "${eventLabel}-DJ — moderne, varm, dansegulvet i fokus"`}
          value={value.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {value.tagline.length}/80 — vises lige under dit navn.
        </p>
      </div>

      <div>
        <Label htmlFor={`bio-${eventLabel}`}>Bio</Label>
        <Textarea
          id={`bio-${eventLabel}`}
          rows={compact ? 3 : 5}
          placeholder={`Fortæl kunderne, hvad der gør dig til den rette ${eventLabel.toLowerCase()}-DJ. Beskriv din stil, erfaring, og hvad du gør under eventet.`}
          value={value.bio}
          onChange={(e) => onChange("bio", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {value.bio.length} tegn {value.bio.length < 80 ? `(${80 - value.bio.length} mere nødvendige)` : "✓"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`musicStyle-${eventLabel}`}>Musikstil</Label>
          <Input
            id={`musicStyle-${eventLabel}`}
            placeholder="f.eks. House, disco, funk — høj energi i toppene"
            value={value.musicStyle}
            onChange={(e) => onChange("musicStyle", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`signature-${eventLabel}`}>Signatur-numre</Label>
          <Input
            id={`signature-${eventLabel}`}
            placeholder="3–5 numre, kunder måske genkender"
            value={value.signatureTracks}
            onChange={(e) => onChange("signatureTracks", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`approach-${eventLabel}`}>Din tilgang</Label>
        <Textarea
          id={`approach-${eventLabel}`}
          rows={compact ? 2 : 3}
          placeholder={`Hvordan afvikler du et ${eventLabel.toLowerCase()}? F.eks. hvornår du ankommer, hvordan du håndterer ønsker, og hvordan det typiske flow ser ud.`}
          value={value.approach}
          onChange={(e) => onChange("approach", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`price-${eventLabel}`}>Startpris for denne eventtype (kr.)</Label>
        <Input
          id={`price-${eventLabel}`}
          type="number"
          min={0}
          placeholder="Valgfrit — lad stå på 0 for at bruge din standard"
          value={value.priceFromMajor || ""}
          onChange={(e) => onChange("priceFromMajor", Number(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}
