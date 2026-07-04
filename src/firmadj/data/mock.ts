import type { FirmaDJ, FirmaPackage } from "@/firmadj/types";

export const packages: FirmaPackage[] = [
  {
    id: "after-dinner",
    name: "After Dinner DJ",
    basePrice: 8500,
    tagline: "Fra 8.500 kr. — sikker stemning efter middagen.",
    description:
      "Et elegant setup til firmafester, hvor I vil fra netværk og middag direkte til dansegulv med ro i maven.",
    inclusions: ["Pro-lydanlæg", "4 timers spilletid", "EAN-faktura", "Backup-DJ garanti", "Planlagt opstart efter dessert"],
  },
  {
    id: "dinner-party",
    name: "Dinner Ready + Party",
    basePrice: 10500,
    tagline: "Fra 10.500 kr. — musik hele vejen fra velkomst til fyldt gulv.",
    description:
      "Til virksomheder der vil have lækker baggrundsmusik under middagen og et kontrolleret skifte til fuld fest senere på aftenen.",
    inclusions: ["Baggrundsmusik under middagen", "Pro Audio til 80–150 gæster", "EAN-faktura", "Backup-DJ garanti", "Playliste koordineret med jer"],
  },
  {
    id: "full-corporate",
    name: "Full Corporate Evening",
    basePrice: 14000,
    tagline: "Fra 14.000 kr. — premium produktion og ekstra tryghed.",
    description:
      "Vores mest komplette løsning til store firmabegivenheder med lys, større anlæg, backup-DJ og en koordinator, der holder styr på detaljerne.",
    inclusions: ["Større Pro Audio", "Lys- og showsetup", "Backup-DJ garanti", "Koordinator på aftenen", "EAN-faktura", "Teknisk planlægning før event"],
    featured: true,
  },
];

export const djs: FirmaDJ[] = [
  {
    id: "dj-michael",
    stageName: "DJ Michael",
    genres: ["House", "Top 40", "Disco"],
    references: ["Novo Nordisk", "Carlsberg", "Danske Bank"],
    quote: "Jeg bygger altid aftenen op, så dansegulvet topper på det rigtige tidspunkt.",
    photo:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    alt: "DJ foran lysende klublys og publikum",
  },
  {
    id: "dj-sara",
    stageName: "DJ Sara",
    genres: ["Nordisk Pop", "Disco", "80'er/90'er"],
    references: ["LEGO", "Coloplast", "Ørsted"],
    quote: "Jeg kombinerer sikre hits med en elegant lyd, der passer til et professionelt setup.",
    photo:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    alt: "DJ ved mixer med varmt scenelys",
  },
  {
    id: "dj-anders",
    stageName: "DJ Anders",
    genres: ["House", "Hip-Hop", "Top 40"],
    references: ["Mærsk", "TDC", "Vestas"],
    quote: "Mit fokus er at læse rummet hurtigt og holde energien skarp hele aftenen.",
    photo:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
    alt: "DJ i et mørkt venue med farvede lys",
  },
  {
    id: "dj-nadia",
    stageName: "DJ Nadia",
    genres: ["Disco", "Nordisk Pop", "Top 40"],
    references: ["Grundfos", "Novo Nordisk", "Carlsberg"],
    quote: "Mine sets er bygget til at samle kolleger på tværs af afdelinger.",
    photo:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    alt: "DJ med høretelefoner og lys i baggrunden",
  },
  {
    id: "dj-kasper",
    stageName: "DJ Kasper",
    genres: ["80'er/90'er", "Disco", "Hip-Hop"],
    references: ["Mærsk", "LEGO", "TDC"],
    quote: "Når publikum vil have noget velkendt, leverer jeg det med energi og finesse.",
    photo:
      "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=800&q=80",
    alt: "DJkabine med farvet scenelys og crowd",
  },
  {
    id: "dj-louise",
    stageName: "DJ Louise",
    genres: ["House", "Nordisk Pop", "Top 40"],
    references: ["Ørsted", "Coloplast", "Vestas"],
    quote: "Jeg holder et raffineret udtryk under middagen og skruer op med præcision bagefter.",
    photo:
      "https://images.unsplash.com/photo-1501386761578-10780a8d3c2d?auto=format&fit=crop&w=800&q=80",
    alt: "DJ i professionel lysopsætning",
  },
];
