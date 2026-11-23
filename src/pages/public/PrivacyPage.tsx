import { PLATFORM_NAME } from "@/lib/constants";

export function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-16 prose prose-slate prose-headings:font-semibold">
      <h1>Privatlivspolitik</h1>
      <p className="lead">
        Midlertidig privatlivspolitik for {PLATFORM_NAME}. Erstat med en GDPR-kompatibel politik før lancering.
      </p>
      <h2>Oplysninger vi indsamler</h2>
      <ul>
        <li>Kontooplysninger (navn, e-mail, rolle)</li>
        <li>Profiloplysninger (DJ: bio, billeder, udstyr; Kunde: bookinghistorik)</li>
        <li>Betalingsmetadata (aldrig fulde kortnumre — holdes af Stripe)</li>
        <li>Brugsdata (viste sider, foretagne bookinger)</li>
      </ul>
      <h2>Hvordan vi bruger dine oplysninger</h2>
      <p>
        Til at levere tjenesten, matche kunder med DJs, behandle betalinger, sende transaktionse-mails og
        forebygge svindel.
      </p>
      <h2>Hvem har adgang</h2>
      <p>
        DJs ser kun kontaktoplysninger, efter en booking er bekræftet. Kunder ser DJ-profiler, men aldrig
        personlige kontaktoplysninger, før bookingen er bekræftet.
      </p>
      <h2>Dine rettigheder</h2>
      <p>
        Under GDPR har du ret til at tilgå, rette, slette og eksportere dine personoplysninger. Kontakt
        supporten for at udøve disse rettigheder.
      </p>
    </div>
  );
}
