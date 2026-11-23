import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Verified, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPES, SETUP_SIZES, EXPERIENCE_YEARS } from "@/lib/constants";

type Props = {
  stageName: string;
  city: string;
  country: string;
  bio: string;
  yearsExperience: string;
  eventTypes: string[];
  setupSize: string;
  profilePhotoUrl?: string | null;
  className?: string;
};

export function LivePreview({
  stageName,
  city,
  country,
  bio,
  yearsExperience,
  eventTypes,
  setupSize,
  profilePhotoUrl,
  className,
}: Props) {
  const displayName = stageName || "Dit kunstnernavn";
  const location = [city, country].filter(Boolean).join(", ") || "By, Land";
  const yearsLabel = EXPERIENCE_YEARS.find((y) => y.id === yearsExperience)?.label;
  const setupLabel = SETUP_SIZES.find((s) => s.id === setupSize)?.label;

  return (
    <div className={cn("sticky top-24", className)}>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        Live profilforhåndsvisning
      </div>
      <motion.div
        layout
        className="overflow-hidden rounded-2xl border bg-card shadow-xl"
      >
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary via-primary to-accent/70">
          <AnimatePresence mode="wait">
            {profilePhotoUrl ? (
              <motion.img
                key={profilePhotoUrl}
                src={profilePhotoUrl}
                alt=""
                className="h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full w-full items-center justify-center text-primary-foreground/50"
              >
                <Sparkles className="h-10 w-10" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
            <div>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={displayName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-xl font-semibold text-white drop-shadow"
                >
                  {displayName}
                </motion.h3>
              </AnimatePresence>
              <p className="flex items-center gap-1 text-xs text-white/80">
                <MapPin className="h-3 w-3" /> {location}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              <Verified className="h-3 w-3" /> Afventer godkendelse
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Ny
            </span>
            {yearsLabel && (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {yearsLabel}
              </span>
            )}
            {setupLabel && (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {setupLabel} opsætning
              </span>
            )}
          </div>

          <p className="line-clamp-4 text-sm text-muted-foreground">
            {bio || "Din bio vises her. Fortæl kunderne om din stil, din erfaring, og hvad der gør dine sæt uforglemmelige."}
          </p>

          {eventTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {eventTypes.map((id) => {
                const label = EVENT_TYPES.find((e) => e.id === id)?.label;
                if (!label) return null;
                return (
                  <motion.span
                    key={id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent"
                  >
                    {label}
                  </motion.span>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span>Fra <span className="font-semibold text-foreground">3.500 kr.</span></span>
            <span>Svarer på forespørgsler &lt; 24t</span>
          </div>
        </div>
      </motion.div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Sådan ser kunderne dig, når du er godkendt.
      </p>
    </div>
  );
}
