"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { type ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

const backofficeMenu = [
  "Dashboard",
  "Catalog Servicii",
  "Gestionare Comenzi",
  "Management Provideri",
  "Rapoarte & BI",
  "Design System",
  "AI Darrin",
  "Integrari Externe",
  "Administrare Mobile",
  "Marketing",
];

const serviceLevels = [
  { label: "Bronz", price: "726 lei", note: "Interventie esentiala" },
  { label: "Argint", price: "1.252 lei", note: "Configuratie recomandata" },
  { label: "Aur", price: "1.467 lei", note: "Executie extinsa" },
  { label: "Platinum", price: "1.731 lei", note: "Pachet premium complet" },
];

const recipeRows = [
  { type: "MANOPERA", label: "Mecanic instalatii termice", value: "2.5 ora" },
  { type: "MATERIAL", label: "Kit etansare + robineti", value: "1 set" },
  { type: "TRANSPORT", label: "Transport urban interventie", value: "8 km" },
];

const attachmentRows = [
  { type: "Imagine principala", state: "Preview live", tone: "bg-[#FFF3E6] text-[#A75A12]" },
  { type: "Video demo", state: "Atasat", tone: "bg-[#E7F5F4] text-[#117A73]" },
  { type: "PDF instructiuni", state: "Atasat", tone: "bg-[#EEF3FB] text-[#27446F]" },
];

const publicNavItems = ["Acasa", "Catalog Servicii", "Devino Partener", "Investitori", "Despre Noi", "Contact"];

const publicHomeCards = [
  {
    title: "Reparat calorifer",
    description: "Serviciu sincronizat direct din Backoffice, cu media, reteta simplificata si preturi pe nivel.",
    featured: true,
  },
  {
    title: "Renovare baie la cheie",
    description: "Pachet complet pentru lucrari coordonate, materiale si executie integrata.",
    featured: false,
  },
  {
    title: "Montaj centrala termica",
    description: "Instalare, configurare si punere in functiune cu control operational clar.",
    featured: false,
  },
  {
    title: "Interventii electrice",
    description: "Diagnostic si remediere rapida pentru instalatii rezidentiale sau comerciale.",
    featured: false,
  },
  {
    title: "Amenajari interioare premium",
    description: "Flux de proiect, deviz si executie pentru spatii rezidentiale si comerciale.",
    featured: false,
  },
];

const flowSteps = [
  "1. Super Admin configureaza serviciul in Backoffice, completeaza reteta si incarca media.",
  "2. Click pe Salveaza si publica trimite serviciul in preview-ul public sincronizat.",
  "3. Catalogul public afiseaza automat cardul nou si pagina detaliata pentru Reparat calorifer.",
  "4. Super Admin verifica vizual si aproba exact ce se vede public.",
];

const homeQuickCategories = [
  { title: "Acasa", note: "Instalatii, reparatii, urgente" },
  { title: "Auto", note: "Diagnoza, tractari, mentenanta" },
  { title: "Industrial", note: "Linii, utilaje, interventii" },
  { title: "HoReCa", note: "Service tehnic si operational" },
  { title: "Agricultura", note: "Mecanizare si mentenanta" },
  { title: "Logistica", note: "Transport, depozit, suport" },
  { title: "Institutii", note: "Achizitii si executie controlata" },
];

const homeFeaturedServices = [
  { title: "Reparat calorifer", rating: "4.9", price: "de la 189 lei", media: "[VIDEO]", featured: true },
  { title: "Montaj centrala termica", rating: "4.8", price: "de la 540 lei", media: "[IMAGINE]" },
  { title: "Interventii electrice", rating: "4.7", price: "de la 160 lei", media: "[IMAGINE]" },
  { title: "Renovare baie", rating: "4.9", price: "de la 2.450 lei", media: "[SLIDE]" },
];

const homeHowItWorks = [
  "Descrii / Alegi",
  "Primesti deviz",
  "Alegi furnizor",
  "Executie",
  "Plata securizata + garantie",
];

const homeBenefits = ["Garantie", "Asigurare", "Pret standardizat", "Profesionisti verificati"];

const publicHomeCategoriesV3 = [
  { title: "Acasa", detail: "Instalatii, reparatii, urgente", media: "[IMAGINE]" },
  { title: "Auto", detail: "Diagnoza, tractari, mentenanta", media: "[IMAGINE]" },
  { title: "Industrial", detail: "Utilaje, linii, mentenanta", media: "[VIDEO]" },
  { title: "HoReCa", detail: "Echipamente si operational", media: "[SLIDE]" },
  { title: "Agricultura", detail: "Mecanizare si interventii", media: "[IMAGINE]" },
  { title: "Logistica", detail: "Depozit, transport, suport", media: "[IMAGINE]" },
  { title: "Institutii", detail: "Achizitii si executie controlata", media: "[SLIDE]" },
];

const publicHomeFeaturedV3 = [
  {
    title: "Reparat calorifer",
    rating: "4.9",
    price: "189 lei",
    media: "[VIDEO]",
    badge: "Sincronizat din Backoffice",
    detail: "Card public aprobat dupa salvare: imagine/video, pret, rating, CTA si pagina individuala.",
  },
  {
    title: "Montaj centrala termica",
    rating: "4.8",
    price: "540 lei",
    media: "[IMAGINE]",
    badge: "Featured",
    detail: "Serviciu cu media-first layout si acces rapid in catalog.",
  },
  {
    title: "Interventii electrice",
    rating: "4.7",
    price: "160 lei",
    media: "[IMAGINE]",
    badge: "Rapid",
    detail: "Exemplu de card compact pentru conversie rapida pe mobil.",
  },
  {
    title: "Renovare baie",
    rating: "4.9",
    price: "2.450 lei",
    media: "[SLIDE]",
    badge: "Campanie",
    detail: "Slide vizual pentru servicii cu volum mare si decizie asistata.",
  },
];

const publicSyncStepsV3 = [
  "Super Admin creeaza si configureaza serviciul in Backoffice, cu [IMAGINE], [VIDEO] si documente.",
  "Super Admin salveaza si publica. Serviciul devine vizibil automat in Home Page, Catalog si pagina proprie.",
  "Vizitatorul vede imediat cardul public, inclusiv exemplul Reparat calorifer si CTA-ul Vezi detalii.",
  "Super Admin verifica preview-ul public si aproba exact ce se vede live pe 24 martie 2026.",
];

const publicHowItWorksV3 = [
  "Descrii / Alegi",
  "Primesti deviz",
  "Alegi furnizor",
  "Executie",
  "Plata securizata + garantie",
];

const publicBenefitsV3 = ["Pret standardizat", "Garantie", "Asigurare", "Profesionisti verificati"];

const responsiveShowcaseV3 = [
  { title: "Desktop", size: "1440 px", note: "Hero complet + grid featured 4 coloane" },
  { title: "Tablet", size: "1024 px", note: "Header comprimat + 2 coloane featured" },
  { title: "Mobile", size: "390 px", note: "Scroll vertical + categorii thumb-friendly" },
  { title: "App Mobile", size: "App shell", note: "Bottom CTA si input AI accesibil cu un deget" },
];

const approvedBackofficeSectionsV3 = [
  {
    title: "Homepage publica",
    branches: ["Hero", "Categorii rapide", "Dual entry", "Featured services", "How it works", "Beneficii", "CTA final", "Footer public"],
  },
  {
    title: "Catalog servicii",
    branches: ["Categorii", "Subcategorii", "Carduri servicii", "Preturi de pornire", "Rating", "Filtre si sortare"],
  },
  {
    title: "Pagini servicii",
    branches: ["Galerie media", "Pachete si niveluri", "Deviz", "Furnizori", "Documente", "Recenzii"],
  },
  {
    title: "Darrin AI",
    branches: ["Prompt intrare", "Upload imagine", "Upload video", "Clasificare intentie", "CTA conversie"],
  },
  {
    title: "Parteneri si investitori",
    branches: ["Devino partener", "Devino investitor", "Formulare", "Beneficii", "Aprobari"],
  },
  {
    title: "Administrare globala",
    branches: ["Meniu public", "Limbi", "Adrese", "SEO", "Legal", "Aplicatii mobile"],
  },
];

const approvedCategoriesV3 = [
  { title: "Acasa", note: "Instalatii, urgenta, reparatii", tone: "bg-[#F5F6F7]" },
  { title: "Auto", note: "Diagnoza, remorcare, mentenanta", tone: "bg-[#EAF9F7]" },
  { title: "Industrial", note: "Utilaje, linii, interventii", tone: "bg-[#EEF3FB]" },
  { title: "HoReCa", note: "Service operational rapid", tone: "bg-[#FFF4E8]" },
  { title: "Agricultura", note: "Mecanizare si suport", tone: "bg-[#EAF9F7]" },
  { title: "Logistica", note: "Depozit si executie", tone: "bg-[#EEF3FB]" },
];

const approvedServicesV3 = [
  { title: "Reparat calorifer", price: "de la 189 lei", rating: "4.9", accent: "bg-[#EF7F1A]", highlighted: true },
  { title: "Montaj centrala termica", price: "de la 540 lei", rating: "4.8", accent: "bg-[#1E2E4D]", highlighted: false },
  { title: "Interventii electrice", price: "de la 160 lei", rating: "4.7", accent: "bg-[#09A299]", highlighted: false },
  { title: "Renovare baie", price: "de la 2.450 lei", rating: "4.9", accent: "bg-[#1E2E4D]", highlighted: false },
];

const approvedStepsV3 = [
  "Spui ce problema ai sau alegi direct serviciul",
  "Primesti deviz instant si interval de executie",
  "Alegi furnizorul validat si confirmi comanda",
  "Executie, plata securizata si garantie",
];

const publicHeaderLinks = [
  { label: "Acasa", href: "/mockup-v1/public/home" },
  { label: "Catalog Servicii", href: "/mockup-v1/public/catalog" },
  { label: "Devino Partener", href: "/mockup-v1/public/devino-partener" },
  { label: "Devino Investitor", href: "/mockup-v1/public/investitori" },
  { label: "Contact", href: "/mockup-v1/public/account" },
];

const publicFooterColumns = [
  {
    title: "Servicii",
    links: [
      { label: "Homepage", href: "/mockup-v1/public/home" },
      { label: "Catalog Servicii", href: "/mockup-v1/public/catalog" },
      { label: "Reparat calorifer", href: "/mockup-v1/public/reparat-calorifer" },
      { label: "Cosul meu", href: "/mockup-v1/public/cos" },
    ],
  },
  {
    title: "Companie",
    links: [
      { label: "Devino Partener", href: "/mockup-v1/public/devino-partener" },
      { label: "Inscriere Partener", href: "/mockup-v1/public/devino-partener/inscriere" },
      { label: "Modul Client", href: "/mockup-v1/public/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Creare cont client", href: "/mockup-v1/public/account/creare-cont" },
      { label: "GDPR", href: "/mockup-v1/public/account/creare-cont" },
      { label: "Politici", href: "/mockup-v1/public/account/creare-cont" },
    ],
  },
  {
    title: "Investitori",
    links: [
      { label: "Devino Investitor", href: "/mockup-v1/public/investitori" },
      { label: "Creare cont investitor", href: "/mockup-v1/public/investitori/creare-cont" },
      { label: "Dashboard demo", href: "/mockup-v1/public/investitori" },
    ],
  },
];

const publicQuickAccessLinks = [
  { title: "Catalog servicii", href: "/mockup-v1/public/catalog", tone: "bg-[#FFF4E8]" },
  { title: "Pagina serviciu", href: "/mockup-v1/public/reparat-calorifer", tone: "bg-[#EEF3FB]" },
  { title: "Cosul meu", href: "/mockup-v1/public/cos", tone: "bg-[#EAF9F7]" },
  { title: "Checkout", href: "/mockup-v1/public/checkout", tone: "bg-[#FFF4E8]" },
  { title: "Status plata", href: "/mockup-v1/public/payment-status", tone: "bg-[#EEF3FB]" },
  { title: "Modul partener", href: "/mockup-v1/public/devino-partener", tone: "bg-[#EAF9F7]" },
  { title: "Inscriere partener", href: "/mockup-v1/public/devino-partener/inscriere", tone: "bg-[#FFF4E8]" },
  { title: "Dashboard partener", href: "/mockup-v1/public/dashboard-partener", tone: "bg-[#EAF9F7]" },
  { title: "Modul investitor", href: "/mockup-v1/public/investitori", tone: "bg-[#EEF3FB]" },
  { title: "Creare cont investitor", href: "/mockup-v1/public/investitori/creare-cont", tone: "bg-[#EAF9F7]" },
  { title: "Modul client", href: "/mockup-v1/public/account", tone: "bg-[#FFF4E8]" },
  { title: "Creare cont client", href: "/mockup-v1/public/account/creare-cont", tone: "bg-[#EEF3FB]" },
];

type CartItem = {
  serviceId: string;
  slug: string;
  title: string;
  level: "Basic" | "Standard" | "Premium" | "Platinum";
  quantity: number;
  unit: string;
  zoneId: string;
  zoneName: string;
  priceUnit: number;
  subtotal: number;
  imageUrl?: string;
  prestareAddress?: string;
};

const cartItemsMock: CartItem[] = [
  {
    serviceId: "svc-radiator-repair",
    slug: "reparat-calorifer",
    title: "Reparat calorifer",
    level: "Premium",
    quantity: 2,
    unit: "radiatoare",
    zoneId: "ro-b-3",
    zoneName: "Bucuresti - Sector 3",
    priceUnit: 420,
    subtotal: 840,
    prestareAddress: "Bd. Unirii nr. 5, Bucuresti",
  },
  {
    serviceId: "svc-air-bleeding",
    slug: "aerisire-instalatie-termica",
    title: "Aerisire instalatie termica",
    level: "Standard",
    quantity: 1,
    unit: "interventie",
    zoneId: "ro-b-3",
    zoneName: "Bucuresti - Sector 3",
    priceUnit: 185,
    subtotal: 185,
    prestareAddress: "Bd. Unirii nr. 5, Bucuresti",
  },
  {
    serviceId: "svc-valve-replacement",
    slug: "inlocuire-robinet-calorifer",
    title: "Inlocuire robinet calorifer",
    level: "Platinum",
    quantity: 2,
    unit: "buc",
    zoneId: "ro-b-3",
    zoneName: "Bucuresti - Sector 3",
    priceUnit: 268,
    subtotal: 536,
    prestareAddress: "Bd. Unirii nr. 5, Bucuresti",
  },
];

const cartRecommendationsMock = [
  { title: "Spalare circuit termic", note: "Complementar pentru eficienta caloriferelor", price: "de la 290 lei" },
  { title: "Montaj cap termostatic", note: "Optimizare consum si control pe camera", price: "de la 165 lei" },
  { title: "Verificare centrala termica", note: "Sincronizat cu aceeasi zona de prestare", price: "de la 220 lei" },
];

const checkoutCountryRates = [
  { country: "Romania", tvaLabel: "19%", tvaRate: 0.19, currency: "RON" },
  { country: "Germania", tvaLabel: "19%", tvaRate: 0.19, currency: "EUR" },
  { country: "Olanda", tvaLabel: "21%", tvaRate: 0.21, currency: "EUR" },
];

const checkoutPaymentSteps = [
  "Revizuire coș și validare zonă prestare pentru toate serviciile",
  "Separare adresă prestare / adresă facturare și calcul TVA pe țara selectată",
  "Alegere metodă de plată: card, transfer bancar, blocare sumă",
  "Confirmare comandă, emitere documente și notificare către prestatori",
];

const checkoutPaymentMethods = [
  "Card online securizat - Stripe / MobilPay",
  "Transfer bancar pentru companii și proiecte mari",
  "Blocare sumă / autorizare inițială până la confirmarea finală",
];

const postCheckoutStates = [
  {
    key: "pending",
    title: "Pending payment",
    note: "Plata este initiata, dar asteapta confirmarea procesatorului.",
    tone: "bg-[#FFF4E8] text-[#EF7F1A]",
  },
  {
    key: "authorized",
    title: "Payment authorized",
    note: "Suma este blocata sau confirmata, iar comanda poate intra in flux operational.",
    tone: "bg-[#EAF9F7] text-[#117A73]",
  },
  {
    key: "confirmed",
    title: "Order confirmed",
    note: "Documentele sunt generate si clientul primeste email si SMS cu rezumatul comenzii.",
    tone: "bg-[#EEF3FB] text-[#1E2E4D]",
  },
  {
    key: "provider",
    title: "Awaiting provider assignment",
    note: "Backoffice-ul cauta sau confirma prestatorul potrivit pe baza zonei si serviciilor comandate.",
    tone: "bg-[#1E2E4D] text-white",
  },
];

const serviceLevelResourcesV3 = [
  {
    level: "Bronz",
    summary: "Interventie esentiala",
    finalPrice: "726 lei",
    resources: [
      "Manopera: 2.5 ore",
      "Material: kit etansare standard",
      "Transport: urban 8 km",
      "TVA: conform zona si tip client",
    ],
  },
  {
    level: "Argint",
    summary: "Configuratie recomandata",
    finalPrice: "1.252 lei",
    resources: [
      "Manopera: diagnostic + reglaj extins",
      "Material: kit etansare + robineti",
      "Transport: urban prioritar",
      "Zona / moneda: calculate din Backoffice",
    ],
  },
  {
    level: "Aur",
    summary: "Executie extinsa",
    finalPrice: "1.467 lei",
    resources: [
      "Manopera: interventie extinsa",
      "Material: pachet complet consumabile",
      "Transport: extins in zona prestare",
      "TVA si tara: reguli active din admin",
    ],
  },
  {
    level: "Platinum",
    summary: "Pachet premium complet",
    finalPrice: "1.731 lei",
    resources: [
      "Manopera: prioritate maxima",
      "Material: componente premium",
      "Transport: dedicat si verificare finala",
      "Pret final: zona, moneda si TVA sincronizate",
    ],
  },
];

const publicAccessConfigV3 = [
  "Subdomeniu dezvoltare si testare: https://mydarrin.homebestpal.com",
  "Gate temporar cu email + parola inainte de Home Page publica",
  "Dupa autentificare, vizitatorul vede direct homepage-ul My Darrin",
  "Lansare publica finala: www.mydarrin.com, fara gate",
];

const homepageBuilderControlsV3 = [
  "Texte, headline, subheadline si CTA-uri",
  "Imagini, video, slide-uri si ordinea lor",
  "Categorii rapide si carduri featured",
  "Beneficii, footer si setari de limba",
  "Publicare automata dupa Save din Web Design / Homepage Builder",
];

function LogoBlock() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 overflow-hidden rounded-[18px] bg-[#EF7F1A]">
        <div className="absolute left-[8px] top-[7px] h-[30px] w-[28px] rounded-tl-[16px] rounded-tr-[12px] rounded-br-[9px] bg-[#1E2E4D]" />
        <div className="absolute left-[15px] top-[23px] h-[16px] w-[8px] rounded-t-[8px] bg-[#EF7F1A] ring-[4px] ring-white" />
        <div className="absolute right-[7px] top-[7px] h-[12px] w-[12px] rounded-full border-[4px] border-white bg-[#1E2E4D]" />
      </div>
      <div>
        <div className="text-[24px] font-semibold leading-none text-[#1E2E4D]">My Darrin</div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#EF7F1A]">Home Best Pal</div>
      </div>
    </div>
  );
}

function DarrinBadge() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-[0_12px_24px_rgba(30,46,77,0.08)]">
      <div className="relative h-10 w-10 rounded-full bg-[#1E2E4D]">
        <span className="absolute left-2 top-3 h-2.5 w-2.5 rounded-full bg-white" />
        <span className="absolute right-2 top-3 h-2.5 w-2.5 rounded-full bg-white" />
        <span className="absolute left-1/2 top-6 h-1.5 w-4 -translate-x-1/2 rounded-full bg-[#EF7F1A]" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Darrin AI</div>
        <div className="text-sm text-[#1E2E4D]/70">Asistent discret pentru Super Admin</div>
      </div>
    </div>
  );
}

