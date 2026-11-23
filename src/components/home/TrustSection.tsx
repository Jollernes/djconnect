import { BadgeCheck, Lock, Receipt, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ITEMS: { title: string; text: string; Icon: LucideIcon }[] = [
  {
    title: "Verificerede DJs",
    text: "Alle DJs er gennemgået af os, og deres lyd- og lysudstyr er kontrolleret.",
    Icon: BadgeCheck,
  },
  {
    title: "Gennemsigtige priser",
    text: "Se prisen fra start. Ingen skjulte gebyrer – du ved, hvad du betaler for.",
    Icon: Receipt,
  },
  {
    title: "Sikker booking",
    text: "Betal trygt online via sikker betalingsløsning – og få en klar bekræftelse på din booking.",
    Icon: Lock,
  },
  {
    title: "Ægte anmeldelser",
    text: "Læs anmeldelser fra kunder, der har booket og holdt fest med DJ'en.",
    Icon: Star,
  },
];

export function TrustSection() {
  return (
    <section className="container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Book med ro i maven</h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">
          Vi gør det nemt og trygt at finde den rigtige DJ til din fest.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ title, text, Icon }) => (
          <div key={title} className="text-center sm:text-left">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 sm:mx-0">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
