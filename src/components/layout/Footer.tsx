import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAME, PLATFORM_SUPPORT_EMAIL, REGION_OPTIONS, EVENT_TYPE_OPTIONS } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-primary pb-24 text-primary-foreground md:pb-0">
      <div className="container grid gap-10 py-12 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-4">
          <p className="text-lg font-semibold">{PLATFORM_NAME}</p>
          <p className="max-w-sm text-sm leading-6 text-primary-foreground/70">
            Virksomhedsoplysninger indsættes ved lancering. Platformen er bygget som en kurateret managed-agency løsning til danske firmaevents.
          </p>
          <a className="block text-sm text-primary-foreground/70 hover:text-primary-foreground" href={`mailto:${PLATFORM_SUPPORT_EMAIL}`}>
            {PLATFORM_SUPPORT_EMAIL}
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold">Serviceområder</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {REGION_OPTIONS.map((region) => (
              <Badge key={region.id} variant="outline" className="border-primary-foreground/20 text-primary-foreground">
                {region.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Eventtyper</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EVENT_TYPE_OPTIONS.map((eventType) => (
              <Badge key={eventType.id} variant="outline" className="border-primary-foreground/20 text-primary-foreground">
                {eventType.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold">Hurtige links</p>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <Link to="/handelsbetingelser" className="hover:text-primary-foreground">
              Handelsbetingelser
            </Link>
            <Link to="/privatlivspolitik" className="hover:text-primary-foreground">
              Privatlivspolitik
            </Link>
            <Link to="/kontakt" className="hover:text-primary-foreground">
              Kontakt
            </Link>
          </div>
          <Button asChild variant="accent" className="w-full">
            <Link to="/brief">Tjek dato og få match</Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container flex flex-col gap-2 py-4 text-xs text-primary-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {PLATFORM_NAME}</span>
          <span>Premium managed-agency booking til danske virksomheder</span>
        </div>
      </div>
    </footer>
  );
}
