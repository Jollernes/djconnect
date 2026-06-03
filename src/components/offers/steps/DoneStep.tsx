import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { DJProfileWithRelations } from "@/types/domain";

export function DoneStep({
  matchedDJs,
  email,
}: {
  matchedDJs: DJProfileWithRelations[];
  email: string;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-gradient-to-br from-rose-50 to-amber-50 px-4 py-4 text-center md:px-6 md:py-5">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-rose-900">
          <Mail className="h-4 w-4" />
          Vi har sendt din brief til{" "}
          <span className="font-bold">{email || "dig"}</span>
        </div>
        <p className="mt-1 text-xs text-rose-900/70">
          En kopi ligger i din indbakke. Vi videresender hver DJ's tilbud, så snart de svarer.
        </p>
      </div>

      <div>
        <h2 className="text-center text-base font-semibold">Dine 3 matchede DJs</h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          De er blevet notificeret — forvent et personligt tilbud inden for 24 timer.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {matchedDJs.map((dj, idx) => (
            <motion.div
              key={dj.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.15, type: "spring" }}
              className="relative flex flex-col items-center gap-3 rounded-2xl border bg-white p-4 text-center"
            >
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <Check className="h-3 w-3" /> Notificeret
              </span>
              <Avatar className="h-16 w-16 ring-2 ring-rose-100">
                <AvatarImage src={dj.profile.avatar_url ?? undefined} alt={dj.stage_name} />
                <AvatarFallback>{dj.stage_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-tight">{dj.stage_name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {dj.profile.city} · ⭐ {dj.rating_average?.toFixed(1) ?? "—"}
                </p>
              </div>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">{dj.tagline}</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/djs/${dj.username}`}>Se profil</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 text-center md:p-5">
        <p className="text-sm font-semibold">Hvad sker der nu</p>
        <ol className="mx-auto mt-3 max-w-md space-y-2 text-left text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
              1
            </span>
            DJs gennemgår din brief og tjekker tilgængelighed på din dato.
          </li>
          <li className="flex gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
              2
            </span>
            Hver ledig DJ sender dig et personligt tilbud inden for 24 timer.
          </li>
          <li className="flex gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
              3
            </span>
            Du sammenligner tilbud, vælger den du bedst kan lide og betaler via escrow.
          </li>
        </ol>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button asChild className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
          <Link to="/">Tilbage til forsiden</Link>
        </Button>
        <Button asChild variant="link" className="text-muted-foreground">
          <Link to="/search">Eller find DJs selv →</Link>
        </Button>
      </div>
    </div>
  );
}
