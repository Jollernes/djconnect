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
        <Label htmlFor={`tagline-${eventLabel}`}>Tagline</Label>
        <Input
          id={`tagline-${eventLabel}`}
          maxLength={80}
          placeholder={`e.g. "${eventLabel} DJ — modern, warm, dancefloor-first"`}
          value={value.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {value.tagline.length}/80 — shown right under your name.
        </p>
      </div>

      <div>
        <Label htmlFor={`bio-${eventLabel}`}>Bio</Label>
        <Textarea
          id={`bio-${eventLabel}`}
          rows={compact ? 3 : 5}
          placeholder={`Tell customers what makes you the right ${eventLabel.toLowerCase()} DJ. Cover your style, experience, and what you do during the event.`}
          value={value.bio}
          onChange={(e) => onChange("bio", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {value.bio.length} characters {value.bio.length < 80 ? `(${80 - value.bio.length} more needed)` : "✓"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`musicStyle-${eventLabel}`}>Music style</Label>
          <Input
            id={`musicStyle-${eventLabel}`}
            placeholder="e.g. House, disco, funk — high-energy peaks"
            value={value.musicStyle}
            onChange={(e) => onChange("musicStyle", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`signature-${eventLabel}`}>Signature tracks</Label>
          <Input
            id={`signature-${eventLabel}`}
            placeholder="3–5 tracks customers might recognise"
            value={value.signatureTracks}
            onChange={(e) => onChange("signatureTracks", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`approach-${eventLabel}`}>Your approach</Label>
        <Textarea
          id={`approach-${eventLabel}`}
          rows={compact ? 2 : 3}
          placeholder={`How do you run a ${eventLabel.toLowerCase()}? E.g. when you arrive, how you handle requests, what the typical flow looks like.`}
          value={value.approach}
          onChange={(e) => onChange("approach", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`price-${eventLabel}`}>Starting price for this event type (DKK)</Label>
        <Input
          id={`price-${eventLabel}`}
          type="number"
          min={0}
          placeholder="Optional — leave at 0 to use your default"
          value={value.priceFromMajor || ""}
          onChange={(e) => onChange("priceFromMajor", Number(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}
