import { PLATFORM_NAME } from "@/lib/constants";

export function AboutPage() {
  return (
    <div className="container max-w-3xl py-16 prose prose-slate prose-headings:font-semibold">
      <h1>Om {PLATFORM_NAME}</h1>
      <p>
        {PLATFORM_NAME} er en markedsplads, der forbinder mennesker, der holder events, med professionelle DJs, der
        medbringer et komplet mobilt diskotek. Vi fokuserer udelukkende på DJs — ikke bands, ikke generel
        underholdning — fordi det at booke en DJ med det rette udstyr, personlighed og musikvalg er et
        specialistjob.
      </p>
      <h2>Hvorfor vi findes</h2>
      <p>
        At holde et bryllup, firmaarrangement eller en stor mærkedag er stressende nok i forvejen. At finde en DJ, du
        faktisk kan stole på — som møder op med det rette setup, spiller det, dine gæster vil danse til, og
        opfører sig professionelt — burde være enkelt. {PLATFORM_NAME} findes for at gøre det enkelt.
      </p>
      <h2>Hvordan vi adskiller os</h2>
      <ul>
        <li>
          <strong>Kun verificerede DJs.</strong> Hver DJ gennemgås af vores team, før de kan acceptere bookinger.
          Vi ser på udstyr, erfaring og referencer.
        </li>
        <li>
          <strong>Escrow-betalinger.</strong> Din betaling holdes af Stripe og frigives først til DJ'en 24
          timer efter dit event er afsluttet — hvilket beskytter begge parter.
        </li>
        <li>
          <strong>Gennemsigtig prissætning.</strong> Se startpriser på forhånd, med et tydeligt platformsgebyr.
          Ingen skjulte omkostninger.
        </li>
        <li>
          <strong>Ægte anmeldelser.</strong> Kun kunder med gennemførte bookinger kan skrive anmeldelser, så det, du
          læser, er det, du får.
        </li>
      </ul>
      <h2>Kom i kontakt</h2>
      <p>
        Har du spørgsmål? Skriv til os på <a href="mailto:support@djconnect.example">support@djconnect.example</a>
        {" "}eller se vores <a href="/faq">FAQ</a>.
      </p>
    </div>
  );
}
