import Link from "next/link";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import type { HomepageContent, PublicCatalogPrice, PublicServiceTaxonomy, PublicSyncManifest } from "@/lib/site-content";
import {
  PublicAccountRegisterForm,
  PublicRoleCompletionForm,
  PublicRoleSelectionForm,
} from "@/components/public-account-register-form";
import { GeoAddressAutocomplete } from "@/components/geo-address-autocomplete";
import {
  getPublicServiceBySlug,
  publicFooterColumns,
  publicNavLinks,
  publicQuickLinks,
  publicSelfSignupRoles,
  publicServiceCatalog,
} from "@/lib/public-site";

const inter = Inter({ subsets: ["latin"] });

type PillTone = "light" | "dark" | "green" | "orange";

function Pill({ children, tone = "light" }: { children: ReactNode; tone?: PillTone }) {
  return <span className={`v3-pill v3-pill-${tone}`}>{children}</span>;
}

function LogoBlock({ page, inverse = false }: { page: HomepageContent; inverse?: boolean }) {
  const branding = page.content.branding;
  const meta = page.content.meta;
  const logoText = branding?.logoText || meta?.brand || "My Darrin";
  const logoSubtext = branding?.logoSubtext || meta?.subBrand || "Home Best Pal";
  const logoUrl = branding?.logoUrl;

  return (
    <div className="v3-logo-block">
      {logoUrl ? (
        <div className="v3-logo-image-shell">
          <img src={logoUrl} alt={logoText} className="v3-logo-image" />
        </div>
      ) : (
        <div className="v3-logo-mark">
          <div className="v3-logo-shape" />
          <div className="v3-logo-core" />
          <div className="v3-logo-eye" />
        </div>
      )}
      <div>
        <div className={`v3-logo-title ${inverse ? "v3-logo-title-inverse" : ""}`}>{logoText}</div>
        <div className="v3-logo-subtitle">{logoSubtext}</div>
      </div>
    </div>
  );
}

function toneClass(tone: "orange" | "green" | "blue" | "light") {
  return {
    orange: "v3-tone-orange",
    green: "v3-tone-green",
    blue: "v3-tone-blue",
    light: "v3-tone-light",
  }[tone];
}

function accentClass(accent: "orange" | "navy" | "green") {
  return {
    orange: "v3-service-accent-orange",
    navy: "v3-service-accent-navy",
    green: "v3-service-accent-green",
  }[accent];
}

function betonLevelClass(level: "Bronz" | "Argint" | "Aur" | "Platinum") {
  return {
    Bronz: "v3-beton-level-bronz",
    Argint: "v3-beton-level-argint",
    Aur: "v3-beton-level-aur",
    Platinum: "v3-beton-level-platinum",
  }[level];
}

function betonStatToneClass(tone: "blue" | "amber" | "green" | "purple") {
  return {
    blue: "v3-beton-stat-blue",
    amber: "v3-beton-stat-amber",
    green: "v3-beton-stat-green",
    purple: "v3-beton-stat-purple",
  }[tone];
}

function resolveServiceClassifications(
  service: (typeof publicServiceCatalog)[number],
  taxonomy?: PublicServiceTaxonomy | null,
) {
  if (!taxonomy) {
    return service.classifications;
  }

  return {
    caen: taxonomy.caen_codes,
    uniclass: taxonomy.uniclass_codes,
    esco: taxonomy.esco_codes,
    indicators: taxonomy.indicator_codes,
  };
}

function formatDynamicPrice(amount: number, currency: string, currencySymbol?: string | null) {
  const normalized = Number.isFinite(amount) ? amount.toFixed(0) : "0";
  const suffix = currencySymbol && currencySymbol !== currency ? currencySymbol : currency.toLowerCase();
  return `de la ${normalized} ${suffix}`;
}

function resolveServicePrice(
  service: (typeof publicServiceCatalog)[number],
  dynamicPrice?: PublicCatalogPrice | null,
) {
  if (!dynamicPrice?.levels?.length) {
    return {
      startingPrice: service.startingPrice,
      levels: service.levels,
    };
  }

  const recommended = dynamicPrice.levels.find((level) => level.recommended) ?? dynamicPrice.levels[0];
  return {
    startingPrice: formatDynamicPrice(recommended.gross_total, dynamicPrice.currency, dynamicPrice.currency_symbol),
    levels: dynamicPrice.levels.map((level) => ({
      label: level.label,
      price: `${level.gross_total.toFixed(0)} ${dynamicPrice.currency_symbol && dynamicPrice.currency_symbol !== dynamicPrice.currency ? dynamicPrice.currency_symbol : dynamicPrice.currency.toLowerCase()}`,
      note: level.description ?? "Pret calculat din motorul de deviz",
    })),
  };
}

function resolveDeliveryBadge(
  service: (typeof publicServiceCatalog)[number],
  dynamicPrice?: PublicCatalogPrice | null,
) {
  return dynamicPrice?.delivery_badge ?? service.badges.find((badge) => badge.toLowerCase().includes("livrare")) ?? null;
}

function getAvailabilityWarning(dynamicPrice?: PublicCatalogPrice | null) {
  return dynamicPrice?.availability_status === "partial_available" ? dynamicPrice.partial_availability?.message ?? null : null;
}

function formatMaterialCardTitle(clasa: string) {
  return `Beton ${clasa} (Livrare Inclusa)`;
}

