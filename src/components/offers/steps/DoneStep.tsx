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
          We sent your brief to{" "}
          <span className="font-bold">{email || "you"}</span>
        </div>
        <p className="mt-1 text-xs text-rose-900/70">
          A copy is in your inbox. We'll forward each DJ's offer as soon as they reply.
        </p>
      </div>

      <div>
        <h2 className="text-center text-base font-semibold">Your 3 matched DJs</h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          They've been notified — expect a personal offer within 24 hours.
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
                <Check className="h-3 w-3" /> Notified
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
                <Link to={`/djs/${dj.username}`}>View profile</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 text-center md:p-5">
        <p className="text-sm font-semibold">What happens next</p>
        <ol className="mx-auto mt-3 max-w-md space-y-2 text-left text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
              1
            </span>
            DJs review your brief and check availability for your date.
          </li>
          <li className="flex gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
              2
            </span>
            Each available DJ sends you a personal offer within 24 hours.
          </li>
          <li className="flex gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
              3
            </span>
            You compare offers, pick the one you love, pay through escrow.
          </li>
        </ol>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button asChild className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
          <Link to="/">Back to homepage</Link>
        </Button>
        <Button asChild variant="link" className="text-muted-foreground">
          <Link to="/search">Or browse DJs yourself →</Link>
        </Button>
      </div>
    </div>
  );
}
