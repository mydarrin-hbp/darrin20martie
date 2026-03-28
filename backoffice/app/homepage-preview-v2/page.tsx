import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const navItems = [
  { label: "Servicii", href: "/mockup-v1/public/catalog" },
  { label: "Industrii", href: "/mockup-v1/public/catalog" },
  { label: "Devino partener", href: "/mockup-v1/public/devino-partener" },
  { label: "Devino investitor", href: "/mockup-v1/public/investitori" },
  { label: "Contact", href: "/mockup-v1/public/account" },
];

const backofficeSections = [
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

const categories = [
  { title: "Acasa", note: "Instalatii, urgenta, reparatii", tone: "bg-[#F5F6F7]" },
  { title: "Auto", note: "Diagnoza, remorcare, mentenanta", tone: "bg-[#EAF9F7]" },
  { title: "Industrial", note: "Utilaje, linii, interventii", tone: "bg-[#EEF3FB]" },
  { title: "HoReCa", note: "Service operational rapid", tone: "bg-[#FFF4E8]" },
  { title: "Agricultura", note: "Mecanizare si suport", tone: "bg-[#EAF9F7]" },
  { title: "Logistica", note: "Depozit si executie", tone: "bg-[#EEF3FB]" },
];

const services = [
  { title: "Reparat calorifer", price: "de la 189 lei", rating: "4.9", accent: "bg-[#EF7F1A]", highlighted: true },
  { title: "Montaj centrala termica", price: "de la 540 lei", rating: "4.8", accent: "bg-[#1E2E4D]" },
  { title: "Interventii electrice", price: "de la 160 lei", rating: "4.7", accent: "bg-[#09A299]" },
  { title: "Renovare baie", price: "de la 2.450 lei", rating: "4.9", accent: "bg-[#1E2E4D]" },
];

const steps = [
  "Spui ce problema ai sau alegi direct serviciul",
  "Primesti deviz instant si interval de executie",
  "Alegi furnizorul validat si confirmi comanda",
  "Executie, plata securizata si garantie",
];

const quickRoutes = [
  { title: "Catalog servicii", href: "/mockup-v1/public/catalog", tone: "bg-[#FFF4E8]" },
  { title: "Pagina serviciu Reparat calorifer", href: "/mockup-v1/public/reparat-calorifer", tone: "bg-[#EEF3FB]" },
  { title: "Coșul meu", href: "/mockup-v1/public/cos", tone: "bg-[#EAF9F7]" },
  { title: "Checkout", href: "/mockup-v1/public/checkout", tone: "bg-[#FFF4E8]" },
  { title: "Status plată", href: "/mockup-v1/public/payment-status", tone: "bg-[#EEF3FB]" },
  { title: "Modul Devino Partener", href: "/mockup-v1/public/devino-partener", tone: "bg-[#EAF9F7]" },
  { title: "Creare cont partener", href: "/mockup-v1/public/devino-partener/inscriere", tone: "bg-[#FFF4E8]" },
  { title: "Dashboard partener", href: "/mockup-v1/public/dashboard-partener", tone: "bg-[#EAF9F7]" },
  { title: "Modul Devino Investitor", href: "/mockup-v1/public/investitori", tone: "bg-[#EEF3FB]" },
  { title: "Creare cont investitor", href: "/mockup-v1/public/investitori/creare-cont", tone: "bg-[#EAF9F7]" },
  { title: "Modul client", href: "/mockup-v1/public/account", tone: "bg-[#FFF4E8]" },
  { title: "Creare cont client", href: "/mockup-v1/public/account/creare-cont", tone: "bg-[#EEF3FB]" },
];

function Pill({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
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

function LogoBlock({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 overflow-hidden rounded-[18px] bg-[#EF7F1A]">
        <div className="absolute left-[10px] top-[8px] h-[34px] w-[30px] rounded-tl-[18px] rounded-tr-[12px] rounded-br-[10px] bg-[#1E2E4D]" />
        <div className="absolute left-[17px] top-[24px] h-[17px] w-[9px] rounded-t-[8px] bg-[#EF7F1A] ring-[4px] ring-white" />
        <div className="absolute right-[8px] top-[8px] h-[13px] w-[13px] rounded-full border-[4px] border-white bg-[#1E2E4D]" />
      </div>
      <div>
        <div className={`text-[30px] font-extrabold leading-none ${inverse ? "text-white" : "text-[#1E2E4D]"}`}>My Darrin</div>
        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#EF7F1A]">Home Best Pal</div>
      </div>
    </div>
  );
}

export default function HomepagePreviewV2Page() {
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
          <Link href="/homepage-preview-v2">
            <LogoBlock />
          </Link>

          <nav className="hidden items-center gap-8 xl:flex">
            {navItems.map((item) => (
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
              {backofficeSections.map((section, index) => (
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
                    <Pill tone="orange">Glovo inspired</Pill>
                    <Pill tone="green">Darrin AI</Pill>
                    <Pill>[VIDEO HERO]</Pill>
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
                    <Pill tone="dark">Bucuresti, Sect. 3</Pill>
                    <Pill>4.9 rating mediu</Pill>
                    <Pill>+250 servicii active</Pill>
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
                        <div className="mt-4">
                          <Link href="/mockup-v1/public/reparat-calorifer" className="rounded-full bg-[#1E2E4D] px-4 py-2 text-sm font-semibold text-white">
                            Vezi pagina serviciului
                          </Link>
                        </div>
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
              <Link href="/mockup-v1/public/account" className="rounded-[32px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_50px_rgba(30,46,77,0.12)]">
                <Pill tone="light">AI first</Pill>
                <div className="mt-5 text-[34px] font-extrabold leading-tight">Spune problema</div>
                <p className="mt-4 text-[16px] leading-7 text-white/72">
                  Text, imagine sau video. Darrin intelege nevoia si propune serviciul corect in cateva secunde.
                </p>
              </Link>

              <Link href="/mockup-v1/public/catalog" className="rounded-[32px] bg-[#FFF4E8] p-8 shadow-[0_18px_50px_rgba(239,127,26,0.10)]">
                <Pill tone="orange">Catalog</Pill>
                <div className="mt-5 text-[34px] font-extrabold leading-tight text-[#1E2E4D]">Alege serviciu</div>
                <p className="mt-4 text-[16px] leading-7 text-[#1E2E4D]/68">
                  Navigare rapida, carduri mari, pret de pornire si rating clar vizibile.
                </p>
              </Link>

              <Link href="/mockup-v1/public/devino-partener" className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_rgba(30,46,77,0.08)]">
                <Pill tone="green">Trust</Pill>
                <div className="mt-5 text-[34px] font-extrabold leading-tight text-[#1E2E4D]">Executie verificata</div>
                <p className="mt-4 text-[16px] leading-7 text-[#1E2E4D]/68">
                  Furnizori validati, plata securizata, garantie si istoric complet de interventie.
                </p>
              </Link>
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
                {categories.map((category) => (
                  <article key={category.title} className={`rounded-[28px] ${category.tone} p-6`}>
                    <div className="flex items-start justify-between gap-4">
                      <Pill tone="dark">{category.title}</Pill>
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
                {services.map((service) => (
                  <article
                    key={service.title}
                    className={`overflow-hidden rounded-[30px] bg-[#F9FAFB] shadow-[0_16px_45px_rgba(30,46,77,0.05)] ${
                      service.highlighted ? "ring-2 ring-[#EF7F1A]/55" : ""
                    }`}
                  >
                    <div className={`flex h-48 items-start justify-between p-5 ${service.accent}`}>
                      <Pill tone="light">{service.highlighted ? "Recomandat" : "Serviciu"}</Pill>
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

            <section className="rounded-[36px] bg-white p-8 shadow-[0_18px_55px_rgba(30,46,77,0.06)] lg:p-10">
              <div className="max-w-3xl">
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#EF7F1A]">Legaturi publice</div>
                <h2 className="mt-3 text-[44px] font-extrabold leading-[0.98] text-[#1E2E4D]">Homepage-ul conecteaza toate modulele aprobate My Darrin</h2>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {quickRoutes.map((route) => (
                  <Link key={route.title} href={route.href} className={`rounded-[28px] ${route.tone} p-6 transition hover:-translate-y-0.5`}>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EF7F1A]">Ruta activa</div>
                    <div className="mt-3 text-[24px] font-extrabold leading-tight text-[#1E2E4D]">{route.title}</div>
                    <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1E2E4D]">Deschide</div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <article className="rounded-[36px] bg-[#1E2E4D] p-8 text-white shadow-[0_18px_55px_rgba(30,46,77,0.12)] lg:p-10">
                <div className="text-[16px] font-bold uppercase tracking-[0.18em] text-[#FFCF95]">Cum functioneaza</div>
                <h2 className="mt-3 text-[42px] font-extrabold leading-[0.98]">Rapid, clar si fara pasi inutili</h2>
                <div className="mt-8 grid gap-4">
                  {steps.map((step, index) => (
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

            <section className="rounded-[38px] bg-[#1E2E4D] p-8 text-white shadow-[0_22px_60px_rgba(30,46,77,0.14)] lg:p-10">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="light">CTA final</Pill>
                    <Pill tone="orange">Conversie</Pill>
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

      <footer className="bg-[#1E2E4D] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] xl:px-8">
          <div>
            <LogoBlock inverse />
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/72">
              Platforma publica My Darrin pentru servicii la cerere, AI operational si profesionisti verificati. Mockup-ul respecta culorile oficiale si fluxul Backoffice catre public.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Pill tone="orange">[LOGO MY DARRIN]</Pill>
              <Pill>[ICON]</Pill>
              <Pill>[ICON]</Pill>
              <Pill>[ICON]</Pill>
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
            {[
              {
                title: "Servicii",
                links: [
                  { label: "Homepage", href: "/homepage-preview-v2" },
                  { label: "Catalog Servicii", href: "/mockup-v1/public/catalog" },
                  { label: "Reparat calorifer", href: "/mockup-v1/public/reparat-calorifer" },
                ],
              },
              {
                title: "Companie",
                links: [
                  { label: "Devino Partener", href: "/mockup-v1/public/devino-partener" },
                  { label: "Inscriere Partener", href: "/mockup-v1/public/devino-partener/inscriere" },
                  { label: "Modul client", href: "/mockup-v1/public/account" },
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
                  { label: "Contact", href: "/mockup-v1/public/account" },
                ],
              },
            ].map((column) => (
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
    </main>
  );
}
