import { Mail, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORM_SUPPORT_EMAIL } from "@/lib/constants";

export function ContactPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold">Kontakt os</h1>
      <p className="mt-2 text-muted-foreground">
        Vi er her for at hjælpe med alt — kundespørgsmål, DJ-ansøgninger eller feedback om platformen.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Mail className="mb-3 h-5 w-5 text-accent" />
            <h3 className="font-semibold">Generel support</h3>
            <p className="mt-1 text-sm text-muted-foreground">For alt vedrørende din booking eller konto.</p>
            <a href={`mailto:${PLATFORM_SUPPORT_EMAIL}`} className="mt-2 inline-block text-sm font-medium text-accent underline">
              {PLATFORM_SUPPORT_EMAIL}
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <MessageSquare className="mb-3 h-5 w-5 text-accent" />
            <h3 className="font-semibold">Presse & partnerskaber</h3>
            <p className="mt-1 text-sm text-muted-foreground">Skriver du om os eller vil indgå et samarbejde?</p>
            <a href="mailto:press@djconnect.example" className="mt-2 inline-block text-sm font-medium text-accent underline">
              press@djconnect.example
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
