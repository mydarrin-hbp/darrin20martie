export type PublicNavLink = {
  label: string;
  href: string;
};

export type PublicQuickLink = {
  title: string;
  href: string;
  tone: "orange" | "green" | "blue" | "light";
};

export type PublicServiceLevel = {
  label: string;
  price: string;
  note: string;
};

export type PublicSpecialCatalogStat = {
  label: string;
  value: string;
  tone: "blue" | "amber" | "green" | "purple";
};

export type PublicSpecialCatalogOffer = {
  id: string;
  clasa: string;
  nivel: "Bronz" | "Argint" | "Aur" | "Platinum";
  pretMc: string;
  cantitateTransport: string;
  sorturi: string;
  transportPret?: string;
  furnizor?: string;
  optionalPompa?: boolean;
  indicatorDeviz?: string;
};

export type PublicServiceClassification = {
  caen: string[];
  uniclass: string[];
  esco: string[];
  indicators: string[];
};

export type PublicSpecialCatalog = {
  title: string;
  supplier: string;
  summary: string;
  stats: PublicSpecialCatalogStat[];
  filters: string[];
  offers: PublicSpecialCatalogOffer[];
};

export type PublicServiceRecord = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  startingPrice: string;
  rating: string;
  accent: "orange" | "navy" | "green";
  mediaType: "VIDEO" | "IMAGINE" | "SLIDE";
  badges: string[];
  benefits: string[];
  levels: PublicServiceLevel[];
  classifications?: PublicServiceClassification;
  specialCatalog?: PublicSpecialCatalog;
};

export type PublicRoleRecord = {
  id: "super-admin" | "admin" | "partner" | "client" | "investor";
  label: string;
  audience: string;
  description: string;
  permissions: string[];
  ctaLabel: string;
};

export const publicNavLinks: PublicNavLink[] = [
  { label: "Servicii", href: "/catalog" },
  { label: "Industrii", href: "/catalog" },
  { label: "Devino partener", href: "/partners/join" },
  { label: "Devino investitor", href: "/investors" },
  { label: "Contact", href: "/account" },
];

