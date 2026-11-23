import { Clock, Mail, Sparkles } from "lucide-react";

export function WelcomeStep() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {[
        {
          Icon: Clock,
          title: "Tager ~2 minutter",
          body: "Mest hurtige valg, ingen lange formularer.",
        },
        {
          Icon: Sparkles,
          title: "Vi matcher 3 DJs til dig",
          body: "Filtreret efter dit event, dato, sted og stemning.",
        },
        {
          Icon: Mail,
          title: "Personlige tilbud på 24 timer",
          body: "Hver DJ svarer direkte med et personligt tilbud.",
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