function MockupMarker({
  label,
  tone = "light",
}: {
  label: string;
  tone?: "light" | "dark" | "green" | "orange";
}) {
  const tones = {
    light: "bg-white/88 text-[#1E2E4D]",
    dark: "bg-[#1E2E4D] text-white",
    green: "bg-[#09A299] text-white",
    orange: "bg-[#EF7F1A] text-white",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tones[tone]}`}>
      {label}
    </span>
  );
}

function ApprovedPublicFooter() {
  return (
    <footer className="bg-[#1E2E4D] text-white">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] xl:px-8">
        <div>
          <div className="flex items-center gap-3">
            <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
            <LogoBlock />
          </div>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/72">
            Platforma publica My Darrin pentru servicii la cerere, AI operational si profesionisti verificati.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1E2E4D]">[ICON]</span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1E2E4D]">[ICON]</span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1E2E4D]">[ICON]</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mockup-v1/public/home" className="rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-[#1E2E4D]">
              iOS App
            </Link>
            <Link href="/mockup-v1/public/account/creare-cont" className="rounded-full bg-[#EF7F1A] px-5 py-3 text-[14px] font-semibold text-white">
              Android App
            </Link>
            <span className="rounded-full bg-white/10 px-4 py-3 text-sm font-medium text-white">RO | EN</span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {publicFooterColumns.map((column) => (
            <div key={column.title}>
              <div className="text-[15px] font-semibold text-white">{column.title}</div>
              <div className="mt-4 grid gap-2 text-[14px] text-white/68">
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-[1500px] gap-3 border-t border-white/10 px-4 py-5 text-sm text-white/60 sm:px-6 lg:grid-cols-[1fr_auto] xl:px-8">
        <div>Home Best Pal SRL | Bucuresti, Romania | contact@mydarrin.com | +40 700 000 000</div>
        <div>mydarrin.homebestpal.com</div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/58">Copyright My Darrin | Operated by Home Best Pal</div>
    </footer>
  );
}

function BrowserFrame({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[#1E2E4D]/10 bg-white shadow-[0_26px_80px_rgba(30,46,77,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2E4D]/8 bg-[#F7F9FC] px-5 py-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EF7F1A]">{eyebrow}</div>
          <div className="mt-1 text-lg font-semibold text-[#1E2E4D]">{title}</div>
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function FlowRail() {
  return (
    <div className="rounded-[30px] bg-[#1E2E4D] p-6 text-white">
      <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#FFCF95]">Flux complet</div>
      <div className="mt-3 text-[28px] font-semibold leading-tight">Backoffice → previzualizare → catalog public → aprobare</div>
      <div className="mt-6 grid gap-4">
        {flowSteps.map((step) => (
          <div key={step} className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4 text-sm leading-7 text-white/82">
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicShell({
  children,
  active,
}: {
  children: ReactNode;
  active: "home" | "catalog" | "service" | "partner" | "investor" | "account";
}) {
  return (
    <main className={`${inter.className} min-h-screen bg-[#FFFFFF] text-[#1E2E4D]`}>
      <div className="fixed bottom-5 right-5 z-30">
        <button className="flex items-center gap-3 rounded-full bg-[#09A299] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(9,162,153,0.28)] transition hover:bg-[#117A73]">
          <MockupMarker label="[DARRIN AI BUTTON]" tone="light" />
          Vorbeste cu Darrin
        </button>
      </div>

      <header className="sticky top-0 z-20 border-b border-[#1E2E4D]/8 bg-white/95 shadow-[0_10px_35px_rgba(30,46,77,0.06)] backdrop-blur">
        <div className="mx-auto max-w-[1540px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[#1E2E4D]/10 bg-[#F6F7FA] px-3 py-2 text-sm font-semibold text-[#1E2E4D] lg:hidden">
                Menu
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                  <LogoBlock />
                </div>
                <div className="hidden items-center gap-2 text-xs font-medium text-[#1E2E4D]/62 md:flex">
                  <MockupMarker label="[ICON]" tone="dark" />
                  Bucuresti, Sector 3 - autodetect sau select manual
                </div>
              </div>
            </div>

            <div className="hidden min-w-[280px] flex-1 items-center gap-3 rounded-[22px] border border-[#1E2E4D]/10 bg-[#F5F6F7] px-4 py-3 lg:flex xl:max-w-[520px]">
              <MockupMarker label="[DARRIN AI]" tone="green" />
              <span className="truncate text-[14px] text-[#1E2E4D]/60">Descrie ce ai nevoie... (poti incarca poze/video)</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a href="#" className="hidden rounded-full bg-[#09A299] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#117A73] md:inline-flex">
                Darrin AI CTA
              </a>
              <span className="hidden rounded-full border border-[#1E2E4D]/10 bg-white px-4 py-3 text-sm font-medium text-[#1E2E4D] sm:inline-flex">
                Cont
              </span>
              <span className="hidden rounded-full border border-[#1E2E4D]/10 bg-white px-4 py-3 text-sm font-medium text-[#1E2E4D] sm:inline-flex">
                Cos
              </span>
              <span className="rounded-full bg-[#F5F6F7] px-4 py-3 text-sm font-medium text-[#1E2E4D]">RO</span>
              <Link href="/mockup-v1/public/account" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1E2E4D] text-sm font-semibold text-white">
                U
              </Link>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-[#1E2E4D]/62 md:hidden">
              <MockupMarker label="[ICON]" tone="dark" />
              Bucuresti, Sector 3
            </div>
            <nav className="flex flex-wrap items-center gap-3 text-[14px] font-medium text-[#1E2E4D]/86 xl:gap-7 xl:text-[15px]">
              {[
                { label: "Servicii", href: "/mockup-v1/public/catalog", key: "catalog" },
                { label: "Industrii", href: "/mockup-v1/public/home", key: "home" },
                { label: "Devino Partener", href: "/mockup-v1/public/devino-partener", key: "partner" },
                { label: "Devino Investitor", href: "/mockup-v1/public/investitori", key: "investor" },
                { label: "Contact", href: "/mockup-v1/public/reparat-calorifer", key: "service" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={active === item.key ? "text-[#EF7F1A]" : "transition hover:text-[#EF7F1A]"}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 rounded-[20px] border border-[#1E2E4D]/10 bg-[#F5F6F7] px-4 py-3 lg:hidden">
              <MockupMarker label="[DARRIN AI]" tone="green" />
              <span className="truncate text-[13px] text-[#1E2E4D]/58">Descrie ce ai nevoie... (poti incarca poze/video)</span>
            </div>
          </div>
        </div>
      </header>

      {children}

      <footer className="mt-12 bg-[#1E2E4D] text-white">
        <div className="mx-auto grid max-w-[1540px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.12fr_1fr] lg:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
              <LogoBlock />
            </div>
            <div className="mt-5 max-w-xl text-sm leading-7 text-white/72">
              My Darrin aduce servicii la cerere, AI operational si executie verificata intr-o experienta publica rapida, aerisita si orientata spre conversie.
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <MockupMarker label="[ICON]" tone="light" />
              <MockupMarker label="[ICON]" tone="light" />
              <MockupMarker label="[ICON]" tone="light" />
              <MockupMarker label="[ICON]" tone="light" />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#" className="rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-[#1E2E4D]">
                iOS App
              </a>
              <a href="#" className="rounded-full bg-[#EF7F1A] px-5 py-3 text-[14px] font-semibold text-white">
                Android App
              </a>
              <span className="rounded-full bg-white/10 px-4 py-3 text-sm font-medium text-white">RO | EN</span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Servicii", ["Catalog Servicii", "Industrii", "Darrin AI"]],
              ["Companie", ["Devino Partener", "Despre", "Contact"]],
              ["Legal", ["Termeni", "GDPR", "Politici"]],
              ["Investitori", ["Devino Investitor", "Ecosistem", "Contact"]],
            ].map(([title, links]) => (
              <div key={String(title)}>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="mt-3 grid gap-2 text-sm text-white/68">
                  {(links as string[]).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-[1540px] gap-3 border-t border-white/10 px-4 py-5 text-sm text-white/60 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>Home Best Pal SRL | Bucuresti, Romania | contact@mydarrin.com | +40 700 000 000</div>
          <div>mydarrin.homebestpal.com</div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/58">
          Copyright My Darrin | Operated by Home Best Pal | mydarrin.homebestpal.com
        </div>
      </footer>
    </main>
  );
}

function PublicSynchronizationStrip() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[30px] bg-[#1E2E4D] p-6 text-white">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#FFCF95]">Flux sincronizare</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <MockupMarker label="[IMAGINE]" tone="light" />
          <MockupMarker label="[VIDEO]" tone="light" />
          <MockupMarker label="[SLIDE]" tone="light" />
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-4">
          {flowSteps.map((step) => (
            <div key={step} className="rounded-[22px] bg-white/8 px-4 py-4 text-sm leading-7 text-white/82">
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicHomeHero() {
  return (
    <section className="bg-[#FCFBF7]">
      <div className="mx-auto grid max-w-[1540px] gap-8 px-4 py-10 sm:px-6 lg:px-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
        <div className="pb-4">
          <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#EF7F1A] shadow-[0_12px_24px_rgba(30,46,77,0.08)]">
            Home Page Publica - Mockup V1
          </div>
          <h1 className="mt-5 max-w-4xl text-[44px] font-semibold leading-[0.96] text-[#1E2E4D] sm:text-[56px] xl:text-[68px]">
            Reparatii, constructii si servicii la cheie - rapid si transparent
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[#1E2E4D]/72">
            Vizitatorul vede imediat serviciile active, iar `Reparat calorifer` apare in homepage imediat dupa ce este
            salvat si publicat din Backoffice.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/mockup-v1/public/catalog" className="rounded-full bg-[#1E2E4D] px-6 py-3 text-sm font-semibold text-white">
              Vezi toate serviciile
            </Link>
            <span className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1E2E4D] shadow-[0_12px_24px_rgba(30,46,77,0.08)]">
              Creeaza deviz instant
            </span>
          </div>
        </div>

        <div className="pb-4">
          <div className="relative overflow-hidden rounded-[36px] bg-[#1E2E4D] p-6 text-white shadow-[0_28px_80px_rgba(30,46,77,0.12)]">
            <div className="flex items-center justify-between gap-4">
              <div className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                Robot Darrin + lucrari reale
              </div>
              <DarrinBadge />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[26px] bg-white/10 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFCF95]">Fundal video</div>
                <div className="mt-4 text-[28px] font-semibold leading-tight">
                  Fundal din lucrari reale, aprobat in Backoffice
                </div>
              </div>
              <div className="rounded-[26px] bg-white/12 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFCF95]">Serviciu evidentiat</div>
                <div className="mt-4 text-[28px] font-semibold leading-tight">Reparat calorifer</div>
                <div className="mt-3 text-sm leading-7 text-white/82">
                  Cardul special din homepage foloseste exact media si preturile publicate de Super Admin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicServiceCards() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Catalog previzualizare</div>
        <h2 className="mt-3 text-[36px] font-semibold leading-[1.02] text-[#1E2E4D]">Serviciile publice apar direct in homepage</h2>
        <p className="mt-4 text-[16px] leading-7 text-[#1E2E4D]/68">
          `Reparat calorifer` este evidentiat pentru a arata clar sincronizarea dintre Backoffice si experienta publica.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {publicHomeCards.map((card) => (
          <article
            key={card.title}
            className={`overflow-hidden rounded-[30px] border border-[#1E2E4D]/10 bg-white shadow-[0_18px_54px_rgba(30,46,77,0.06)] ${
              card.featured ? "ring-2 ring-[#EF7F1A]/60" : ""
            }`}
          >
            <div
              className="h-44"
              style={{ backgroundColor: card.featured ? "#1E2E4D" : "#EEF3FB" }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[22px] font-semibold leading-tight text-[#1E2E4D]">{card.title}</div>
                {card.featured ? (
                  <span className="rounded-full bg-[#FFF3E6] px-3 py-1 text-xs font-semibold text-[#A75A12]">Sincronizat</span>
                ) : null}
              </div>
              <p className="mt-3 text-[15px] leading-7 text-[#1E2E4D]/66">{card.description}</p>
              <div className="mt-5 grid gap-2">
                {serviceLevels.map((level) => (
                  <div key={`${card.title}-${level.label}`} className="flex items-center justify-between rounded-[16px] bg-[#F8FAFD] px-3 py-3 text-sm text-[#1E2E4D]">
                    <span>{level.label}</span>
                    <span className="font-semibold">{level.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Link href="/mockup-v1/public/reparat-calorifer" className="inline-flex rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">
                  Vezi detalii
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BackofficeCreatePanel() {
  return (
    <BrowserFrame
      eyebrow="Backoffice"
      title="Creare / Editare Serviciu Nou"
      actions={
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1E2E4D]">Super Admin</span>
          <span className="rounded-full bg-[#EAF7F5] px-4 py-2 text-sm font-semibold text-[#117A73]">RO / EN</span>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
        <aside className="rounded-[28px] bg-[#1E2E4D] p-5 text-white">
          <div className="flex items-center justify-between">
            <LogoBlock />
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em]">Admin</span>
          </div>
          <div className="mt-6 grid gap-2">
            {backofficeMenu.map((item, index) => (
              <div
                key={item}
                className={`rounded-[18px] px-4 py-3 text-sm ${index === 1 ? "bg-[#EF7F1A] text-white" : "text-white/72"}`}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <DarrinBadge />
          </div>
        </aside>

        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-[#FFFDF8] p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Hierarchy</div>
              <div className="mt-4 grid gap-3">
                {["Domain: Constructii", "Category: Instalatii", "Subcategory: Calorifere"].map((row) => (
                  <div key={row} className="rounded-[18px] border border-[#1E2E4D]/10 bg-white px-4 py-3 text-sm text-[#1E2E4D]/78">
                    {row}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Clasificari</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["CAEN 4322", "Uniclass Pr_65_52_63", "ESCO Thermal mechanic"].map((pill) => (
                  <span key={pill} className="rounded-full bg-[#EEF3FB] px-3 py-2 text-xs font-semibold text-[#1E2E4D]">
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-[#FFFDF8] p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Date de baza</div>
              <div className="mt-4 grid gap-3">
                {[
                  "service_name_ro: Reparat calorifer",
                  "service_name_en: Radiator repair",
                  "service_code: RPSD01A1",
                  "service_slug: reparat-calorifer",
                ].map((row) => (
                  <div key={row} className="rounded-[18px] border border-[#1E2E4D]/10 bg-white px-4 py-3 text-sm text-[#1E2E4D]/78">
                    {row}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-[22px] bg-[#1E2E4D] px-4 py-4 text-sm leading-7 text-white/80">
                Diagnostic, etansare, reglaj si interventie completa pentru calorifere. Serviciul poate fi publicat imediat
                cu preview media si costuri pe nivel.
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Reteta de deviz</div>
                <span className="rounded-full bg-[#EAF7F5] px-3 py-2 text-xs font-semibold text-[#117A73]">+ Adauga resursa</span>
              </div>
              <div className="mt-4 grid gap-3">
                {recipeRows.map((row) => (
                  <div key={row.label} className="grid gap-2 rounded-[22px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 md:grid-cols-[120px_1fr_90px]">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">{row.type}</div>
                    <div className="text-sm text-[#1E2E4D]">{row.label}</div>
                    <div className="text-sm font-semibold text-[#1E2E4D]">{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-[#FFF7ED] p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Costuri configurabile</div>
                <div className="mt-4 grid gap-3 text-sm text-[#1E2E4D]/78">
                  <div className="rounded-[18px] bg-white px-4 py-3">Manopera: 75 lei / ora</div>
                  <div className="rounded-[18px] bg-white px-4 py-3">Indirecte: 10%</div>
                  <div className="rounded-[18px] bg-white px-4 py-3">Platforma: 3%</div>
                  <div className="rounded-[18px] bg-white px-4 py-3">My Darrin: 15%</div>
                  <div className="rounded-[18px] bg-white px-4 py-3">TVA: 21%</div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-[#F8FAFD] p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Atasamente</div>
                <div className="mt-4 grid gap-3">
                  {attachmentRows.map((row) => (
                    <div key={row.type} className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 text-sm text-[#1E2E4D]">
                      <span>{row.type}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.tone}`}>{row.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#1E2E4D] px-5 py-3 text-sm font-semibold text-white">Salveaza si creeaza altul</span>
            <span className="rounded-full bg-[#EF7F1A] px-5 py-3 text-sm font-semibold text-white">Salveaza si publica</span>
            <Link href="/mockup-v1/public" className="rounded-full border border-[#1E2E4D]/12 bg-white px-5 py-3 text-sm font-semibold text-[#1E2E4D]">
              Vizualizare LIVE
            </Link>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function PublicCatalogPanel() {
  return (
    <BrowserFrame
      eyebrow="Pagina Publica"
      title="Catalog Servicii - My Darrin"
      actions={
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-white px-4 py-2 font-medium text-[#1E2E4D]">Catalog Servicii</span>
          <span className="rounded-full bg-white px-4 py-2 font-medium text-[#1E2E4D]">Devino Partener</span>
          <span className="rounded-full bg-white px-4 py-2 font-medium text-[#1E2E4D]">Investitori</span>
        </div>
      }
    >
      <div className="overflow-hidden rounded-[30px] bg-[#FFF4DF]">
        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <LogoBlock />
              <DarrinBadge />
            </div>
            <div className="mt-8 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Catalog sincronizat</div>
            <div className="mt-3 max-w-2xl text-[40px] font-semibold leading-[1.02] text-[#1E2E4D]">
              Serviciul configurat in Backoffice apare imediat in vitrina publica.
            </div>
            <div className="mt-4 max-w-2xl text-[16px] leading-7 text-[#1E2E4D]/72">
              Mockup-ul arata cum cardul `Reparat calorifer` devine vizibil cu media, preturi pe nivele si semnalizare
              pentru aprobare de catre Super Admin.
            </div>
          </div>

          <div className="rounded-[30px] bg-white/88 p-5 shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
            <div className="aspect-[1.35] rounded-[26px] bg-[#1E2E4D] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/74">Serviciu nou</div>
                  <div className="mt-2 text-[28px] font-semibold">Reparat calorifer</div>
                </div>
                <span className="rounded-full bg-white/16 px-3 py-2 text-xs font-semibold">Gate active</span>
              </div>
              <div className="mt-8 rounded-[20px] bg-white/14 p-4 text-sm leading-7 text-white/84">
                Imagine principala, video demo si documentatia tehnica provin direct din configurarea Super Admin.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
        {serviceLevels.map((level) => (
          <article key={level.label} className="rounded-[28px] border border-[#1E2E4D]/10 bg-[#FFFDF8] p-5 shadow-[0_16px_40px_rgba(30,46,77,0.05)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#EF7F1A]">{level.label}</div>
            <div className="mt-3 text-[30px] font-semibold text-[#1E2E4D]">{level.price}</div>
            <div className="mt-2 text-sm leading-7 text-[#1E2E4D]/66">{level.note}</div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <Link href="/mockup-v1/public/reparat-calorifer" className="rounded-full bg-[#1E2E4D] px-5 py-3 text-center text-sm font-semibold text-white">
          Deschide pagina publica a serviciului
        </Link>
        <span className="rounded-full bg-[#EF7F1A] px-5 py-3 text-center text-sm font-semibold text-white">Aproba / Publica</span>
      </div>
    </BrowserFrame>
  );
}

function PublicServicePanel() {
  return (
    <BrowserFrame
      eyebrow="Pagina Serviciu"
      title="Reparat calorifer - pagina publica sincronizata"
      actions={<span className="rounded-full bg-[#EF7F1A] px-4 py-2 text-sm font-semibold text-white">Vizibil pentru Super Admin</span>}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          <div className="rounded-[30px] bg-[#FFF4E8] p-6">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#EF7F1A]">Serviciu configurat</div>
            <div className="mt-3 text-[42px] font-semibold leading-[1.02] text-[#1E2E4D]">Reparat calorifer</div>
            <div className="mt-4 max-w-2xl text-[16px] leading-7 text-[#1E2E4D]/72">
              Diagnostic, etansare, reglaj si interventie completa. Mockup-ul afiseaza exact blocurile pe care le
              configureaza Super Admin in Backoffice.
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-white p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Galerie media</div>
              <div className="mt-4 aspect-[1.45] rounded-[24px] bg-[#1E2E4D] p-5 text-white">
                <div className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                  Imagine principala + video demo
                </div>
                <div className="mt-8 max-w-sm text-[24px] font-semibold leading-tight">Robotul Darrin poate ghida discret utilizatorul spre nivelul recomandat.</div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-[#F8FAFD] p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Reteta simplificata</div>
              <div className="mt-4 grid gap-3">
                {recipeRows.map((row) => (
                  <div key={row.label} className="rounded-[18px] bg-white px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">{row.type}</div>
                    <div className="mt-2 text-sm text-[#1E2E4D]">{row.label}</div>
                    <div className="mt-1 text-sm font-semibold text-[#1E2E4D]">{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-white p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Preturi finale</div>
            <div className="mt-4 grid gap-3">
              {serviceLevels.map((level) => (
                <div key={level.label} className="flex items-center justify-between rounded-[20px] border border-[#1E2E4D]/10 bg-[#FFFDF8] px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold text-[#1E2E4D]">{level.label}</div>
                    <div className="text-sm text-[#1E2E4D]/62">{level.note}</div>
                  </div>
                  <div className="text-lg font-semibold text-[#1E2E4D]">{level.price}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1E2E4D]/10 bg-[#1E2E4D] p-5 text-white">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFCF95]">Actiuni Super Admin</div>
            <div className="mt-4 grid gap-3">
              <span className="rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-[#1E2E4D]">Aproba / Publica</span>
              <span className="rounded-full bg-white/12 px-4 py-3 text-center text-sm font-semibold text-white">Trimite inapoi la editare</span>
              <Link href="/mockup-v1" className="rounded-full bg-[#EF7F1A] px-4 py-3 text-center text-sm font-semibold text-white">
                Inapoi la fluxul complet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function PlatformMockupV1() {
  return (
    <main className="min-h-screen bg-[#FCFBF7] px-4 py-6 text-[#1E2E4D] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-6">
        <section className="overflow-hidden rounded-[34px] bg-[#FFF4E8] p-6 shadow-[0_26px_80px_rgba(30,46,77,0.08)] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#EF7F1A]">Mockup V1 - Platforma sincronizata</div>
              <div className="mt-4 max-w-4xl text-[42px] font-semibold leading-[0.98] text-[#1E2E4D] sm:text-[54px]">
                My Darrin arata acum fluxul complet dintre Backoffice si pagina publica.
              </div>
              <div className="mt-5 max-w-3xl text-[16px] leading-8 text-[#1E2E4D]/72">
                Super Admin configureaza serviciul `Reparat calorifer`, incarca media, salveaza si publica, iar catalogul
                public si pagina serviciului se actualizeaza imediat in mockup-ul de aprobare.
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/mockup-v1/public" className="rounded-full bg-[#1E2E4D] px-5 py-3 text-sm font-semibold text-white">
                  Vezi catalogul public
                </Link>
                <Link href="/mockup-v1/public/reparat-calorifer" className="rounded-full bg-[#EF7F1A] px-5 py-3 text-sm font-semibold text-white">
                  Vezi pagina serviciului
                </Link>
              </div>
            </div>
            <FlowRail />
          </div>
        </section>

        <BackofficeCreatePanel />
        <PublicCatalogPanel />
        <PublicServicePanel />
      </div>
    </main>
  );
}

export function PublicCatalogMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <header className="sticky top-0 z-30 border-b border-[#1E2E4D]/8 bg-white/95 backdrop-blur">
        <div className="bg-[#1E2E4D] text-white">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6 xl:px-8">
            <div className="hidden items-center gap-3 sm:flex">
              <span>Address</span>
              <span className="font-semibold">Residential - Bucharest, Sect 3, Bd Unirii nr. 5</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Romanian</span>
              <span className="hidden sm:inline">Cont</span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
          <Link href="/mockup-v1/public/home">
            <LogoBlock />
          </Link>
          <nav className="hidden items-center gap-8 xl:flex">
            {publicHeaderLinks.map((item) => (
              <Link key={item.label} href={item.href} className="text-[16px] font-medium text-[#1E2E4D] transition hover:text-[#EF7F1A]">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden min-w-[320px] items-center gap-3 rounded-full border border-[#1E2E4D]/10 bg-[#F5F6F7] px-4 py-3 lg:flex">
              <span className="text-xl text-[#1E2E4D]">Q</span>
              <span className="text-[15px] text-[#1E2E4D]/56">Cauta in catalog sau descrie o nevoie...</span>
            </div>
            <Link href="/mockup-v1/public/cos" className="rounded-full border border-[#1E2E4D]/10 bg-white px-5 py-3 text-sm font-semibold text-[#1E2E4D]">
              Cos
              <span className="ml-2 rounded-full bg-[#EF7F1A] px-2 py-0.5 text-xs font-bold text-white">3</span>
            </Link>
            <Link href="/mockup-v1/public/account" className="rounded-full bg-[#09A299] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#117A73]">
              Darrin AI
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#F5F6F7]">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
          <section className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
            <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap gap-2">
                  <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                  <MockupMarker label="[DARRIN AI]" tone="green" />
                  <MockupMarker label="[IMAGINE]" />
                </div>
                <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Catalog servicii</div>
                <h1 className="mt-4 max-w-3xl text-[46px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">
                  Toate serviciile active, clare si pregatite pentru conversie rapida.
                </h1>
                <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                  Catalogul My Darrin pastreaza stilul homepage-ului aprobat: selectie rapida, carduri media-first si filtre simple pentru utilizatori rezidentiali, comerciali si industriali.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {["Acasa", "Auto", "Industrial", "HoReCa", "Agricultura", "Logistica"].map((filter) => (
                    <span key={filter} className="rounded-full bg-[#F5F6F7] px-4 py-3 text-sm font-semibold text-[#1E2E4D]">
                      {filter}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[34px] bg-[#EEF3FB] p-8">
                <div className="flex flex-wrap gap-2">
                  <MockupMarker label="[SLIDE]" tone="dark" />
                  <MockupMarker label="[VIDEO]" />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_24px_rgba(30,46,77,0.05)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Sincronizare live</div>
                    <div className="mt-2 text-[24px] font-extrabold text-[#1E2E4D]">Reparat calorifer</div>
                    <div className="mt-2 text-sm leading-6 text-[#1E2E4D]/64">Card sincronizat din Backoffice, vizibil si in homepage si in pagina de serviciu.</div>
                  </div>
                  <div className="rounded-[24px] bg-[#1E2E4D] p-5 text-white shadow-[0_10px_24px_rgba(30,46,77,0.12)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B9E8E5]">Search + AI</div>
                    <div className="mt-2 text-[22px] font-extrabold leading-tight">Utilizatorul poate intra direct din catalog sau prin Darrin AI.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl">
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Grid servicii</div>
                <h2 className="mt-3 text-[42px] font-extrabold leading-[0.98] text-[#1E2E4D]">Carduri mari, rating clar si pret de pornire vizibil</h2>
              </div>
              <div className="rounded-full bg-[#1E2E4D] px-5 py-3 text-sm font-semibold text-white">64 servicii active</div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {approvedServicesV3.map((service) => (
                <article
                  key={service.title}
                  className={`overflow-hidden rounded-[30px] bg-[#F9FAFB] shadow-[0_16px_45px_rgba(30,46,77,0.05)] ${
                    service.highlighted ? "ring-2 ring-[#EF7F1A]/55" : ""
                  }`}
                >
                  <div className={`flex h-48 items-start justify-between p-5 ${service.accent}`}>
                    <MockupMarker label="[IMAGINE]" tone="light" />
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#1E2E4D]">{service.rating}</span>
                  </div>
                  <div className="p-6">
                    <div className="text-[24px] font-extrabold leading-tight text-[#1E2E4D]">{service.title}</div>
                    <p className="mt-3 text-[15px] leading-7 text-[#1E2E4D]/64">
                      Serviciu public cu media, descriere scurta, rating si CTA sincronizate din Backoffice.
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                      <span className="text-[15px] font-bold text-[#EF7F1A]">{service.price}</span>
                      <div className="flex flex-wrap gap-2">
                        <Link href="/mockup-v1/public/reparat-calorifer" className="rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">
                          Vezi detalii
                        </Link>
                        <Link href="/mockup-v1/public/cos" className="rounded-full bg-[#EF7F1A] px-4 py-2 text-sm font-semibold text-white">
                          Adauga in cos
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
      <ApprovedPublicFooter />
    </main>
  );
}

export function PublicServiceMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <header className="sticky top-0 z-30 border-b border-[#1E2E4D]/8 bg-white/95 backdrop-blur">
        <div className="bg-[#1E2E4D] text-white">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6 xl:px-8">
            <div className="hidden items-center gap-3 sm:flex">
              <span>Address</span>
              <span className="font-semibold">Residential - Bucharest, Sect 3, Bd Unirii nr. 5</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Romanian</span>
              <span className="hidden sm:inline">Cont</span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
          <Link href="/mockup-v1/public/home">
            <LogoBlock />
          </Link>
          <nav className="hidden items-center gap-8 xl:flex">
            {publicHeaderLinks.map((item) => (
              <Link key={item.label} href={item.href} className="text-[16px] font-medium text-[#1E2E4D] transition hover:text-[#EF7F1A]">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/mockup-v1/public/cos" className="rounded-full border border-[#1E2E4D]/10 bg-white px-5 py-3 text-sm font-semibold text-[#1E2E4D]">
              Cos
              <span className="ml-2 rounded-full bg-[#EF7F1A] px-2 py-0.5 text-xs font-bold text-white">3</span>
            </Link>
            <Link href="/mockup-v1/public/account" className="rounded-full bg-[#09A299] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#117A73]">
              Darrin AI
            </Link>
          </div>
        </div>
      </header>

      <section>
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
          <section className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
            <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap gap-2">
                  <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                  <MockupMarker label="[IMAGINE]" />
                  <MockupMarker label="[VIDEO]" />
                </div>
                <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Pagina serviciu</div>
                <h1 className="mt-4 max-w-3xl text-[46px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">
                  Reparat calorifer
                </h1>
                <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                  Pagina de serviciu preia aceeasi directie vizuala aprobata: informatie clara, galerie media mare, preturi vizibile si CTA-uri ferme.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-[#F5F6F7] px-4 py-3 text-sm font-semibold text-[#1E2E4D]">4.9 rating</span>
                  <span className="rounded-full bg-[#FFF4E8] px-4 py-3 text-sm font-semibold text-[#EF7F1A]">de la 189 lei</span>
                  <span className="rounded-full bg-[#EAF9F7] px-4 py-3 text-sm font-semibold text-[#117A73]">Sincronizat din Backoffice</span>
                </div>
              </div>

              <div className="rounded-[34px] bg-[#EEF3FB] p-8">
                <div className="flex flex-wrap gap-2">
                  <MockupMarker label="[IMAGINE]" tone="dark" />
                  <MockupMarker label="[VIDEO]" />
                </div>
                <div className="mt-6 aspect-[1.2] rounded-[28px] bg-[#1E2E4D] p-5 text-white">
                  <div className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    Galerie principala
                  </div>
                  <div className="mt-8 max-w-sm text-[24px] font-extrabold leading-tight">
                    [IMAGINE] principala si [VIDEO] demo configurate din pagina serviciului in Backoffice.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Pachete si detalii</div>
              <h2 className="mt-3 text-[40px] font-extrabold leading-[0.98] text-[#1E2E4D]">Niveluri clare si reteta simplificata pentru decizie rapida</h2>

              <div className="mt-8 grid gap-4 xl:grid-cols-4">
                {serviceLevelResourcesV3.map((level) => (
                  <div key={level.level} className="rounded-[28px] border border-[#1E2E4D]/8 bg-[#F9FAFB] p-5 shadow-[0_10px_24px_rgba(30,46,77,0.04)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[20px] font-extrabold text-[#1E2E4D]">{level.level}</div>
                        <div className="text-sm leading-6 text-[#1E2E4D]/62">{level.summary}</div>
                      </div>
                      <span className="rounded-full bg-[#FFF4E8] px-3 py-1 text-sm font-extrabold text-[#EF7F1A]">Pret final</span>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {level.resources.map((resource) => (
                        <div key={resource} className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 text-sm text-[#1E2E4D]/74">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF9F7] text-[12px] font-bold text-[#117A73]">+</span>
                          <span>{resource}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-[20px] bg-white px-4 py-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Resurse preluate din Backoffice</div>
                        <div className="mt-1 text-sm text-[#1E2E4D]/62">Tara, moneda, zona si TVA active pentru adresa declarata</div>
                      </div>
                      <div className="text-[24px] font-extrabold text-[#EF7F1A]">{level.finalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {recipeRows.map((row) => (
                  <div key={row.label} className="rounded-[24px] bg-[#F5F6F7] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">{row.type}</div>
                    <div className="mt-3 text-[16px] font-semibold text-[#1E2E4D]">{row.label}</div>
                    <div className="mt-2 text-sm text-[#1E2E4D]/62">{row.value}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Actiuni si incredere</div>
              <h2 className="mt-3 text-[40px] font-extrabold leading-[0.98]">CTA-uri directe, simple si orientate spre conversie</h2>
              <div className="mt-8 max-w-md grid gap-3">
                <Link href="/mockup-v1/public/cos" className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">
                  Adauga in cos
                </Link>
                <Link href="/mockup-v1/public/account" className="rounded-full bg-white px-5 py-4 text-center text-sm font-semibold text-[#1E2E4D]">
                  Vorbeste cu Darrin
                </Link>
                <Link href="/mockup-v1/public/catalog" className="rounded-full bg-white/12 px-5 py-4 text-center text-sm font-semibold text-white">
                  Inapoi la catalog
                </Link>
              </div>
              <div className="mt-8 grid max-w-xs gap-3">
                {["Pret standardizat", "Garantie", "Asigurare", "Profesionisti verificati"].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white/8 px-4 py-3 text-sm text-white/82">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}

export function PublicHomeMockup() {
  function ApprovedPill({
    children,
    tone = "light",
  }: {
    children: ReactNode;
    tone?: "light" | "dark" | "green" | "orange";
  }) {
    const tones = {
      light: "bg-white text-[#1E2E4D]",
      dark: "bg-[#1E2E4D] text-white",
      green: "bg-[#09A299] text-white",
      orange: "bg-[#EF7F1A] text-white",
    };

    return <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tones[tone]}`}>{children}</span>;
  }

  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <header className="sticky top-0 z-30 border-b border-[#1E2E4D]/8 bg-white/95 backdrop-blur">
        <div className="bg-[#1E2E4D] text-white">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6 xl:px-8">
            <div className="hidden items-center gap-3 sm:flex">
              <span>Address</span>
              <span className="font-semibold">Residential - Bucharest, Sect 3, Bd Unirii nr. 5</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Romanian</span>
              <span className="hidden sm:inline">Cont</span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
          <Link href="/mockup-v1/public/home">
            <LogoBlock />
          </Link>

          <nav className="hidden items-center gap-8 xl:flex">
            {publicHeaderLinks.map((item) => (
              <Link key={item.label} href={item.href} className="text-[16px] font-medium text-[#1E2E4D] transition hover:text-[#EF7F1A]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden min-w-[300px] items-center gap-3 rounded-full border border-[#1E2E4D]/10 bg-[#F5F6F7] px-4 py-3 lg:flex">
              <span className="text-xl text-[#1E2E4D]">Q</span>
              <span className="text-[15px] text-[#1E2E4D]/56">Search services, AI help, photo or video upload...</span>
            </div>
            <Link href="/mockup-v1/public/cos" className="rounded-full border border-[#1E2E4D]/10 bg-white px-5 py-3 text-sm font-semibold text-[#1E2E4D]">
              Cos
              <span className="ml-2 rounded-full bg-[#EF7F1A] px-2 py-0.5 text-xs font-bold text-white">3</span>
            </Link>
            <Link href="/mockup-v1/public/account" className="rounded-full bg-[#09A299] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#117A73]">
              Darrin AI
            </Link>
          </div>
        </div>
      </header>

      <section>
        <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[320px_1fr] xl:px-8">
          <aside className="rounded-[34px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)]">
            <div className="text-[15px] font-semibold uppercase tracking-[0.22em] text-[#EF7F1A]">Panou administrare</div>
            <h2 className="mt-4 text-[34px] font-extrabold leading-none text-[#1E2E4D]">Structura Backoffice</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#1E2E4D]/66">
              Meniul vertical include sectiunile si ramurile aferente zonelor create si gestionate din Backoffice My Darrin.
            </p>

            <div className="mt-8 grid gap-5">
              {approvedBackofficeSectionsV3.map((section, index) => (
                <div key={section.title} className={`rounded-[24px] border p-5 ${index === 0 ? "border-[#EF7F1A]/24 bg-[#FFF4E8]" : "border-[#1E2E4D]/8 bg-[#F9FAFB]"}`}>
                  <div className={`text-[18px] font-extrabold ${index === 0 ? "text-[#EF7F1A]" : "text-[#1E2E4D]"}`}>{section.title}</div>
                  <div className="mt-4 grid gap-2">
                    {section.branches.map((branch) => (
                      <div key={branch} className="rounded-[14px] bg-white px-3 py-2 text-[14px] font-medium text-[#1E2E4D]/72">
                        {branch}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="grid gap-8">
            <section className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
              <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
                <div className="flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2">
                    <ApprovedPill tone="orange">Glovo inspired</ApprovedPill>
                    <ApprovedPill tone="green">Darrin AI</ApprovedPill>
                    <ApprovedPill>[VIDEO HERO]</ApprovedPill>
                  </div>
                  <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Servicii la cerere, fara frictiune</div>
                  <h1 className="mt-4 max-w-3xl text-[48px] font-extrabold leading-[0.95] text-[#1E2E4D] sm:text-[64px]">
                    Cea mai rapida experienta pentru servicii locale, urgente si programate.
                  </h1>
                  <p className="mt-5 max-w-2xl text-[19px] leading-8 text-[#1E2E4D]/64">
                    My Darrin combina viteza de selectie din Glovo cu increderea Home Best Pal: AI, provideri verificati si executie standardizata.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 rounded-[28px] border border-[#1E2E4D]/10 bg-[#F5F6F7] p-4 sm:flex-row sm:items-center">
                    <div className="flex-1 rounded-full bg-white px-5 py-4 text-[15px] text-[#1E2E4D]/52 shadow-[0_8px_20px_rgba(30,46,77,0.05)]">
                      Descrie ce ai nevoie... poti incarca poze sau video
                    </div>
                    <Link href="/mockup-v1/public/catalog" className="rounded-full bg-[#EF7F1A] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(239,127,26,0.28)]">
                      Vezi servicii
                    </Link>
                    <Link href="/mockup-v1/public/account" className="rounded-full bg-[#09A299] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(9,162,153,0.24)]">
                      Vorbeste cu Darrin
                    </Link>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <ApprovedPill tone="dark">Bucuresti, Sect. 3</ApprovedPill>
                    <ApprovedPill>4.9 rating mediu</ApprovedPill>
                    <ApprovedPill>+250 servicii active</ApprovedPill>
                  </div>
                </div>

                <div className="relative min-h-[420px] overflow-hidden rounded-[34px] bg-[#EEF3FB] p-8">
                  <div className="absolute right-10 top-8 h-52 w-52 rounded-full bg-[#EF7F1A]" />
                  <div className="absolute bottom-10 left-12 h-44 w-44 rounded-full bg-[#09A299]/10" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="max-w-[220px]">
                        <div className="text-[14px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">My Darrin robot</div>
                        <div className="mt-3 text-[22px] font-extrabold leading-tight text-[#1E2E4D]">
                          AI concierge pentru servicii rezidentiale, comerciale si industriale.
                        </div>
                      </div>
                      <div className="relative h-28 w-24 rounded-[22px] bg-[#1E2E4D]">
                        <span className="absolute left-5 top-8 h-4 w-4 rounded-full bg-white" />
                        <span className="absolute right-5 top-8 h-4 w-4 rounded-full bg-white" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] bg-white/92 p-5 shadow-[0_12px_30px_rgba(30,46,77,0.08)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Serviciu evidenta</div>
                        <div className="mt-2 text-[28px] font-extrabold text-[#1E2E4D]">Reparat calorifer</div>
                        <div className="mt-2 text-sm leading-6 text-[#1E2E4D]/64">Vizibil instant in homepage, catalog si pagina de serviciu.</div>
                        <div className="mt-4 inline-flex rounded-full bg-[#FFF4E8] px-3 py-1 text-sm font-semibold text-[#EF7F1A]">de la 189 lei</div>
                      </div>
                      <div className="rounded-[24px] bg-[#1E2E4D] p-5 text-white shadow-[0_12px_30px_rgba(30,46,77,0.14)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B9E8E5]">Flux instant</div>
                        <div className="mt-2 text-[22px] font-extrabold leading-tight">Admin configureaza, salveaza si publica. Vizitatorul vede imediat.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <article className="rounded-[32px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_50px_rgba(30,46,77,0.12)]">
                <ApprovedPill tone="light">AI first</ApprovedPill>
                <div className="mt-5 text-[34px] font-extrabold leading-tight">Spune problema</div>
                <p className="mt-4 text-[16px] leading-7 text-white/72">
                  Text, imagine sau video. Darrin intelege nevoia si propune serviciul corect in cateva secunde.
                </p>
              </article>

              <article className="rounded-[32px] bg-[#FFF4E8] p-8 shadow-[0_18px_50px_rgba(239,127,26,0.10)]">
                <ApprovedPill tone="orange">Catalog</ApprovedPill>
                <div className="mt-5 text-[34px] font-extrabold leading-tight text-[#1E2E4D]">Alege serviciu</div>
                <p className="mt-4 text-[16px] leading-7 text-[#1E2E4D]/68">
                  Navigare rapida, carduri mari, pret de pornire si rating clar vizibile.
                </p>
              </article>

              <article className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(30,46,77,0.08)]">
                <ApprovedPill tone="green">Trust</ApprovedPill>
                <div className="mt-5 text-[34px] font-extrabold leading-tight text-[#1E2E4D]">Executie verificata</div>
                <p className="mt-4 text-[16px] leading-7 text-[#1E2E4D]/68">
                  Furnizori validati, plata securizata, garantie si istoric complet de interventie.
                </p>
              </article>
            </section>

            <section className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Categorii rapide</div>
                  <h2 className="mt-3 text-[44px] font-extrabold leading-[0.98] text-[#1E2E4D]">Acces direct in cele mai cautate industrii</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F6F7] text-2xl text-[#1E2E4D]">&lt;</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E2E4D] text-2xl text-white">&gt;</span>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {approvedCategoriesV3.map((category) => (
                  <article key={category.title} className={`rounded-[28px] ${category.tone} p-6`}>
                    <div className="flex items-start justify-between gap-4">
                      <ApprovedPill tone="dark">{category.title}</ApprovedPill>
                      <span className="text-3xl text-[#EF7F1A]">o</span>
                    </div>
                    <div className="mt-10 text-[28px] font-extrabold leading-tight text-[#1E2E4D]">{category.title}</div>
                    <p className="mt-3 text-[15px] leading-7 text-[#1E2E4D]/66">{category.note}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="max-w-3xl">
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Featured services</div>
                <h2 className="mt-3 text-[44px] font-extrabold leading-[0.98] text-[#1E2E4D]">Carduri mari, clare si foarte orientate spre conversie</h2>
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-4">
                {approvedServicesV3.map((service) => (
                  <article
                    key={service.title}
                    className={`overflow-hidden rounded-[30px] bg-[#F9FAFB] shadow-[0_16px_45px_rgba(30,46,77,0.05)] ${
                      service.highlighted ? "ring-2 ring-[#EF7F1A]/55" : ""
                    }`}
                  >
                    <div className={`flex h-48 items-start justify-between p-5 ${service.accent}`}>
                      <ApprovedPill tone="light">{service.highlighted ? "Recomandat" : "Serviciu"}</ApprovedPill>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#1E2E4D]">{service.rating}</span>
                    </div>
                    <div className="p-6">
                      <div className="text-[24px] font-extrabold leading-tight text-[#1E2E4D]">{service.title}</div>
                      <p className="mt-3 text-[15px] leading-7 text-[#1E2E4D]/64">
                        Preview public sincronizat din Backoffice, cu media, descriere si CTA configurabile.
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-[15px] font-bold text-[#EF7F1A]">{service.price}</span>
                        <Link href="/mockup-v1/public/reparat-calorifer" className="rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">
                          Vezi detalii
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Cum functioneaza</div>
                <h2 className="mt-3 text-[42px] font-extrabold leading-[0.98]">Rapid, clar si fara pasi inutili</h2>
                <div className="mt-8 grid gap-4">
                  {approvedStepsV3.map((step, index) => (
                    <div key={step} className="flex gap-4 rounded-[24px] bg-white/8 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EF7F1A] text-lg font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="text-[16px] leading-7 text-white/78">{step}</div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[36px] bg-[#FFF4E8] p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Beneficii</div>
                <h2 className="mt-3 text-[42px] font-extrabold leading-[0.98] text-[#1E2E4D]">Pret standardizat, garantie si incredere operationala</h2>
                <div className="mt-8 grid gap-4">
                  {["Pret standardizat", "Garantie", "Asigurare", "Profesionisti verificati"].map((item) => (
                    <div key={item} className="rounded-[22px] bg-white p-5 text-[16px] font-semibold text-[#1E2E4D] shadow-[0_10px_26px_rgba(30,46,77,0.05)]">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="max-w-3xl">
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Acces rapid intre module</div>
                <h2 className="mt-3 text-[42px] font-extrabold leading-[0.98] text-[#1E2E4D]">Toate fluxurile publice sunt conectate direct din homepage</h2>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {publicQuickAccessLinks.map((item) => (
                  <Link key={item.title} href={item.href} className={`rounded-[28px] ${item.tone} p-6 transition hover:-translate-y-0.5`}>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Ruta publica</div>
                    <div className="mt-3 text-[24px] font-extrabold leading-tight text-[#1E2E4D]">{item.title}</div>
                    <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1E2E4D]">Deschide</div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[38px] bg-[#1E2E4D] p-8 text-white shadow-[0_22px_60px_rgba(30,46,77,0.14)] lg:p-10">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <ApprovedPill tone="light">CTA final</ApprovedPill>
                    <ApprovedPill tone="orange">Conversie</ApprovedPill>
                  </div>
                  <h2 className="mt-5 text-[44px] font-extrabold leading-[0.95] text-white">Incepe acum sau devino partener in reteaua My Darrin</h2>
                  <p className="mt-4 max-w-2xl text-[17px] leading-8 text-white/74">
                    Varianta dedicata homepage-ului pune accent pe viteza, incredere si o experienta vizuala memorabila, inspirata din Glovo dar adaptata identitatii My Darrin.
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
                  <Link href="/mockup-v1/public/account/creare-cont" className="rounded-full bg-[#EF7F1A] px-6 py-4 text-center text-[15px] font-semibold text-white">
                    Incepe acum
                  </Link>
                  <Link href="/mockup-v1/public/devino-partener" className="rounded-full bg-white px-6 py-4 text-center text-[15px] font-semibold text-[#1E2E4D]">
                    Devino partener
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
      <ApprovedPublicFooter />
    </main>
  );
}

function PublicAccessGateV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 pt-6 sm:px-6 xl:px-8">
      <div className="grid gap-6 rounded-[34px] border border-[#1E2E4D]/8 bg-white p-6 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[ICON]" tone="dark" />
            <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
          </div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Configurare rulare publica</div>
          <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Acces pe subdomeniu de testare, apoi rulare publica pe domeniul final</h2>
          <div className="mt-6 grid gap-3">
            {publicAccessConfigV3.map((item) => (
              <div key={item} className="rounded-[18px] bg-[#F5F6F7] px-4 py-3 text-sm leading-7 text-[#1E2E4D]/72">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-[#EEF3FB] p-6">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[ICON]" tone="dark" />
            <MockupMarker label="[DARRIN AI]" tone="green" />
          </div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Gate de acces</div>
          <div className="mt-3 rounded-[24px] border border-[#1E2E4D]/8 bg-white p-5 shadow-[0_10px_24px_rgba(30,46,77,0.05)]">
            <div className="text-[22px] font-semibold text-[#1E2E4D]">Acces temporar protejat</div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-full bg-[#F5F6F7] px-4 py-3 text-sm text-[#1E2E4D]/56">Email gate</div>
              <div className="rounded-full bg-[#F5F6F7] px-4 py-3 text-sm text-[#1E2E4D]/56">Parola gate</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">Autentificare</span>
              <span className="rounded-full bg-[#09A299] px-4 py-2 text-sm font-semibold text-white">Intrare in Home Page</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#1E2E4D]/64">
              Mockup-ul arata pasul de gate inainte de homepage, fara a afisa credentialele direct in interfata publica.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicHomeHeroV3() {
  return (
    <section className="bg-[#F5F6F7]">
      <div className="relative mx-auto grid max-w-[1540px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:py-16 xl:px-8">
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
            <MockupMarker label="[DARRIN AI]" tone="green" />
            <MockupMarker label="[VIDEO]" tone="light" />
          </div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#EF7F1A]">Mockup V3 - Home publica - 24 martie 2026</div>
          <h1 className="mt-4 max-w-3xl text-[40px] font-semibold leading-[0.96] text-[#1E2E4D] sm:text-[48px] xl:text-[58px]">
            Servicii la cerere. Oriunde. Oricand.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-8 text-[#111827]/72">
            AI + profesionisti verificati pentru orice nevoie - acasa, birou sau industrie. Homepage-ul afiseaza instant ce a fost creat si salvat din Backoffice, inclusiv exemplul Reparat calorifer.
          </p>

          <div className="mt-8 rounded-[26px] border border-[#1E2E4D]/10 bg-white p-4 shadow-[0_16px_38px_rgba(30,46,77,0.06)]">
            <div className="flex flex-wrap items-center gap-2">
              <MockupMarker label="[DARRIN AI]" tone="green" />
              <MockupMarker label="[IMAGINE]" />
              <MockupMarker label="[VIDEO]" />
              <MockupMarker label="[ICON]" tone="dark" />
            </div>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row">
              <div className="flex-1 rounded-full border border-[#1E2E4D]/10 bg-[#F5F6F7] px-5 py-4 text-[15px] text-[#111827]/56">
                Descrie ce ai nevoie... (poti incarca poze/video)
              </div>
              <button className="rounded-full bg-[#1E2E4D] px-5 py-4 text-sm font-semibold text-white">Trimite catre Darrin AI</button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mockup-v1/public/catalog" className="rounded-full bg-[#EF7F1A] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_34px_rgba(239,127,26,0.22)]">
              Vezi servicii
            </Link>
            <a href="#" className="rounded-full bg-[#09A299] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_34px_rgba(9,162,153,0.22)] transition hover:bg-[#117A73]">
              Vorbeste cu Darrin
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[34px] border border-white/20 bg-[#1E2E4D] p-6 text-white shadow-[0_30px_80px_rgba(30,46,77,0.22)] min-h-[480px]">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[VIDEO]" tone="light" />
            <MockupMarker label="[IMAGINE]" tone="light" />
            <MockupMarker label="[SLIDE]" tone="light" />
            <MockupMarker label="[DARRIN AI]" tone="green" />
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] bg-white/10 p-6 backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/72">Hero vizual dominant</div>
              <div className="mt-3 text-3xl font-semibold leading-tight">[VIDEO] sau [IMAGINE] full-width cu overlay curat, flat, in stil Glovo / Uber.</div>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Ponderea vizuala ramane 60% imagine si 40% text, cu focus pe viteza, incredere si CTA-uri mari.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#B8F0EB]">Serviciu live</div>
                  <span className="rounded-full bg-[#EF7F1A] px-3 py-1 text-xs font-semibold text-white">Reparat calorifer</span>
                </div>
                <div className="mt-4 text-[24px] font-semibold">Vizibil pe Home Page imediat dupa Save in Backoffice</div>
                <div className="mt-3 text-sm leading-7 text-white/82">Rating 4.9, de la 189 lei, media [VIDEO], CTA Vezi detalii.</div>
              </div>

              <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#B8F0EB]">Validare publica</div>
                <div className="mt-3 text-sm leading-7 text-white/82">
                  Super Admin verifica Home Page, Catalogul de Servicii si pagina individuala inainte de aprobare finala.
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-8 rounded-full bg-white/14 px-4 py-2 text-sm font-medium backdrop-blur">
            [VIDEO] fundal administrabil din Backoffice
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicHomeQuickCategories() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="max-w-3xl">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Categorii rapide</div>
        <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Navigare rapida pentru probleme uzuale si industrii active</h2>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {homeQuickCategories.map((category) => (
          <article key={category.title} className="rounded-[24px] border border-[#1E2E4D]/8 bg-white p-5 shadow-[0_16px_40px_rgba(30,46,77,0.05)]">
            <MockupMarker label="[ICON]" tone="dark" />
            <div className="mt-5 text-[20px] font-semibold text-[#1E2E4D]">{category.title}</div>
            <p className="mt-2 text-[14px] leading-6 text-[#111827]/66">{category.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicHomeDualEntry() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 xl:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[30px] bg-[#EAF9F7] p-8 shadow-[0_18px_50px_rgba(9,162,153,0.10)]">
          <MockupMarker label="[DARRIN AI]" tone="green" />
          <h3 className="mt-5 text-[32px] font-semibold leading-tight text-[#1E2E4D]">Spune problema</h3>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#111827]/68">
            Intrare asistata pentru text, imagine si video. Darrin clarifica cererea si propune serviciul potrivit in mai putin de 5 secunde.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <MockupMarker label="[IMAGINE]" />
            <MockupMarker label="[VIDEO]" />
            <MockupMarker label="[ICON]" tone="dark" />
          </div>
        </article>

        <article className="rounded-[30px] bg-[#FFF6EA] p-8 shadow-[0_18px_50px_rgba(239,127,26,0.10)]">
          <MockupMarker label="[IMAGINE]" tone="orange" />
          <h3 className="mt-5 text-[32px] font-semibold leading-tight text-[#1E2E4D]">Alege serviciu</h3>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#111827]/68">
            Intrare clasica in catalog pentru utilizatorii care stiu deja ce cauta si vor sa compare pachete, rating si disponibilitate.
          </p>
          <Link href="/mockup-v1/public/catalog" className="mt-6 inline-flex rounded-full bg-[#1E2E4D] px-5 py-3 text-sm font-semibold text-white">
            Acceseaza catalogul
          </Link>
        </article>
      </div>
    </section>
  );
}

function PublicHomeFeaturedServices() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="max-w-3xl">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Servicii featured</div>
        <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Carduri media-first pentru conversie rapida si selectie clara</h2>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {homeFeaturedServices.map((service) => (
          <article key={service.title} className={`overflow-hidden rounded-[28px] bg-white shadow-[0_20px_55px_rgba(30,46,77,0.08)] ${service.featured ? "ring-2 ring-[#EF7F1A]/55" : ""}`}>
            <div className={`flex h-48 items-start justify-between p-5 ${service.featured ? "bg-[#FFF1DF]" : "bg-[#EEF3FB]"}`}>
              <MockupMarker label={service.media} tone={service.featured ? "orange" : "dark"} />
              {service.featured ? <MockupMarker label="Sincronizat din Backoffice" tone="green" /> : null}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[22px] font-semibold text-[#1E2E4D]">{service.title}</h3>
                <span className="rounded-full bg-[#F5F6F7] px-3 py-1 text-sm font-semibold text-[#111827]">{service.rating}</span>
              </div>
              <p className="mt-3 text-[15px] leading-7 text-[#111827]/66">Incepand {service.price}. Media si copy vor fi configurate din admin.</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#EF7F1A]">Incepand {service.price}</span>
                <Link href="/mockup-v1/public/reparat-calorifer" className="rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">
                  Vezi detalii
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicHomeLevelCards() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 xl:px-8">
      <div className="max-w-3xl">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Niveluri</div>
        <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Pachete clare pentru servicii standardizate</h2>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {serviceLevels.map((level, index) => (
          <article key={level.label} className={`rounded-[28px] p-6 shadow-[0_18px_54px_rgba(30,46,77,0.06)] ${index === 1 ? "bg-[#1E2E4D] text-white" : "bg-white text-[#1E2E4D]"}`}>
            <MockupMarker label="[ICON]" tone={index === 1 ? "light" : "dark"} />
            <div className="mt-5 text-sm font-semibold uppercase tracking-[0.18em]">{level.label}</div>
            <div className="mt-2 text-[32px] font-semibold">{level.price}</div>
            <div className={`mt-1 text-sm ${index === 1 ? "text-white/72" : "text-[#111827]/60"}`}>{level.note}</div>
            <div className="mt-5 grid gap-3 text-sm leading-6">
              <div>- Durata estimata configurabila</div>
              <div>- Continut si materiale din Backoffice</div>
              <div>- Pret final public</div>
            </div>
            <button className={`mt-6 rounded-full px-4 py-3 text-sm font-semibold ${index === 1 ? "bg-[#EF7F1A] text-white" : "bg-[#F5F6F7] text-[#1E2E4D]"}`}>
              Selecteaza
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicHomeHowItWorks() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="rounded-[34px] bg-[#F5F6F7] p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">How it works</div>
          <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Flux simplificat pentru servicii complexe</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {homeHowItWorks.map((step, index) => (
            <article key={step} className="rounded-[24px] bg-white p-5 shadow-[0_16px_42px_rgba(30,46,77,0.05)]">
              <MockupMarker label="[ICON]" tone="orange" />
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Pas {index + 1}</div>
              <div className="mt-2 text-[20px] font-semibold text-[#1E2E4D]">{step}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicHomeBenefitsAndPromo() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 xl:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-[30px] bg-[#1E2E4D] p-8 text-white shadow-[0_22px_60px_rgba(30,46,77,0.16)]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#FFCF95]">Beneficii</div>
          <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-white sm:text-[40px]">Trust vizibil inainte de prima interactiune</h2>
          <div className="mt-8 grid gap-3">
            {homeBenefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-[18px] border border-white/12 bg-white/8 px-4 py-3 text-sm">
                <MockupMarker label="[ICON]" tone="light" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-8 shadow-[0_22px_60px_rgba(30,46,77,0.06)]">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[SLIDE]" tone="dark" />
            <MockupMarker label="[IMAGINE]" />
          </div>
          <h3 className="mt-5 text-[32px] font-semibold leading-tight text-[#1E2E4D]">Slider promotional administrabil din Backoffice</h3>
          <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#111827]/68">
            Zona este rezervata pentru oferte, industrii prioritare sau campanii sezoniere. Continutul va fi gestionat din admin: upload media, ordonare slide-uri si activare/dezactivare.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["[SLIDE] Oferta sezoniera", "[SLIDE] Industrie activa", "[SLIDE] Serviciu promovat"].map((slide) => (
              <div key={slide} className="rounded-[22px] bg-[#F5F6F7] p-4 text-sm font-semibold text-[#1E2E4D]">
                {slide}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicHomeFinalCta() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="grid gap-6 rounded-[34px] bg-[#FFF4E8] p-8 shadow-[0_20px_55px_rgba(30,46,77,0.06)] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[IMAGINE]" tone="orange" />
            <MockupMarker label="[VIDEO]" />
            <MockupMarker label="[SLIDE]" />
          </div>
          <h2 className="mt-5 text-[34px] font-semibold leading-tight text-[#1E2E4D]">Incepe acum sau intra in ecosistemul de executie My Darrin</h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#111827]/68">
            CTA final orientat pe doua conversii majore: cerere serviciu si onboarding partener. Toate textele, imaginile si butoanele raman configurabile din Backoffice.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
          <a href="#" className="rounded-full bg-[#EF7F1A] px-6 py-4 text-center text-[15px] font-semibold text-white">
            Incepe acum
          </a>
          <a href="#" className="rounded-full bg-[#09A299] px-6 py-4 text-center text-[15px] font-semibold text-white transition hover:bg-[#117A73]">
            Devino partener
          </a>
        </div>
      </div>
    </section>
  );
}

function PublicHomeQuickCategoriesV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="max-w-3xl">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Categorii rapide</div>
        <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Scroll orizontal pe mobil, grid aerisit pe desktop</h2>
        <p className="mt-4 text-[16px] leading-7 text-[#111827]/68">
          Fiecare categorie este media-first si poate fi controlata din Backoffice: icon, imagine, ordine si activare.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {publicHomeCategoriesV3.map((category) => (
          <article key={category.title} className="overflow-hidden rounded-[26px] border border-[#1E2E4D]/8 bg-white shadow-[0_16px_40px_rgba(30,46,77,0.05)]">
            <div className="flex h-28 items-start justify-between bg-[#EEF3FB] p-4">
              <MockupMarker label="[ICON]" tone="dark" />
              <MockupMarker label={category.media} tone="light" />
            </div>
            <div className="p-5">
              <div className="text-[20px] font-semibold text-[#1E2E4D]">{category.title}</div>
              <p className="mt-2 text-[14px] leading-6 text-[#111827]/66">{category.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicHomeDualEntryV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 xl:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[32px] bg-[#EAF9F7] p-8 shadow-[0_18px_50px_rgba(9,162,153,0.10)]">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[DARRIN AI]" tone="green" />
            <MockupMarker label="[IMAGINE]" />
            <MockupMarker label="[VIDEO]" />
          </div>
          <h3 className="mt-5 text-[32px] font-semibold leading-tight text-[#1E2E4D]">Spune problema</h3>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#111827]/68">
            Intrare asistata AI pentru text, imagine si video. Darrin transforma intentia in deviz si propunere de serviciu.
          </p>
          <div className="mt-6 rounded-[24px] border border-[#09A299]/12 bg-white/75 p-5 text-sm leading-7 text-[#1E2E4D]/72">
            [DARRIN AI] Primeste cererea, clarifica lipsurile si trimite catre serviciul recomandat.
          </div>
        </article>

        <article className="rounded-[32px] bg-[#FFF6EA] p-8 shadow-[0_18px_50px_rgba(239,127,26,0.10)]">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[IMAGINE]" tone="orange" />
            <MockupMarker label="[ICON]" tone="dark" />
          </div>
          <h3 className="mt-5 text-[32px] font-semibold leading-tight text-[#1E2E4D]">Alege serviciu</h3>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#111827]/68">
            Intrare clasica in catalog pentru utilizatorii care stiu deja ce cauta si vor selectie directa pe categorie sau serviciu.
          </p>
          <Link href="/mockup-v1/public/catalog" className="mt-6 inline-flex rounded-full bg-[#1E2E4D] px-5 py-3 text-sm font-semibold text-white">
            Acceseaza catalogul
          </Link>
        </article>
      </div>
    </section>
  );
}

function PublicHomeFeaturedServicesV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="max-w-3xl">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Servicii featured</div>
        <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Grid media-first cu Reparat calorifer evidentiat in Home Page</h2>
        <p className="mt-4 text-[16px] leading-7 text-[#111827]/68">
          Cardurile folosesc 60% zona vizuala si 40% zona informationala pentru conversie rapida pe desktop, tablet si mobile.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {publicHomeFeaturedV3.map((service, index) => (
          <article
            key={service.title}
            className={`overflow-hidden rounded-[30px] bg-white shadow-[0_20px_55px_rgba(30,46,77,0.08)] ${
              index === 0 ? "ring-2 ring-[#EF7F1A]/55" : ""
            }`}
          >
            <div className={`flex h-52 items-start justify-between p-5 ${index === 0 ? "bg-[#1E2E4D] text-white" : "bg-[#EEF3FB] text-[#1E2E4D]"}`}>
              <MockupMarker label={service.media} tone={index === 0 ? "light" : "dark"} />
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${index === 0 ? "bg-[#EF7F1A] text-white" : "bg-white text-[#1E2E4D]"}`}>
                {service.badge}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[22px] font-semibold text-[#1E2E4D]">{service.title}</h3>
                <span className="rounded-full bg-[#F5F6F7] px-3 py-1 text-sm font-semibold text-[#111827]">{service.rating}</span>
              </div>
              <p className="mt-3 text-[15px] leading-7 text-[#111827]/66">{service.detail}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#EF7F1A]">Incepand de la {service.price}</span>
                <Link href="/mockup-v1/public/reparat-calorifer" className="rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">
                  Vezi detalii
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicHomeSyncFlowV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 xl:px-8">
      <div className="overflow-hidden rounded-[34px] bg-[#1E2E4D] text-white shadow-[0_22px_60px_rgba(30,46,77,0.16)]">
        <div className="grid gap-6 p-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <MockupMarker label="[IMAGINE]" tone="light" />
              <MockupMarker label="[VIDEO]" tone="light" />
              <MockupMarker label="[SLIDE]" tone="light" />
            </div>
            <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#FFCF95]">Flux sincronizare Backoffice ↔ Public</div>
            <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-white sm:text-[40px]">
              Super Admin creeaza, salveaza, publica, verifica si aproba ce vede vizitatorul
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-7 text-white/72">
              Acest rail trebuie sa fie vizibil in mockup pentru a demonstra traseul complet al continutului public.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {publicSyncStepsV3.map((step, index) => (
              <article key={step} className="rounded-[24px] border border-white/12 bg-white/8 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFCF95]">Pas {index + 1}</div>
                <p className="mt-3 text-sm leading-7 text-white/82">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicHomepageBuilderV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 xl:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-[32px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)]">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="Web Design" tone="dark" />
            <MockupMarker label="Homepage Builder" tone="orange" />
          </div>
          <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Configurare Backoffice</div>
          <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Textele, imaginile, video-urile si CTA-urile se administreaza din Homepage Builder</h2>
          <p className="mt-4 text-[16px] leading-7 text-[#111827]/68">
            Dupa editare si Save in Backoffice, modificarile se sincronizeaza automat cu pagina publica, exact cum cere fluxul functional My Darrin.
          </p>
        </article>

        <article className="rounded-[32px] bg-[#FFF4E8] p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)]">
          <div className="grid gap-3">
            {homepageBuilderControlsV3.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 text-sm leading-7 text-[#1E2E4D] shadow-[0_10px_24px_rgba(30,46,77,0.05)]">
                <MockupMarker label="[ICON]" tone="dark" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function PublicHomeHowItWorksV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="rounded-[34px] bg-[#F5F6F7] p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">How it works</div>
          <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Parcurs scurt, clar si predictibil pentru utilizator</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {publicHowItWorksV3.map((step, index) => (
            <article key={step} className="rounded-[24px] bg-white p-5 shadow-[0_16px_42px_rgba(30,46,77,0.05)]">
              <MockupMarker label="[ICON]" tone="orange" />
              <div className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Pas {index + 1}</div>
              <div className="mt-2 text-[20px] font-semibold text-[#1E2E4D]">{step}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicHomeBenefitsV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 xl:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[32px] bg-[#FFFFFF] p-8 shadow-[0_20px_55px_rgba(30,46,77,0.06)]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Beneficii</div>
          <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Promisiunea publica este simpla: siguranta, claritate si incredere</h2>
          <div className="mt-8 grid gap-3">
            {publicBenefitsV3.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-[18px] border border-[#1E2E4D]/8 bg-[#F5F6F7] px-4 py-3 text-sm text-[#1E2E4D]">
                <MockupMarker label="[ICON]" tone="dark" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-[#FFF4E8] p-8 shadow-[0_20px_55px_rgba(30,46,77,0.06)]">
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[SLIDE]" tone="dark" />
            <MockupMarker label="[IMAGINE]" />
          </div>
          <h3 className="mt-5 text-[32px] font-semibold leading-tight text-[#1E2E4D]">Zona promotionala configurabila pentru campanii si industrii</h3>
          <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#111827]/68">
            Sectiunea poate afisa oferte, industrii prioritare sau servicii promovate direct din Backoffice, fara incarcare vizuala excesiva.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["[SLIDE] Oferta sezoniera", "[IMAGINE] Partener verificat", "[SLIDE] Industrie activa"].map((slide) => (
              <div key={slide} className="rounded-[22px] bg-white/70 p-4 text-sm font-semibold text-[#1E2E4D]">
                {slide}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicHomeResponsiveShowcaseV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-14 sm:px-6 xl:px-8">
      <div className="max-w-3xl">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#EF7F1A]">Responsive preview</div>
        <h2 className="mt-3 text-[32px] font-semibold leading-[1.04] text-[#1E2E4D] sm:text-[40px]">Desktop, Tablet, Mobile si simulare App Mobile</h2>
        <p className="mt-4 text-[16px] leading-7 text-[#111827]/68">
          Layout-ul ramane thumb-friendly si pastreaza CTA-urile prioritare vizibile indiferent de dimensiunea ecranului.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-4">
        {responsiveShowcaseV3.map((device, index) => (
          <article key={device.title} className="rounded-[30px] border border-[#1E2E4D]/8 bg-white p-5 shadow-[0_18px_54px_rgba(30,46,77,0.06)]">
            <div className={`mx-auto overflow-hidden rounded-[28px] border border-[#1E2E4D]/10 ${index === 0 ? "aspect-[16/10]" : index === 1 ? "aspect-[10/12]" : "aspect-[9/18]"} bg-[#F5F6F7] p-3`}>
              <div className="rounded-[18px] bg-white p-3 shadow-[0_10px_24px_rgba(30,46,77,0.06)]">
                <div className="flex flex-wrap gap-2">
                  <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                  <MockupMarker label="[DARRIN AI]" tone="green" />
                </div>
                <div className="mt-3 rounded-full bg-[#F5F6F7] px-3 py-2 text-xs text-[#1E2E4D]/60">Descrie ce ai nevoie...</div>
                <div className="mt-3 h-16 rounded-[18px] bg-[#1E2E4D]" />
                <div className="mt-3 grid gap-2">
                  <div className="h-7 rounded-full bg-[#FFF1DF]" />
                  <div className="h-7 rounded-full bg-[#EAF9F7]" />
                  <div className="h-7 rounded-full bg-[#EEF3FB]" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-[18px] font-semibold text-[#1E2E4D]">{device.title}</div>
                <div className="text-sm text-[#111827]/56">{device.size}</div>
              </div>
              <MockupMarker label={device.title === "App Mobile" ? "[ICON]" : "[IMAGINE]"} tone={device.title === "App Mobile" ? "dark" : "light"} />
            </div>
            <p className="mt-3 text-sm leading-7 text-[#111827]/66">{device.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicHomeFinalCtaV3() {
  return (
    <section className="mx-auto max-w-[1540px] px-4 py-6 pb-14 sm:px-6 xl:px-8">
      <div className="grid gap-6 rounded-[34px] bg-[#1E2E4D] p-8 text-white shadow-[0_20px_55px_rgba(30,46,77,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <MockupMarker label="[IMAGINE]" tone="light" />
            <MockupMarker label="[VIDEO]" tone="light" />
          </div>
          <h2 className="mt-5 text-[34px] font-semibold leading-tight text-white">Incepe acum sau devino parte din reteaua My Darrin</h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-7 text-white/76">
            CTA final pentru doua conversii majore: cerere serviciu si onboarding partener. Sectiunea ramane configurabila din Backoffice.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
          <a href="#" className="rounded-full bg-[#EF7F1A] px-6 py-4 text-center text-[15px] font-semibold text-white">
            Incepe acum
          </a>
          <a href="#" className="rounded-full bg-[#09A299] px-6 py-4 text-center text-[15px] font-semibold text-white transition hover:bg-[#117A73]">
            Devino partener
          </a>
        </div>
      </div>
    </section>
  );
}

function GenericMockupPanel({
  eyebrow,
  title,
  items,
  accent = "orange",
}: {
  eyebrow: string;
  title: string;
  items: string[];
  accent?: "orange" | "navy" | "ai";
}) {
  const tone =
    accent === "navy"
      ? "text-[#1E2E4D]"
      : accent === "ai"
        ? "text-[#09A299]"
        : "text-[#EF7F1A]";

  return (
    <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
      <BrowserFrame eyebrow={eyebrow} title={title}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] p-5">
              <div className={`text-sm font-semibold uppercase tracking-[0.18em] ${tone}`}>{eyebrow}</div>
              <div className="mt-3 text-[24px] font-semibold text-[#1E2E4D]">{item}</div>
            </div>
          ))}
        </div>
      </BrowserFrame>
    </section>
  );
}

function AdminShell({
  title,
  active,
  children,
}: {
  title: string;
  active: string;
  children: ReactNode;
}) {
  const nav = [
    { label: "Owner Tower", href: "/mockup-v1/admin/owner-tower" },
    { label: "Dashboard", href: "/mockup-v1/admin/dashboard" },
    { label: "Comenzi Live", href: "/mockup-v1/admin/live-orders" },
    { label: "BI Operational", href: "/mockup-v1/admin/bi-operational" },
    { label: "Financiar", href: "/mockup-v1/admin/financial" },
    { label: "Legal & Compliance", href: "/mockup-v1/admin/legal-compliance" },
    { label: "Notificari", href: "/mockup-v1/admin/notifications" },
    { label: "AI Center", href: "/mockup-v1/admin/ai-center" },
    { label: "Marketplace", href: "/mockup-v1/admin/marketplace-governance" },
    { label: "Mobile Apps", href: "/mockup-v1/admin/mobile-apps" },
    { label: "Homepage", href: "/mockup-v1/admin/homepage" },
    { label: "Servicii", href: "/mockup-v1/admin/services" },
    { label: "Parteneri", href: "/mockup-v1/admin/partners" },
    { label: "Utilizatori", href: "/mockup-v1/admin/users" },
    { label: "Configurari", href: "/mockup-v1/admin/settings" },
    { label: "Integrari", href: "/mockup-v1/admin/integrations" },
  ];

  return (
    <main className="min-h-screen bg-[#F5F6F7] text-[#111827]">
      <div className="grid xl:grid-cols-[250px_1fr]">
        <aside className="bg-[#1E2E4D] p-6 text-white">
          <LogoBlock />
          <div className="mt-8 grid gap-2">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-[18px] px-4 py-3 text-sm ${active === item.label ? "bg-[#EF7F1A] text-white" : "text-white/72"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        <div>
          <header className="border-b border-[#1E2E4D]/8 bg-white px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Backoffice</div>
                <div className="mt-1 text-[30px] font-semibold text-[#1E2E4D]">{title}</div>
              </div>
              <div className="flex items-center gap-3">
                <DarrinBadge />
                <span className="rounded-full bg-[#F5F6F7] px-4 py-2 text-sm font-medium text-[#1E2E4D]">Super Admin</span>
              </div>
            </div>
          </header>
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function PartnerLandingMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Devino partener</div>
              <h1 className="mt-4 text-[48px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">Wizard complet de inscriere pentru parteneri, echipe si companii verificate.</h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                Interfata este multi-step, mobile-first, cu progres vizibil, asistenta AI si toate datele necesare pentru aprobarea unui partener in My Darrin.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-5">
                {["1. Date de baza", "2. Profesii", "3. Echipamente", "4. Documente", "5. Acceptare"].map((step, index) => (
                  <div key={step} className={`rounded-[18px] px-4 py-3 text-center text-sm font-semibold ${index === 0 ? "bg-[#EF7F1A] text-white" : "bg-[#F5F6F7] text-[#1E2E4D]"}`}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-3">
                {["Progress bar vizibil", "Wizard responsive mobile-first", "Mascota AI pentru ajutor interactiv", "Butoane AI pentru sugestii", "Upload documente si OCR", "Semnare si OTP final"].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Pasul 1</div>
                <div className="mt-2 text-[34px] font-extrabold text-[#1E2E4D]">Date de baza</div>
              </div>
              <span className="rounded-full bg-[#09A299] px-5 py-3 text-sm font-semibold text-white">Sugestii completare</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                "Nume",
                "Email",
                "Telefon mobil (OTP)",
                "Tip entitate: PFA / SRL / Persoana Fizica",
                "CUI / CNP",
                "Adresa + zona din Backoffice",
                "IBAN RO",
                "Banca",
                "Titular cont",
                "SWIFT / BIC",
                "Administrator: nume",
                "Administrator: functie / telefon / email",
              ].map((field) => (
                <div key={field} className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/56">
                  {field}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[24px] bg-[#FFF4E8] p-5 text-sm leading-7 text-[#1E2E4D]/72">
              Echipa / persoane autorizate si disponibile: multi-input dinamic, minim o persoana, profesie multi-select din Backoffice, plus upload CI / Pasaport / Permis pentru fiecare.
            </div>
          </article>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Pasul 2</div>
              <div className="mt-2 text-[34px] font-extrabold text-[#1E2E4D]">Profesii si categorii</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Dropdown multi-select din Backoffice",
                  "Categorii arborescente: Rezidential -> Instalatii",
                  "Profesii selectate -> servicii generate automat",
                  "Partenerul bifeaza serviciile dorite",
                  "AI: Sugereaza categorii pe baza descrierii tale",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/72">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Pasul 3</div>
              <div className="mt-2 text-[34px] font-extrabold text-[#1E2E4D]">Echipamente si dotari</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Lista generata automat din Backoffice",
                  "Checkbox confirmare de detinere",
                  "Upload poze echipamente",
                  "Upload document cu utilaje si scule disponibile",
                  "Date compatibile cu resursele definite in admin",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/72">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Pasul 4</div>
              <div className="mt-2 text-[34px] font-extrabold text-[#1E2E4D]">Upload documente si autorizatii</div>
              <div className="mt-6 grid gap-3">
                {[
                  "BI / CI / Pasaport / Permis pentru fiecare persoana autorizata",
                  "Autorizatii speciale pentru competente critice",
                  "AI OCR pentru verificare automata format si continut",
                  "Semnalare documente lipsa sau invalide",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/72">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Pasul 5</div>
              <div className="mt-2 text-[34px] font-extrabold">Acceptare documente si trimitere</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Checkbox pentru Termeni generali, Termeni partener si GDPR",
                  "Semnatura electronica avansata / qualified",
                  "Biometrie mobila / web: amprenta sau faciala",
                  "Email + SMS cu link securizat si cod OTP",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white/8 px-4 py-3 text-sm text-white/82">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                <Link href="/mockup-v1/public/devino-partener/inscriere" className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">
                  Trimite cererea de parteneriat
                </Link>
                <Link href="/mockup-v1/public/devino-partener/inscriere" className="rounded-full bg-white px-5 py-4 text-center text-sm font-semibold text-[#1E2E4D]">
                  Salveaza draftul
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export function InvestorLandingMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[WIDGET EMBED]" tone="dark" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Devino investitor</div>
              <h1 className="mt-4 text-[48px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">Modul embedded pentru runda SEED, onboarding securizat si dashboard investitor.</h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                Widget-ul este plug-and-play pentru `www.mydarrin.com`, `www.homebestpal.com`, landing pages si site-uri partenere, cu sincronizare live din Backoffice si flux complet pentru investitori.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Runda SEED activa", "Embedded widget", "Backoffice configurabil"].map((item, index) => (
                  <div key={item} className={`rounded-[18px] px-4 py-3 text-center text-sm font-semibold ${index === 0 ? "bg-[#EF7F1A] text-white" : "bg-[#F5F6F7] text-[#1E2E4D]"}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-3">
                {[
                  "Pre-money valuation: 4.000.000 EUR",
                  "Pret / actiune: 1.000 EUR",
                  "Soft cap: 300.000 EUR",
                  "Hard cap: 600.000 EUR",
                  "Secondary sale: 600 actiuni",
                  "Durata campaniei: 90 zile",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Widget public embedded</div>
                <div className="mt-2 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Status live, progres, social proof si CTA de investitie</div>
              </div>
              <span className="rounded-full bg-[#EF7F1A] px-5 py-3 text-sm font-semibold text-white">Investeste acum - minim 1.000 EUR</span>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
              <div className="rounded-[28px] bg-[#1E2E4D] p-6 text-white">
                <div className="flex flex-wrap gap-2">
                  <MockupMarker label="Runda activa" tone="orange" />
                  <MockupMarker label="[ICON]" tone="light" />
                </div>
                <div className="mt-5 text-[32px] font-extrabold">320.000 EUR / 600.000 EUR</div>
                <div className="mt-2 text-sm text-white/72">53% din hard cap | progres sincronizat prin WebSocket</div>
                <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[53%] rounded-full bg-[#09A299]" />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-white/8 px-4 py-3 text-sm">Soft cap: 300.000 EUR</div>
                  <div className="rounded-[18px] bg-white/8 px-4 py-3 text-sm">Hard cap: 600.000 EUR</div>
                  <div className="rounded-[18px] bg-white/8 px-4 py-3 text-sm">15% secondary sale</div>
                  <div className="rounded-[18px] bg-white/8 px-4 py-3 text-sm">ROI tinta 5 ani: 145%</div>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  "Harta investitorilor - Bucuresti, Bacau, Cluj, Iasi, Constanta, international",
                  "Distribuie entitati - PF 62% | Companii 18% | Fonduri 12% | Banci 8%",
                  "Burndown chart - ritm absorbtie actiuni vs timp ramas",
                ].map((item) => (
                  <div key={item} className="rounded-[24px] bg-[#F5F6F7] p-5 text-sm leading-7 text-[#1E2E4D]/72">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Backoffice round config</div>
            <div className="mt-6 grid gap-3">
              {[
                "FundingRound: valuation, pret, caps, durata, numar actiuni",
                "Distributie utilizare fonduri: 40% Tech / 40% Marketing / 15% Echipa / 5% Rezerve",
                "Runde succesive configurabile: SEED -> pre-Series A",
                "Aprobari admin + notificari push/email",
                "Legatura cu AIPL si performanta platformei",
                "Partener activ -> buton Devino si Investitor cu precompletare KYC",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/72">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Onboarding si aprobare</div>
            <div className="mt-4 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Flux securizat pentru intrarea in runda</div>
            <div className="mt-8 grid gap-3">
              {[
                "1. Click Investeste acum -> Nume, Email, Telefon, Tip entitate, Suma aproximativa",
                "2. Daca este deja partener -> precompletare automata + KYC reutilizat",
                "3. Verificare initiala prin email + telefon OTP",
                "4. Aprobare manuala admin in Backoffice",
                "5. Dupa aprobare -> email cu credentiale + link dashboard personalizat",
              ].map((item, index) => (
                <div key={item} className="flex gap-4 rounded-[20px] bg-[#F5F6F7] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF7F1A] text-sm font-bold text-white">{index + 1}</div>
                  <div className="text-sm leading-7 text-[#1E2E4D]/72">{item}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[24px] bg-[#FFF4E8] p-5 text-sm leading-7 text-[#1E2E4D]/72">
              Email automat de bun venit: confirmare tranzactie, ID unic, numar actiuni, valoare investitie, status contract, acces dashboard, rapoarte trimestriale si eligibilitate retragere.
            </div>
          </article>

          <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Dashboard investitor</div>
            <div className="mt-4 text-[36px] font-extrabold leading-[0.98]">KYC, monitorizare, documente si retragere decizionala</div>
            <div className="mt-8 grid gap-3">
              {[
                "Formalizare legala: PF / PJ / Fond / Banca, CUI/CNP, sediu, reprezentant, IBAN, SWIFT",
                "Upload documente + semnatura digitala contract prin OTP / eIDAS",
                "Monitorizare investitie: valoare actiune, progres fonduri utilizate, status retragere",
                "Notificari la milestone-uri: soft cap, hard cap, raport trimestrial",
                "Documente: contract SEED, certificate actiuni, rapoarte trimestriale / anuale",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-white/8 px-4 py-3 text-sm text-white/82">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              <span className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">Aproba acces investitor</span>
              <span className="rounded-full bg-white px-5 py-4 text-center text-sm font-semibold text-[#1E2E4D]">Deschide dashboard demo</span>
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Creare cont investitor</div>
                <div className="mt-2 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Exista acum o cale explicita de inscriere in modulul investitor</div>
              </div>
              <span className="rounded-full bg-[#09A299] px-5 py-3 text-sm font-semibold text-white">Cont nou</span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                "Nume complet",
                "Email",
                "Telefon mobil pentru OTP",
                "Tip entitate: PF / PJ / Fond / Banca",
                "Suma aproximativa investitie",
                "Parola",
                "Confirmare parola",
                "Acceptare NDA + GDPR",
              ].map((field) => (
                <div key={field} className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/56">
                  {field}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/mockup-v1/public/investitori/creare-cont" className="rounded-full bg-[#EF7F1A] px-5 py-4 text-sm font-semibold text-white">
                Creeaza cont investitor
              </Link>
              <Link href="/mockup-v1/public/investitori/creare-cont" className="rounded-full bg-[#1E2E4D] px-5 py-4 text-sm font-semibold text-white">
                Trimite OTP
              </Link>
              <Link href="/mockup-v1/public/investitori/creare-cont" className="rounded-full bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                Am deja cont
              </Link>
            </div>
          </article>

          <article className="rounded-[36px] bg-[#EEF3FB] p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Cale de acces completa</div>
            <div className="mt-6 grid gap-3">
              {[
                "Vizitatorul apasa Investeste acum",
                "Isi creeaza contul investitor sau intra cu un cont existent",
                "Verifica email + telefon prin OTP",
                "Completeaza onboarding-ul si datele KYC / KYB",
                "Admin aproba si activeaza dashboard-ul privat",
              ].map((item, index) => (
                <div key={item} className="flex gap-4 rounded-[20px] bg-white px-4 py-4 text-sm leading-7 text-[#1E2E4D]/72 shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EF7F1A] text-xs font-bold text-white">{index + 1}</div>
                  <div>{item}</div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            "FastAPI + PostgreSQL dedicat pentru FundingRound",
            "Stripe Connect + escrow pentru plati",
            "Gemini pentru scoring KYC initial si audit securizat AES-256",
          ].map((item) => (
            <article key={item} className="rounded-[30px] bg-white p-6 shadow-[0_16px_45px_rgba(30,46,77,0.05)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Specificatii tehnice</div>
              <div className="mt-3 text-[24px] font-extrabold leading-tight text-[#1E2E4D]">{item}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function AccountMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[1fr_1fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[ICON]" tone="dark" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Cont client dupa comanda</div>
              <h1 className="mt-4 text-[48px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">
                Timeline comanda, documente, mesagerie si actiuni post-checkout.
              </h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                Dupa plata si confirmare, clientul intra in zona operationala: vede statusul comenzii, documentele generate,
                comunicarea cu prestatorul si poate reprograma, anula sau lasa review.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#1E2E4D] px-4 py-3 text-sm font-semibold text-white">Comanda #MD-2026-00481</span>
                <span className="rounded-full bg-[#EAF9F7] px-4 py-3 text-sm font-semibold text-[#117A73]">Order confirmed</span>
                <span className="rounded-full bg-[#FFF4E8] px-4 py-3 text-sm font-semibold text-[#EF7F1A]">Prestator in alocare</span>
              </div>
            </div>
            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-3">
                {[
                  "Timeline live al comenzii si statusurilor post-checkout",
                  "Factura, proforma si dovada platii intr-un singur loc",
                  "Mesagerie directa cu prestatorul si echipa My Darrin",
                  "Actiuni rapide: reprogrameaza, anuleaza, lasa review",
                  "Istoric servicii, adrese si metode de plata salvate",
                  "Suport Darrin AI contextual pentru comanda curenta",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Timeline comanda</div>
            <div className="mt-3 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Clientul vede clar ce s-a intamplat si ce urmeaza</div>
            <div className="mt-8 grid gap-4">
              {[
                "Plata autorizata si comanda creata in sistem",
                "Documente emise: proforma, factura si dovada plata",
                "Prestatorul este selectat pentru zona Bucuresti - Sector 3",
                "Interventia este programata pentru maine, 10:00 - 12:00",
                "Dupa finalizare se activeaza garantia si review-ul",
              ].map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[22px] bg-[#F5F6F7] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF7F1A] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="text-sm leading-7 text-[#1E2E4D]/72">{step}</div>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Documente si plata</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Factura proforma - PDF securizat",
                  "Factura fiscala - generata dupa confirmare",
                  "Dovada plata / autorizare card",
                  "Ordin de lucru si rezumat servicii",
                ].map((item) => (
                  <div key={item} className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Mesagerie si actiuni</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Chat cu prestatorul alocat si echipa de suport",
                  "Trimite poze suplimentare sau clarificari de acces",
                  "Confirmare ora sosire si fereastra de interventie",
                  "Escaladare rapida catre Darrin AI sau suport uman",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white/8 px-4 py-3 text-sm text-white/82">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                <Link href="/mockup-v1/public/payment-status" className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">
                  Vezi status plata
                </Link>
                <span className="rounded-full bg-white px-5 py-4 text-center text-sm font-semibold text-[#1E2E4D]">
                  Reprogrameaza
                </span>
                <span className="rounded-full bg-white/12 px-5 py-4 text-center text-sm font-semibold text-white">
                  Anuleaza
                </span>
                <span className="rounded-full bg-[#09A299] px-5 py-4 text-center text-sm font-semibold text-white">
                  Lasa review
                </span>
              </div>
            </article>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Servicii si adrese salvate</div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                "Reparat calorifer - ultima comanda",
                "Adresa principala de prestare",
                "Adresa secundara birou",
                "Card salvat si preferinte plata",
                "Contact facturare",
                "Limba si preferinte notificari",
                "Garantie activa pentru comanda curenta",
                "Istoric review-uri trimise",
              ].map((field) => (
                <div key={field} className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/70">
                  {field}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[36px] bg-[#EEF3FB] p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Centru de suport</div>
            <div className="mt-3 text-[34px] font-extrabold leading-[0.98] text-[#1E2E4D]">Darrin AI si suportul operational raman aproape dupa plasarea comenzii</div>
            <div className="mt-8 grid gap-3">
              {[
                "Rezumat AI al comenzii si urmatorului pas",
                "Raspuns rapid pentru intrebari despre factura si programare",
                "Buton de escaladare catre operator uman",
                "Sugestie de servicii complementare dupa finalizare",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              <Link href="/mockup-v1/public/catalog" className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">
                Comanda din nou
              </Link>
              <Link href="/mockup-v1/public/cos" className="rounded-full bg-[#1E2E4D] px-5 py-4 text-center text-sm font-semibold text-white">
                Vezi cosul
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export function PublicCartMockup() {
  const billingCountry = "Romania";
  const subtotal = cartItemsMock.reduce((sum, item) => sum + item.subtotal, 0);
  const supplements = 96;
  const garantie = subtotal * 0.05;
  const tvaRate = 0.19;
  const tva = (subtotal + supplements + garantie) * tvaRate;
  const total = subtotal + supplements + garantie + tva;

  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[ICON]" tone="dark" />
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Coșul Meu</div>
              <h1 className="mt-4 text-[48px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">
                Coș multi-serviciu cu total live, zonă validată și tranziție fluidă către checkout.
              </h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                Modulul gestionează temporar serviciile selectate, păstrează datele în `localStorage` pentru utilizatori
                nelogați și sincronizează coșul cu backend-ul după autentificare.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#1E2E4D] px-4 py-3 text-sm font-semibold text-white">{cartItemsMock.length} servicii</span>
                <span className="rounded-full bg-[#FFF4E8] px-4 py-3 text-sm font-semibold text-[#EF7F1A]">{total.toFixed(2)} lei total estimat</span>
                <span className="rounded-full bg-[#EAF9F7] px-4 py-3 text-sm font-semibold text-[#117A73]">Toate zonele validate</span>
              </div>
            </div>

            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-3">
                {[
                  "Header cu icon coș + badge număr items",
                  "Persistență hibridă: localStorage + sync server după login",
                  "Blocare checkout dacă o zonă de prestare nu este validată",
                  "Prețuri ajustate din rate-card, nivel, cantitate, zonă și TVA țară facturare",
                  "Recomandări AI complementare generate din conținutul coșului",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Header secțiune</div>
                <div className="mt-2 text-[34px] font-extrabold text-[#1E2E4D]">Coșul Meu, total estimat și control rapid asupra articolelor</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/mockup-v1/public/catalog" className="rounded-full bg-[#1E2E4D] px-5 py-3 text-sm font-semibold text-white">
                  Continuă cumpărăturile
                </Link>
                <span className="rounded-full bg-[#F5F6F7] px-5 py-3 text-sm font-semibold text-[#1E2E4D]">Golește coșul</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {cartItemsMock.map((item) => (
                <div key={`${item.serviceId}-${item.level}`} className="rounded-[28px] border border-[#1E2E4D]/8 bg-[#F9FAFB] p-5 shadow-[0_10px_24px_rgba(30,46,77,0.04)]">
                  <div className="grid gap-5 lg:grid-cols-[124px_1fr_auto]">
                    <div className="rounded-[24px] bg-[#1E2E4D] p-4 text-white">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em]">Imagine</div>
                      <div className="mt-6 rounded-full bg-white/12 px-3 py-2 text-xs font-semibold">[IMAGINE]</div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-[24px] font-extrabold text-[#1E2E4D]">
                          {item.title} - {item.level}
                        </div>
                        <span className="rounded-full bg-[#FFF4E8] px-3 py-1 text-xs font-semibold text-[#EF7F1A]">{item.quantity} {item.unit}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm leading-7 text-[#1E2E4D]/68">
                        <div>Zonă prestare: {item.zoneName}</div>
                        <div>Adresă prestare: {item.prestareAddress}</div>
                        <div>Preț unitar: {item.priceUnit} lei, ajustat din rate-card pe zonă, nivel și disponibilitate</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <div className="rounded-[20px] bg-white px-4 py-4 text-right shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Subtotal</div>
                        <div className="mt-2 text-[28px] font-extrabold text-[#EF7F1A]">{item.subtotal} lei</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/mockup-v1/public/${item.slug}`} className="rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">
                          Editează
                        </Link>
                        <span className="rounded-full bg-[#F5F6F7] px-4 py-2 text-sm font-semibold text-[#1E2E4D]">Șterge</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] bg-[#FFF4E8] p-5 text-sm leading-7 text-[#1E2E4D]/72">
              Dacă un articol are zonă de prestare nevalidată, checkout-ul se blochează și utilizatorul este redirecționat către
              verificarea disponibilității din catalog sau pagina serviciului.
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Total & garanție</div>
              <div className="mt-6 grid gap-4">
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>Subtotal servicii</span>
                  <span>{subtotal.toFixed(2)} lei</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>Suplimentări transport / urgență</span>
                  <span>{supplements.toFixed(2)} lei</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>Garanție bună execuție 5%</span>
                  <span>{garantie.toFixed(2)} lei</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>TVA ({billingCountry} 19%)</span>
                  <span>{tva.toFixed(2)} lei</span>
                </div>
                <div className="rounded-[24px] bg-[#1E2E4D] px-5 py-5 text-white">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCF95]">Total de plătit</div>
                  <div className="mt-2 text-[36px] font-extrabold text-[#EF7F1A]">{total.toFixed(2)} lei</div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[#1E2E4D]/64">
                Prețurile sunt estimative și se pot ajusta ușor în funcție de detaliile finale furnizate prestatorului.
              </p>
              <div className="mt-6 grid gap-3">
                <Link href="/mockup-v1/public/checkout" className="rounded-full bg-[#EF7F1A] px-6 py-4 text-center text-[15px] font-semibold text-white">
                  Mergi la Checkout
                </Link>
                <Link href="/mockup-v1/public/catalog" className="rounded-full bg-[#1E2E4D] px-6 py-4 text-center text-[15px] font-semibold text-white">
                  Continuă cumpărăturile
                </Link>
              </div>
            </article>

            <article className="rounded-[36px] bg-[#09A299] p-8 text-white shadow-[0_18px_55px_rgba(9,162,153,0.20)] lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <MockupMarker label="[DARRIN AI]" tone="light" />
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-white">Ai nevoie și de...</div>
              </div>
              <div className="mt-4 text-[34px] font-extrabold leading-[0.98]">Recomandări AI complementare pentru conținutul actual al coșului</div>
              <div className="mt-8 grid gap-4">
                {cartRecommendationsMock.map((item) => (
                  <div key={item.title} className="rounded-[24px] bg-white/12 p-5">
                    <div className="text-[22px] font-extrabold">{item.title}</div>
                    <div className="mt-2 text-sm leading-7 text-white/80">{item.note}</div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{item.price}</span>
                      <Link href="/mockup-v1/public/cos" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#117A73]">
                        Adaugă
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            "Din catalog sau pagina serviciului: utilizatorul apasă Adaugă în coș și completează adresa de prestare.",
            "POST /api/zone/check-availability verifică zona, nivelul și disponibilitatea înainte de adăugare.",
            "GET /api/cart și POST /api/cart/add sincronizează coșul local cu serverul după login.",
          ].map((item) => (
            <article key={item} className="rounded-[30px] bg-white p-6 shadow-[0_16px_45px_rgba(30,46,77,0.05)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Flux tehnic integrare</div>
              <div className="mt-3 text-[24px] font-extrabold leading-tight text-[#1E2E4D]">{item}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function PublicCheckoutMockup() {
  const selectedCountry = checkoutCountryRates[0];
  const subtotal = cartItemsMock.reduce((sum, item) => sum + item.subtotal, 0);
  const supplements = 96;
  const garantie = subtotal * 0.05;
  const tva = (subtotal + supplements + garantie) * selectedCountry.tvaRate;
  const total = subtotal + supplements + garantie + tva;

  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[ICON]" tone="dark" />
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Checkout My Darrin</div>
              <h1 className="mt-4 text-[48px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">
                Finalizare comandă cu adresă de prestare separată de facturare, TVA pe țară și pași clari de plată.
              </h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                Checkout-ul primește automat datele din coș, păstrează validarea zonelor de prestare și calculează totalul
                final după țara de facturare selectată de client.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-4">
                {checkoutPaymentSteps.map((step, index) => (
                  <div key={step} className={`rounded-[18px] px-4 py-3 text-center text-sm font-semibold ${index === 0 ? "bg-[#EF7F1A] text-white" : "bg-[#F5F6F7] text-[#1E2E4D]"}`}>
                    {index + 1}. Pas
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-3">
                {[
                  "Checkout blocat dacă există servicii fără zonă prestare validată",
                  "Adresă prestare salvată per item, adresă facturare unică pe comandă",
                  "TVA din țara facturare, nu din zona de executare",
                  "Metode de plată multiple pentru PF, PJ și proiecte mari",
                  "Sincronizare cu cont client și documente generate la final",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="grid gap-6">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Adrese separat</div>
              <div className="mt-3 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Adresă de prestare per serviciu și adresă de facturare la nivel de comandă</div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-[28px] bg-[#F9FAFB] p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Adresă prestare</div>
                  <div className="mt-4 grid gap-3">
                    {cartItemsMock.map((item) => (
                      <div key={item.serviceId} className="rounded-[20px] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                        <div className="text-[16px] font-extrabold text-[#1E2E4D]">{item.title}</div>
                        <div className="mt-2 text-sm leading-7 text-[#1E2E4D]/68">{item.prestareAddress}</div>
                        <div className="text-sm leading-7 text-[#117A73]">Zonă validată: {item.zoneName}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] bg-[#F9FAFB] p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Adresă facturare</div>
                  <div className="mt-4 grid gap-3">
                    {[
                      "Tip entitate: Persoană Fizică / Companie",
                      "Nume / Denumire companie",
                      "CUI / CNP",
                      "Țara facturare",
                      "Județ / Regiune",
                      "Adresă completă facturare",
                    ].map((field) => (
                      <div key={field} className="rounded-[20px] bg-white px-4 py-4 text-sm text-[#1E2E4D]/56 shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">TVA pe țară</div>
              <div className="mt-3 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Selectarea țării de facturare actualizează instant TVA și totalul</div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {checkoutCountryRates.map((country) => (
                  <div key={country.country} className={`rounded-[24px] p-5 ${country.country === selectedCountry.country ? "bg-[#1E2E4D] text-white" : "bg-[#F5F6F7] text-[#1E2E4D]"}`}>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">{country.currency}</div>
                    <div className="mt-3 text-[24px] font-extrabold">{country.country}</div>
                    <div className="mt-2 text-sm font-semibold">TVA {country.tvaLabel}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[28px] bg-[#FFF4E8] p-5 text-sm leading-7 text-[#1E2E4D]/72">
                Formula activă de calcul: subtotal servicii + suplimentări + garanție bună execuție, apoi TVA conform țării de
                facturare selectate în checkout.
              </div>
            </article>

            <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Pași de plată</div>
              <div className="mt-3 text-[36px] font-extrabold leading-[0.98]">Clientul vede clar cum trece de la verificare la confirmare</div>
              <div className="mt-8 grid gap-3">
                {checkoutPaymentSteps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-[20px] bg-white/8 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF7F1A] text-sm font-bold text-white">{index + 1}</div>
                    <div className="text-sm leading-7 text-white/82">{step}</div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-6">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Sumar comandă</div>
              <div className="mt-6 grid gap-4">
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>Subtotal servicii</span>
                  <span>{subtotal.toFixed(2)} lei</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>Suplimentări</span>
                  <span>{supplements.toFixed(2)} lei</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>Garanție bună execuție 5%</span>
                  <span>{garantie.toFixed(2)} lei</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                  <span>TVA {selectedCountry.country} ({selectedCountry.tvaLabel})</span>
                  <span>{tva.toFixed(2)} lei</span>
                </div>
                <div className="rounded-[24px] bg-[#1E2E4D] px-5 py-5 text-white">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCF95]">Total de plată</div>
                  <div className="mt-2 text-[36px] font-extrabold text-[#EF7F1A]">{total.toFixed(2)} lei</div>
                </div>
              </div>
            </article>

            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Metode de plată</div>
              <div className="mt-6 grid gap-3">
                {checkoutPaymentMethods.map((item, index) => (
                  <div key={item} className={`rounded-[22px] px-5 py-4 text-sm font-semibold ${index === 0 ? "bg-[#EAF9F7] text-[#117A73]" : "bg-[#F5F6F7] text-[#1E2E4D]"}`}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/56">Cardholder name</div>
                <div className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/56">Card number</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/56">MM / YY</div>
                  <div className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm text-[#1E2E4D]/56">CVC</div>
                </div>
              </div>
            </article>

            <article className="rounded-[36px] bg-[#09A299] p-8 text-white shadow-[0_18px_55px_rgba(9,162,153,0.20)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-white">Acțiuni finale</div>
              <div className="mt-4 text-[34px] font-extrabold leading-[0.98]">Confirmare comandă, emitere documente și pornire flux operațional</div>
              <div className="mt-8 grid gap-3">
                <Link href="/mockup-v1/public/payment-status" className="rounded-full bg-[#EF7F1A] px-6 py-4 text-center text-[15px] font-semibold text-white">
                  Plateste si confirma comanda
                </Link>
                <Link href="/mockup-v1/public/cos" className="rounded-full bg-white px-6 py-4 text-center text-[15px] font-semibold text-[#117A73]">
                  Inapoi la cos
                </Link>
              </div>
              <p className="mt-5 text-sm leading-7 text-white/82">
                După confirmare: ordin de lucru, notificare prestatori, email client, factură proformă și status inițial al
                comenzii în contul clientului.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PublicPaymentStatusMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[ICON]" tone="dark" />
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Plata si stari post-checkout</div>
              <h1 className="mt-4 text-[48px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">
                Dupa checkout, comanda trece prin plata, confirmare si intrarea in executie.
              </h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                Acest ecran arata tranzitia completa dintre plata efectiva si starea operationala vizibila in contul clientului
                si in Backoffice.
              </p>
            </div>

            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-3">
                {[
                  "Stripe / MobilPay confirma plata sau autorizarea sumei",
                  "Backoffice primeste evenimentul si actualizeaza statusul comenzii",
                  "Clientul vede noile stari in cont si primeste email plus SMS",
                  "Prestatorul este notificat doar dupa validarea completa a platii",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
            <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Status lifecycle</div>
            <div className="mt-3 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Stari clare pentru client, plata si echipa operationala</div>
            <div className="mt-8 grid gap-4 xl:grid-cols-4">
              {postCheckoutStates.map((state, index) => (
                <div key={state.key} className="rounded-[28px] border border-[#1E2E4D]/8 bg-[#F9FAFB] p-5 shadow-[0_10px_24px_rgba(30,46,77,0.04)]">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${state.tone}`}>
                    {state.title}
                  </div>
                  <div className="mt-4 text-[22px] font-extrabold leading-tight text-[#1E2E4D]">Etapa {index + 1}</div>
                  <p className="mt-3 text-sm leading-7 text-[#1E2E4D]/68">{state.note}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
            <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Evenimente sistem</div>
              <div className="mt-4 text-[36px] font-extrabold leading-[0.98]">Ordinea triggerelor dupa plata</div>
              <div className="mt-8 grid gap-3">
                {[
                  "Webhook de la procesatorul de plata actualizeaza pending payment",
                  "Autorizarea sau captura schimba comanda in payment authorized",
                  "Documentele si rezumatul duc comanda in order confirmed",
                  "Motorul de alocare si adminul muta comanda in awaiting provider assignment",
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-[20px] bg-white/8 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF7F1A] text-sm font-bold text-white">{index + 1}</div>
                    <div className="text-sm leading-7 text-white/82">{item}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Actiuni disponibile</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Pending payment: reincercare plata, schimbare metoda, suport",
                  "Payment authorized: vizualizare dovada, sumar comanda, blocare suma",
                  "Order confirmed: factura, ordin de lucru, notificari",
                  "Awaiting provider assignment: timeline si mesaj catre suport",
                ].map((item) => (
                  <div key={item} className="rounded-[22px] bg-[#F5F6F7] px-5 py-4 text-sm font-semibold text-[#1E2E4D]">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                <Link href="/mockup-v1/public/account" className="rounded-full bg-[#EF7F1A] px-6 py-4 text-center text-[15px] font-semibold text-white">
                  Vezi comanda in contul clientului
                </Link>
                <Link href="/mockup-v1/public/dashboard-partener" className="rounded-full bg-[#09A299] px-6 py-4 text-center text-[15px] font-semibold text-white">
                  Vezi dashboard partener
                </Link>
                <Link href="/mockup-v1/public/checkout" className="rounded-full bg-[#1E2E4D] px-6 py-4 text-center text-[15px] font-semibold text-white">
                  Inapoi la checkout
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <ApprovedPublicFooter />
    </main>
  );
}

export function PublicPartnerDashboardMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[ICON]" tone="dark" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Dashboard prestator / partener</div>
              <h1 className="mt-4 text-[48px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[60px]">
                Comanda alocata, confirmare, resurse, executie si inchidere operationala.
              </h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-8 text-[#1E2E4D]/64">
                Dupa alocare, partenerul intra in dashboard-ul sau si vede toate datele necesare pentru a accepta comanda,
                a pregati resursele, a comunica cu clientul si a inchide interventia corect.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#1E2E4D] px-4 py-3 text-sm font-semibold text-white">Comanda #MD-2026-00481</span>
                <span className="rounded-full bg-[#EAF9F7] px-4 py-3 text-sm font-semibold text-[#117A73]">Prestator alocat</span>
                <span className="rounded-full bg-[#FFF4E8] px-4 py-3 text-sm font-semibold text-[#EF7F1A]">Interventie maine 10:00</span>
              </div>
            </div>

            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-3">
                {[
                  "Client: Bucuresti, Sector 3, Bd. Unirii nr. 5",
                  "Serviciu: Reparat calorifer - nivel Premium",
                  "Resurse necesare preluate automat din Backoffice",
                  "Mesagerie directa cu clientul si suportul operational",
                  "Check-in, inceput lucrare, finalizare si upload dovada executie",
                ].map((item) => (
                  <div key={item} className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-[#1E2E4D] shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="grid gap-6">
            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Flux operational</div>
              <div className="mt-3 text-[36px] font-extrabold leading-[0.98] text-[#1E2E4D]">Partenerul vede pas cu pas ce are de facut dupa alocare</div>
              <div className="mt-8 grid gap-4">
                {[
                  "1. Accepta sau refuza comanda intr-un SLA clar",
                  "2. Verifica adresa, intervalul si detaliile tehnice ale serviciului",
                  "3. Confirma echipa, resursele si timpul estimat de deplasare",
                  "4. Face check-in la locatie si incepe executia",
                  "5. Inchide comanda cu poze, observatii si semnatura clientului",
                ].map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-[22px] bg-[#F5F6F7] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EF7F1A] text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="text-sm leading-7 text-[#1E2E4D]/72">{step}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Resurse si reteta de executie</div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  "Manopera: mecanic instalatii termice - 2.5 ore",
                  "Material: kit etansare + robineti",
                  "Transport: urban 8 km, timp estimat 25 min",
                  "Checklist siguranta si protectie la locatie",
                  "Poze obligatorii inainte / dupa interventie",
                  "Garantie activa dupa inchidere si validare client",
                ].map((item) => (
                  <div key={item} className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-6">
            <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Actiuni prestator</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Accepta comanda",
                  "Solicita clarificari clientului",
                  "Porneste deplasarea",
                  "Incepe executia",
                  "Finalizeaza si incarca dovada",
                ].map((item, index) => (
                  <div key={item} className={`rounded-[18px] px-4 py-4 text-sm font-semibold ${index === 0 ? "bg-[#EF7F1A] text-white" : "bg-white/8 text-white/84"}`}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[22px] bg-white/8 p-5 text-sm leading-7 text-white/82">
                Dashboard-ul pastreaza sincronizarea cu Backoffice: status, materiale, observatii, poze si semnatura finala.
              </div>
            </article>

            <article className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Mesagerie si inchidere</div>
              <div className="mt-6 grid gap-3">
                {[
                  "Chat cu clientul pentru acces, parcare sau clarificari",
                  "Canal cu suportul My Darrin pentru exceptii si escalari",
                  "Upload poze finale si fisier proces verbal",
                  "Semnatura clientului si trimitere spre validare",
                ].map((item) => (
                  <div key={item} className="rounded-[20px] bg-[#F5F6F7] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                <Link href="/mockup-v1/public/payment-status" className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">
                  Inapoi la status comanda
                </Link>
                <Link href="/mockup-v1/public/account" className="rounded-full bg-[#1E2E4D] px-5 py-4 text-center text-sm font-semibold text-white">
                  Vezi si contul clientului
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <ApprovedPublicFooter />
    </main>
  );
}

export function PartnerSignupMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[DARRIN AI]" tone="green" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Inscriere devino partener</div>
              <h1 className="mt-4 text-[44px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[56px]">Creeaza contul de partener si continua onboarding-ul.</h1>
              <p className="mt-5 text-[18px] leading-8 text-[#1E2E4D]/64">
                Ecran dedicat de creare cont, fara footer, aliniat cu varianta aprobata pentru wizard-ul partener.
              </p>
            </div>
            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {["Email", "Telefon OTP", "Parola", "Confirmare parola", "Tip entitate", "Acceptare termeni"].map((field) => (
                  <div key={field} className="rounded-[20px] bg-white px-4 py-4 text-sm text-[#1E2E4D]/56 shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {field}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3">
                <span className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">Creeaza cont partener</span>
                <span className="rounded-full bg-[#1E2E4D] px-5 py-4 text-center text-sm font-semibold text-white">Trimite OTP</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function InvestorSignupMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[WIDGET EMBED]" tone="dark" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Inscriere devino investitor</div>
              <h1 className="mt-4 text-[44px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[56px]">Creeaza contul investitor si intra in fluxul de aprobare.</h1>
              <p className="mt-5 text-[18px] leading-8 text-[#1E2E4D]/64">
                Ecran dedicat pentru creare cont investitor, fara footer, aliniat cu varianta investitor aprobata.
              </p>
            </div>
            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {["Nume complet", "Email", "Telefon OTP", "Tip entitate", "Suma estimata", "Parola", "Confirmare parola", "Acceptare NDA / GDPR"].map((field) => (
                  <div key={field} className="rounded-[20px] bg-white px-4 py-4 text-sm text-[#1E2E4D]/56 shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {field}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3">
                <span className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">Creeaza cont investitor</span>
                <span className="rounded-full bg-[#1E2E4D] px-5 py-4 text-center text-sm font-semibold text-white">Trimite OTP</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ClientSignupMockup() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#F5F6F7] text-[#1E2E4D]`}>
      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[38px] bg-white shadow-[0_22px_60px_rgba(30,46,77,0.08)]">
          <div className="grid gap-6 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-2">
                <MockupMarker label="[LOGO MY DARRIN]" tone="orange" />
                <MockupMarker label="[ICON]" tone="dark" />
              </div>
              <div className="mt-6 text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Creare cont client</div>
              <h1 className="mt-4 text-[44px] font-extrabold leading-[0.96] text-[#1E2E4D] sm:text-[56px]">Creeaza contul client si continua cu adresele si comenzile.</h1>
              <p className="mt-5 text-[18px] leading-8 text-[#1E2E4D]/64">
                Ecran dedicat pentru client, fara footer, aliniat cu varianta aprobata a modulului de cont.
              </p>
            </div>
            <div className="rounded-[34px] bg-[#EEF3FB] p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {["Prenume", "Nume", "Telefon", "Email", "Parola", "Confirmare parola", "Adresa principala", "Tip locatie"].map((field) => (
                  <div key={field} className="rounded-[20px] bg-white px-4 py-4 text-sm text-[#1E2E4D]/56 shadow-[0_8px_18px_rgba(30,46,77,0.05)]">
                    {field}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3">
                <span className="rounded-full bg-[#EF7F1A] px-5 py-4 text-center text-sm font-semibold text-white">Creeaza cont client</span>
                <span className="rounded-full bg-[#1E2E4D] px-5 py-4 text-center text-sm font-semibold text-white">Trimite OTP</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AdminDashboardMockup() {
  return (
    <AdminShell title="Dashboard" active="Dashboard">
      <GenericMockupPanel eyebrow="KPI" title="Indicatori principali" items={["Comenzi", "Venituri", "Furnizori activi", "Conversii", "Grafice operationale"]} />
    </AdminShell>
  );
}

export function AdminLiveOrdersMockup() {
  return (
    <AdminShell title="Comenzi Live" active="Comenzi Live">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="Live Operations"
          title="Control operational complet pentru Super Admin"
          actions={<span className="rounded-full bg-[#EF7F1A] px-4 py-2 text-sm font-semibold text-white">24 comenzi active</span>}
        >
          <div className="grid gap-4 xl:grid-cols-4">
            {[
              "Alocare prestator in timp real pe zona, serviciu si SLA",
              "Monitorizare check-in, executie, upload dovezi si semnatura client",
              "Escalari si exceptii operationale cu suport Darrin AI",
              "Validare inchidere, activare garantie si review post-serviciu",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <BrowserFrame eyebrow="Orders Queue" title="Comenzi care cer actiune imediata">
            <div className="grid gap-4">
              {[
                "MD-2026-00481 | Reparat calorifer | Bucuresti Sector 3 | awaiting provider assignment | SLA 12 min",
                "MD-2026-00482 | Interventie electrica | Cluj-Napoca | provider accepted | check-in in 18 min",
                "MD-2026-00483 | Montaj centrala termica | Iasi | pending payment review | necesita validare admin",
                "MD-2026-00484 | Reparatie instalatie apa | Constanta | exception raised | client request reschedule",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="SLA" title="Urmarire SLA si alerte">
            <div className="grid gap-3">
              {[
                "SLA alocare: 92% respectat astazi",
                "3 comenzi la risc in urmatoarele 15 minute",
                "1 comanda escalata catre suport uman",
                "Timp mediu check-in prestator: 21 minute",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Allocation" title="Alocare prestator">
            <div className="grid gap-3">
              {[
                "Matching automat pe zona, competenta, rating si disponibilitate",
                "Override manual de catre Super Admin",
                "Buton rapid: confirma alocarea sau muta pe alt partener",
                "Istoric alocari si motivatii vizibile pentru audit",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Exceptions" title="Exceptii si escalari">
            <div className="grid gap-3">
              {[
                "Refuz prestator sau depasire SLA",
                "Client indisponibil / adresa neclara",
                "Materiale lipsa sau pret recalculat",
                "Escalare AI -> operator uman -> manager operational",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Closure" title="Inchidere, garantie si review">
            <div className="grid gap-3">
              {[
                "Validare poze inainte / dupa si semnatura client",
                "Confirmare finala admin daca exista exceptii",
                "Activare garantie buna executie",
                "Trigger automat pentru review client",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminOperationalBiMockup() {
  return (
    <AdminShell title="BI Operational" active="BI Operational">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="Executive BI"
          title="KPI-uri operationale pentru Super Admin"
          actions={<span className="rounded-full bg-[#09A299] px-4 py-2 text-sm font-semibold text-white">Actualizare live</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "Comenzi live: 24 active",
              "SLA respectat: 92%",
              "Conversie catalog -> checkout: 18.4%",
              "Rating parteneri activi: 4.82",
              "Review-uri finalizate: 87%",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <BrowserFrame eyebrow="Orders & SLA" title="Comenzi live si calitatea executiei">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Volum comenzi pe orase si industrii",
                "Timp mediu alocare prestator",
                "Timp mediu check-in si durata executie",
                "Comenzi cu risc SLA sau exceptii active",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Conversion" title="Conversii si funnel comercial">
            <div className="grid gap-3">
              {[
                "Homepage -> catalog",
                "Catalog -> pagina serviciu",
                "Pagina serviciu -> cos",
                "Cos -> checkout",
                "Checkout -> payment authorized",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Partners" title="Performanta partenerilor">
            <div className="grid gap-3">
              {[
                "Top parteneri dupa accept rate si timp raspuns",
                "Scor calitate executie si incidente",
                "Rata anulare / reprogramare pe partener",
                "Capacitate pe zone si servicii",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Guarantees" title="Garantii si post-serviciu">
            <div className="grid gap-3">
              {[
                "Garantii active, expirate si in disputa",
                "Costuri de garantie si reveniri",
                "Activare review dupa inchidere",
                "Corelatie garantie vs rating final client",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Reviews" title="Review-uri si satisfactie clienti">
            <div className="grid gap-3">
              {[
                "NPS si rating mediu pe categorie",
                "Review-uri negative care cer follow-up",
                "Teme recurente extrase de Darrin AI",
                "Impact review-uri asupra conversiei viitoare",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="AIPL" title="Legatura dintre BI operational si AI / pricing logic">
            <div className="grid gap-3">
              {[
                "Economiile de timp generate de AI pe clasificare si alocare",
                "Predictia riscului de SLA si exceptie operationala",
                "Recomandari de rebalansare a retelei de parteneri",
                "Ajustari de rate-card pe baza cererii, zonei si performantei",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide din BI">
            <div className="grid gap-3">
              {[
                "Deschide comenzi live cu risc SLA",
                "Vezi top parteneri si zone deficitare",
                "Valideaza campanii pe baza conversiilor",
                "Lanseaza analiza review-uri negative",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminFinancialMockup() {
  return (
    <AdminShell title="Financiar" active="Financiar">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="Financial Control"
          title="Reconciliere, comisioane si payout pentru parteneri"
          actions={<span className="rounded-full bg-[#EF7F1A] px-4 py-2 text-sm font-semibold text-white">Payout batch: azi 17:00</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "Incasari brute azi: 148.240 lei",
              "Comision platforma: 18.760 lei",
              "Payout-uri in asteptare: 52",
              "Reconciliere reusita: 97.8%",
              "Dispute financiare active: 3",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <BrowserFrame eyebrow="Reconciliation" title="Reconciliere tranzactii client - platforma - partener">
            <div className="grid gap-4">
              {[
                "MD-2026-00481 | plata capturata | comision aplicat | payout eligibil in 48h",
                "MD-2026-00482 | suma autorizata | asteapta inchidere comanda",
                "MD-2026-00483 | factura emisa | exceptie TVA | necesita verificare",
                "MD-2026-00484 | refund partial | recalcul comision si garantie",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Payout Engine" title="Eligibilitate payout si ferestre de plata">
            <div className="grid gap-3">
              {[
                "Comanda finalizata si validata de client",
                "Perioada de garantie sau hold financiar respectata",
                "Documente fiscale si cont bancar partener valide",
                "Payout programat: zilnic / saptamanal / manual",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Fees" title="Comisione si retineri">
            <div className="grid gap-3">
              {[
                "Comision platforma per categorie si serviciu",
                "Retinere garantie buna executie",
                "Ajustari pentru refund, discount sau dispute",
                "Istoric comisioane si reguli active din Backoffice",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Partner Payouts" title="Payout parteneri">
            <div className="grid gap-3">
              {[
                "Lista parteneri eligibili pentru payout",
                "IBAN, titular si metoda de transfer verificate",
                "Status payout: pending, processing, paid, failed",
                "Export bancar si dovada trimiterii",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Exceptions" title="Exceptii financiare">
            <div className="grid gap-3">
              {[
                "Plata esuata sau capturata partial",
                "Mismatch intre factura, payout si suma incasata",
                "TVA / moneda / zona cu reguli incompatibile",
                "Blocare manuala payout de catre Super Admin",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="Audit" title="Audit financiar si trasabilitate completa">
            <div className="grid gap-3">
              {[
                "Jurnal complet pe comanda: client -> procesator -> platforma -> partener",
                "Istoric modificari manuale pentru comisioane si payout",
                "Log immutable pentru dispute, refund si reversari",
                "Documente fiscale si export contabil pentru reconciliere externa",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide Super Admin">
            <div className="grid gap-3">
              {[
                "Ruleaza payout batch pentru partenerii eligibili",
                "Blocheaza sau aproba manual payout",
                "Deschide reconcilierea pe zi / oras / partener",
                "Trimite raport financiar catre owner / accounting",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminLegalComplianceMockup() {
  return (
    <AdminShell title="Legal & Compliance" active="Legal & Compliance">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="Legal Control"
          title="Contracte, GDPR, semnaturi si audit documentar"
          actions={<span className="rounded-full bg-[#09A299] px-4 py-2 text-sm font-semibold text-white">Conformitate activa</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "Contracte active: 2.184",
              "Semnaturi in asteptare: 46",
              "Documente expirate: 12",
              "GDPR requests deschise: 3",
              "Audit trail complet: 100%",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <BrowserFrame eyebrow="Contracts" title="Contracte si documente obligatorii">
            <div className="grid gap-4">
              {[
                "Contract client pentru servicii si termeni comerciali",
                "Contract partener / furnizor si anexele operationale",
                "NDA pentru investitori, parteneri si accesuri sensibile",
                "Modele versionate si publicare controlata din Backoffice",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="eSignature" title="Semnaturi si validare juridica">
            <div className="grid gap-3">
              {[
                "OTP, timestamp si semnatura cu valoare juridica",
                "eIDAS / qualified signature pentru fluxuri critice",
                "Biometrie pe mobil sau web pentru acceptari avansate",
                "Istoric semnari si stare document per entitate",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="GDPR" title="Protectia datelor si lifecycle legal">
            <div className="grid gap-3">
              {[
                "Consimtamant, temei legal si registru de prelucrare",
                "Cereri de acces, rectificare, stergere si export date",
                "Retentie configurabila pe tip document si entitate",
                "Mascare / anonimizare dupa expirarea bazei legale",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Audit" title="Audit documentar si trasabilitate">
            <div className="grid gap-3">
              {[
                "Versiuni documente si cine a publicat fiecare forma",
                "Log immutable pentru upload, semnare si expirare",
                "Legare document -> comanda -> partener -> client",
                "Dovezi de acceptare si canale de trimitere",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Retention" title="Retentie si arhivare legala">
            <div className="grid gap-3">
              {[
                "Reguli diferite pentru contracte, facturi, KYC si semnaturi",
                "Arhiva criptata si restaurare controlata",
                "Alerte pentru expirare, resemnare sau reinnoire",
                "Politici pe tara, entitate si tip de serviciu",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="Compliance Ops" title="Monitorizare conformitate in timp real">
            <div className="grid gap-3">
              {[
                "Parteneri cu documente expirate sau incomplete",
                "Clienti / investitori fara acceptari actualizate",
                "Comenzi blocate din motive juridice sau documentare",
                "Notificari automate pentru reinnoire si follow-up legal",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide Super Admin / Legal">
            <div className="grid gap-3">
              {[
                "Publica o noua versiune de contract sau termeni",
                "Trimite reminder de semnare / document lipsa",
                "Blocheaza operarea unei entitati neconforme",
                "Exporta dosar complet pentru audit sau litigiu",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminNotificationsMockup() {
  return (
    <AdminShell title="Notificari" active="Notificari">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="Omnichannel"
          title="Email, SMS, push, WhatsApp si trigger-e automate"
          actions={<span className="rounded-full bg-[#09A299] px-4 py-2 text-sm font-semibold text-white">Routing activ</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "Email livrate azi: 18.420",
              "SMS livrate azi: 6.180",
              "Push trimise: 12.904",
              "WhatsApp trimise: 2.311",
              "Rate succes mediu: 96.7%",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <BrowserFrame eyebrow="Triggers" title="Trigger-e automate pe tot ciclul platformei">
            <div className="grid gap-4">
              {[
                "Creare cont client / partener / investitor",
                "OTP, verificare email si semnaturi documente",
                "Adaugare in cos, checkout, plata si status comanda",
                "Alocare prestator, check-in, finalizare si review",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Channel Rules" title="Reguli de canal si fallback">
            <div className="grid gap-3">
              {[
                "Email pentru documente, contracte si rapoarte",
                "SMS pentru OTP, urgenta si reminder scurt",
                "Push pentru status live in aplicatie",
                "WhatsApp pentru notificari operationale premium",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Templates" title="Sabloane si localizare">
            <div className="grid gap-3">
              {[
                "Template versionat pe limba si entitate",
                "Continut dinamic cu variabile de comanda",
                "Preview pe email, SMS, push si WhatsApp",
                "Publicare controlata din Backoffice",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Delivery" title="Livrare si istoricul comunicarilor">
            <div className="grid gap-3">
              {[
                "Queued, sent, delivered, failed, read",
                "Retry logic si fallback pe alt canal",
                "Log per utilizator, comanda si document",
                "Corelatie cu funnel si SLA operational",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Compliance" title="Preferinte si conformitate mesaje">
            <div className="grid gap-3">
              {[
                "Opt-in / opt-out pe tip de notificare",
                "Consimtamant pentru marketing si canale externe",
                "Politici pe tara, limba si profil utilizator",
                "Istoric acceptari si dovada comunicarii",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="Journeys" title="Automatizari si customer journeys">
            <div className="grid gap-3">
              {[
                "Journey client: signup -> cos -> checkout -> review",
                "Journey partener: onboarding -> alocare -> executie -> payout",
                "Journey investitor: lead -> KYC -> plata -> dashboard",
                "Journey intern: exceptii, aprobari, escalari, follow-up",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide Super Admin">
            <div className="grid gap-3">
              {[
                "Trimite campanie sau mesaj punctual",
                "Pauzeaza un canal sau un trigger defect",
                "Deschide istoricul de livrare pentru o comanda",
                "Ruleaza test pe template inainte de publicare",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminAiCenterMockup() {
  return (
    <AdminShell title="AI Center" active="AI Center">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="AI Orchestration"
          title="Reguli AI, clasificare, rutare, scoring si automatizari cross-module"
          actions={<span className="rounded-full bg-[#09A299] px-4 py-2 text-sm font-semibold text-white">AI active</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "Clasificari automate azi: 12.842",
              "Rutari AI reusite: 94.1%",
              "Scoring fraude / risc: 318 cazuri",
              "Sugestii operationale acceptate: 67%",
              "Automatizari active: 126 reguli",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <BrowserFrame eyebrow="Classification" title="Intent, serviciu, categorie si prioritate">
            <div className="grid gap-4">
              {[
                "Text, imagine si video -> intentie si categorie corecta",
                "Detectie urgenta, locatie si tip interventie",
                "Mapare la servicii si niveluri din Backoffice",
                "Explicatii si confidence score pentru decizia AI",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Routing" title="Rutare operationala si decizii in timp real">
            <div className="grid gap-3">
              {[
                "Rutare spre partenerul optim dupa zona, scor si SLA",
                "Escalare la operator uman cand confidence este scazut",
                "Rutare financiara, legala sau suport in functie de eveniment",
                "Fallback rules daca AI sau integrarea esueaza",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Scoring" title="Scoring si predictii">
            <div className="grid gap-3">
              {[
                "Scor risc operational pentru comenzi live",
                "Scor calitate / fiabilitate pentru parteneri",
                "Scor fraud / plata pentru checkout si investitii",
                "Scor satisfactie estimata si probabilitate review negativ",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Suggestions" title="Sugestii operationale si comerciale">
            <div className="grid gap-3">
              {[
                "Sugestii servicii complementare in catalog si cos",
                "Recomandari de reprogramare si alocare prestator",
                "Ajustari rate-card si disponibilitate pe zona",
                "Rezumat automat pentru operatori si clienti",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Automation" title="Automatizari cross-module">
            <div className="grid gap-3">
              {[
                "Public -> cos -> checkout -> plata -> alocare",
                "Payout, legal, compliance si notificari legate automat",
                "BI si alerte actualizate in functie de evenimente live",
                "Playbooks automate pentru exceptii si escalari",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="Governance" title="Reguli, observabilitate si control">
            <div className="grid gap-3">
              {[
                "Versionare reguli AI si medii de test / productie",
                "Observabilitate pe model, latency, cost si drift",
                "Aprobari pentru automatizari sensibile sau high-risk",
                "Audit trail pentru fiecare decizie AI cu override uman",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide Super Admin / AI Ops">
            <div className="grid gap-3">
              {[
                "Publica o regula noua de rutare sau scoring",
                "Pune pe pauza o automatizare defecta",
                "Deschide explicatia unei decizii AI pe comanda",
                "Ruleaza un test A/B pentru sugestii sau clasificare",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminMarketplaceGovernanceMockup() {
  return (
    <AdminShell title="Marketplace Governance" active="Marketplace">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="Expansion Control"
          title="Orase, zone, tari, lansari etapizate si reguli locale"
          actions={<span className="rounded-full bg-[#EF7F1A] px-4 py-2 text-sm font-semibold text-white">12 piete active</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "Tari active: 3",
              "Orase lansate: 14",
              "Zone configurate: 126",
              "Servicii active pe piata: 248",
              "Lansari planificate: 5",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <BrowserFrame eyebrow="Markets" title="Guvernanta pe tari, orase si zone">
            <div className="grid gap-4">
              {[
                "Romania -> Bucuresti, Cluj, Iasi, Constanta, Bacau",
                "Germania -> Berlin pilot, Munchen in pregatire",
                "Olanda -> Amsterdam pilot cu servicii limitate",
                "Zone per oras cu activare separata si SLA local",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Rollout" title="Lansari etapizate si go-live controlat">
            <div className="grid gap-3">
              {[
                "Preview intern -> beta privata -> go-live public",
                "Activare per categorie si serviciu, nu doar per piata",
                "Gate de acces, whitelist sau subdomeniu de test",
                "Rollback rapid daca piata are probleme operationale",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Availability" title="Disponibilitate servicii">
            <div className="grid gap-3">
              {[
                "Activ / inactiv per serviciu, oras si zona",
                "Dependenta de capacitatea partenerilor",
                "Preturi, TVA, moneda si documente locale",
                "Blocare automata cand reteaua este insuficienta",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Local Rules" title="Reguli locale si configurari pe piata">
            <div className="grid gap-3">
              {[
                "Moneda, TVA, comisioane si taxe locale",
                "Ferestre orare, SLA si reguli de urgenta",
                "Documente obligatorii pe tara / oras / categorie",
                "Mesaje, limbi si template-uri specifice pietei",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Governance" title="Activare si dezactivare piete">
            <div className="grid gap-3">
              {[
                "Comutare rapida pe piata, oras sau zona",
                "Motiv de inchidere / mentenanta / lansare amanata",
                "Istoric cine a activat sau dezactivat si cand",
                "Impact imediat in homepage, catalog si checkout",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="Dependencies" title="Dependinte pentru expansiune controlata">
            <div className="grid gap-3">
              {[
                "Retea minima de parteneri validati pe zona",
                "Legal, financial si notifications pregatite pentru piata",
                "Template-uri, limbi si suport localizate",
                "KPI minim de performanta pentru trecerea la urmatoarea etapa",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide Super Admin / Expansion Ops">
            <div className="grid gap-3">
              {[
                "Activeaza o piata noua sau extinde un oras existent",
                "Pauzeaza o zona cu performanta slaba",
                "Deschide raportul de readiness pentru lansare",
                "Propaga reguli locale in catalog, preturi si notificari",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminMobileAppsMockup() {
  return (
    <AdminShell title="Mobile Apps" active="Mobile Apps">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="App Shell Governance"
          title="iOS, Android, feature flags, push routing, deep links si rollout pe versiuni"
          actions={<span className="rounded-full bg-[#09A299] px-4 py-2 text-sm font-semibold text-white">2 shell-uri active</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "iOS live version: 1.8.2",
              "Android live version: 1.8.4",
              "Feature flags mobile: 38",
              "Deep links active: 64",
              "Push success rate: 95.4%",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <BrowserFrame eyebrow="Shells" title="Guvernanta pe aplicatiile iOS si Android">
            <div className="grid gap-4">
              {[
                "App shell client pentru comenzi, checkout si tracking",
                "App shell partener pentru alocare, executie si payout",
                "Configurari comune si ecrane partajate intre platforme",
                "Separare clara intre build intern, beta si productie",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Versioning" title="Versiuni, rollout si compatibilitate">
            <div className="grid gap-3">
              {[
                "Min supported version per app shell",
                "Rollout gradual pe procente si cohorts",
                "Block / force update pentru versiuni critice",
                "Compatibilitate cu API, feature flags si deep links",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Flags" title="Feature flags mobile">
            <div className="grid gap-3">
              {[
                "Activare pe platforma, tara, oras sau cohort",
                "Diferențiere client vs partener vs investitor",
                "Kill switch pentru functii instabile",
                "Teste A/B si rollout incremental",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Push" title="Push routing si payload governance">
            <div className="grid gap-3">
              {[
                "Push pe user, device, segment sau comanda",
                "Routing diferit pentru client si partener",
                "Fallback catre SMS / email cand push esueaza",
                "Tracking open rate si impact operational",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Deep Links" title="Deep links si navigare controlata">
            <div className="grid gap-3">
              {[
                "Deep link catre pagina serviciu, cos, checkout, comanda",
                "Deep link operational catre dashboard partener",
                "Version-aware fallback daca ecranul lipseste",
                "Campanii si notificari cu destinatii mobile precise",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="Release Ops" title="Release, beta, observabilitate si crash governance">
            <div className="grid gap-3">
              {[
                "Beta interne si externe cu testers separati",
                "Crash monitoring, performance si health pe versiune",
                "Release notes, aprobari si rollback rapid",
                "Legare cu AI Center, Notifications si Marketplace pentru rollout localizat",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide App Governance">
            <div className="grid gap-3">
              {[
                "Activeaza un feature flag pe o cohorta",
                "Creste rollout-ul pentru o versiune stabila",
                "Blocheaza o versiune sau trimite force update",
                "Testeaza deep links si push routing pe medii controlate",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminOwnerTowerMockup() {
  return (
    <AdminShell title="Owner / Executive Control Tower" active="Owner Tower">
      <section className="grid gap-6">
        <BrowserFrame
          eyebrow="Executive Layer"
          title="Viziune globala asupra business-ului My Darrin"
          actions={<span className="rounded-full bg-[#EF7F1A] px-4 py-2 text-sm font-semibold text-white">Daily board ready</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {[
              "GMV 30d: 4.82M lei",
              "Cash runway: 18 luni",
              "Markets live: 12",
              "Ops health: 91%",
              "Compliance health: 97%",
              "AI adoption: 68%",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-[#F8FAFD] p-5 text-sm font-semibold text-[#1E2E4D]">
                {item}
              </div>
            ))}
          </div>
        </BrowserFrame>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <BrowserFrame eyebrow="Executive KPI" title="KPI executivi si semnale de decizie">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "GMV, net revenue, contribution margin si take rate",
                "Conversie end-to-end si cost de achizitie pe canal",
                "SLA operational, succes executie si dispute",
                "Retentie clienti, NPS si repeat order rate",
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-[#1E2E4D]/10 bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Cashflow" title="Cashflow, risc si sanatate financiara">
            <div className="grid gap-3">
              {[
                "Incasari vs payout vs obligatii fiscale",
                "Expunere pe refund, dispute si garantii",
                "Forecast 30 / 90 / 180 zile",
                "Alerte runway si burn rate",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#FFF4E8] px-4 py-4 text-sm font-semibold text-[#1E2E4D]">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <BrowserFrame eyebrow="Expansion" title="Expansiune si readiness pe piete">
            <div className="grid gap-3">
              {[
                "Orase pregatite pentru lansare si piata tinta urmatoare",
                "Readiness parteneri + legal + financiar + localizare",
                "Performanta pietelor lansate vs baseline",
                "Decizie go / no-go pentru expansiune",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Risk" title="Risc, compliance si exceptii critice">
            <div className="grid gap-3">
              {[
                "Comenzi, piete sau parteneri cu risc ridicat",
                "Expunere legala, documente expirate si audit findings",
                "Risc financiar si concentrari pe zone / parteneri",
                "Incident board cu escalari active",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="AI + Ops" title="AI, operatiuni si guvernanta intr-o singura privire">
            <div className="grid gap-3">
              {[
                "Impact AI asupra costului operational si vitezei",
                "Automatizari care reduc interventia umana",
                "Calitatea deciziilor AI si rata override uman",
                "Zone unde AI si ops cer recalibrare",
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/76">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <BrowserFrame eyebrow="Portfolio View" title="Control tower cross-module">
            <div className="grid gap-3">
              {[
                "Legare directa cu BI, live orders, financiar, legal, notificari si AI center",
                "Board unificat pentru owner si management executiv",
                "Snapshot de business pe zi, saptamana si luna",
                "Indicatori de crestere, eficienta si risc in acelasi panou",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#F8FAFD] px-4 py-4 text-sm text-[#1E2E4D]/78">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>

          <BrowserFrame eyebrow="Actions" title="Actiuni rapide Owner / Executive">
            <div className="grid gap-3">
              {[
                "Deschide piata noua sau pune pe pauza o zona",
                "Lanseaza audit pe cost, risc sau performanta",
                "Trimite brief executiv catre management",
                "Activeaza task-force pentru o problema critica",
              ].map((item) => (
                <div key={item} className="rounded-[20px] bg-[#1E2E4D] px-4 py-4 text-sm font-semibold text-white">
                  {item}
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminHomepageManagementMockup() {
  return (
    <AdminShell title="Management Homepage" active="Homepage">
      <GenericMockupPanel eyebrow="Homepage" title="Configurare sectiuni" items={["Activare / dezactivare", "Ordonare drag & drop", "Editare texte", "Editare imagini", "Editare video"]} />
    </AdminShell>
  );
}

export function AdminServicesMockup() {
  return (
    <AdminShell title="Servicii" active="Servicii">
      <GenericMockupPanel eyebrow="Servicii" title="Creare / editare servicii" items={["Categorii / subcategorii", "Niveluri BASIC / STANDARD / PREMIUM / PLATINUM", "Preturi si logica", "Media si continut public"]} />
    </AdminShell>
  );
}

export function AdminPartnersMockup() {
  return (
    <AdminShell title="Parteneri" active="Parteneri">
      <GenericMockupPanel eyebrow="Parteneri" title="Management furnizori" items={["Lista furnizori", "Verificare", "Rating", "Documente", "Zone acoperite"]} />
    </AdminShell>
  );
}

export function AdminUsersMockup() {
  return (
    <AdminShell title="Utilizatori" active="Utilizatori">
      <GenericMockupPanel eyebrow="Utilizatori" title="Clienti si activitate" items={["Clienti", "Istoric", "Activitate", "Status cont"]} />
    </AdminShell>
  );
}

export function AdminSettingsMockup() {
  return (
    <AdminShell title="Configurari" active="Configurari">
      <GenericMockupPanel eyebrow="Configurari" title="Setari globale" items={["Culori platforma", "Moneda", "Zone geografice", "Taxe / comisioane"]} />
    </AdminShell>
  );
}

export function AdminIntegrationsMockup() {
  return (
    <AdminShell title="Integrari" active="Integrari">
      <GenericMockupPanel eyebrow="Integrari" title="Conectori externi" items={["Stripe", "Google Maps", "OpenAI / Gemini", "Email / SMS"]} />
    </AdminShell>
  );
}
