import { Clock, Mail, Sparkles } from "lucide-react";

export function WelcomeStep() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {[
        {
          Icon: Clock,
          title: "Takes ~2 minutes",
          body: "Mostly tap-and-go selections, no long forms.",
        },
        {
          Icon: Sparkles,
          title: "We match 3 DJs for you",
          body: "Filtered by your event, date, location, vibe.",
        },
        {
          Icon: Mail,
          title: "Personal offers in 24h",
          body: "Each DJ replies directly with a custom quote.",
        },
      ].map((b) => (
        <div
          key={b.title}
          className="flex items-start gap-3 rounded-2xl border bg-white p-4 text-left"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500/10 to-amber-400/10">
            <b.Icon className="h-5 w-5 text-rose-600" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">{b.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{b.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
