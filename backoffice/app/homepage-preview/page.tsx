const utilityLinks = ["Facebook", "Instagram", "LinkedIn", "YouTube", "WhatsApp Business"];
const languageOptions = ["RO", "EN", "FR", "DE", "IT"];
const navItems = ["Servicii", "Cum functioneaza", "Darrin AI", "Devino partener", "Devino investitor", "Despre noi", "Contact"];

const heroSlides = [
  {
    eyebrow: "Platforma My Darrin",
    title: "Servicii, oameni si automatizare coordonate intr-un singur ecosistem.",
    description:
      "My Darrin uneste catalogul public, backoffice-ul operational, relatia cu partenerii si fluxurile asistate de Darrin AI intr-o experienta coerenta.",
    accent: "from-[#EF7F1A]/25 via-white to-[#1E2E4D]/8",
    badge: "Brand slide",
  },
  {
    eyebrow: "Catalog de servicii",
    title: "Serviciile sunt structurate pe domenii, categorii si configurari reale.",
    description:
      "Homepage-ul pregateste intrarea in catalogul public si in paginile de servicii care se vor sincroniza cu ecosistemul din backoffice.",
    accent: "from-[#1E2E4D]/12 via-white to-[#EF7F1A]/12",
    badge: "Services slide",
  },
  {
    eyebrow: "Darrin AI",
    title: "Inteligenta artificiala ghideaza selectia, configurarea si suportul.",
    description:
      "Zona verde este rezervata pentru Darrin AI, recomandari inteligente, clarificari conversationale si decizii operationale asistate.",
    accent: "from-[#09A299]/22 via-white to-[#117A73]/10",
    badge: "AI slide",
  },
  {
    eyebrow: "Ecosistem parteneri",
    title: "Partenerii intra intr-un flux digital cu onboarding si coordonare clara.",
    description:
      "Sectiunea Devino partener trebuie sa aiba loc vizibil in homepage si sa sustina cresterea ecosistemului operational.",
    accent: "from-[#EF7F1A]/18 via-white to-[#09A299]/10",
    badge: "Partner slide",
  },
];

const trustPoints = [
  { title: "Catalog servicii structurat", body: "Domenii, categorii si servicii finale pregatite pentru sincronizare cu zona publica." },
  { title: "Parteneri validati", body: "Fluxul Devino partener ramane integrat in homepage si in ecosistemul operational." },
  { title: "Darrin AI integrat", body: "AI-ul nu este doar vizual. Este o componenta functionala a produsului si a viitoarelor fluxuri." },
  { title: "Suport activ", body: "Header-ul si footer-ul includ adresa, multilingv, suport, social media si aplicatiile mobile." },
];

const workflowSteps = [
  { step: "01", title: "Alegi serviciul", body: "Intrarea incepe din homepage, apoi continua in catalogul public sincronizat cu structura din backoffice." },
  { step: "02", title: "Configurezi cererea", body: "Serviciile vor mosteni logica de configurare pe niveluri, localitate, resurse si contexte operationale." },
  { step: "03", title: "Darrin AI te ghideaza", body: "Asistentul AI recomanda, clarifica si simplifica selectia serviciului potrivit pentru utilizator." },
  { step: "04", title: "Partenerul executa", body: "Fluxul public trebuie sa trimita natural catre ecosistemul de parteneri si executie reala." },
  { step: "05", title: "Platforma sincronizeaza", body: "Ce se configureaza in servicii si backoffice trebuie sa ajunga coerent in toate modulele publice." },
];

const featuredServices = [
  {
    title: "Interventii rapide",
    label: "Popular",
    description: "Reparatii, urgenta si programari rapide cu vizibilitate pe disponibilitate si zona activa.",
  },
  {
    title: "Amenajari premium",
    label: "New",
    description: "Amenajari configurabile pe niveluri Bronz - Platinum cu pachete si assets sincronizate.",
  },
  {
    title: "Constructii & renovari",
    label: "AI Recommended",
    description: "Fluxuri complexe care combina servicii, resurse, indicatori si recomandari inteligente.",
  },
  {
    title: "Servicii verzi",
    label: "Darrin AI",
    description: "Zona unde AI-ul poate prioritiza eficienta, materiale potrivite si structuri mai sustenabile.",
  },
];

