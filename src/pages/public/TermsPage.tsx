import { PLATFORM_NAME, PLATFORM_FEE_PERCENT } from "@/lib/constants";

export function TermsPage() {
  return (
    <div className="container max-w-3xl py-16 prose prose-slate prose-headings:font-semibold">
      <h1>Servicevilkår</h1>
      <p className="lead">
        Dette er midlertidige servicevilkår for {PLATFORM_NAME}. Erstat med professionelt udarbejdede vilkår
        før lancering.
      </p>
      <h2>1. Accept af vilkår</h2>
      <p>
        Ved at tilgå eller bruge {PLATFORM_NAME} accepterer du at være bundet af disse vilkår. Hvis du ikke er enig, så
        brug ikke platformen.
      </p>
      <h2>2. Tjenesten</h2>
      <p>
        {PLATFORM_NAME} er en markedsplads, der forbinder kunder, der ønsker at booke en DJ, med uafhængige DJs, der
        driver mobile diskoteker. Vi er ikke den direkte udbyder af DJ-ydelser.
      </p>
      <h2>3. Platformsgebyr</h2>
      <p>
        {PLATFORM_NAME} opkræver et servicegebyr på {PLATFORM_FEE_PERCENT}% på hver booking, oplyst ved
        betaling.
      </p>
      <h2>4. Aflysninger og tilbagebetalinger</h2>
      <p>
        Aflysninger håndteres efter den plan, der vises ved betaling: 100% tilbagebetaling mere end 14 dage før
        eventet, 50% mellem 7 og 14 dage, 0% mindre end 7 dage.
      </p>
      <h2>5. DJ'ens ansvar</h2>
      <p>
        DJs indestår for, at de ejer eller har lovlig adgang til alt anført udstyr, har eventuelle påkrævede licenser,
        og møder op til tiden og klar til at arbejde.
      </p>
      <h2>6. Ansvarsbegrænsning</h2>
      <p>
        I det omfang loven tillader det, er {PLATFORM_NAME}'s ansvar begrænset til det platformsgebyr,
        der er tilbageholdt på den pågældende booking.
      </p>
      <h2>7. Lovvalg</h2>
      <p>Disse vilkår er underlagt dansk lovgivning.</p>
    </div>
  );
}
