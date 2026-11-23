import { Users } from "lucide-react";
import { GUEST_BUCKETS, type GuestBucketId, type OfferSetupId } from "@/lib/offerRequestContent";
import { SetupSizePicker } from "@/components/wedding/SetupSizePicker";
import { cn } from "@/lib/utils";

export function SizeStep({
  guestBucket,
  setupSize,
  onGuestBucketChange,
  onSetupChange,
}: {
  guestBucket: GuestBucketId | undefined;
  setupSize: OfferSetupId | undefined;
  onGuestBucketChange: (id: GuestBucketId) => void;
  onSetupChange: (id: OfferSetupId | null) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-rose-500" /> Hvor mange gæster?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
          {GUEST_BUCKETS.map((b) => {
            const selected = guestBucket === b.id;
            const peopleCount = ["intimate", "small", "medium", "large", "huge"].indexOf(b.id) + 1;
            return (
              <button
                key={b.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onGuestBucketChange(b.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                  selected
                    ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-100"
                    : "border-border bg-white hover:border-rose-300 hover:bg-rose-50/20",
                )}
              >
                <div className="flex h-10 items-end justify-center gap-0.5">
                  {Array.from({ length: peopleCount }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 rounded-full",
                        selected ? "bg-rose-500" : "bg-slate-400",
                      )}
                      style={{ height: `${10 + i * 5}px` }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground">{b.range}</p>
                </div>
              </button>
            );
          })}
        </div>
        {guestBucket && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {GUEST_BUCKETS.find((b) => b.id === guestBucket)?.tagline}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold">Lyd &amp; lys-opsætning</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Vælg det udstyr, der passer til dit lokale — DJs anbefaler, hvis du er i tvivl.
        </p>
        <div className="mt-3">
          <SetupSizePicker value={setupSize ?? null} onChange={onSetupChange} />
        </div>
      </div>
    </div>
  );
}