const domains = [
  "Reparatii si interventii",
  "Amenajari interioare",
  "Constructii si renovari",
  "Instalatii",
  "Curatenie si mentenanta",
  "Servicii verzi",
];

const aiCards = [
  "Recomanda servicii relevante in functie de context, locatie si intentia utilizatorului.",
  "Reduce timpul de selectie prin ghidare conversationala si clarificarea cerintelor.",
  "Sustine viitorul flux de configurare cu reguli, pachete si logica operationala asistata.",
  "Ofera o identitate separata in homepage prin elemente vizuale verzi si mesaje de produs distincte.",
];

const partnerBenefits = [
  "Acces la cereri si onboarding digital",
  "Vizibilitate in ecosistemul My Darrin",
  "Fluxuri de lucru sincronizate cu zona publica si backoffice",
];

const investorHighlights = [
  "Platforma comerciala + AI + backoffice",
  "Ecosistem scalabil pe servicii, parteneri si operatiuni",
  "Brand nou, dar construit pe fundatia Home Best Pal",
];

const ecosystemCards = [
  { title: "Backoffice", text: "Sursa de adevar pentru servicii, categorii, assets si configurari." },
  { title: "Catalog servicii", text: "Zona publica trebuie sa reflecte controlat ce este populat si validat in sistem." },
  { title: "Devino partener", text: "Homepage-ul trimite natural catre onboarding-ul operational pentru colaboratori." },
  { title: "Devino investitor", text: "Zona de interes investitional ramane conectata la povestea generala a platformei." },
  { title: "Darrin AI", text: "Componenta de diferentiere care trebuie sa apara clar si functional in homepage." },
];

const footerColumns = [
  { title: "Platforma", links: ["Acasa", "Servicii", "Cum functioneaza", "Darrin AI", "Despre noi"] },
  { title: "Clienti", links: ["Catalog servicii", "Cerere serviciu", "Contul meu", "Suport clienti", "FAQ"] },
  { title: "Parteneri", links: ["Devino partener", "Onboarding parteneri", "Reguli colaborare", "Suport parteneri", "Zone active"] },
  { title: "Investitori", links: ["Devino investitor", "Oportunitate", "Documente", "FAQ investitori", "Business deck"] },
  { title: "Legal", links: ["Termeni si conditii", "Politica de confidentialitate", "Politica cookies", "GDPR", "ANPC"] },
  { title: "Business info", links: ["Home Best Pal LTD", "Home Best Pal Romania", "www.mydarrin.com", "www.homebestpal.com", "technical.support@mydarrin.com"] },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 overflow-hidden rounded-[22px] bg-[#EF7F1A] shadow-[0_18px_40px_rgba(239,127,26,0.22)]">
        <div className="absolute left-[10px] top-[8px] h-[34px] w-[34px] rounded-tl-[18px] rounded-tr-[16px] rounded-br-[12px] bg-[#1E2E4D]" />
        <div className="absolute left-[18px] top-[27px] h-[20px] w-[10px] rounded-t-[7px] bg-[#EF7F1A] ring-[4px] ring-white/95" />
        <div className="absolute right-[8px] top-[8px] h-[14px] w-[14px] rounded-full border-[4px] border-white/95 bg-[#1E2E4D]" />
      </div>
      <div>
        <div className="text-[30px] font-semibold tracking-tight text-[#1E2E4D]">My Darrin</div>
        <div className="text-[10px] uppercase tracking-[0.34em] text-[#EF7F1A]">Home Best Pal</div>
      </div>
    </div>
  );
}