function PublicHeader({ page }: { page: HomepageContent }) {
  const content = page.content;
  const menuItems = content.header?.menu?.length ? content.header.menu : publicNavLinks.map((item) => item.label);

  return (
    <header className="v3-header-shell">
      <div className="v3-header-top">
        <div className="v3-header-top-inner">
          <div className="v3-header-address">
            <span>Address</span>
            <span className="v3-header-address-strong">{content.header?.locationLabel ?? "Residential - Bucharest, Sect 3, Bd Unirii nr. 5"}</span>
          </div>
          <div className="v3-header-tools">
            <span>{content.header?.language ?? "Romanian"}</span>
            <Link href="https://admin.mydarrin.homebestpal.com" className="v3-header-admin-link">
              Administrare
            </Link>
          </div>
        </div>
      </div>

      <div className="v3-header-main">
        <div className="v3-header-main-inner">
          <Link href="/" className="v3-header-brand">
            <LogoBlock page={page} />
          </Link>

          <div className="v3-header-delivery">
            <span className="v3-header-delivery-label">Disponibil in</span>
            <strong>{content.header?.locationLabel ?? "Bucuresti si Ilfov"}</strong>
          </div>

          <div className="v3-market-searchbar">
            <div className="v3-market-search-filter">Toate</div>
            <div className="v3-market-search-input">{content.header?.searchPlaceholder ?? "Cauta servicii, AI, poze, video sau cod serviciu"}</div>
            <Link href="/catalog" className="v3-market-search-action">
              Cauta
            </Link>
          </div>

          <div className="v3-header-actions">
            <div className="v3-header-locale">
              <span className="v3-header-flag">RO</span>
              <span>{content.header?.language ?? "Romanian"}</span>
            </div>
            <Link href="/account" className="v3-header-account-chip">
              <span className="v3-header-account-label">Salut, intra in cont</span>
              <strong>Cont & onboarding</strong>
            </Link>
            <Link href="/checkout" className="v3-header-orders-chip">
              <span>Comenzi</span>
              <strong>& status</strong>
            </Link>
            <Link href="/cart" className="v3-header-cart-chip">
              <span className="v3-chip-badge">3</span>
              <strong>Cos</strong>
            </Link>
            <Link href="/account" className="v3-ai-chip v3-ai-chip-header">
              Darrin AI
            </Link>
          </div>
        </div>

        <div className="v3-header-nav-strip">
          <div className="v3-header-nav-inner">
            <Link href="/catalog" className="v3-header-nav-emphasis">
              Toate serviciile
            </Link>
            {menuItems.map((itemLabel) => (
              <Link key={itemLabel} href="/catalog" className="v3-header-strip-link">
                {itemLabel}
              </Link>
            ))}
            <Link href="/account/create" className="v3-header-strip-link v3-header-strip-link-accent">
              Creeaza cont
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function PublicFooter({ page }: { page: HomepageContent }) {
  const branding = page.content.branding;
  const footerColumns = page.content.footer?.columns;
  const footerApps = page.content.footer?.apps;

  return (
    <footer className="v3-footer">
      <div className="v3-footer-inner">
        <div>
          <LogoBlock page={page} inverse />
          <p className="v3-footer-copy">
            Platforma publica My Darrin pentru servicii la cerere, AI operational si profesionisti verificati. Continutul
            homepage-ului este sincronizat din Backoffice prin `site_content_pages`, iar media serviciilor este stocata prin
            serviciul de attachments cu backend GCS.
          </p>
          <div className="v3-footer-pills">
            <Pill tone="orange">[LOGO MY DARRIN]</Pill>
            <Pill>[ICON]</Pill>
            <Pill>[ICON]</Pill>
            <Pill>[ICON]</Pill>
          </div>
          <div className="v3-footer-actions">
            {(footerApps?.[0] ?? "iOS App") ? (
              <Link href="/" className="v3-store-link">
                {footerApps?.[0] ?? "iOS App"}
              </Link>
            ) : null}
            {(footerApps?.[1] ?? "Android App") ? (
              <Link href="/account/create" className="v3-store-link v3-store-link-orange">
                {footerApps?.[1] ?? "Android App"}
              </Link>
            ) : null}
            <span className="v3-language-chip">RO | EN</span>
          </div>
        </div>

        <div className="v3-footer-grid">
          {(footerColumns
            ? Object.entries(footerColumns).map(([title, links]) => ({
                title,
                links: links.map((label) => ({ label, href: "/catalog" })),
              }))
            : publicFooterColumns
          ).map((column) => (
            <div key={column.title}>
              <div className="v3-footer-title">{column.title}</div>
              <div className="v3-footer-links">
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="v3-footer-meta">
        <div>Home Best Pal SRL | Bucuresti, Romania | contact@mydarrin.com | +40 700 000 000</div>
        <div>{page.content.meta?.domain ?? "mydarrin.homebestpal.com"}</div>
      </div>
      <div className="v3-footer-bottom">Copyright My Darrin | Operated by Home Best Pal</div>
    </footer>
  );
}

function PublicShell({
  page,
  children,
  hideFooter = false,
}: {
  page: HomepageContent;
  children: ReactNode;
  hideFooter?: boolean;
}) {
  const design = page.content.design;
  const theme = page.content.meta?.theme;
  const colors = design?.colors;
  const fonts = design?.fonts;
  const fontSizes = design?.fontSizes;

  return (
    <main
      className={`${inter.className} v3-page`}
      style={
        {
          "--v3-bg": colors?.background ?? theme?.background ?? "#f5f6f7",
          "--v3-surface": colors?.surface ?? theme?.surface ?? "#ffffff",
          "--v3-primary": colors?.primary ?? theme?.structure ?? "#1e2e4d",
          "--v3-secondary": colors?.secondary ?? theme?.ai ?? "#09a299",
          "--v3-accent": colors?.accent ?? theme?.cta ?? "#ef7f1a",
          "--v3-text": colors?.text ?? "#1e2e4d",
          "--v3-display-font": fonts?.display ?? inter.style.fontFamily ?? "Inter, Arial, sans-serif",
          "--v3-body-font": fonts?.body ?? inter.style.fontFamily ?? "Inter, Arial, sans-serif",
          "--v3-accent-font": fonts?.accent ?? inter.style.fontFamily ?? "Inter, Arial, sans-serif",
          "--v3-hero-size": fontSizes?.hero ?? "64px",
          "--v3-section-title-size": fontSizes?.sectionTitle ?? "44px",
          "--v3-body-size": fontSizes?.body ?? "16px",
          "--v3-label-size": fontSizes?.label ?? "11px",
        } as CSSProperties
      }
    >
      <PublicHeader page={page} />
      <section className="v3-content-shell">{children}</section>
      {hideFooter ? null : <PublicFooter page={page} />}
    </main>
  );
}

function SignupFlowTopbar({
  title,
  homeHref = "/",
  backHref,
}: {
  title: string;
  homeHref?: string;
  backHref: string;
}) {
  return (
    <div className="v3-signup-topbar">
      <div className="v3-signup-topbar-copy">
        <div className="v3-eyebrow">Flux creare cont</div>
        <h2 className="v3-signup-topbar-title">{title}</h2>
      </div>

      <div className="v3-signup-topbar-actions">
        <Link href={homeHref} className="v3-ghost-chip">
          Homepage
        </Link>
        <Link href={backHref} className="v3-dark-button">
          Back
        </Link>
      </div>
    </div>
  );
}

function buildHomepageServices(page: HomepageContent) {
  const featured = page.content.featuredServices ?? [];
  return featured.map((service) => {
    const catalogRecord = getPublicServiceBySlug(service.slug);
    return {
      slug: service.slug,
      title: service.title,
      rating: service.rating,
      startingPrice: service.startingPrice,
      featured: service.featured,
      accent: catalogRecord?.accent ?? "navy",
      summary: catalogRecord?.summary ?? "Preview public sincronizat din Backoffice, cu media, descriere si CTA configurabile.",
    };
  });
}

function PublicAuthTabs({ active }: { active: "login" | "register" }) {
  return (
    <div className="v3-auth-tabs">
      <Link href="/account" className={`v3-auth-tab ${active === "login" ? "v3-auth-tab-active" : ""}`}>
        Autoidentificare
      </Link>
      <Link href="/account/create" className={`v3-auth-tab ${active === "register" ? "v3-auth-tab-active" : ""}`}>
        Inregistrare
      </Link>
    </div>
  );
}

function AccountBenefitsPanel({
  title,
  items,
  footer,
}: {
  title: string;
  items: string[];
  footer?: ReactNode;
}) {
  return (
    <aside className="v3-auth-benefits-panel">
      <div className="v3-eyebrow">Avantajele tale in My Darrin</div>
      <h2 className="v3-auth-benefits-title">{title}</h2>
      <div className="v3-auth-benefits-list">
        {items.map((item) => (
          <div key={item} className="v3-auth-benefit-item">
            <span className="v3-auth-benefit-check">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      {footer ? <div className="v3-auth-benefits-footer">{footer}</div> : null}
    </aside>
  );
}

export function PublicHomepage({ page }: { page: HomepageContent }) {
  const content = page.content;
  const services = buildHomepageServices(page);
  const heroImageUrl = content.mediaLibrary?.heroImageUrl;
  const slogan = content.branding?.slogan ?? "Structura marketplace aprobata";

  return (
    <PublicShell page={page}>
      <section className="v3-marketplace-stage">
        <article className="v3-marketplace-notice">
          <div className="v3-card-kicker">{slogan}</div>
          <h2 className="v3-marketplace-notice-title">Afisam serviciile disponibile pentru zona ta si deschidem rapid cautarea, contul si cosul.</h2>
          <p className="v3-muted-copy">
            Inspiratia este o intrare utilitara de marketplace: localizare, cautare mare, cont vizibil si acces direct catre comenzi. Totul ramane adaptat identitatii My Darrin si fluxurilor noastre de servicii.
          </p>
          <div className="v3-marketplace-notice-actions">
            <Link href="/catalog" className="v3-ghost-chip">
              Schimba serviciul
            </Link>
            <Link href="/account/create" className="v3-primary-button">
              Creeaza cont
            </Link>
          </div>
        </article>

        <article className="v3-marketplace-account-card">
          <div className="v3-card-kicker">Intrare rapida</div>
          <div className="v3-marketplace-account-title">Contul My Darrin ramane intrarea catre AI, comenzi si fluxurile de inregistrare.</div>
          <Link href="/account" className="v3-marketplace-account-button">
            Autoidentificare
          </Link>
          <div className="v3-marketplace-account-copy">
            Esti nou? <Link href="/account/create">Incepe de aici.</Link>
          </div>
        </article>
      </section>

      <div className="v3-grid-layout">
        <aside className="v3-sidebar-card">
          <div className="v3-kicker">Panou administrare</div>
          <h2 className="v3-sidebar-title">Structura Backoffice</h2>
          <p className="v3-muted-copy">
            Varianta publica foloseste aceeasi logica aprobata: Super Admin configureaza continutul, media si CTA-urile din
            Backoffice, apoi sincronizarea publica este vizibila imediat in homepage, catalog si pagina de serviciu.
          </p>

          <div className="v3-admin-entry-card">
            <div className="v3-card-kicker">Acces Backoffice</div>
            <h3 className="v3-admin-entry-title">Panoul de administrare este separat si ramane pe subdomeniul dedicat</h3>
            <p className="v3-muted-copy">
              Vizitatorii folosesc `mydarrin.homebestpal.com`, iar administratorii intra in Backoffice prin ruta dedicata pentru
              rolurile Admin si Super Admin.
            </p>
            <div className="v3-admin-entry-actions">
              <Link href="https://admin.mydarrin.homebestpal.com" className="v3-dark-button">
                Deschide Backoffice
              </Link>
              <span className="v3-inline-note">Roluri permise: Super Admin, Admin</span>
            </div>
          </div>

          <div className="v3-sidebar-stack">
            {[
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
            ].map((section, index) => (
              <article key={section.title} className={`v3-sidebar-module ${index === 0 ? "v3-sidebar-module-highlight" : ""}`}>
                <div className="v3-sidebar-module-title">{section.title}</div>
                <div className="v3-sidebar-branch-list">
                  {section.branches.map((branch) => (
                    <div key={branch} className="v3-sidebar-branch">
                      {branch}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="v3-page-stack">
          <section className="v3-panel-card">
            <div className="v3-hero-grid">
              <div className="v3-hero-copy">
                <div className="v3-pill-row">
                  <Pill tone="orange">Glovo inspired</Pill>
                  <Pill tone="green">Darrin AI</Pill>
                  <Pill>[{content.hero?.mediaType ?? "VIDEO HERO"}]</Pill>
                </div>
                <div className="v3-eyebrow">Servicii la cerere, fara frictiune</div>
                <h1 className="v3-hero-title">{content.hero?.headline ?? "Cea mai rapida experienta pentru servicii locale, urgente si programate."}</h1>
                <p className="v3-hero-description">
                  {content.hero?.subheadline ??
                    "My Darrin combina viteza de selectie din Glovo cu increderea Home Best Pal: AI, provideri verificati si executie standardizata."}
                </p>

                <div className="v3-command-bar">
                  <div className="v3-command-input">{content.header?.searchPlaceholder ?? "Descrie ce ai nevoie... poti incarca poze sau video"}</div>
                  <Link href="/catalog" className="v3-primary-button">
                    {content.hero?.primaryCta ?? "Vezi servicii"}
                  </Link>
                  <Link href="/account" className="v3-secondary-button">
                    {content.hero?.secondaryCta ?? "Vorbeste cu Darrin"}
                  </Link>
                </div>

                <div className="v3-pill-row">
                  <Pill tone="dark">Bucuresti, Sect. 3</Pill>
                  <Pill>4.9 rating mediu</Pill>
                  <Pill>+250 servicii active</Pill>
                </div>
              </div>

              <div className="v3-hero-visual" style={heroImageUrl ? { backgroundImage: `linear-gradient(rgba(238,243,251,0.82), rgba(238,243,251,0.88)), url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                <div className="v3-hero-orb v3-hero-orb-orange" />
                <div className="v3-hero-orb v3-hero-orb-green" />
                <div className="v3-hero-visual-content">
                  <div className="v3-robot-card">
                    <div>
                      <div className="v3-card-kicker">My Darrin robot</div>
                      <div className="v3-card-title">AI concierge pentru servicii rezidentiale, comerciale si industriale.</div>
                    </div>
                    <div className="v3-robot-face">
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="v3-mini-grid">
                    <article className="v3-service-spotlight">
                      <div className="v3-card-kicker">Serviciu evidenta</div>
                      <div className="v3-service-spotlight-title">Reparat calorifer</div>
                      <div className="v3-service-spotlight-copy">Vizibil instant in homepage, catalog si pagina de serviciu.</div>
                      <div className="v3-price-pill">de la 189 lei</div>
                      <Link href="/services/reparat-calorifer" className="v3-dark-button">
                        Vezi pagina serviciului
                      </Link>
                    </article>
                    <article className="v3-sync-spotlight">
                      <div className="v3-card-kicker v3-card-kicker-mint">Flux instant</div>
                      <div className="v3-sync-spotlight-copy">Admin configureaza, salveaza si publica. Vizitatorul vede imediat.</div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="v3-feature-row">
            <Link href="/account" className="v3-feature-card v3-feature-card-dark">
              <Pill>AI first</Pill>
              <div className="v3-feature-title">Spune problema</div>
              <p>Text, imagine sau video. Darrin intelege nevoia si propune serviciul corect in cateva secunde.</p>
            </Link>

            <Link href="/catalog" className="v3-feature-card v3-feature-card-orange">
              <Pill tone="orange">Catalog</Pill>
              <div className="v3-feature-title">Alege serviciu</div>
              <p>Navigare rapida, carduri mari, pret de pornire si rating clar vizibile.</p>
            </Link>

            <Link href="/partners/join" className="v3-feature-card">
              <Pill tone="green">Trust</Pill>
              <div className="v3-feature-title">Executie verificata</div>
              <p>Furnizori validati, plata securizata, garantie si istoric complet de interventie.</p>
            </Link>
          </section>

          <section className="v3-section-card">
            <div className="v3-section-head">
              <div>
                <div className="v3-eyebrow">Categorii rapide</div>
                <h2 className="v3-section-title">Acces direct in cele mai cautate industrii</h2>
              </div>
              <div className="v3-arrow-pair">
                <span>&lt;</span>
                <span className="v3-arrow-active">&gt;</span>
              </div>
            </div>

            <div className="v3-category-grid">
              {(content.quickCategories ?? []).map((category, index) => (
                <article key={category.title} className={`v3-category-card ${["v3-tone-light", "v3-tone-green", "v3-tone-blue", "v3-tone-orange"][index % 4]}`}>
                  <div className="v3-category-top">
                    <Pill tone="dark">{category.title}</Pill>
                    <span className="v3-category-icon">o</span>
                  </div>
                  <div className="v3-category-title">{category.title}</div>
                  <p>{category.media ?? "IMAGINE / VIDEO"}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="v3-section-card">
            <div className="v3-section-head">
              <div>
                <div className="v3-eyebrow">Featured services</div>
                <h2 className="v3-section-title">Carduri mari, clare si foarte orientate spre conversie</h2>
              </div>
            </div>

            <div className="v3-services-grid">
              {services.map((service) => (
                <article key={service.slug} className={`v3-service-card ${service.featured ? "v3-service-card-highlighted" : ""}`}>
                  <div className={`v3-service-media ${accentClass(service.accent)}`}>
                    <Pill>{service.featured ? "Recomandat" : "Serviciu"}</Pill>
                    <span className="v3-rating-badge">{service.rating}</span>
                  </div>
                  <div className="v3-service-content">
                    <div className="v3-service-title">{service.title}</div>
                    <p>{service.summary}</p>
                    <div className="v3-service-meta">
                      <span className="v3-price-text">{service.startingPrice}</span>
                      <Link href={`/services/${service.slug}`} className="v3-dark-button">
                        Vezi detalii
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="v3-section-card">
            <div className="v3-section-head">
              <div>
                <div className="v3-eyebrow">Legaturi publice</div>
                <h2 className="v3-section-title">Homepage-ul conecteaza toate modulele aprobate My Darrin</h2>
              </div>
            </div>

            <div className="v3-quick-grid">
              {publicQuickLinks.map((route) => (
                <Link key={route.title} href={route.href} className={`v3-quick-card ${toneClass(route.tone)}`}>
                  <div className="v3-card-kicker">Ruta activa</div>
                  <div className="v3-quick-title">{route.title}</div>
                  <div className="v3-quick-chip">Deschide</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="v3-split-highlight">
            <article className="v3-section-card v3-section-card-dark">
              <div className="v3-card-kicker v3-card-kicker-light">Cum functioneaza</div>
              <h2 className="v3-section-title">Rapid, clar si fara pasi inutili</h2>
              <div className="v3-step-list">
                {(content.howItWorks ?? []).map((step, index) => (
                  <div key={`${step}-${index}`} className="v3-step-card">
                    <div className="v3-step-index">{index + 1}</div>
                    <div>
                      <strong>Pasul {index + 1}</strong>
                      <div>{step}</div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="v3-section-card v3-section-card-soft">
              <div className="v3-eyebrow">Beneficii</div>
              <h2 className="v3-section-title">Pret standardizat, garantie si incredere operationala</h2>
              <div className="v3-benefits-grid">
                {(content.benefits ?? []).map((benefit) => (
                  <div key={benefit} className="v3-benefit-card">
                    {benefit}
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="v3-section-card">
            <div className="v3-section-head">
              <div>
                <div className="v3-eyebrow">Flux complet de sincronizare</div>
                <h2 className="v3-section-title">Backoffice - salvare - publicare - verificare</h2>
              </div>
            </div>
            <div className="v3-step-list v3-step-list-light">
              {(content.syncFlow ?? []).map((step, index) => (
                <div key={`${step}-${index}`} className="v3-step-card v3-step-card-light">
                  <div className="v3-step-index">{index + 1}</div>
                  <div>{step}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="v3-final-cta">
            <div className="v3-final-copy">
              <div className="v3-pill-row">
                <Pill>CTA final</Pill>
                <Pill tone="orange">Conversie</Pill>
              </div>
              <h2 className="v3-section-title v3-section-title-light">Incepe acum sau devino partener in reteaua My Darrin</h2>
              <p className="v3-page-description">
                Varianta dedicata homepage-ului pune accent pe viteza, incredere si o experienta vizuala memorabila, inspirata din
                Glovo dar adaptata identitatii My Darrin.
              </p>
            </div>
            <div className="v3-final-actions">
              <Link href="/account/create" className="v3-primary-button">
                {content.finalCta?.primary ?? "Incepe acum"}
              </Link>
              <Link href="/partners/join" className="v3-white-button">
                {content.finalCta?.secondary ?? "Devino partener"}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}

export function PublicCatalogPage({
  page,
  taxonomyBySlug = {},
  dynamicPriceBySlug = {},
  syncManifest,
}: {
  page: HomepageContent;
  taxonomyBySlug?: Record<string, PublicServiceTaxonomy | null>;
  dynamicPriceBySlug?: Record<string, PublicCatalogPrice | null>;
  syncManifest?: PublicSyncManifest | null;
}) {
  const specialServices = publicServiceCatalog.filter((service) => service.specialCatalog);
  const standardServices = publicServiceCatalog.filter((service) => !service.specialCatalog);

  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Catalog servicii</div>
            <h1 className="v3-page-title">Catalogul public include acum si zona de materiale speciale pentru betoane</h1>
            <p className="v3-page-description">
              Cardurile, filtrele, CTA-urile si ierarhia de informatie urmeaza acelasi limbaj vizual din `homepage-preview-v2`, cu
              focus pe claritate, conversie si sincronizare vizibila din Backoffice. Pentru `materiale si betoane` am adaugat o
              structura dark dedicata, inspirata din captura ta, dar integrata in conceptul My Darrin.
            </p>
            {syncManifest ? (
              <p className="v3-inline-note">Versiune config: {syncManifest.content_version}</p>
            ) : null}
          </div>
          <div className="v3-page-hero-side">
            <div className="v3-page-hero-chip">Filtre</div>
            <div className="v3-page-hero-chip">Sortare</div>
            <div className="v3-page-hero-chip">Rating</div>
            <div className="v3-page-hero-chip">Pret de pornire</div>
          </div>
        </div>
      </section>

      {specialServices.map((service) => {
        const specialCatalog = service.specialCatalog;
        const classifications = resolveServiceClassifications(service, taxonomyBySlug[service.slug]);
        const resolvedPrice = resolveServicePrice(service, dynamicPriceBySlug[service.slug]);
        const deliveryBadge = resolveDeliveryBadge(service, dynamicPriceBySlug[service.slug]);

        if (!specialCatalog) {
          return null;
        }

        return (
          <section key={service.slug} className="v3-special-catalog-shell">
            <div className="v3-special-catalog-head">
              <div className="v3-special-catalog-brand">
                <div className="v3-special-catalog-icon">B</div>
                <div>
                  <div className="v3-special-catalog-kicker">{specialCatalog.title}</div>
                  <h2 className="v3-special-catalog-title">{service.title}</h2>
                  <p className="v3-special-catalog-copy">
                    {specialCatalog.supplier} | {specialCatalog.summary}
                  </p>
                </div>
              </div>
              <Link href={`/services/${service.slug}`} className="v3-special-catalog-cta">
                Vezi serviciul special
              </Link>
            </div>

            <div className="v3-special-stats-grid">
              {specialCatalog.stats.map((stat) => (
                <article key={stat.label} className="v3-special-stat-card">
                  <span className={`v3-special-stat-icon ${betonStatToneClass(stat.tone)}`} />
                  <div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="v3-special-filter-bar">
              {specialCatalog.filters.map((filter, index) => (
                <span key={filter} className={`v3-special-filter-chip ${index === 0 ? "v3-special-filter-chip-active" : ""}`}>
                  {filter}
                </span>
              ))}
            </div>

            {classifications ? (
              <div className="v3-taxonomy-grid">
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">CAEN</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.caen.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">Uniclass</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.uniclass.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">ESCO</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.esco.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">Indicatori deviz</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.indicators.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            ) : null}

            <div className="v3-special-offer-grid">
              {specialCatalog.offers.map((offer) => (
                <article key={offer.id} className="v3-special-offer-card">
                  <div className="v3-special-offer-head">
                    <div>
                      <span className={`v3-special-level-pill ${betonLevelClass(offer.nivel)}`}>{offer.nivel}</span>
                      <div className="v3-special-offer-title">{formatMaterialCardTitle(offer.clasa)}</div>
                    </div>
                    {deliveryBadge ? <span className="v3-delivery-badge">{deliveryBadge}</span> : null}
                  </div>
                  <div className="v3-special-offer-price-main">{resolvedPrice.startingPrice}</div>
                  <p className="v3-special-offer-summary">
                    Pachet de livrare la cheie pentru beton, transport si coordonare operationala, afisat ca serviciu public standardizat.
                  </p>
                  <div className="v3-special-offer-secondary">
                    <span>Sort {offer.sorturi}</span>
                    {offer.furnizor ? <span>{offer.furnizor}</span> : null}
                  </div>
                  <div className="v3-service-badges v3-service-badges-compact">
                    <span className="v3-mini-badge">Pachet de livrare</span>
                    {offer.optionalPompa ? <span className="v3-mini-badge">Pompa optionala</span> : null}
                    <span className="v3-mini-badge">{offer.cantitateTransport}</span>
                  </div>
                  <details className="v3-technical-details">
                    <summary>Vezi detalii tehnice</summary>
                    <div className="v3-special-offer-rows">
                      <div>
                        <span>Transport</span>
                        <strong>{offer.cantitateTransport}</strong>
                      </div>
                      <div>
                        <span>Sorturi</span>
                        <strong>{offer.sorturi}</strong>
                      </div>
                      {offer.transportPret ? (
                        <div>
                          <span>Pret transport</span>
                          <strong>{offer.transportPret}</strong>
                        </div>
                      ) : null}
                      {offer.furnizor ? (
                        <div>
                          <span>Furnizor</span>
                          <strong>{offer.furnizor}</strong>
                        </div>
                      ) : null}
                      {offer.indicatorDeviz ? (
                        <div>
                          <span>Indicator deviz</span>
                          <strong>{offer.indicatorDeviz}</strong>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="v3-section-card">
        <div className="v3-filter-bar">
          <span className="v3-filter-chip v3-filter-chip-active">Acasa</span>
          <span className="v3-filter-chip">Auto</span>
          <span className="v3-filter-chip">Materiale speciale</span>
          <span className="v3-filter-chip">Industrial</span>
          <span className="v3-filter-chip">HoReCa</span>
          <span className="v3-filter-chip">Agricultura</span>
          <span className="v3-filter-chip">Logistica</span>
        </div>

        <div className="v3-catalog-grid">
          {standardServices.map((service) => {
            const resolvedPrice = resolveServicePrice(service, dynamicPriceBySlug[service.slug]);
            const deliveryBadge = resolveDeliveryBadge(service, dynamicPriceBySlug[service.slug]);
            const availabilityWarning = getAvailabilityWarning(dynamicPriceBySlug[service.slug]);

            return (
            <article key={service.slug} className="v3-catalog-card">
              <div className={`v3-catalog-media ${accentClass(service.accent)}`}>
                <Pill>{service.mediaType}</Pill>
                <span className="v3-rating-badge">{service.rating}</span>
              </div>
              <div className="v3-catalog-content">
                <div className="v3-catalog-category">{service.category}</div>
                <div className="v3-service-title">{service.title}</div>
                <p>{service.summary}</p>
                <div className="v3-service-badges">
                  {deliveryBadge ? <span className="v3-mini-badge v3-mini-badge-accent">{deliveryBadge}</span> : null}
                  {service.badges.map((badge) => (
                    <span key={badge} className="v3-mini-badge">
                      {badge}
                    </span>
                  ))}
                </div>
                {availabilityWarning ? <div className="v3-warning-note">{availabilityWarning}</div> : null}
                <div className="v3-service-meta">
                  <span className="v3-price-text">{resolvedPrice.startingPrice}</span>
                  <Link href={`/services/${service.slug}`} className="v3-dark-button">
                    Vezi detalii
                  </Link>
                </div>
              </div>
            </article>
          )})}
        </div>
      </section>
    </PublicShell>
  );
}

export function PublicServicePage({
  page,
  slug,
  taxonomy,
  dynamicPrice,
  syncManifest,
}: {
  page: HomepageContent;
  slug: string;
  taxonomy?: PublicServiceTaxonomy | null;
  dynamicPrice?: PublicCatalogPrice | null;
  syncManifest?: PublicSyncManifest | null;
}) {
  const service = getPublicServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const classifications = resolveServiceClassifications(service, taxonomy);
  const resolvedPrice = resolveServicePrice(service, dynamicPrice);
  const deliveryBadge = resolveDeliveryBadge(service, dynamicPrice);
  const availabilityWarning = getAvailabilityWarning(dynamicPrice);

  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-service-detail-grid">
          <div>
            <div className="v3-pill-row">
              {service.badges.map((badge, index) => (
                <Pill key={badge} tone={index === 0 ? "orange" : "light"}>
                  {badge}
                </Pill>
              ))}
            </div>
            <div className="v3-eyebrow">Pagina serviciu</div>
            <h1 className="v3-page-title">{service.title}</h1>
            <p className="v3-page-description">{service.description}</p>

            <div className="v3-sync-banner">
              <strong>Flux obligatoriu vizibil:</strong>
              <span>
                Super Admin creeaza si configureaza serviciul in Backoffice, salveaza, apoi continutul devine public in homepage,
                catalog si aceasta pagina individuala.
              </span>
            </div>
            {dynamicPrice ? (
              <div className="v3-inline-note">
                Pret dinamic calculat din deviz pentru {dynamicPrice.country_code}/{dynamicPrice.zone_slug}. Versiune config:{" "}
                {syncManifest?.content_version ?? "fallback"}
              </div>
            ) : null}
            <GeoAddressAutocomplete helperText="Selecteaza adresa exacta din Google Places pentru a recalcula pretul pe coordonate GPS exacte." />

            <div className="v3-service-detail-actions">
              <Link href="/checkout" className={`v3-primary-button ${dynamicPrice?.availability_status === "partial_available" ? "v3-primary-button-warning" : ""}`}>
                {dynamicPrice?.availability_status === "partial_available" ? "Comanda cu verificare" : "Continua spre checkout"}
              </Link>
              <Link href="/cart" className="v3-dark-button">
                Adauga in cos
              </Link>
            </div>
            {deliveryBadge ? <div className="v3-inline-note">{deliveryBadge}</div> : null}
            {availabilityWarning ? <div className="v3-warning-note">{availabilityWarning}</div> : null}
          </div>

          <div className={`v3-detail-media ${accentClass(service.accent)}`}>
            <div className="v3-detail-media-label">[{service.mediaType}] Galerie media configurata din Backoffice</div>
            <div className="v3-detail-price">{resolvedPrice.startingPrice}</div>
          </div>
        </div>
      </section>

      <section className="v3-split-highlight">
        {service.specialCatalog ? (
          <article className="v3-special-service-panel">
            <div className="v3-special-catalog-head">
              <div className="v3-special-catalog-brand">
                <div className="v3-special-catalog-icon">B</div>
                <div>
                  <div className="v3-special-catalog-kicker">{service.specialCatalog.title}</div>
                  <h2 className="v3-special-catalog-title">Oferta operationala pentru materiale si betoane</h2>
                  <p className="v3-special-catalog-copy">{service.specialCatalog.summary}</p>
                </div>
              </div>
            </div>

            <div className="v3-special-stats-grid">
              {service.specialCatalog.stats.map((stat) => (
                <article key={stat.label} className="v3-special-stat-card">
                  <span className={`v3-special-stat-icon ${betonStatToneClass(stat.tone)}`} />
                  <div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </article>
              ))}
            </div>

            {classifications ? (
              <div className="v3-taxonomy-grid">
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">CAEN</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.caen.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">Uniclass</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.uniclass.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">ESCO</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.esco.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="v3-taxonomy-card">
                  <div className="v3-taxonomy-title">Indicatori deviz</div>
                  <div className="v3-taxonomy-pills">
                    {classifications.indicators.map((item) => (
                      <span key={item} className="v3-taxonomy-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            ) : null}

            <div className="v3-special-offer-grid">
              {service.specialCatalog.offers.map((offer) => (
                <article key={offer.id} className="v3-special-offer-card">
                  <div className="v3-special-offer-head">
                    <div>
                      <span className={`v3-special-level-pill ${betonLevelClass(offer.nivel)}`}>{offer.nivel}</span>
                      <div className="v3-special-offer-title">{formatMaterialCardTitle(offer.clasa)}</div>
                    </div>
                    {deliveryBadge ? <span className="v3-delivery-badge">{deliveryBadge}</span> : null}
                  </div>
                  <div className="v3-special-offer-price-main">{resolvedPrice.startingPrice}</div>
                  <p className="v3-special-offer-summary">
                    Configurator comercial simplificat pentru clientul final, cu detaliile de deviz mutate intr-o sectiune separata.
                  </p>
                  <div className="v3-special-offer-secondary">
                    <span>Sort {offer.sorturi}</span>
                    {offer.furnizor ? <span>{offer.furnizor}</span> : null}
                  </div>
                  <div className="v3-service-badges v3-service-badges-compact">
                    <span className="v3-mini-badge">Pachet de livrare</span>
                    {offer.optionalPompa ? <span className="v3-mini-badge">Pompa optionala</span> : null}
                    <span className="v3-mini-badge">{offer.cantitateTransport}</span>
                  </div>
                  <details className="v3-technical-details">
                    <summary>Vezi detalii tehnice</summary>
                    <div className="v3-special-offer-rows">
                      <div>
                        <span>Transport</span>
                        <strong>{offer.cantitateTransport}</strong>
                      </div>
                      <div>
                        <span>Sorturi</span>
                        <strong>{offer.sorturi}</strong>
                      </div>
                      {offer.transportPret ? (
                        <div>
                          <span>Pret transport</span>
                          <strong>{offer.transportPret}</strong>
                        </div>
                      ) : null}
                      {offer.furnizor ? (
                        <div>
                          <span>Furnizor</span>
                          <strong>{offer.furnizor}</strong>
                        </div>
                      ) : null}
                      {offer.indicatorDeviz ? (
                        <div>
                          <span>Indicator deviz</span>
                          <strong>{offer.indicatorDeviz}</strong>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </article>
        ) : null}

        <article className="v3-section-card">
          <div className="v3-eyebrow">Pachete si niveluri</div>
          <h2 className="v3-section-title">Preturi si configuratii vizibile public dupa aprobare</h2>
          <div className="v3-level-grid">
            {resolvedPrice.levels.map((level) => (
              <div key={level.label} className="v3-level-card">
                <div className="v3-level-label">{level.label}</div>
                <div className="v3-level-price">{level.price}</div>
                <p>{level.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="v3-section-card v3-section-card-soft">
          <div className="v3-eyebrow">Beneficii</div>
          <h2 className="v3-section-title">Ce vede vizitatorul dupa publicare</h2>
          <div className="v3-benefits-grid">
            {service.benefits.map((benefit) => (
              <div key={benefit} className="v3-benefit-card">
                {benefit}
              </div>
            ))}
          </div>
        </article>
      </section>
    </PublicShell>
  );
}

function GenericPublicLanding({
  page,
  eyebrow,
  title,
  description,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  page: HomepageContent;
  eyebrow: string;
  title: string;
  description: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">{eyebrow}</div>
            <h1 className="v3-page-title">{title}</h1>
            <p className="v3-page-description">{description}</p>
          </div>
          <div className="v3-final-actions">
            <Link href={primaryHref} className="v3-primary-button">
              {primaryLabel}
            </Link>
            <Link href={secondaryHref} className="v3-dark-button">
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="v3-split-highlight">
        <article className="v3-section-card">
          <div className="v3-eyebrow">{leftTitle}</div>
          <h2 className="v3-section-title">Structura urmeaza standardul V3 aprobat</h2>
          <div className="v3-benefits-grid">
            {leftItems.map((item) => (
              <div key={item} className="v3-benefit-card">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="v3-section-card v3-section-card-soft">
          <div className="v3-eyebrow">{rightTitle}</div>
          <h2 className="v3-section-title">Sincronizare si conformitate</h2>
          <div className="v3-step-list v3-step-list-light">
            {rightItems.map((item, index) => (
              <div key={item} className="v3-step-card v3-step-card-light">
                <div className="v3-step-index">{index + 1}</div>
                <div>{item}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PublicShell>
  );
}

export function PublicPartnerLandingPage({ page }: { page: HomepageContent }) {
  return (
    <GenericPublicLanding
      page={page}
      eyebrow="Devino partener"
      title="Zona partenerilor este aliniata la acelasi stil V3 aprobat din homepage"
      description="Formularele, beneficiile, CTA-urile si ordinea informatiei urmeaza aceeasi identitate vizuala aprobata pentru publicul My Darrin."
      leftTitle="Beneficii partener"
      leftItems={["Acces la lead-uri validate", "Executie standardizata", "Media si documente centralizate", "Control operational in Backoffice"]}
      rightTitle="Flux si GDPR"
      rightItems={["Datele formularului sunt persistate in baza de date aplicativa", "Documentele si atasamentele se stocheaza prin serviciul de attachments cu backend GCS", "Accesul la administrare este limitat prin roluri si token auth", "Datele personale sunt minimizate, auditate si supuse aprobarilor GDPR"]}
      primaryHref="/account/create"
      primaryLabel="Creeaza cont partener"
      secondaryHref="/catalog"
      secondaryLabel="Vezi servicii"
    />
  );
}

export function PublicInvestorLandingPage({ page }: { page: HomepageContent }) {
  return (
    <GenericPublicLanding
      page={page}
      eyebrow="Devino investitor"
      title="Modulul investitori foloseste aceeasi structura, culori si UX aprobate in V3"
      description="Landingul investitorilor este acum tratat ca parte a platformei publice coerente, nu ca o pagina izolata de mockup."
      leftTitle="Puncte cheie"
      leftItems={["Mesaj clar de incredere", "CTA-uri mari si directe", "Sectiuni explicite pentru beneficii", "Compatibilitate cu www.mydarrin.com"]}
      rightTitle="Date si protectie"
      rightItems={["Conturile investitor sunt pastrate in baza de date aplicativa", "Accesul si prelucrarea datelor sunt controlate prin roluri", "Documentele atasate sunt stocate separat in Cloud Storage", "Retentia si aprobarea publicarii sunt controlate din Backoffice"]}
      primaryHref="/account/create"
      primaryLabel="Creeaza cont investitor"
      secondaryHref="/account"
      secondaryLabel="Contact"
    />
  );
}

export function PublicAccountPage({ page }: { page: HomepageContent }) {
  return (
    <PublicShell page={page} hideFooter>
      <section className="v3-auth-shell">
        <article className="v3-auth-card">
          <PublicAuthTabs active="login" />

          <div className="v3-auth-card-body">
            <div className="v3-eyebrow">Salut! Bine ai revenit.</div>
            <h1 className="v3-auth-card-title">Autoidentificare rapida pentru AI, comenzi si traseul contului tau</h1>
            <p className="v3-page-description">
              Pastram structura clara din captura de referinta, dar o aliniem cu My Darrin: acces rapid catre onboarding, AI si istoricul de servicii.
            </p>

            <div className="v3-social-stack">
              <button type="button" className="v3-social-button">
                <span className="v3-social-mark v3-social-mark-google">G</span>
                <span>Conecteaza-te cu Google</span>
              </button>
              <button type="button" className="v3-social-button">
                <span className="v3-social-mark v3-social-mark-apple">A</span>
                <span>Conecteaza-te cu Apple</span>
              </button>
              <button type="button" className="v3-social-button">
                <span className="v3-social-mark v3-social-mark-facebook">f</span>
                <span>Conecteaza-te cu Facebook</span>
              </button>
            </div>

            <div className="v3-auth-divider">
              <span>sau identifica-te prin email</span>
            </div>

            <div className="v3-auth-form-grid">
              <label className="v3-form-field">
                <span>Adresa de e-mail</span>
                <input className="v3-form-control v3-form-control-rect" placeholder="email@mydarrin.com" />
              </label>
              <label className="v3-form-field">
                <span>Parola</span>
                <input className="v3-form-control v3-form-control-rect" type="password" placeholder="Introdu parola" />
              </label>
            </div>

            <Link href="/account/create" className="v3-auth-forgot-link">
              Ai uitat parola sau nu ai cont? Continua cu inregistrarea.
            </Link>

            <div className="v3-auth-actions">
              <Link href="/account/create" className="v3-primary-button v3-auth-primary">
                Creeaza cont client
              </Link>
              <Link href="/catalog" className="v3-dark-button">
                Explora catalog
              </Link>
            </div>

            <div className="v3-auth-inline-note">
              Fluxul activ public este crearea contului cu verificare telefon. Autentificarea sociala si loginul client final se conecteaza in etapa urmatoare, fara sa schimbam aceasta structura aprobata.
            </div>
          </div>
        </article>

        <AccountBenefitsPanel
          title="Avantajele tale cu un cont My Darrin"
          items={[
            "Pornesti de la AI, cautare mare si selectie rapida din catalog.",
            "Salvezi servicii, niveluri si comenzi in acelasi traseu public.",
            "Primesti actualizari pentru devize, checkout si status plata.",
            "Onboardingul pentru client, partener sau investitor ramane separat si clar.",
          ]}
          footer={
            <div className="v3-auth-side-note">
              Accesul pentru `Admin` si `Super Admin` ramane separat in Backoffice.
            </div>
          }
        />
      </section>
    </PublicShell>
  );
}

export function PublicAccountCreatePage({ page }: { page: HomepageContent }) {
  return (
    <PublicShell page={page} hideFooter>
      <section className="v3-auth-shell v3-auth-shell-register">
        <article className="v3-auth-card">
          <PublicAuthTabs active="register" />

          <div className="v3-auth-card-body">
            <div className="v3-eyebrow">Pasul 1 din 3</div>
            <h1 className="v3-auth-card-title">Inregistrarea ramane scurta, clara si construita pentru conversie rapida</h1>
            <p className="v3-page-description">
              Formularul public porneste de la datele minime, valideaza telefonul si continua apoi pe traseul corect pentru client, partener sau investitor.
            </p>

            <PublicAccountRegisterForm />

            <div className="v3-signup-footnote">
              Pentru conturi `Admin` sau `Super Admin`, accesul se acorda exclusiv din Backoffice.
            </div>

            <div className="v3-final-actions">
              <Link href="/account/create/administrare" className="v3-ghost-chip">
                Cont administrare
              </Link>
              <Link href="https://admin.mydarrin.homebestpal.com" className="v3-dark-button">
                Intrare Backoffice
              </Link>
            </div>
          </div>
        </article>

        <AccountBenefitsPanel
          title="De ce functioneaza acest onboarding pentru proiectul nostru"
          items={[
            "Structura de card cu taburi separa clar autoidentificarea de inregistrare.",
            "Varianta Facebook a fost adaugata in acelasi grup cu Google si Apple.",
            "Flow-ul real ramane sincronizat cu verificarea telefonului si alegerea rolului.",
            "Designul ramane coerent cu homepage-ul de marketplace si cu Backoffice-ul aprobat.",
          ]}
          footer={
            <div className="v3-signup-role-strip v3-signup-role-strip-light">
              {publicSelfSignupRoles.map((role) => (
                <div key={role.id} className="v3-signup-role-chip v3-signup-role-chip-light">
                  <strong>{role.label}</strong>
                  <span>{role.audience}</span>
                </div>
              ))}
            </div>
          }
        />
      </section>
    </PublicShell>
  );
}

export function PublicAccountRoleSelectionPage({ page, leadId }: { page: HomepageContent; leadId: number }) {
  return (
    <PublicShell page={page} hideFooter>
      <SignupFlowTopbar title="Alegi rolul potrivit dupa validarea telefonului" backHref="/account/create" />

      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Pasul 2</div>
            <h1 className="v3-page-title">Telefon validat. Acum alegi traseul corect al contului</h1>
            <p className="v3-page-description">
              Selectia rolului se face doar dupa verificarea contactului. Fiecare rol public merge mai departe pe o pagina
              dedicata si curata, fara campuri din alte fluxuri.
            </p>
          </div>
        </div>
      </section>

      <section className="v3-section-card">
        <PublicRoleSelectionForm leadId={leadId} />
      </section>
    </PublicShell>
  );
}

function PublicRoleCompletionPage({
  page,
  leadId,
  role,
  eyebrow,
  title,
  description,
  backHref,
  nextSteps,
  roleBenefits,
}: {
  page: HomepageContent;
  leadId: number;
  role: "CLIENT" | "PARTNER" | "INVESTOR";
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  nextSteps: string[];
  roleBenefits: string[];
}) {
  return (
    <PublicShell page={page} hideFooter>
      <SignupFlowTopbar title={title} backHref={backHref} />

      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">{eyebrow}</div>
            <h1 className="v3-page-title">{title}</h1>
            <p className="v3-page-description">{description}</p>
          </div>
        </div>
      </section>

      <section className="v3-section-card">
        <PublicRoleCompletionForm leadId={leadId} role={role} />
      </section>

      <section className="v3-split-highlight">
        <article className="v3-section-card">
          <div className="v3-eyebrow">Avantaje rol</div>
          <h2 className="v3-section-title">Pagina ramane dedicata strict traseului selectat</h2>
          <div className="v3-benefits-grid">
            {roleBenefits.map((item) => (
              <div key={item} className="v3-benefit-card">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="v3-section-card v3-section-card-soft">
          <div className="v3-eyebrow">Ce urmeaza</div>
          <h2 className="v3-section-title">Dupa finalizarea parolei</h2>
          <div className="v3-step-list v3-step-list-light">
            {nextSteps.map((item, index) => (
              <div key={item} className="v3-step-card v3-step-card-light">
                <div className="v3-step-index">{index + 1}</div>
                <div>{item}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PublicShell>
  );
}

export function PublicClientAccountCompletionPage({ page, leadId }: { page: HomepageContent; leadId: number }) {
  return (
    <PublicRoleCompletionPage
      page={page}
      leadId={leadId}
      role="CLIENT"
      eyebrow="Pasul 3 - Client"
      title="Finalizeaza contul de client"
      description="Fluxul client ramane cel mai rapid: dupa validarea telefonului si parola aleasa, contul poate intra direct in utilizare."
      backHref={`/account/create/select-role?lead=${leadId}`}
      roleBenefits={[
        "Comanda servicii imediat dupa activare",
        "Pastreaza istoricul cererilor si platilor",
        "Primeste comunicari si statusuri clare",
        "Ramane separat de fluxurile Partener si Investitor",
      ]}
      nextSteps={[
        "Contul client se activeaza direct dupa finalizare",
        "Poti intra in catalog si continua spre checkout",
        "Statusurile viitoare raman vizibile in zona de cont",
      ]}
    />
  );
}

export function PublicPartnerAccountCompletionPage({ page, leadId }: { page: HomepageContent; leadId: number }) {
  return (
    <PublicRoleCompletionPage
      page={page}
      leadId={leadId}
      role="PARTNER"
      eyebrow="Pasul 3 - Partener"
      title="Finalizeaza contul de partener"
      description="Contul partener este separat de client si intra in fluxul de aprobare operationala dupa finalizarea parolei."
      backHref={`/account/create/select-role?lead=${leadId}`}
      roleBenefits={[
        "Traseu dedicat pentru prestatori verificati",
        "Documentele si disponibilitatea raman pe profilul partener",
        "Nu se amesteca cu datele clientului",
        "Accesul operational se deschide dupa aprobare",
      ]}
      nextSteps={[
        "Datele intra in validarea operationala",
        "Super Admin sau echipa de verificare aproba accesul relevant",
        "Dupa aprobare, partenerul continua in dashboardul dedicat",
      ]}
    />
  );
}

export function PublicInvestorAccountCompletionPage({ page, leadId }: { page: HomepageContent; leadId: number }) {
  return (
    <PublicRoleCompletionPage
      page={page}
      leadId={leadId}
      role="INVESTOR"
      eyebrow="Pasul 3 - Investitor"
      title="Finalizeaza contul de investitor"
      description="Pagina investitorului ramane dedicata profilului de investitie si foloseste acelasi sistem vizual curat si aprobat."
      backHref={`/account/create/select-role?lead=${leadId}`}
      roleBenefits={[
        "Profil separat fata de client si partener",
        "Mesaj si informatie aliniate zonei de investitii",
        "Datele de contact raman salvate din pasul initial",
        "Flux clar, fara campuri inutile din alte roluri",
      ]}
      nextSteps={[
        "Contul este trimis in fluxul intern de evaluare",
        "Comunicarea ulterioara continua pe emailul declarat",
        "Accesul detaliat se acorda dupa validarea administrativa",
      ]}
    />
  );
}

export function PublicAdminAccessPage({ page }: { page: HomepageContent }) {
  return (
    <PublicShell page={page} hideFooter>
      <section className="v3-signup-clean-shell">
        <SignupFlowTopbar title="Conturile de administrare sunt separate de fluxul public" backHref="/account/create" />

        <div className="v3-signup-clean-layout">
          <aside className="v3-signup-story-panel">
            <div className="v3-signup-story-copy">
              <div className="v3-eyebrow v3-eyebrow-light">Administrare</div>
              <h1 className="v3-signup-story-title">Accesul in Backoffice se aproba controlat</h1>
              <p className="v3-signup-story-description">
                Rolurile de administrare nu se creeaza din fluxul public de signup. Ele sunt validate separat si aprobate explicit
                de `SUPER_ADMIN`, apoi se foloseste subdomeniul dedicat pentru panoul de administrare.
              </p>
            </div>

            <div className="v3-signup-story-list">
              {[
                "Admin si Super Admin nu apar in selectia publica de roluri.",
                "Datele minime pot fi salvate pentru contact, dar accesul efectiv se aproba intern.",
                "Intrarea in panoul de administrare ramane pe subdomeniul dedicat.",
              ].map((item) => (
                <div key={item} className="v3-signup-story-item">
                  <span className="v3-signup-story-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <article className="v3-signup-form-panel">
            <div className="v3-signup-form-frame">
              <div className="v3-signup-form-top">
                <div className="v3-eyebrow">Cont administrare</div>
                <h2 className="v3-section-title">Traseu separat fata de Client, Partener si Investitor</h2>
                <p className="v3-page-description">
                  Daca utilizatorul are nevoie de acces administrativ, fluxul corect este verificarea interna si aprobarea de
                  catre `SUPER_ADMIN`, nu crearea directa din pagina publica.
                </p>
              </div>

              <div className="v3-benefits-grid">
                {[
                  "Acces controlat prin aprobare interna",
                  "Subdomeniu separat pentru Backoffice",
                  "Audit clar pe roluri de administrare",
                  "Fara expunere publica a conturilor administrative",
                ].map((item) => (
                  <div key={item} className="v3-benefit-card">
                    {item}
                  </div>
                ))}
              </div>

              <div className="v3-final-actions">
                <Link href="https://admin.mydarrin.homebestpal.com" className="v3-primary-button">
                  Deschide Backoffice
                </Link>
                <Link href="/account/create" className="v3-dark-button">
                  Inapoi la creare cont
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PublicShell>
  );
}

export function PublicCartPage({ page }: { page: HomepageContent }) {
  const cartServices = ["reparat-calorifer", "montaj-centrala-termica"]
    .map((slug) => getPublicServiceBySlug(slug))
    .filter((service): service is NonNullable<ReturnType<typeof getPublicServiceBySlug>> => Boolean(service));

  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Coș</div>
            <h1 className="v3-page-title">Coșul public este aliniat la V3 si pregatit pentru checkout</h1>
            <p className="v3-page-description">Carduri mari, sumare clare si CTA-uri puternice, in aceeasi geometrie aprobata pe homepage.</p>
          </div>
          <Link href="/checkout" className="v3-primary-button">
            Continua spre checkout
          </Link>
        </div>
      </section>

      <section className="v3-section-card">
        <div className="v3-cart-grid">
          {cartServices.map((service) => (
            <article key={service.slug} className="v3-cart-card">
              <div className={`v3-cart-media ${accentClass(service.accent)}`}>[{service.mediaType}]</div>
              <div>
                <div className="v3-service-title">{service.title}</div>
                <p>{service.summary}</p>
              </div>
              <div className="v3-price-text">{service.startingPrice}</div>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

export function PublicCheckoutPage({ page }: { page: HomepageContent }) {
  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Checkout</div>
            <h1 className="v3-page-title">Checkout-ul pastreaza acelasi ritm vizual si ierarhie aprobata in homepage V3</h1>
            <p className="v3-page-description">Formular, sumar de comanda si CTA final intr-un layout coerent, pregatit pentru integrarea finala de plata.</p>
          </div>
        </div>
      </section>

      <section className="v3-split-highlight">
        <article className="v3-section-card">
          <div className="v3-form-grid">
            <GeoAddressAutocomplete helperText="Autocomplete-ul trimite place_id catre backend pentru calcul fiscal si geografic exact." />
            {["Persoana de contact", "Telefon", "Fereastra de executie", "Observatii"].map((field) => (
              <label key={field} className="v3-form-field">
                <span>{field}</span>
                <div className="v3-form-input" />
              </label>
            ))}
          </div>
        </article>
        <article className="v3-section-card v3-section-card-soft">
          <div className="v3-eyebrow">Rezumat</div>
          <h2 className="v3-section-title">Reparat calorifer</h2>
          <div className="v3-checkout-summary">
            <div><span>Subtotal</span><strong>189 lei</strong></div>
            <div><span>Transport</span><strong>35 lei</strong></div>
            <div><span>Total</span><strong>224 lei</strong></div>
          </div>
          <div className="v3-final-actions">
            <Link href="/payment-status" className="v3-primary-button">
              Continua la plata
            </Link>
          </div>
        </article>
      </section>
    </PublicShell>
  );
}

export function PublicPaymentStatusPage({ page }: { page: HomepageContent }) {
  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Status plata</div>
            <h1 className="v3-page-title">Vizualizare status plata in acelasi design public aprobat</h1>
            <p className="v3-page-description">Pagina confirma statusul tranzactiei si pastreaza consistenta de stil pentru experienta completa end-to-end.</p>
          </div>
        </div>
      </section>

      <section className="v3-section-card">
        <div className="v3-status-grid">
          <article className="v3-status-card v3-status-card-success">
            <div className="v3-status-label">APPROVED</div>
            <div className="v3-service-title">Plata a fost confirmata</div>
            <p>Comanda este inregistrata si vizibila pentru Super Admin in Backoffice.</p>
          </article>
          <article className="v3-status-card">
            <div className="v3-status-label">SYNC</div>
            <div className="v3-service-title">Urmeaza verificarea publica</div>
            <p>Administratorul poate verifica si aproba ce se vede public pentru serviciul si continutul asociat.</p>
          </article>
        </div>
      </section>
    </PublicShell>
  );
}
