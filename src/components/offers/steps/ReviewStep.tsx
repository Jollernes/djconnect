import {
  BUDGET_OPTIONS,
  CITY_OPTIONS,
  EXTRA_OPTIONS,
  GENRE_OPTIONS,
  GUEST_BUCKETS,
} from "@/lib/offerRequestContent";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";
import type { OfferRequest } from "@/hooks/useOfferRequest";
import { SetupSizeIcon } from "@/components/wedding/SetupSizeIcon";
import { Pencil } from "lucide-react";

const SETUP_LABEL = { small: "Lille", medium: "Mellem", large: "Stor" } as const;

function Row({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex shrink-0 items-center gap-1 text-xs font-medium text-rose-700 hover:underline"
      >
        <Pencil className="h-3 w-3" /> Rediger
      </button>
    </div>
  );
}

export function ReviewStep({
  request,
  onEditStep,
}: {
  request: OfferRequest;
  onEditStep: (step: number) => void;
}) {
  const eventType = EVENT_TYPE_OPTIONS.find((e) => e.id === request.eventType);
  const cityLabel =
    CITY_OPTIONS.find((c) => c.id === request.city)?.label || request.customCity || "Ikke angivet";
  const guestBucket = GUEST_BUCKETS.find((b) => b.id === request.guestBucket);
  const budget = BUDGET_OPTIONS.find((b) => b.id === request.budget);
  const dateFormatted = request.date
    ? new Date(request.date).toLocaleDateString("da-DK", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Ikke angivet";

  return (
    <div className="space-y-2">
      <Row
        label="Event"
        value={eventType?.label ?? "Ikke angivet"}
        onEdit={() => onEditStep(2)}
      />
      <Row label="Hvornår" value={dateFormatted} onEdit={() => onEditStep(3)} />
      <Row label="Hvor" value={cityLabel} onEdit={() => onEditStep(3)} />
      <Row
        label="Gæster"
        value={guestBucket ? `${guestBucket.label} · ${guestBucket.range}` : "Ikke angivet"}
        onEdit={() => onEditStep(4)}
      />
      <Row
        label="Opsætning"
        value={
          request.setupSize ? (
            <span className="inline-flex items-center gap-2">
              <span className="block h-5 w-9 overflow-hidden rounded ring-1 ring-rose-200">
                <SetupSizeIcon size={request.setupSize} active />
              </span>
              {SETUP_LABEL[request.setupSize]}
            </span>
          ) : (
            "Enhver opsætning"
          )
        }
        onEdit={() => onEditStep(4)}
      />
      <Row
        label="Musik"
        value={
          request.genres.length === 0
            ? "Åben for forslag"
            : request.genres
                .map((id) => GENRE_OPTIONS.find((g) => g.id === id)?.label)
                .filter(Boolean)
                .join(" · ")
        }
        onEdit={() => onEditStep(5)}
      />
      <Row
        label="Ekstra"
        value={
          request.extras.length === 0
            ? "Ingen"
            : request.extras
                .map((id) => EXTRA_OPTIONS.find((x) => x.id === id)?.label)
                .filter(Boolean)
                .join(" · ")
        }
        onEdit={() => onEditStep(6)}
      />
      <Row
        label="Budget"
        value={budget ? `${budget.label} · ${budget.range}` : "Ikke angivet"}
        onEdit={() => onEditStep(7)}
      />
      <Row
        label="Kontakt"
        value={
          <div className="space-y-0.5">
            <p>{request.contact.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{request.contact.email}</p>
            {request.contact.phone && (
              <p className="text-xs text-muted-foreground">{request.contact.phone}</p>
            )}
          </div>
        }
        onEdit={() => onEditStep(8)}
      />
    </div>
  );
}