function DarrinFigure() {
  return (
    <div className="relative mx-auto aspect-[0.95] w-full max-w-[520px]">
      <div className="absolute inset-0 rounded-[42px] bg-[radial-gradient(circle_at_24%_18%,rgba(239,127,26,0.22),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(9,162,153,0.16),transparent_22%),linear-gradient(180deg,#fdfefe_0%,#eef4fb_100%)] shadow-[0_32px_80px_rgba(30,46,77,0.08)]" />
      <div className="absolute left-1/2 top-[12%] h-28 w-28 -translate-x-1/2 rounded-[32px] border-[6px] border-[#17366C] bg-[#214C96] shadow-[0_20px_44px_rgba(23,54,108,0.22)]">
        <div className="absolute left-1/2 top-8 flex -translate-x-1/2 gap-4">
          <span className="h-4 w-4 rounded-full bg-white" />
          <span className="h-4 w-4 rounded-full bg-white" />
        </div>
        <div className="absolute -left-2 top-4 h-10 w-4 rounded-full bg-[#EF7F1A]" />
        <div className="absolute -right-2 top-4 h-10 w-4 rounded-full bg-[#EF7F1A]" />
      </div>
      <div className="absolute left-1/2 top-[33%] h-48 w-48 -translate-x-1/2 rounded-[38px] border-[7px] border-[#17366C] bg-[#214C96]">
        <div className="absolute left-1/2 top-12 h-20 w-20 -translate-x-1/2 rounded-full border-[5px] border-[#EF7F1A] bg-[#1B3768]" />
        <div className="absolute left-1/2 top-[72px] h-8 w-8 -translate-x-1/2 rounded-[11px] bg-[#EF7F1A]" />
      </div>
      <div className="absolute left-[20%] top-[39%] h-32 w-9 rotate-[20deg] rounded-full border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute right-[20%] top-[39%] h-32 w-9 -rotate-[20deg] rounded-full border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute left-[13%] top-[58%] h-16 w-16 rounded-full border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute right-[13%] top-[58%] h-16 w-16 rounded-full border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute left-[35%] top-[73%] h-28 w-9 rotate-[7deg] rounded-full border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute right-[35%] top-[73%] h-28 w-9 -rotate-[7deg] rounded-full border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute left-[28%] bottom-[4%] h-9 w-20 rounded-[22px] border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute right-[28%] bottom-[4%] h-9 w-20 rounded-[22px] border-[5px] border-[#17366C] bg-[#214C96]" />
      <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/82 px-4 py-2 text-xs font-semibold text-[#1E2E4D] shadow-[0_10px_28px_rgba(30,46,77,0.08)]">Hero visual</div>
      <div className="absolute bottom-5 left-5 rounded-full bg-[#09A299]/16 px-4 py-2 text-xs font-semibold text-[#117A73]">Darrin AI online</div>
      <div className="absolute right-5 top-[22%] w-40 rounded-[24px] border border-white/80 bg-white/86 p-4 shadow-[0_14px_34px_rgba(30,46,77,0.09)]">
        <div className="text-[11px] uppercase tracking-[0.25em] text-[#117A73]">Slide logic</div>
        <div className="mt-3 text-sm font-semibold text-[#1E2E4D]">Brand, Services, AI, Partner, Investor</div>
      </div>
    </div>
  );
}

function SectionLabel({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "ai" }) {
  const classes =
    tone === "ai"
      ? "border-[#09A299]/20 bg-[#09A299]/10 text-[#117A73]"
      : "border-[#EF7F1A]/25 bg-[#EF7F1A]/10 text-[#EF7F1A]";
  return <div className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] ${classes}`}>{children}</div>;
}

export default function HomepagePreviewPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f9fbfe_0%,#f4f7fb_28%,#fbf8f2_100%)] text-[#1E2E4D]">
      <div className="border-b border-white/10 bg-[#1E2E4D] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-3 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-3 text-white/82">
            {utilityLinks.map((link) => (
              <a key={link} href="#" className="transition hover:text-white">
                {link}
              </a>
            ))}
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-center text-white/94">
            Adresa activa: Residential - Bucuresti, Sector 3, Bd. Unirii nr. 5
          </div>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            {languageOptions.map((language) => (
              <a key={language} href="#" className={language === "RO" ? "font-semibold text-white" : "transition hover:text-white"}>
                {language}
              </a>
            ))}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-[#1E2E4D]/8 bg-white/88 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-5 px-6 py-4">
          <BrandMark />

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#1E2E4D]/88 xl:flex">
            {navItems.map((item) => (
              <a key={item} href="#" className="transition hover:text-[#EF7F1A]">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden min-w-[250px] rounded-full border border-[#1E2E4D]/10 bg-[#F5F7FA] px-4 py-2 text-sm text-[#1E2E4D]/56 lg:block">
              Cauta servicii, categorii sau recomandari Darrin AI
            </div>
            <a href="#" className="rounded-full border border-[#09A299]/20 bg-[#09A299] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(9,162,153,0.18)]">
              Ask Darrin
            </a>
            <a href="#" className="rounded-full border border-[#1E2E4D]/10 bg-white px-4 py-3 text-sm font-semibold text-[#1E2E4D]">
              Cont
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-6 py-14 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
        <div className="flex flex-col justify-center">
          <SectionLabel>Mockup homepage pentru analiza si aprobare</SectionLabel>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.94] text-[#1E2E4D] md:text-6xl">
            My Darrin devine homepage-ul care uneste servicii, parteneri, investitori si Darrin AI.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#1E2E4D]/70">
            Acest mockup este construit pentru aprobare de design. El arata cum va fi pozitionat noul brand My Darrin, cum apar
            adresa si multilingvul in header, cum intra serviciile in homepage si cum este separata vizual zona Darrin AI.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="rounded-full bg-[#EF7F1A] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(239,127,26,0.26)]">
              Vezi serviciile
            </a>
            <a href="#" className="rounded-full border border-[#1E2E4D]/10 bg-white px-6 py-3 text-sm font-semibold text-[#1E2E4D]">
              Devino partener
            </a>
            <a href="#" className="rounded-full border border-[#09A299]/18 bg-[#09A299]/10 px-6 py-3 text-sm font-semibold text-[#117A73]">
              Descopera Darrin AI
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[30px] border border-[#1E2E4D]/8 bg-white/84 p-5 shadow-[0_18px_50px_rgba(30,46,77,0.06)]">
              <div className="text-sm text-[#1E2E4D]/58">Header obligatoriu</div>
              <div className="mt-3 text-lg font-semibold">Adresa + multilingv</div>
              <div className="mt-2 text-sm leading-6 text-[#1E2E4D]/62">Pastrate vizibil din prima zona a paginii, asa cum ai cerut.</div>
            </div>
            <div className="rounded-[30px] border border-[#1E2E4D]/8 bg-white/84 p-5 shadow-[0_18px_50px_rgba(30,46,77,0.06)]">
              <div className="text-sm text-[#1E2E4D]/58">Zona principala</div>
              <div className="mt-3 text-lg font-semibold">Servicii + AI + parteneri</div>
              <div className="mt-2 text-sm leading-6 text-[#1E2E4D]/62">Homepage-ul este gandit ca poarta de intrare in intreg ecosistemul My Darrin.</div>
            </div>
            <div className="rounded-[30px] border border-[#09A299]/16 bg-[linear-gradient(180deg,rgba(9,162,153,0.12),rgba(255,255,255,0.9))] p-5 shadow-[0_18px_50px_rgba(9,162,153,0.12)]">
              <div className="text-sm text-[#117A73]">Footer obligatoriu</div>
              <div className="mt-3 text-lg font-semibold text-[#117A73]">Social media + aplicatii</div>
              <div className="mt-2 text-sm leading-6 text-[#117A73]/80">Footer-ul include retele sociale, store badges si business information.</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-10 hidden h-32 w-32 rounded-full bg-[#EF7F1A]/18 blur-3xl lg:block" />
          <div className="absolute -right-4 bottom-10 hidden h-36 w-36 rounded-full bg-[#09A299]/18 blur-3xl lg:block" />
          <DarrinFigure />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-4">
        <div className="grid gap-4 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <article key={point.title} className="rounded-[30px] border border-[#1E2E4D]/8 bg-white/84 p-6 shadow-[0_16px_42px_rgba(30,46,77,0.06)]">
              <div className="text-base font-semibold text-[#1E2E4D]">{point.title}</div>
              <p className="mt-3 text-sm leading-7 text-[#1E2E4D]/63">{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="rounded-[40px] border border-[#1E2E4D]/8 bg-white/86 p-8 shadow-[0_24px_70px_rgba(30,46,77,0.08)] lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionLabel>Hero slider logic</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold text-[#1E2E4D]">Tipurile de slide-uri propuse pentru homepage-ul My Darrin</h2>
              <p className="mt-4 text-sm leading-7 text-[#1E2E4D]/65">
                In locul unui slider generic, homepage-ul foloseste slide-uri tematice: platforma, servicii, Darrin AI, parteneri si investitori.
              </p>
            </div>
            <div className="text-sm leading-7 text-[#1E2E4D]/58">Fiecare slide sustine o directie diferita de produs si de business.</div>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-4">
            {heroSlides.map((slide) => (
              <article key={slide.title} className={`rounded-[32px] border border-[#1E2E4D]/8 bg-gradient-to-br ${slide.accent} p-6`}>
                <div className="inline-flex rounded-full border border-[#1E2E4D]/10 bg-white/80 px-3 py-1 text-xs font-semibold text-[#1E2E4D]/70">
                  {slide.badge}
                </div>
                <div className="mt-5 text-sm uppercase tracking-[0.24em] text-[#EF7F1A]">{slide.eyebrow}</div>
                <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#1E2E4D]">{slide.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#1E2E4D]/64">{slide.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[36px] border border-[#1E2E4D]/8 bg-[linear-gradient(180deg,#1E2E4D_0%,#294271_100%)] p-8 text-white shadow-[0_24px_70px_rgba(30,46,77,0.18)]">
            <div className="text-sm uppercase tracking-[0.28em] text-white/65">Cum functioneaza</div>
            <h2 className="mt-4 text-3xl font-semibold">Fluxul homepage-ului trebuie sa explice foarte simplu ecosistemul.</h2>
            <p className="mt-4 text-sm leading-7 text-white/76">
              Aceasta sectiune ajuta utilizatorul sa inteleaga rapid traseul dintre homepage, servicii, configurare, Darrin AI si executie.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {workflowSteps.map((step) => (
              <article key={step.step} className="rounded-[30px] border border-[#1E2E4D]/8 bg-white/84 p-5 shadow-[0_16px_42px_rgba(30,46,77,0.06)]">
                <div className="text-3xl font-semibold text-[#EF7F1A]">{step.step}</div>
                <div className="mt-3 text-lg font-semibold text-[#1E2E4D]">{step.title}</div>
                <p className="mt-3 text-sm leading-7 text-[#1E2E4D]/62">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <SectionLabel>Catalog servicii</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-[#1E2E4D]">Sectiunea comerciala principala: servicii recomandate si intrari in catalog</h2>
            <p className="mt-4 text-sm leading-7 text-[#1E2E4D]/64">
              Aici homepage-ul trebuie sa arate ce poate promova din serviciile populate si validate in ecosistemul actual.
            </p>
          </div>
          <a href="#" className="inline-flex w-fit rounded-full border border-[#1E2E4D]/10 bg-white px-5 py-3 text-sm font-semibold text-[#1E2E4D]">
            Vezi toate serviciile
          </a>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {featuredServices.map((service, index) => (
            <article key={service.title} className="overflow-hidden rounded-[32px] border border-[#1E2E4D]/8 bg-white/86 shadow-[0_18px_50px_rgba(30,46,77,0.06)]">
              <div
                className="h-44"
                style={{
                  background:
                    index === 2
                      ? "linear-gradient(135deg,#1E2E4D 0%,#5072b8 100%)"
                      : index === 3
                        ? "linear-gradient(135deg,#09A299 0%,#117A73 100%)"
                        : "linear-gradient(135deg,#f7d4b6 0%,#fff7ec 100%)",
                }}
              />
              <div className="p-6">
                <div className="inline-flex rounded-full border border-[#1E2E4D]/10 bg-[#F5F7FA] px-3 py-1 text-xs font-semibold text-[#1E2E4D]/68">
                  {service.label}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#1E2E4D]">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#1E2E4D]/62">{service.description}</p>
                <a href="#" className="mt-5 inline-flex text-sm font-semibold text-[#EF7F1A]">
                  Vezi serviciul
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="rounded-[40px] border border-[#1E2E4D]/8 bg-white/84 p-8 shadow-[0_22px_64px_rgba(30,46,77,0.07)] lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionLabel>Domenii si categorii</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold text-[#1E2E4D]">Zona de intrare structurata in catalogul de servicii</h2>
            </div>
            <div className="text-sm leading-7 text-[#1E2E4D]/60">Aceste carduri trebuie sa poata fi alimentate ulterior din structura reala Domain → Category → Service.</div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {domains.map((domain, index) => (
              <article key={domain} className="rounded-[28px] border border-[#1E2E4D]/8 p-5" style={{ background: index === 5 ? "linear-gradient(180deg, rgba(9,162,153,0.10), rgba(255,255,255,0.94))" : "linear-gradient(180deg, rgba(239,127,26,0.06), rgba(255,255,255,0.94))" }}>
                <div className="text-lg font-semibold text-[#1E2E4D]">{domain}</div>
                <div className="mt-3 text-sm leading-7 text-[#1E2E4D]/60">
                  Card de categorie pentru navigarea rapida in catalogul public si in paginile de servicii.
                </div>
                <a href="#" className="mt-4 inline-flex text-sm font-semibold text-[#EF7F1A]">
                  Vezi categoria
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="rounded-[40px] border border-[#09A299]/18 bg-[linear-gradient(180deg,rgba(9,162,153,0.12),rgba(17,122,115,0.04))] p-8 shadow-[0_24px_70px_rgba(9,162,153,0.12)] lg:p-10">
            <SectionLabel tone="ai">Darrin AI</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-[#117A73]">Sectiune distincta vizual, rezervata exclusiv inteligentei artificiale</h2>
            <p className="mt-4 text-sm leading-7 text-[#117A73]/84">
              Verdele nu trebuie sa concureze zona principala a platformei. El marcheaza clar locul unde Darrin AI recomanda, explica si sustine deciziile.
            </p>
            <div className="mt-6 grid gap-4">
              {aiCards.map((card) => (
                <div key={card} className="rounded-[28px] border border-[#117A73]/12 bg-white/72 p-5 text-sm leading-7 text-[#117A73]/84">
                  {card}
                </div>
              ))}
            </div>
            <a href="#" className="mt-6 inline-flex rounded-full bg-[#117A73] px-5 py-3 text-sm font-semibold text-white">
              Descopera Darrin AI
            </a>
          </div>

          <div className="grid gap-6">
            <article className="rounded-[38px] border border-[#1E2E4D]/8 bg-white/86 p-8 shadow-[0_20px_60px_rgba(30,46,77,0.08)]">
              <SectionLabel>Devino partener</SectionLabel>
              <h3 className="mt-4 text-3xl font-semibold text-[#1E2E4D]">Sectiune dedicata furnizorilor si executantilor din ecosistem</h3>
              <p className="mt-4 text-sm leading-7 text-[#1E2E4D]/64">
                Homepage-ul trebuie sa aiba o intrare clara catre fluxul Devino partener, fara sa ascunda beneficiile si logica de onboarding.
              </p>
              <div className="mt-6 grid gap-3">
                {partnerBenefits.map((benefit) => (
                  <div key={benefit} className="rounded-[24px] bg-[#F5F7FA] px-4 py-3 text-sm text-[#1E2E4D]/72">
                    {benefit}
                  </div>
                ))}
              </div>
              <a href="#" className="mt-6 inline-flex rounded-full bg-[#EF7F1A] px-5 py-3 text-sm font-semibold text-white">
                Devino partener
              </a>
            </article>

            <article className="rounded-[38px] border border-[#1E2E4D]/8 bg-[linear-gradient(135deg,#1E2E4D_0%,#304b7d_100%)] p-8 text-white shadow-[0_24px_70px_rgba(30,46,77,0.18)]">
              <SectionLabel>Devino investitor</SectionLabel>
              <h3 className="mt-4 text-3xl font-semibold">Sectiune mai business, mai premium, pentru directia investitionala</h3>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Zona de investitori trebuie sa ramana conectata la povestea platformei, fara sa fractureze experienta principala de homepage.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {investorHighlights.map((highlight) => (
                  <div key={highlight} className="rounded-[24px] border border-white/12 bg-white/8 px-4 py-4 text-sm text-white/84">
                    {highlight}
                  </div>
                ))}
              </div>
              <a href="#" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1E2E4D]">
                Devino investitor
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="rounded-[40px] border border-[#1E2E4D]/8 bg-white/86 p-8 shadow-[0_22px_64px_rgba(30,46,77,0.07)] lg:p-10">
          <div className="max-w-3xl">
            <SectionLabel>Ecosistem My Darrin</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold text-[#1E2E4D]">Un website sincronizat cu backoffice-ul, nu doar un landing page de prezentare</h2>
            <p className="mt-4 text-sm leading-7 text-[#1E2E4D]/64">
              Aceasta sectiune confirma directia de implementare: ce se creeaza in servicii, assets, configurari si backoffice trebuie sa poata alimenta natural homepage-ul si paginile publice.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {ecosystemCards.map((card) => (
              <article key={card.title} className="rounded-[28px] border border-[#1E2E4D]/8 bg-[#F8FAFD] p-5">
                <div className="text-lg font-semibold text-[#1E2E4D]">{card.title}</div>
                <p className="mt-3 text-sm leading-7 text-[#1E2E4D]/62">{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-4">
          <article className="rounded-[34px] border border-[#1E2E4D]/8 bg-white/84 p-7 shadow-[0_18px_54px_rgba(30,46,77,0.07)]">
            <div className="text-sm uppercase tracking-[0.24em] text-[#EF7F1A]">UK Entity</div>
            <div className="mt-4 text-lg font-semibold text-[#1E2E4D]">Home Best Pal LTD (UK)</div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-[#1E2E4D]/64">
              <div>124 City Road, London, England, EC1V 2NX</div>
              <div>+44 7451 268188</div>
            </div>
          </article>
          <article className="rounded-[34px] border border-[#1E2E4D]/8 bg-white/84 p-7 shadow-[0_18px_54px_rgba(30,46,77,0.07)]">
            <div className="text-sm uppercase tracking-[0.24em] text-[#EF7F1A]">Romania</div>
            <div className="mt-4 text-lg font-semibold text-[#1E2E4D]">Home Best Pal Romania</div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-[#1E2E4D]/64">
              <div>RO46577229</div>
              <div>Bucuresti</div>
              <div>+40 755 511 777</div>
            </div>
          </article>
          <article className="rounded-[34px] border border-[#1E2E4D]/8 bg-white/84 p-7 shadow-[0_18px_54px_rgba(30,46,77,0.07)]">
            <div className="text-sm uppercase tracking-[0.24em] text-[#EF7F1A]">Emailuri</div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-[#1E2E4D]/64">
              <div>gdpr@homebestpal.com</div>
              <div>info@mydarrin.com</div>
              <div>technical.support@mydarrin.com</div>
              <div>darrin@mydarrin.com</div>
            </div>
          </article>
          <article className="rounded-[34px] border border-[#1E2E4D]/8 bg-white/84 p-7 shadow-[0_18px_54px_rgba(30,46,77,0.07)]">
            <div className="text-sm uppercase tracking-[0.24em] text-[#EF7F1A]">Legal / support</div>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-[#1E2E4D]/64">
              <div>GDPR</div>
              <div>Termeni si conditii</div>
              <div>Politica de confidentialitate</div>
              <div>Politica cookies</div>
            </div>
          </article>
        </div>
      </section>

      <footer className="border-t border-[#1E2E4D]/8 bg-[#FBFCFE]">
        <div className="mx-auto max-w-[1440px] px-6 py-14">
          <div className="rounded-[36px] border border-[#1E2E4D]/8 bg-white/84 p-8 shadow-[0_18px_54px_rgba(30,46,77,0.06)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <SectionLabel>Footer branding</SectionLabel>
                <div className="mt-4">
                  <BrandMark />
                </div>
                <p className="mt-5 text-sm leading-7 text-[#1E2E4D]/64">
                  My Darrin este platforma care uneste servicii, suport operational si inteligenta artificiala intr-un ecosistem construit de Home Best Pal.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="rounded-full bg-[#EF7F1A] px-5 py-3 text-sm font-semibold text-white">
                  Vezi serviciile
                </a>
                <a href="#" className="rounded-full border border-[#1E2E4D]/10 bg-white px-5 py-3 text-sm font-semibold text-[#1E2E4D]">
                  Devino partener
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <div className="text-sm font-semibold text-[#1E2E4D]">{column.title}</div>
                <div className="mt-4 grid gap-2.5 text-sm text-[#1E2E4D]/60">
                  {column.links.map((link) => (
                    <a key={link} href="#" className="transition hover:text-[#EF7F1A]">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 rounded-[34px] border border-[#1E2E4D]/8 bg-white/84 p-6 lg:grid-cols-[1.05fr_0.95fr_0.9fr]">
            <div>
              <div className="text-sm font-semibold text-[#1E2E4D]">Conecteaza-te cu My Darrin</div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {utilityLinks.map((item) => (
                  <a key={item} href="#" className="rounded-full border border-[#1E2E4D]/10 px-4 py-2 text-[#1E2E4D]/70 transition hover:border-[#EF7F1A]/30 hover:text-[#EF7F1A]">
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-[#1E2E4D]">Descarca aplicatiile My Darrin</div>
              <div className="mt-4 grid gap-3 text-sm">
                <a href="#" className="rounded-full bg-[#1E2E4D] px-4 py-3 text-center font-semibold text-white">
                  Download on the App Store
                </a>
                <a href="#" className="rounded-full bg-[#EF7F1A] px-4 py-3 text-center font-semibold text-white">
                  Get it on Google Play
                </a>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-[#1E2E4D]">Footer essentials</div>
              <div className="mt-4 grid gap-2 text-sm leading-7 text-[#1E2E4D]/64">
                <div>Adresa si multilingv raman in header</div>
                <div>Social media si mobile apps raman in footer</div>
                <div className="text-[#117A73]">Darrin AI are o identitate vizuala separata</div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-[#1E2E4D]/8 pt-6 text-sm text-[#1E2E4D]/56 md:flex-row md:items-center md:justify-between">
            <div>© My Darrin | Operated by Home Best Pal</div>
            <div className="flex flex-wrap items-center gap-4">
              <span>www.mydarrin.com</span>
              <span>www.homebestpal.com</span>
              <span>RO / EN / FR / DE / IT</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
