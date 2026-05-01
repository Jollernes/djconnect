import { Info, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SetupSizeIcon } from "@/components/wedding/SetupSizeIcon";

type SetupId = "small" | "medium" | "large";

type SetupOption = {
  id: SetupId;
  label: string;
  guestRange: string;
  shortRange: string;
  tagline: string;
  typical: string[];
  minimum: string[];
};

const SETUPS: SetupOption[] = [
  {
    id: "small",
    label: "Small",
    guestRange: "Up to ~60 guests",
    shortRange: "≤60 guests",
    tagline: "Apartment, intimate gathering, ceremony only",
    typical: [
      "Pioneer DDJ-FLX4 / DDJ-1000 controller",
      "1× active 12\" speaker (up to ~500W)",
      "Wireless mic for speeches",
      "2× LED par cans + simple stand",
      "Backup laptop, cables, stand",
    ],
    minimum: [
      "DJ controller + laptop",
      "1× active speaker",
      "Wired mic",
      "Power-conditioned cabling",
    ],
  },
  {
    id: "medium",
    label: "Medium",
    guestRange: "100–200 guests",
    shortRange: "100–200",
    tagline: "Most weddings, mid-size venues, full evening",
    typical: [
      "Pioneer CDJ-3000 + DJM mixer (or pro controller)",
      "2× active 12\" tops (1,000–1,500W total)",
      "Wireless mic + reception music bed",
      "2× LED moving heads + 4× par cans + light haze",
      "Light DJ booth / lectern, backup gear",
    ],
    minimum: [
      "Pro decks + mixer",
      "2× powered tops",
      "Wireless mic",
      "Basic moving-head or LED rig",
      "Backup deck or laptop",
    ],
  },
  {
    id: "large",
    label: "Large",
    guestRange: "200+ guests / outdoor / two rooms",
    shortRange: "200+ guests",
    tagline: "Big halls, outdoor weddings, company galas",
    typical: [
      "2× CDJ-3000 + DJM-900NXS2 (or equivalent)",
      "2× 12\" tops + 1× 18\" subwoofer (~2,000–3,000W)",
      "2× wireless mics (toast + MC)",
      "Truss rig: 4–6× moving heads, LED wash, strobe, haze",
      "DJ booth with branded face, dedicated power",
      "Full backup: 2nd laptop, mic, redundant decks",
    ],
    minimum: [
      "Pro decks + mixer with backup",
      "2× tops + sub",
      "2× wireless mics",
      "DMX rig with moving heads + haze",
      "Branded booth or lectern",
    ],
  },
];

const SENTINEL_ANY = "__any";

/**
 * Dropdown picker for setup size. The trigger and each menu item show the
 * coloured stage-scene icon next to the label so the customer can recognise
 * the setup visually. An ⓘ button next to the dropdown opens a popover with
 * the full "typically included / minimum guaranteed" details.
 */
export function SetupSizePicker({
  value,
  onChange,
}: {
  value: SetupId | null;
  onChange: (next: SetupId | null) => void;
}) {
  const selected = value ? SETUPS.find((s) => s.id === value) ?? null : null;

  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1.5">
      <Select
        value={value ?? SENTINEL_ANY}
        onValueChange={(v) => onChange(v === SENTINEL_ANY ? null : (v as SetupId))}
      >
        <SelectTrigger className="h-11 w-full min-w-[180px] max-w-[220px] gap-2 rounded-full pl-1.5 pr-3 text-xs [&>span]:flex [&>span]:min-w-0 [&>span]:flex-1 [&>span]:items-center [&>span]:gap-2 [&>span]:overflow-hidden">
          <SelectValue placeholder="Setup size" asChild>
            <span>
              {selected ? (
                <>
                  <span className="block h-7 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-rose-200">
                    <SetupSizeIcon size={selected.id} active />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                    <span className="w-full truncate text-xs font-semibold text-foreground">
                      {selected.label}
                    </span>
                    <span className="w-full truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                      {selected.shortRange}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="block h-7 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                    <SetupSizeIcon size="medium" />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">Setup size</span>
                </>
              )}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-[280px] p-1">
          <SelectItem value={SENTINEL_ANY} className="rounded-md py-2 pl-3">
            <span className="text-xs text-muted-foreground">Any setup size</span>
          </SelectItem>
          {SETUPS.map((s) => (
            <SelectItem key={s.id} value={s.id} className="rounded-md py-1.5 pl-2 pr-3">
              <span className="flex items-center gap-3">
                <span className="block h-10 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
                  <SetupSizeIcon size={s.id} active={value === s.id} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{s.label}</span>
                  <span className="text-[11px] text-muted-foreground">{s.guestRange}</span>
                  <span className="text-[10px] text-muted-foreground/80">{s.tagline}</span>
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="What's included in each setup"
            className="grid h-8 w-8 place-items-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background"
          >
            <Info className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-[360px] max-w-[92vw] p-0">
          <PackageDetails option={selected} />
        </PopoverContent>
      </Popover>

      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Clear setup size"
          className="grid h-8 w-8 place-items-center rounded-full border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function PackageDetails({ option }: { option: SetupOption | null }) {
  if (!option) {
    return (
      <div>
        <div className="border-b bg-gradient-to-br from-rose-50 to-amber-50 px-4 py-3">
          <h4 className="text-sm font-semibold leading-tight">What's included at each setup</h4>
          <p className="mt-0.5 text-xs text-foreground/70">
            Pick a setup size in the dropdown to see the full kit list and minimum guarantees.
          </p>
        </div>
        <div className="grid gap-3 px-4 py-3">
          {SETUPS.map((s) => (
            <div key={s.id} className="flex items-start gap-3">
              <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
                <SetupSizeIcon size={s.id} active />
              </div>
              <div className="text-xs">
                <p className="font-semibold">{s.label}</p>
                <p className="text-muted-foreground">{s.guestRange}</p>
                <p className="text-muted-foreground/80">{s.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="border-b bg-gradient-to-br from-rose-50 to-amber-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md ring-1 ring-rose-200">
            <SetupSizeIcon size={option.id} active />
          </div>
          <div>
            <h4 className="text-sm font-semibold leading-tight">{option.label} setup</h4>
            <p className="text-[11px] uppercase tracking-wider text-rose-700/80">
              {option.guestRange}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-foreground/70">{option.tagline}</p>
      </div>
      <div className="space-y-3 px-4 py-3 text-xs">
        <div>
          <p className="mb-1.5 font-semibold text-foreground">Typically included</p>
          <ul className="space-y-1 text-muted-foreground">
            {option.typical.map((t) => (
              <li key={t} className="flex gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-dashed bg-muted/40 p-2.5">
          <p className="mb-1 font-semibold text-foreground">Minimum guaranteed</p>
          <ul className="space-y-1 text-muted-foreground">
            {option.minimum.map((m) => (
              <li key={m} className="flex gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Each DJ confirms exact gear in the booking thread before you pay.
        </p>
      </div>
    </div>
  );
}
