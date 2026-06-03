import { Link } from "react-router-dom";
import { Music2 } from "lucide-react";
import { PLATFORM_NAME } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Music2 className="h-4 w-4" />
            </span>
            <span className="text-lg">{PLATFORM_NAME}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            Verificerede DJs med komplet mobilt diskotek — book med tryghed til bryllupper, fester og firmaarrangementer.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Platform</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/how-it-works" className="hover:text-primary-foreground">Sådan fungerer det</Link></li>
            <li><Link to="/about" className="hover:text-primary-foreground">Om os</Link></li>
            <li><Link to="/faq" className="hover:text-primary-foreground">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-primary-foreground">Kontakt</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">For DJs</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/signup/dj" className="hover:text-primary-foreground">Bliv DJ</Link></li>
            <li><Link to="/how-it-works#djs" className="hover:text-primary-foreground">Sådan fungerer det for DJs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Juridisk</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/terms" className="hover:text-primary-foreground">Handelsbetingelser</Link></li>
            <li><Link to="/privacy" className="hover:text-primary-foreground">Privatlivspolitik</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-primary-foreground/60 sm:flex-row">
          <span>© {year} {PLATFORM_NAME}. Alle rettigheder forbeholdes.</span>
          <span>Betalinger behandles sikkert af Stripe.</span>
        </div>
      </div>
    </footer>
  );
}
