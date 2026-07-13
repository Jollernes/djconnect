export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Kan vi selv vælge DJ?",
    answer:
      "Ja. I får en kurateret shortlist på 2 til 3 relevante DJs, og I kan enten lade platformen vælge det bedste match eller selv vælge én af de foreslåede DJs.",
  },
  {
    question: "Hvad hvis DJ'en bliver syg?",
    answer:
      "Vi planlægger altid med backup. Hvis der opstår sygdom eller en akut nødsituation, håndterer vi en erstatning eller en tilsvarende løsning, så arrangementet stadig afvikles trygt.",
  },
  {
    question: "Er lyd og lys inkluderet?",
    answer:
      "Ja, lyd og lys indgår i pakkerne. Hvis jeres event har særlige tekniske behov, bliver det tydeligt afklaret, før I bekræfter.",
  },
  {
    question: "Kan DJ'en spille under middagen og senere til dans?",
    answer:
      "Ja. Det er en central del af vores model, og mange events kører netop med baggrundsmusik under middagen og en mere festlig profil bagefter.",
  },
  {
    question: "Kan vi ønske bestemte numre?",
    answer:
      "Ja. I kan angive både must-play og do-not-play numre i briefen, så vi kan tage hensyn til det fra starten.",
  },
  {
    question: "Kan I håndtere taler og mikrofon?",
    answer:
      "Ja. Når mikrofon er relevant, matcher vi jer med en løsning, der kan håndtere taler, præsentationer og en tydelig afvikling.",
  },
  {
    question: "Hvor hurtigt får vi svar?",
    answer:
      "Vi arbejder med hurtig og tydelig opfølgning. I praksis får de fleste et svar samme dag, og vi prioriterer korte svartider i hele processen.",
  },
  {
    question: "Er priserne inklusiv eller eksklusiv moms?",
    answer:
      "Priserne vises eksklusiv moms. Transport og særlige tekniske behov bliver tydeligt beregnet, før I bekræfter.",
  },
  {
    question: "Kan vi booke til julefrokost?",
    answer:
      "Ja. Julefrokoster er en af de faste eventtyper, vi er bygget til at håndtere.",
  },
  {
    question: "Kan vi genbooke samme setup næste år?",
    answer:
      "Ja. Når I først har fundet en løsning, gemmer vi erfaringerne, så det er nemt at gentage eller justere til næste år.",
  },
];

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Booking og valg af DJ",
    items: FAQ_ITEMS.slice(0, 2),
  },
  {
    title: "Teknik, musik og afvikling",
    items: FAQ_ITEMS.slice(2, 6),
  },
  {
    title: "Pris, svar og genbooking",
    items: FAQ_ITEMS.slice(6),
  },
];

export const HOME_FAQ_ITEMS = FAQ_ITEMS.slice(0, 5);