export const publicFooterColumns = [
  {
    title: "Servicii",
    links: [
      { label: "Homepage", href: "/" },
      { label: "Catalog Servicii", href: "/catalog" },
      { label: "Reparat calorifer", href: "/services/reparat-calorifer" },
      { label: "Materiale si Betoane", href: "/services/materiale-betoane" },
      { label: "Coșul meu", href: "/cart" },
    ],
  },
  {
    title: "Companie",
    links: [
      { label: "Devino Partener", href: "/partners/join" },
      { label: "Creare cont partener", href: "/partners/join" },
      { label: "Modul client", href: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Creare cont client", href: "/account/create" },
      { label: "GDPR", href: "/account/create" },
      { label: "Politici", href: "/account/create" },
    ],
  },
  {
    title: "Investitori",
    links: [
      { label: "Devino Investitor", href: "/investors" },
      { label: "Creare cont investitor", href: "/investors" },
      { label: "Contact", href: "/account" },
    ],
  },
];

export const publicQuickLinks: PublicQuickLink[] = [
  { title: "Catalog servicii", href: "/catalog", tone: "orange" },
  { title: "Pagina serviciu Reparat calorifer", href: "/services/reparat-calorifer", tone: "blue" },
  { title: "Serviciu special Materiale si Betoane", href: "/services/materiale-betoane", tone: "blue" },
  { title: "Coșul meu", href: "/cart", tone: "green" },
  { title: "Checkout", href: "/checkout", tone: "orange" },
  { title: "Status plată", href: "/payment-status", tone: "blue" },
  { title: "Modul Devino Partener", href: "/partners/join", tone: "green" },
  { title: "Modul Devino Investitor", href: "/investors", tone: "blue" },
  { title: "Creare cont client", href: "/account/create", tone: "light" },
];

export const publicServiceCatalog: PublicServiceRecord[] = [
  {
    slug: "materiale-betoane",
    title: "Materiale si Betoane",
    category: "Materiale speciale",
    summary: "Catalog special pentru clase de beton, transport, pompa si furnizori verificati, integrat in acelasi flux public My Darrin.",
    description:
      "Zona de materiale speciale preia logica unui catalog operational dedicat pentru betoane si o aliniaza cu proiectul nostru: selectie rapida, clase clare, niveluri comerciale, transport si optiunea de pompa, toate vizibile public dupa configurare si aprobare.",
    startingPrice: "de la 345 lei / mc",
    rating: "4.9",
    accent: "navy",
    mediaType: "IMAGINE",
    badges: ["Materiale speciale", "Catalog beton", "Livrare programata"],
    classifications: {
      caen: ["CAEN 2363 - Fabricarea betonului", "CAEN 4941 - Transport rutier de marfuri"],
      uniclass: ["Uniclass Pr_20_31_16_15 - Ready-mixed concrete", "Uniclass Ss_20_05 - Concrete construction systems"],
      esco: [
        "ESCO - concrete pump operator",
        "ESCO - concrete mixing plant operator",
        "ESCO - construction materials technician",
      ],
      indicators: ["IND BET C20.25", "IND BET C25.30", "IND BET C30.37", "IND TRN BET POMPA"],
    },
    benefits: [
      "Clase de beton standardizate pe niveluri comerciale",
      "Pret / mc, transport si furnizor vizibile din prima ecranare",
      "Optiune pompa pentru santiere si turnari speciale",
      "Serviciu aliniat cu comanda, checkout si status plata",
    ],
    levels: [
      { label: "Bronz", price: "345 lei / mc", note: "Pentru lucrari uzuale si bugete controlate" },
      { label: "Argint", price: "390 lei / mc", note: "Pentru executii rezidentiale cu cerinte echilibrate" },
      { label: "Aur", price: "445 lei / mc", note: "Pentru santiere premium cu ritm si volum ridicat" },
      { label: "Platinum", price: "520 lei / mc", note: "Pentru proiecte speciale cu control tehnic extins" },
    ],
    specialCatalog: {
      title: "Catalog Betoane",
      supplier: "Betoniera SRL",
      summary:
        "Inspiratia din structura trimisa este pastrata in forma unui catalog special dark, dar aliniata My Darrin ca serviciu special pentru materiale si executii.",
      stats: [
        { label: "Total produse", value: "12", tone: "blue" },
        { label: "Platinum", value: "3", tone: "amber" },
        { label: "Cu pompa", value: "5", tone: "green" },
        { label: "Pret mediu / mc", value: "412 lei", tone: "purple" },
      ],
      filters: ["Toate", "Bronz", "Argint", "Aur", "Platinum"],
      offers: [
        {
          id: "beton-c20-25",
          clasa: "C20/25",
          nivel: "Bronz",
          pretMc: "345 lei",
          cantitateTransport: "7 mc",
          sorturi: "4",
          transportPret: "150 lei",
          furnizor: "Statia Sud Bucuresti",
          indicatorDeviz: "IND BET C20.25",
        },
        {
          id: "beton-c25-30",
          clasa: "C25/30",
          nivel: "Argint",
          pretMc: "390 lei",
          cantitateTransport: "8 mc",
          sorturi: "4",
          transportPret: "165 lei",
          furnizor: "Betoniera SRL",
          optionalPompa: true,
          indicatorDeviz: "IND BET C25.30",
        },
        {
          id: "beton-c30-37",
          clasa: "C30/37",
          nivel: "Aur",
          pretMc: "445 lei",
          cantitateTransport: "8 mc",
          sorturi: "5",
          transportPret: "180 lei",
          furnizor: "Statia Vest Logistic",
          optionalPompa: true,
          indicatorDeviz: "IND BET C30.37",
        },
        {
          id: "beton-c35-45",
          clasa: "C35/45",
          nivel: "Platinum",
          pretMc: "520 lei",
          cantitateTransport: "9 mc",
          sorturi: "6",
          transportPret: "220 lei",
          furnizor: "Betoniera Pro Industrial",
          optionalPompa: true,
          indicatorDeviz: "IND BET C35.45",
        },
      ],
    },
  },
  {
    slug: "reparat-calorifer",
    title: "Reparat calorifer",
    category: "Acasa",
    summary: "Vizibil instant din Backoffice in homepage, catalog si pagina dedicata.",
    description:
      "Serviciu-etalon pentru fluxul complet My Darrin: Super Admin configureaza textul, imaginile, video-ul si documentele in Backoffice, salveaza, apoi publicul vede imediat actualizarea in site.",
    startingPrice: "de la 189 lei",
    rating: "4.9",
    accent: "orange",
    mediaType: "VIDEO",
    badges: ["Sincronizat din Backoffice", "Recomandat", "AI ready"],
    benefits: ["Pret standardizat", "Garantie", "Documente atasate", "Provider verificat"],
    levels: [
      { label: "Bronz", price: "189 lei", note: "Diagnostic si interventie esentiala" },
      { label: "Argint", price: "349 lei", note: "Reparatie recomandata cu materiale incluse" },
      { label: "Aur", price: "540 lei", note: "Inlocuire partiala si reglaj complet" },
    ],
  },
  {
    slug: "montaj-centrala-termica",
    title: "Montaj centrala termica",
    category: "Acasa",
    summary: "Interventie complexa cu verificari si executie standardizata.",
    description:
      "Pachet pentru montaj si configurare cu verificari tehnice, provider validat si status clar pentru client pe intreaga durata a executiei.",
    startingPrice: "de la 540 lei",
    rating: "4.8",
    accent: "navy",
    mediaType: "IMAGINE",
    badges: ["Featured", "Cu deviz instant"],
    benefits: ["Programare rapida", "Garantie", "Checklist de executie", "Plata securizata"],
    levels: [
      { label: "Standard", price: "540 lei", note: "Montaj esential" },
      { label: "Premium", price: "1.290 lei", note: "Montaj + accesorii + verificari" },
    ],
  },
  {
    slug: "interventii-electrice",
    title: "Interventii electrice",
    category: "Acasa",
    summary: "Raspuns rapid pentru incidente si remedieri electrice.",
    description:
      "Serviciu rapid, orientat spre conversie, cu card mare, rating, pret de pornire si CTA puternic, in aceeasi grila vizuala aprobata din homepage V3.",
    startingPrice: "de la 160 lei",
    rating: "4.7",
    accent: "green",
    mediaType: "IMAGINE",
    badges: ["Rapid", "Urgente"],
    benefits: ["Timp de raspuns", "Pret transparent", "Istoric de interventie"],
    levels: [
      { label: "Standard", price: "160 lei", note: "Diagnostic si remediere rapida" },
      { label: "Premium", price: "310 lei", note: "Remediere extinsa si sigurante" },
    ],
  },
  {
    slug: "renovare-baie",
    title: "Renovare baie",
    category: "Acasa",
    summary: "Pachet cu volum mare, orientat pe claritate si incredere.",
    description:
      "Exemplu de serviciu care cere prezentare media ampla, beneficii, CTA si ordonare buna a informatiei in acelasi sistem vizual coerent cu homepage V3.",
    startingPrice: "de la 2.450 lei",
    rating: "4.9",
    accent: "navy",
    mediaType: "SLIDE",
    badges: ["Campanie", "Proiect complet"],
    benefits: ["Deviz clar", "Echipe validate", "Monitorizare executie"],
    levels: [
      { label: "Standard", price: "2.450 lei", note: "Refresh esential" },
      { label: "Premium", price: "4.980 lei", note: "Executie completa" },
    ],
  },
];

export function getPublicServiceBySlug(slug: string) {
  return publicServiceCatalog.find((service) => service.slug === slug);
}

export const publicRoleCatalog: PublicRoleRecord[] = [
  {
    id: "super-admin",
    label: "Super Admin",
    audience: "Control total platforma",
    description: "Configureaza structura publica, aproba continutul sincronizat si gestioneaza rolurile si permisiunile.",
    permissions: ["Administrare globala", "Aprobari finale", "Roluri si permisiuni", "Audit si rapoarte"],
    ctaLabel: "Solicita activare Super Admin",
  },
  {
    id: "admin",
    label: "Admin",
    audience: "Operare Backoffice",
    description: "Gestioneaza servicii, categorii, media si CTA-uri din Backoffice, cu publicare controlata pe site-ul public.",
    permissions: ["Editare servicii", "Upload imagini si video", "Gestionare categorii", "Validare continut"],
    ctaLabel: "Solicita cont Admin",
  },
  {
    id: "partner",
    label: "Partener",
    audience: "Prestator verificat",
    description: "Isi administreaza profilul, documentele, disponibilitatea si comenzile primite din platforma.",
    permissions: ["Profil companie", "Documente conformitate", "Disponibilitate", "Status executie"],
    ctaLabel: "Creeaza cont Partener",
  },
  {
    id: "investor",
    label: "Investitor",
    audience: "Acces profil investitii",
    description: "Isi finalizeaza profilul investitional si ramane in flux de analiza si aprobare controlata.",
    permissions: ["Profil investitional", "Documente suport", "Istoric comunicare", "Acces controlat"],
    ctaLabel: "Creeaza cont Investitor",
  },
  {
    id: "client",
    label: "Client",
    audience: "Comanda servicii",
    description: "Poate cere servicii, incarca foto si video, urmari statusul si gestiona istoricul comenzilor sale.",
    permissions: ["Cereri si comenzi", "Upload media", "Plata si status", "Istoric interventii"],
    ctaLabel: "Creeaza cont Client",
  },
];

export const publicSelfSignupRoles = publicRoleCatalog.filter((role) =>
  ["client", "partner", "investor"].includes(role.id),
);
