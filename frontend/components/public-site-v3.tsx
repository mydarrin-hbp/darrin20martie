import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import type {
  HomepageContent,
  PublicCatalogCategoryItem,
  PublicCatalogCategoryListResponse,
  PublicCatalogPrice,
  PublicCatalogServiceCard,
  PublicServiceTaxonomy,
  PublicServiceTechnicalSpecs,
  PublicSyncManifest,
} from "@/lib/site-content";
import {
  PublicAccountRegisterForm,
  PublicRoleCompletionForm,
  PublicRoleSelectionForm,
} from "@/components/public-account-register-form";
import { GeoAddressAutocomplete } from "@/components/geo-address-autocomplete";
import { CatalogTree } from "@/components/catalog-tree";
import { InvestorSeedWidget } from "@/components/investor-seed-widget";
import { PublicCheckoutSubmit } from "@/components/public-checkout-submit";
import { GeoRestrictionGate } from "@/components/geo-restriction-gate";
import { LiveActivityFeed } from "@/components/live-activity-feed";
import { VisualEditableText } from "@/components/visual-editable-text";
import { PublicPaymentStatusClient } from "@/components/public-payment-status-client";
import { PublicAccountLoginForm } from "@/components/public-account-login-form";
import { ClientOrders } from "@/components/client-orders";
import { ClientOrderDetailPanel } from "@/components/client-order-detail";
import { HeroSlider } from "@/components/hero-slider";
import { PublicAiDarrinChat } from "@/components/public-ai-darrin-chat";
import { PublicCheckoutDraftSummary, PublicCheckoutFields } from "@/components/public-checkout-fields";
import { PublicCartClient } from "@/components/public-cart-client";
import {
  getPublicServiceBySlug,
  publicCrossSellMap,
  publicDomainTree,
  publicMaterialPivotMap,
  publicSafetyChecklist,
  publicFooterColumns,
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
          <Image src={logoUrl} alt={logoText} className="v3-logo-image" width={140} height={48} />
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

type ResolvedServicePrice = {
  startingPrice: string;
  primaryValue: string;
  currencyLabel: string;
  prefixLabel: string;
  taxLabel: string;
  minimumOrderApplied: boolean;
  minimumOrderNote?: string | null;
  levels: Array<{
    label: string;
    price: string;
    note: string;
  }>;
};

function formatPriceAmount(amount: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function normalizeCurrencyLabel(currency: string, currencySymbol?: string | null) {
  const value = (currencySymbol || currency || "RON").toUpperCase();
  return value === "LEI" ? "RON" : value;
}

type ServiceMediaAssets = {
  images?: string[];
  videos?: string[];
  documents?: string[];
};

type SidebarItem = {
  label: string;
  href: string;
  subItems?: Array<{ label: string; href: string }>;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
  highlight?: boolean;
};

type AccountSidebarItem = {
  label: string;
  href: string;
  meta?: string;
};

type AccountSidebarSection = {
  title: string;
  items: AccountSidebarItem[];
};

type ResolvedServiceRecord = (typeof publicServiceCatalog)[number] & {
  media?: ServiceMediaAssets;
};

type CartEntry = {
  slug: string;
  card?: PublicCatalogServiceCard | null;
  dynamicPrice?: PublicCatalogPrice | null;
};

type CheckoutContext = {
  slug: string;
  card?: PublicCatalogServiceCard | null;
  dynamicPrice?: PublicCatalogPrice | null;
  targetAddress?: string | null;
  placeId?: string | null;
};

const DEFAULT_SERVICE_BENEFITS = ["Pret standardizat", "Garantie", "Asigurare", "Profesionisti verificati"];

function normalizeMediaAssets(card?: PublicCatalogServiceCard | null): ServiceMediaAssets {
  return {
    images: (card?.images ?? []).filter(Boolean),
    videos: (card?.videos ?? []).filter(Boolean),
    documents: (card?.documents ?? []).filter(Boolean),
  };
}

function normalizeCatalogDimensions(catalogServices?: PublicCatalogServiceCard[]) {
  const categories = new Map<string, Set<string>>();
  const domains = new Set<string>();

  if (catalogServices?.length) {
    for (const service of catalogServices) {
      if (service.category) {
        if (!categories.has(service.category)) {
          categories.set(service.category, new Set());
        }
        for (const subcategory of service.subcategories ?? []) {
          if (subcategory) {
            categories.get(service.category)?.add(subcategory);
          }
        }
      }
      if (service.domain) {
        domains.add(service.domain);
      }
    }
  } else {
    for (const service of publicServiceCatalog) {
      if (service.category) {
        if (!categories.has(service.category)) {
          categories.set(service.category, new Set());
        }
      }
    }
  }

  const categoryItems = Array.from(categories.entries())
    .map(([category, subcategories]) => ({
      label: category,
      href: `/catalog?category=${encodeURIComponent(category)}`,
      subItems: Array.from(subcategories.values())
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 8)
        .map((subcategory) => ({
          label: subcategory,
          href: `/catalog?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`,
        })),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const domainItems = Array.from(domains.values())
    .sort((a, b) => a.localeCompare(b))
    .map((domain) => ({
      label: domain,
      href: `/catalog?domain=${encodeURIComponent(domain)}`,
    }));

  return { categoryItems, domainItems };
}

function buildPublicSidebarSections(catalogServices?: PublicCatalogServiceCard[]) {
  const { categoryItems, domainItems } = normalizeCatalogDimensions(catalogServices);
  return [
    {
      title: "Servicii",
      items: categoryItems.length
        ? categoryItems
        : [
            { label: "Servicii principale", href: "/catalog" },
            { label: "Catalog complet", href: "/catalog" },
          ],
      highlight: true,
    },
    {
      title: "Domenii",
      items: domainItems.length
        ? domainItems
        : [
            { label: "Rezidential", href: "/catalog" },
            { label: "Commercial", href: "/catalog" },
            { label: "Industrial", href: "/catalog" },
        ],
    },
    {
      title: "Materiale (Marketplace)",
      items: [
        { label: "Catalog materiale", href: "/materials" },
        { label: "Consumabile", href: "/materials?category=consumabile-termice" },
        { label: "HVAC & termice", href: "/materials?category=hvac-instalatii-termice" },
        { label: "Devino provider", href: "/marketplace/providers" },
      ],
    },
    {
      title: "Inchirieri Utilaje",
      items: [
        { label: "Utilaje rental", href: "/materials?category=utilaje-rental" },
        { label: "Catalog utilaje", href: "/catalog?resource_type=EQUIPMENT" },
      ],
    },
    {
      title: "Devino Partener",
      items: [
        { label: "Inscriere Partener", href: "/partners/join" },
        { label: "Creeaza Cont Partener", href: "/account/create" },
      ],
    },
    {
      title: "Devino Investitor",
      items: [
        { label: "Program Investitori", href: "/investors" },
        { label: "Creeaza Cont Investitor", href: "/investors/create" },
      ],
    },
    {
      title: "Asiguratori",
      items: [
        { label: "Parteneriate Asiguratori", href: "/contact" },
        { label: "Integrare Asigurari", href: "/contact" },
      ],
    },
    {
      title: "Clienti",
      items: [
        { label: "Cont Client", href: "/account" },
        { label: "Creeaza Cont Client", href: "/account/create" },
      ],
    },
    {
      title: "Contact",
      items: [
        { label: "Contact My Darrin", href: "/contact" },
        { label: "AI Darrin", href: "/account" },
      ],
    },
    {
      title: "Info / Legal",
      items: [
        { label: "CUM FUNCTIONEAZA My Darrin", href: "/how-it-works" },
        { label: "Despre My Darrin", href: "/about" },
        { label: "Termeni & GDPR", href: "/legal" },
      ],
    },
  ] as SidebarSection[];
}

function PublicSidebar({ catalogServices }: { catalogServices?: PublicCatalogServiceCard[] }) {
  const sidebarSections = buildPublicSidebarSections(catalogServices);
  return (
    <aside className="v3-sidebar-card w-full lg:sticky lg:top-6">
      <div className="v3-kicker">Sidebar sincronizat</div>
      <h2 className="v3-sidebar-title">Navigare publica</h2>
      <p className="v3-muted-copy">
        Structura din stanga oglindeste sectiunile publice aprobate in Backoffice. Modificarile de catalog si domenii sunt
        reflectate instant in acest meniu.
      </p>

      <div className="v3-sidebar-accordion">
        {sidebarSections.map((section, index) => (
          <details
            key={section.title}
            className={`v3-sidebar-accordion-item ${section.highlight ? "v3-sidebar-accordion-item-highlight" : ""}`}
            open={index === 0}
          >
            <summary className="v3-sidebar-accordion-summary">
              <span>{section.title}</span>
              <span className="v3-sidebar-accordion-icon" aria-hidden />
            </summary>
            <div className="v3-sidebar-accordion-body">
              {section.items.map((item) => (
                <div key={item.label} className="v3-sidebar-accordion-row">
                  <Link href={item.href} className="v3-sidebar-accordion-link">
                    {item.label}
                  </Link>
                  {item.subItems?.length ? (
                    <div className="v3-sidebar-subitems">
                      {item.subItems.map((subItem) => (
                        <Link key={subItem.label} href={subItem.href} className="v3-sidebar-subitem">
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </aside>
  );
}

function resolveFooterLink(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("catalog")) return "/catalog";
  if (normalized.includes("homepage") || normalized.includes("acasa")) return "/";
  if (normalized.includes("serviciu")) return "/catalog";
  if (normalized.includes("partener")) return "/partners/join";
  if (normalized.includes("invest")) return "/investors";
  if (normalized.includes("contact")) return "/contact";
  if (normalized.includes("despre") || normalized.includes("about")) return "/about";
  if (normalized.includes("gdpr") || normalized.includes("termeni") || normalized.includes("politic")) return "/legal";
  if (normalized.includes("cont")) return "/account/create";
  return "/catalog";
}

function buildFooterGroups(page: HomepageContent) {
  const footerColumns = page.content.footer?.columns;
  const footerApps = page.content.footer?.apps;
  const fallbackColumns = publicFooterColumns;
  const columnEntries = footerColumns
    ? Object.entries(footerColumns).map(([title, links]) => ({
        title,
        links: links.map((label) => ({ label, href: resolveFooterLink(label) })),
      }))
    : fallbackColumns;

  const findColumn = (keywords: string[]) =>
    columnEntries.find((column) => keywords.some((keyword) => column.title.toLowerCase().includes(keyword)));

  const usefulLinks = findColumn(["servicii", "serviciu", "util"]) ?? columnEntries[0];
  const legalLinks = findColumn(["legal", "termeni", "gdpr", "politic"]) ?? columnEntries[2] ?? columnEntries[0];
  const supportLinks = findColumn(["companie", "contact", "suport", "despre"]) ?? columnEntries[1] ?? columnEntries[0];
  const usefulPages = findColumn(["pagina", "about", "despre", "contact"]) ?? columnEntries[3] ?? columnEntries[0];

  const ensureHowItWorks = (links: { label: string; href: string }[]) => {
    if (links.some((link) => link.href === "/how-it-works")) {
      return links;
    }
    return [{ label: "CUM FUNCTIONEAZA My Darrin", href: "/how-it-works" }, ...links];
  };

  return [
    {
      title: "Useful information",
      links: ensureHowItWorks(usefulLinks?.links ?? []),
    },
    {
      title: "Terms & conditions",
      links: ensureHowItWorks(legalLinks?.links ?? []),
    },
    {
      title: "Customer support",
      links: [
        ...(supportLinks?.links ?? []),
        { label: "AI Darrin", href: "/account" },
        { label: "Suport clienti", href: "/contact" },
      ],
    },
    {
      title: "Useful pages",
      links: usefulPages?.links ?? [],
    },
  ];
}

function parseBenefits(markdown?: string | null) {
  return (markdown ?? "")
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean);
}

function resolveMediaType(assets: ServiceMediaAssets) {
  if ((assets.videos ?? []).length > 0) return "VIDEO";
  if ((assets.images ?? []).length > 0) return "IMAGINE";
  return "SLIDE";
}

function pickAccent(slug: string, fallbackIndex: number) {
  const accents: Array<ResolvedServiceRecord["accent"]> = ["orange", "navy", "green"];
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash + slug.charCodeAt(index) * (index + 3)) % accents.length;
  }
  return accents[hash] ?? accents[fallbackIndex % accents.length];
}

function parseTierLevels(levelAttachments: Record<string, unknown> | null | undefined) {
  const raw = Array.isArray((levelAttachments as Record<string, unknown> | undefined)?.service_tiers)
    ? ((levelAttachments as Record<string, unknown>).service_tiers as Array<Record<string, unknown>>)
    : [];
  const levels = raw
    .map((tier) => ({
      label: String(tier.title ?? tier.tierKey ?? "Nivel"),
      price: `+${Number(tier.marginMultiplier ?? 0)}%`,
      note: String(tier.benefitsMarkdown ?? "Configuratie standard"),
    }))
    .filter((tier) => tier.label.trim().length > 0);
  if (levels.length) {
    return levels;
  }
  return [
    { label: "Bronz", price: "de la 0 RON", note: "Configuratie standard" },
    { label: "Argint", price: "de la 0 RON", note: "Configuratie recomandata" },
    { label: "Aur", price: "de la 0 RON", note: "Executie extinsa" },
    { label: "Platina", price: "de la 0 RON", note: "Garantie extinsa + mentenanta" },
  ];
}

function parseStaticPrice(startingPrice: string) {
  const match = startingPrice.match(/(\d[\d.,]*)\s*([A-Za-z]+)/);
  if (!match) {
    return {
      primaryValue: startingPrice,
      currencyLabel: "RON",
      prefixLabel: "",
    };
  }

  return {
    primaryValue: match[1].replace(",", "."),
    currencyLabel: normalizeCurrencyLabel(match[2]),
    prefixLabel: startingPrice.toLowerCase().includes("de la") ? "de la" : "",
  };
}

function parsePriceAmount(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function resolveServicePrice(
  service: (typeof publicServiceCatalog)[number],
  dynamicPrice?: PublicCatalogPrice | null,
): ResolvedServicePrice {
  if (!dynamicPrice?.levels?.length) {
    const staticPrice = parseStaticPrice(service.startingPrice);
    return {
      startingPrice: service.startingPrice,
      primaryValue: staticPrice.primaryValue,
      currencyLabel: staticPrice.currencyLabel,
      prefixLabel: staticPrice.prefixLabel,
      taxLabel: "TVA inclus",
      minimumOrderApplied: false,
      minimumOrderNote: null,
      levels: service.levels,
    };
  }

  const recommended = dynamicPrice.levels.find((level) => level.recommended) ?? dynamicPrice.levels[0];
  const currencyLabel = normalizeCurrencyLabel(dynamicPrice.currency, dynamicPrice.currency_symbol);
  return {
    startingPrice: `de la ${formatPriceAmount(recommended.gross_total)} ${currencyLabel}`,
    primaryValue: formatPriceAmount(recommended.gross_total),
    currencyLabel,
    prefixLabel: "de la",
    taxLabel: "TVA inclus",
    minimumOrderApplied: Boolean(dynamicPrice.minimum_order_applied),
    minimumOrderNote: dynamicPrice.minimum_order_note,
    levels: dynamicPrice.levels.map((level) => ({
      label: level.label,
      price: `${formatPriceAmount(level.gross_total)} ${currencyLabel}`,
      note: level.description ?? "Pret calculat din motorul de deviz",
    })),
  };
}

function buildServiceFromCatalogCard(card: PublicCatalogServiceCard, index: number): ResolvedServiceRecord {
  const mediaAssets = normalizeMediaAssets(card);
  const rateCardLabel = card.rate_card
    ? `de la ${formatPriceAmount(card.rate_card.base_price)} ${normalizeCurrencyLabel(card.rate_card.currency)}`
    : "de la 0 RON";

  return {
    slug: card.slug,
    title: card.name,
    category: card.category ?? card.domain ?? "Serviciu",
    summary: card.description ?? "Serviciu sincronizat din Backoffice, cu continut public actualizat in timp real.",
    description:
      card.description_extended ??
      card.description ??
      "Serviciu tehnic configurat in Backoffice si publicat automat in catalogul My Darrin.",
    startingPrice: rateCardLabel,
    rating: card.rating_aipl ? card.rating_aipl.toFixed(1) : "4.8",
    accent: pickAccent(card.slug, index),
    mediaType: resolveMediaType(mediaAssets),
    badges: [
      ...(card.subcategories?.length ? [card.subcategories[0]] : []),
      ...(card.resource_types?.length ? [card.resource_types[0]] : []),
    ].filter(Boolean),
    benefits: DEFAULT_SERVICE_BENEFITS,
    levels: parseTierLevels(card.level_attachments),
    media: mediaAssets,
  };
}

function mergeServiceWithCard(service: ResolvedServiceRecord, card: PublicCatalogServiceCard, index: number): ResolvedServiceRecord {
  const mediaAssets = normalizeMediaAssets(card);
  return {
    ...service,
    title: card.name || service.title,
    category: card.category ?? card.domain ?? service.category,
    summary: card.description ?? service.summary,
    description: card.description_extended ?? card.description ?? service.description,
    rating: card.rating_aipl ? card.rating_aipl.toFixed(1) : service.rating,
    mediaType:
      (mediaAssets.images ?? []).length || (mediaAssets.videos ?? []).length
        ? resolveMediaType(mediaAssets)
        : service.mediaType,
    media:
      (mediaAssets.images ?? []).length || (mediaAssets.videos ?? []).length || (mediaAssets.documents ?? []).length
        ? mediaAssets
        : service.media,
    levels: card.level_attachments ? parseTierLevels(card.level_attachments) : service.levels,
    accent: service.accent ?? pickAccent(card.slug, index),
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

function PriceLockup({
  price,
  center = false,
  compact = false,
  pulseKey,
}: {
  price: ResolvedServicePrice;
  center?: boolean;
  compact?: boolean;
  pulseKey?: string | null;
}) {
  return (
    <div
      key={pulseKey ?? "static-price"}
      className={`v3-price-lockup ${center ? "v3-price-lockup-center" : ""} ${compact ? "v3-price-lockup-compact" : ""} ${pulseKey ? "v3-price-lockup-pulse" : ""}`}
    >
      {price.prefixLabel ? <div className="v3-price-prefix">{price.prefixLabel}</div> : null}
      <div className="v3-price-figure-row">
        <span className="v3-price-figure">{price.primaryValue}</span>
        <span className="v3-price-currency">{price.currencyLabel}</span>
      </div>
      <div className="v3-price-meta-row">
        <span className="v3-price-meta-badge">{price.taxLabel}</span>
        {price.minimumOrderApplied ? <span className="v3-price-meta-badge v3-price-meta-badge-soft">Tarif minim</span> : null}
      </div>
      {price.minimumOrderNote ? <div className="v3-price-note">{price.minimumOrderNote}</div> : null}
    </div>
  );
}

function PublicHeader({ page }: { page: HomepageContent }) {
  return (
    <header className="v3-header-shell">
      <div className="v3-header-main v3-header-main-compact">
        <div className="v3-header-main-inner v3-header-main-clean v3-header-main-compact-inner flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <Link href="/" className="v3-header-brand">
            <LogoBlock page={page} />
          </Link>

          <nav className="v3-header-links v3-header-links-compact flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <div className="v3-mega-trigger">
              <Link href="/catalog" className="v3-header-link">
                Servicii
              </Link>
              <div className="v3-mega-menu">
                <div className="v3-mega-column">
                  <div className="v3-mega-title">Domenii servicii</div>
                  {publicDomainTree.map((domain) => (
                    <div key={domain.id} className="v3-mega-group">
                      <strong>{domain.label}</strong>
                      <div className="v3-mega-list">
                        {domain.children?.map((category) => (
                          <Link key={category.id} href={`/catalog?category=${category.id}`}>
                            {category.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="v3-mega-column v3-mega-highlight">
                  <div className="v3-mega-title">Acces rapid</div>
                  <Link href="/catalog">Catalog servicii</Link>
                  <Link href="/catalog?domain=constructii">Constructii & Instalatii</Link>
                  <Link href="/catalog?domain=electrice-iluminat">Electrice & Iluminat</Link>
                  <Link href="/catalog?resource_type=EQUIPMENT">Utilaje (rental)</Link>
                </div>
                <div className="v3-mega-column v3-mega-column-compact">
                  <div className="v3-mega-title">Servicii cheie</div>
                  {publicServiceCatalog.slice(0, 6).map((service) => (
                    <Link key={service.slug} href={`/services/${service.slug}`} className="v3-mega-link-strong">
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="v3-mega-trigger">
              <Link href="/materials" className="v3-header-link">
                Materiale
              </Link>
              <div className="v3-mega-menu">
                <div className="v3-mega-column">
                  <div className="v3-mega-title">Catalog materiale</div>
                  {publicDomainTree.map((domain) => (
                    <div key={domain.id} className="v3-mega-group">
                      <strong>{domain.label}</strong>
                      <div className="v3-mega-list">
                        {domain.children?.map((category) => (
                          <Link key={category.id} href={`/materials?category=${category.id}`}>
                            {category.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="v3-mega-column v3-mega-highlight">
                  <div className="v3-mega-title">Marketplace</div>
                  <Link href="/materials">Catalog materiale</Link>
                  <Link href="/materials?category=consumabile-termice">Consumabile</Link>
                  <Link href="/materials?category=usi-ferestre">Usi & Ferestre</Link>
                  <Link href="/materials?category=hvac-instalatii-termice">HVAC</Link>
                </div>
                <div className="v3-mega-column v3-mega-column-compact">
                  <div className="v3-mega-title">Pivot Material → Serviciu</div>
                  {Object.values(publicMaterialPivotMap).map((item) => (
                    <div key={item.label} className="v3-mega-pivot-card">
                      <strong>{item.label}</strong>
                      <div className="v3-mega-pivot-actions">
                        {item.actions.map((action) => (
                          <span key={action} className="v3-mega-chip">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/about" className="v3-header-link">
              About
            </Link>
            <Link href="/contact" className="v3-header-link">
              Contact
            </Link>
          </nav>

          <div className="v3-header-search w-full lg:w-auto">
            <div className="v3-market-searchbar v3-market-searchbar-compact v3-market-searchbar-clean">
              <span className="v3-market-search-filter">Cauta</span>
              <input
                className="v3-market-search-input"
                placeholder={page.content.header?.searchPlaceholder ?? "Cauta servicii, materiale sau cod deviz"}
                aria-label="Cauta servicii"
              />
              <button type="button" className="v3-market-search-action">
                Cauta
              </button>
            </div>
          </div>

          <div className="v3-header-actions v3-header-actions-clean flex flex-wrap gap-3 lg:flex-nowrap lg:justify-end">
            <Link href="/partners/join" className="v3-ghost-chip">
              Devino Partener
            </Link>
            <Link href="/investors" className="v3-ghost-chip">
              Devino Investitor
            </Link>
            <Link href="/cos" className="v3-header-cart-chip v3-header-cart-compact">
              <strong>Cos</strong>
            </Link>
            <Link href="/account" className="v3-ai-chip v3-ai-chip-header v3-ai-chip-compact">
              <span className="v3-ai-icon" aria-hidden />
              AI Darrin
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function PublicFooter({ page }: { page: HomepageContent }) {
  const footerGroups = buildFooterGroups(page);
  const linkGroups = [
    { title: "Linkuri Utile", links: footerGroups[0]?.links ?? [] },
    { title: "Legal & Termeni", links: footerGroups[1]?.links ?? [] },
    { title: "Suport & Contact", links: footerGroups[2]?.links ?? [] },
    {
      title: "Social Media & Aplicatii mobile",
      links: [
        { label: "Facebook", href: "/contact" },
        { label: "LinkedIn", href: "/contact" },
        { label: "App Store", href: "/contact" },
        { label: "Google Play", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="v3-footer v3-footer-horizontal">
      <div className="v3-footer-inner">
        <div className="v3-footer-top-row flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <LogoBlock page={page} inverse />
          <div className="v3-footer-top-actions flex flex-wrap gap-3 md:justify-end">
            <span className="v3-language-chip">RO | EN</span>
            <Link href="/contact" className="v3-footer-cta">
              Suport rapid
            </Link>
            <Link href="/account" className="v3-ai-chip">
              <span className="v3-ai-icon" aria-hidden />
              AI Darrin
            </Link>
          </div>
        </div>

        <div className="v3-footer-groups-horizontal grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {linkGroups.map((group) => (
            <div key={group.title} className="v3-footer-group">
              <div className="v3-footer-title">{group.title}</div>
              <div className="v3-footer-inline-links v3-footer-inline-links-horizontal">
                {group.links.map((link) =>
                  link.href.startsWith("http") ? (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="v3-footer-meta grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:gap-4">
        <div>Home Best Pal SRL | Bucuresti, Romania | contact@mydarrin.com | +40 700 000 000</div>
        <div>{page.content.meta?.domain ?? "mydarrin.homebestpal.com"}</div>
      </div>
      <div className="v3-footer-bottom">
        <VisualEditableText
          slug="homepage"
          path="footer.copyright"
          value={page.content.footer?.copyright ?? "Copyright My Darrin | Operated by Home Best Pal"}
          as="div"
        />
      </div>
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
      className={`${inter.className} v3-page overflow-x-hidden`}
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
      <GeoRestrictionGate />
      <PublicHeader page={page} />
      <section className="v3-content-shell px-4 sm:px-6 lg:px-10">{children}</section>
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

function AccountEntryCard({
  title,
  description,
  loginHref,
  registerHref,
  footerNote,
  eyebrow = "Conturi profesionale",
}: {
  title: string;
  description: string;
  loginHref: string;
  registerHref: string;
  footerNote?: string;
  eyebrow?: string;
}) {
  return (
    <div className="v3-entry-card">
      <div className="v3-card-kicker">{eyebrow}</div>
      <div className="v3-entry-card-title">{title}</div>
      <p className="v3-muted-copy">{description}</p>
      <div className="v3-entry-card-actions">
        <Link href={loginHref} className="v3-primary-button">
          Autentifica-te
        </Link>
        <Link href={registerHref} className="v3-dark-button">
          Creeaza cont
        </Link>
      </div>
      {footerNote ? <div className="v3-inline-note">{footerNote}</div> : null}
    </div>
  );
}

function RoleAccessPanel({
  title,
  description,
  loginHref,
  registerHref,
  footerNote,
}: {
  title: string;
  description: string;
  loginHref: string;
  registerHref: string;
  footerNote?: string;
}) {
  return (
    <div className="v3-role-access">
      <div>
        <div className="v3-card-kicker">Acces cont</div>
        <h2 className="v3-section-title">{title}</h2>
        <p className="v3-page-description">{description}</p>
        {footerNote ? <div className="v3-inline-note v3-inline-note-soft">{footerNote}</div> : null}
      </div>
      <div className="v3-role-access-actions">
        <Link href={loginHref} className="v3-primary-button">
          Autentifica-te
        </Link>
        <Link href={registerHref} className="v3-dark-button">
          Creeaza cont
        </Link>
      </div>
    </div>
  );
}

function AccountDashboardShell({
  page,
  roleLabel,
  title,
  description,
  sidebar,
  headerStats,
  children,
  action,
  statusNote,
}: {
  page: HomepageContent;
  roleLabel: string;
  title: string;
  description: string;
  sidebar: AccountSidebarSection[];
  headerStats: Array<{ label: string; value: string; hint?: string }>;
  children: ReactNode;
  action?: ReactNode;
  statusNote?: { title: string; description: string };
}) {
  return (
    <PublicShell page={page}>
      {statusNote ? (
        <section className="v3-panel-card v3-panel-card-soft">
          <div className="v3-inline-note v3-inline-note-soft">
            <strong>{statusNote.title}</strong>
            <span>{statusNote.description}</span>
          </div>
        </section>
      ) : null}
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">{roleLabel}</div>
            <h1 className="v3-page-title">{title}</h1>
            <p className="v3-page-description">{description}</p>
          </div>
          {action}
        </div>
        <div className="v3-account-stats">
          {headerStats.map((stat) => (
            <div key={stat.label} className="v3-account-stat-card">
              <div className="v3-account-stat-label">{stat.label}</div>
              <div className="v3-account-stat-value">{stat.value}</div>
              {stat.hint ? <div className="v3-account-stat-hint">{stat.hint}</div> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="v3-account-shell grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="v3-account-sidebar">
          {sidebar.map((section) => (
            <div key={section.title} className="v3-account-sidebar-section">
              <div className="v3-account-sidebar-title">{section.title}</div>
              <div className="v3-account-sidebar-items">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href} className="v3-account-sidebar-link">
                    <span>{item.label}</span>
                    {item.meta ? <span className="v3-account-sidebar-meta">{item.meta}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <div className="v3-account-main">{children}</div>
      </section>
    </PublicShell>
  );
}

export function PublicHomepage({
  page,
  roleHint,
  catalogServices,
  liveUserEmail,
}: {
  page: HomepageContent;
  roleHint?: string;
  catalogServices?: PublicCatalogServiceCard[];
  liveUserEmail?: string;
}) {
  const content = page.content;
  const services = buildHomepageServices(page);
  const heroImageUrl = content.mediaLibrary?.heroImageUrl;
  const heroSlidesInput = Array.isArray((content as any).heroSlides) ? ((content as any).heroSlides as Array<Record<string, unknown>>) : [];
  const heroSlides = heroSlidesInput.length
    ? heroSlidesInput.map((slide, idx) => ({
        id: String(slide.id ?? `slide-${idx + 1}`),
        title: String(slide.title ?? `Slide ${idx + 1}`),
        description: String(slide.description ?? ""),
        accent: (slide.accent as "orange" | "navy" | "green") ?? (["orange", "navy", "green"][idx % 3] as "orange" | "navy" | "green"),
        mediaUrl: typeof slide.mediaUrl === "string" ? slide.mediaUrl : undefined,
        mediaType: (slide.mediaType as "IMAGE" | "VIDEO" | "BANNER") ?? "IMAGE",
      }))
    : undefined;
  const howItWorksSteps = content.howItWorks?.length
    ? content.howItWorks
    : [
        "Descrii / Alegi",
        "Primesti / selectezi serviciul si nivelele aferente",
        "Primesti deviz",
        "Sunt alocati actorii (furnizor serviciu, materiale optional, utilaje optional, transport optional, polita de asigurare optional)",
        "Executie",
        "Plata securizata + garantie",
      ];
  const slogan = content.branding?.slogan ?? "Structura marketplace aprobata";
  const detectedRole = (roleHint ?? "CLIENT").toUpperCase() as "CLIENT" | "INVESTOR" | "PARTNER";
  const heroCopy = {
    CLIENT: {
      headline: "Servicii locale in 15 minute, cu echipe verificate si preturi standardizate.",
      subheadline:
        "Experienta client ramane cea mai rapida: selectezi serviciul, primesti deviz, vezi statusul live si platesti securizat.",
      primaryCta: "Solicita deviz",
      secondaryCta: "Vezi catalog",
    },
    INVESTOR: {
      headline: "Investitii in infrastructura tech + executie operationala verificata.",
      subheadline:
        "Urmareste rundele SEED active, cvorumul live si evolutia proiectelor in timp real, direct din dashboardul public.",
      primaryCta: "Investește în Tech",
      secondaryCta: "Vezi indicatorii",
    },
    PARTNER: {
      headline: "Devino partener verificat si acceseaza proiecte cu plata securizata.",
      subheadline:
        "Onboardingul de partener include documente obligatorii, validare operationala si acces la comenzi live.",
      primaryCta: "Devino Partener",
      secondaryCta: "Incarca documente",
    },
  }[detectedRole];
  const heroHeadline = content.hero?.headline ?? heroCopy.headline;
  const heroSubheadline = content.hero?.subheadline ?? heroCopy.subheadline;

  return (
    <PublicShell page={page}>
      {liveUserEmail ? (
        <section className="v3-live-banner">
          <div className="v3-live-banner-card">
            <div className="v3-live-pill">Live</div>
            <div>
              <strong>Cont activ.</strong> Esti live inregistrat ca {liveUserEmail}.
            </div>
          </div>
        </section>
      ) : null}

      <HeroSlider slides={heroSlides} fullWidth />

      <section className="v3-marketplace-stage">
        <article className="v3-marketplace-notice">
          <div className="v3-card-kicker">{slogan}</div>
          <h2 className="v3-marketplace-notice-title">{heroHeadline}</h2>
          <p className="v3-muted-copy">
            {heroSubheadline}
          </p>
          <div className="v3-marketplace-notice-actions">
            <Link href="/catalog" className="v3-ghost-chip">
              {heroCopy.secondaryCta}
            </Link>
            <Link href={detectedRole === "PARTNER" ? "/partners/join" : "/account/create"} className="v3-primary-button">
              {heroCopy.primaryCta}
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

      <section className="v3-cta-strip">
        <Link href="/partners/join" className="v3-primary-button">
          Devino Partener
        </Link>
        <Link href="/investors" className="v3-dark-button">
          Investește în Tech
        </Link>
        <Link href="/catalog" className="v3-ghost-chip">
          Solicită Deviz
        </Link>
      </section>

      <div className="v3-grid-layout grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        <PublicSidebar catalogServices={catalogServices} />

        <div className="v3-page-stack">
          <section className="v3-panel-card">
            <div className="v3-hero-grid grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
              <div className="v3-hero-copy">
                <div className="v3-pill-row">
                  <Pill tone="orange">Glovo inspired</Pill>
                  <Pill tone="green">Darrin AI</Pill>
                  <Pill>[{content.hero?.mediaType ?? "VIDEO HERO"}]</Pill>
                </div>
                <div className="v3-eyebrow">Servicii la cerere, fara frictiune</div>
                <VisualEditableText slug="homepage" path="hero.headline" value={heroHeadline} as="h1" className="v3-hero-title" />
                <VisualEditableText
                  slug="homepage"
                  path="hero.subheadline"
                  value={heroSubheadline}
                  as="p"
                  multiline
                  className="v3-hero-description"
                />

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
                      <PriceLockup
                        price={resolveServicePrice(getPublicServiceBySlug("reparat-calorifer") ?? publicServiceCatalog[0])}
                        compact
                      />
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
              <Link href="/how-it-works" className="v3-howitworks-tab">
                Deschide modul Cum functioneaza
              </Link>
              <div className="v3-step-list">
                {howItWorksSteps.map((step, index) => (
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
                {(content.benefits ?? []).map((benefit, index) => (
                  <div key={`${benefit}-${index}`} className="v3-benefit-card">
                    <VisualEditableText slug="homepage" path={`benefits.${index}`} value={benefit} as="div" />
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
  catalogServices,
  taxonomyBySlug = {},
  dynamicPriceBySlug = {},
  syncManifest,
  targetAddress,
  placeId,
  catalogMetaBySlug = {},
  activeFilters,
}: {
  page: HomepageContent;
  catalogServices?: PublicCatalogServiceCard[];
  taxonomyBySlug?: Record<string, PublicServiceTaxonomy | null>;
  dynamicPriceBySlug?: Record<string, PublicCatalogPrice | null>;
  syncManifest?: PublicSyncManifest | null;
  targetAddress?: string;
  placeId?: string;
  catalogMetaBySlug?: Record<string, PublicCatalogServiceCard | undefined>;
  activeFilters?: {
    domain: string | null;
    category: string | null;
    subcategory: string | null;
    resourceTypes: string[];
    equipmentTypes: string[];
    brands: string[];
  };
}) {
  const catalogCards = (catalogServices ?? Object.values(catalogMetaBySlug)).filter(
    (card): card is PublicCatalogServiceCard => Boolean(card),
  );
  const cardBySlug = new Map(catalogCards.map((card) => [card.slug, card]));
  const mergedCatalogServices = catalogCards.map((card, index) => {
    const staticService = publicServiceCatalog.find((service) => service.slug === card.slug);
    return staticService ? mergeServiceWithCard(staticService, card, index) : buildServiceFromCatalogCard(card, index);
  });
  const fallbackServices: ResolvedServiceRecord[] = publicServiceCatalog
    .filter((service) => !cardBySlug.has(service.slug))
    .map((service) => ({ ...service }));
  const catalogServicesResolved: ResolvedServiceRecord[] = [...mergedCatalogServices, ...fallbackServices];
  const pricePulseKey = placeId ?? targetAddress ?? null;
  const catalogHeadline = page.content.hero?.headline ?? "Catalogul public include acum si zona de materiale speciale pentru betoane";
  const catalogSubheadline =
    page.content.hero?.subheadline ??
    "Cardurile, filtrele, CTA-urile si ierarhia de informatie urmeaza acelasi limbaj vizual din `homepage-preview-v2`, cu focus pe claritate, conversie si sincronizare vizibila din Backoffice. Toate serviciile, inclusiv `materiale si betoane`, apar aici ca anunturi/carduri comerciale, iar configurarea detaliata se face exclusiv pe pagina dedicata serviciului.";

  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Catalog servicii</div>
            <VisualEditableText slug="catalog" path="hero.headline" value={catalogHeadline} as="h1" className="v3-page-title" />
            <VisualEditableText
              slug="catalog"
              path="hero.subheadline"
              value={catalogSubheadline}
              as="p"
              multiline
              className="v3-page-description"
            />
            {syncManifest ? (
              <p className="v3-inline-note">Versiune config: {syncManifest.content_version}</p>
            ) : null}
            <GeoAddressAutocomplete
              helperText="Selecteaza adresa exacta pentru a recalcula instant preturile principale din catalog."
              pulseTargetId="catalog"
            />
          </div>
          <div className="v3-page-hero-side">
            <div className="v3-page-hero-chip">Filtre</div>
            <div className="v3-page-hero-chip">Sortare</div>
            <div className="v3-page-hero-chip">Rating</div>
            <div className="v3-page-hero-chip">Pret de pornire</div>
          </div>
        </div>
      </section>

      <div className="v3-grid-layout v3-grid-layout-tight">
        <PublicSidebar catalogServices={catalogCards} />
        <div className="v3-page-stack">
          <section className="v3-section-card v3-catalog-section">
            <div className="v3-catalog-layout">
              <CatalogTree />
              <div>
                <div className="v3-filter-bar">
          {[
            { label: "Constructii", value: "constructii" },
            { label: "Energie Verde", value: "energie-verde" },
            { label: "Logistica", value: "logistica" },
            { label: "Agricultura", value: "agricultura" },
          ].map((item) => (
            <Link
              key={item.value}
              href={`/catalog?domain=${item.value}`}
              className={`v3-filter-chip ${activeFilters?.domain === item.value ? "v3-filter-chip-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
                </div>

                <div className="v3-filter-bar v3-filter-bar-secondary">
          {[
            { label: "Excavatoare", value: "excavator" },
            { label: "Compactoare", value: "compactor" },
            { label: "Materiale", value: "material" },
          ].map((item) => (
            <Link
              key={item.value}
              href={`/catalog?equipment_type=${item.value}`}
              className={`v3-filter-chip ${activeFilters?.equipmentTypes?.includes(item.value) ? "v3-filter-chip-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
                </div>

                <div className="v3-catalog-grid">
          {catalogServicesResolved.map((service, index) => {
            const catalogMeta = catalogMetaBySlug[service.slug];
            const resolvedPrice = resolveServicePrice(service, dynamicPriceBySlug[service.slug]);
            const deliveryBadge = resolveDeliveryBadge(service, dynamicPriceBySlug[service.slug]);
            const availabilityWarning = getAvailabilityWarning(dynamicPriceBySlug[service.slug]);
            const highlightedOffer = service.specialCatalog?.offers[0];
            const rateCard = catalogMeta?.rate_card;
            const rateCardLabel = rateCard ? `${formatPriceAmount(rateCard.base_price)} ${rateCard.currency} / unit` : null;

            const mediaAssets = service.media
              ? {
                  images: service.media.images ?? [],
                  videos: service.media.videos ?? [],
                  documents: service.media.documents ?? [],
                }
              : normalizeMediaAssets(catalogMeta);
            const hasImage = (mediaAssets.images ?? []).length > 0;
            return (
            <article key={service.slug} className="v3-catalog-card">
              <div className={`v3-catalog-media ${accentClass(service.accent)}`}>
                {hasImage ? (
                  <Image
                    src={mediaAssets.images?.[0] ?? ""}
                    alt={service.title}
                    className="v3-media-image"
                    width={520}
                    height={360}
                  />
                ) : null}
                {hasImage ? <span className="v3-media-overlay" /> : null}
                <Pill>{service.mediaType}</Pill>
                <span className="v3-rating-badge">AIPL {service.rating}</span>
              </div>
              <div className="v3-catalog-content">
                <div className="v3-catalog-category">{service.category}</div>
                {catalogMeta?.domain ? <div className="v3-inline-note">Domeniu master: {catalogMeta.domain}</div> : null}
                {service.objectLabel ? <div className="v3-inline-note">Obiect: {service.objectLabel} / {service.interventionType}</div> : null}
                <div className="v3-service-title">{service.title}</div>
                <p>{service.summary}</p>
                <div className="v3-service-badges">
                  {deliveryBadge ? <span className="v3-mini-badge v3-mini-badge-accent">{deliveryBadge}</span> : null}
                  {highlightedOffer ? <span className="v3-mini-badge">{formatMaterialCardTitle(highlightedOffer.clasa)}</span> : null}
                  {service.badges.map((badge) => (
                    <span key={badge} className="v3-mini-badge">
                      {badge}
                    </span>
                  ))}
                  {catalogMeta?.equipment_types?.length ? (
                    <span className="v3-mini-badge v3-mini-badge-soft">{catalogMeta.equipment_types[0]}</span>
                  ) : null}
                  {catalogMeta?.brands?.length ? (
                    <span className="v3-mini-badge v3-mini-badge-soft">{catalogMeta.brands[0]}</span>
                  ) : null}
                </div>
                <div className="v3-tier-summary">
                  <span>Bronz: manopera standard</span>
                  <span>Argint: transport + manipulare</span>
                  <span>Aur: utilaj rental</span>
                  <span>Platina: garantie + mentenanta 2 ani</span>
                </div>
                {availabilityWarning ? <div className="v3-warning-note">{availabilityWarning}</div> : null}
                {catalogMeta?.availability_status ? (
                  <div className="v3-inline-note">Disponibilitate flota: {catalogMeta.availability_status}</div>
                ) : null}
                {rateCardLabel ? <div className="v3-inline-note">Rate-card: {rateCardLabel}</div> : null}
                {catalogMeta?.object_kind ? (
                  <div className="v3-inline-note">Tip obiect: {catalogMeta.object_kind}</div>
                ) : null}
                {catalogMeta?.pivot_actions?.length ? (
                  <div className="v3-inline-note">Actiuni sugerate: {catalogMeta.pivot_actions.join(", ")}</div>
                ) : null}
                <div className="v3-service-meta">
                  <PriceLockup price={resolvedPrice} compact pulseKey={pricePulseKey ? `${service.slug}:${pricePulseKey}` : null} />
                  <Link href={`/services/${service.slug}`} className="v3-dark-button">
                    Vezi detalii
                  </Link>
                </div>
              </div>
            </article>
          )})}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}

export function PublicMaterialsPage({
  page,
  categories,
  materials,
  activeCategory,
  activeSubcategory,
}: {
  page: HomepageContent;
  categories: PublicCatalogCategoryListResponse | null;
  materials: PublicCatalogServiceCard[];
  activeCategory: string | null;
  activeSubcategory: string | null;
}) {
  const groups = categories?.items ?? [];
  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Marketplace materiale</div>
            <h1 className="v3-page-title">Materiale & consumabile gestionate de provideri aprobati</h1>
            <p className="v3-page-description">
              Lista de materiale este administrata de provideri de bricolaj sau integrari IP aprobate de SuperAdmin. Selectia
              materialelor poate declansa automat fluxuri de servicii in My Darrin.
            </p>
          </div>
        </div>
      </section>

      <div className="v3-grid-layout v3-grid-layout-tight">
        <PublicSidebar />
        <div className="v3-page-stack">
          <section className="v3-section-card v3-catalog-section">
            <div className="v3-catalog-layout">
              <aside className="v3-catalog-tree">
                <div className="v3-tree-title">Categorii materiale</div>
                <div className="v3-tree-list">
                  {groups.map((group) => (
                    <div key={group.category_slug} className="v3-tree-node v3-tree-node-level-1">
                      <Link
                        href={`/materials?category=${group.category_slug}`}
                        className={`v3-tree-button ${activeCategory === group.category_slug ? "v3-tree-button-active" : ""}`}
                      >
                        <span>{group.category}</span>
                        <span className="v3-tree-caret">›</span>
                      </Link>
                      <div className="v3-tree-children">
                        {group.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.slug}
                            href={`/materials?category=${group.category_slug}&subcategory=${subcategory.slug}`}
                            className={`v3-tree-button v3-tree-node-level-2 ${activeSubcategory === subcategory.slug ? "v3-tree-button-active" : ""}`}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <div>
                <div className="v3-catalog-grid">
                  {materials.map((item) => {
                    const slug = item.slug.toLowerCase();
                    const pivotKey =
                      publicMaterialPivotMap[slug] ? slug :
                      slug.includes("ciment") || slug.includes("silicon") || slug.includes("glet") ? "consumabile-termice" :
                      null;
                    const pivot = pivotKey ? publicMaterialPivotMap[pivotKey] : null;
                    const isConsumable = pivot?.kind === "CONSUMABLE" || pivot?.purchaseOnly;
                    return (
                    <article key={item.slug} className="v3-catalog-card">
                      <div className="v3-catalog-media v3-service-accent-navy">
                        <Pill>MATERIAL</Pill>
                      </div>
                      <div className="v3-catalog-content">
                        <div className="v3-catalog-category">{item.category ?? "Material"}</div>
                        <div className="v3-service-title">{item.name}</div>
                        <p>{item.description ?? "Material disponibil prin marketplace."}</p>
                        {item.pivot_actions?.length ? (
                          <div className="v3-inline-note">Actiuni sugerate: {item.pivot_actions.join(", ")}</div>
                        ) : null}
                        <div className="v3-service-meta">
                          <Link href={`/materials/${item.slug}`} className="v3-dark-button">
                            Vezi detalii
                          </Link>
                          <Link href={isConsumable ? "/finalizare-proiect" : "/catalog"} className="v3-primary-button">
                            {isConsumable ? "Cumpara" : "Solicita serviciu"}
                          </Link>
                        </div>
                      </div>
                    </article>
                  )})}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </PublicShell>
  );
}

export function PublicMaterialDetailPage({
  page,
  material,
  specs,
}: {
  page: HomepageContent;
  material: PublicCatalogServiceCard | null;
  specs: PublicServiceTechnicalSpecs | null;
}) {
  if (!material) {
    return (
      <PublicShell page={page}>
        <section className="v3-section-card">
          <h1 className="v3-page-title">Material indisponibil</h1>
        </section>
      </PublicShell>
    );
  }

  const resolvePivotKey = () => {
    const slug = material.slug.toLowerCase();
    if (publicMaterialPivotMap[slug]) return slug;
    if (slug.includes("aluminiu")) return "calorifer-aluminiu";
    if (slug.includes("calorifer") || slug.includes("radiator")) return "radiatoare";
    if (slug.includes("centrala")) return "centrale-peletti";
    if (slug.includes("aer") || slug.includes("ac")) return "aer-conditionat";
    if (slug.includes("parchet") || slug.includes("gresie")) return "parchet-gresie";
    if (slug.includes("sanitar") || slug.includes("wc") || slug.includes("chiuveta")) return "obiecte-sanitare";
    if (slug.includes("usa")) return "usi-interior";
    if (slug.includes("ciment") || slug.includes("silicon") || slug.includes("glet")) return "consumabile-termice";
    return null;
  };

  const pivotKey = resolvePivotKey();
  const pivot = pivotKey ? publicMaterialPivotMap[pivotKey] : null;
  const minLevel =
    pivot?.constraints?.minLevel ??
    ((pivot?.constraints?.weightKg ?? 0) > 100 || (pivot?.constraints?.heightM ?? 0) > 3 ? "AUR" : null);
  const requiresRental = Boolean(pivot?.constraints?.requiresRental);
  const isConsumable = pivot?.kind === "CONSUMABLE" || pivot?.purchaseOnly;
  const actions = isConsumable ? ["Cumpara"] : pivot?.actions ?? ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"];

  const associatedServices = publicServiceCatalog.filter((service) => {
    if (!pivot) return false;
    const label = pivot.label.toLowerCase();
    return service.objectLabel?.toLowerCase().includes(label.split(" ")[0]);
  });

  const fallbackServices = associatedServices.length ? associatedServices : publicServiceCatalog.slice(0, 3);

  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Material</div>
            <h1 className="v3-page-title">{material.name}</h1>
            <p className="v3-page-description">{material.description ?? "Fisa material."}</p>
            {pivot ? (
              <div className="v3-inline-note">
                Pivot: {pivot.label}. Actiuni: {actions.join(", ")}.
              </div>
            ) : null}
            {minLevel || requiresRental ? (
              <div className="v3-inline-note">
                {minLevel ? `Nivel minim auto-selectat: ${minLevel}. ` : ""}
                {requiresRental ? "Necesita utilaj rental (ex: nacela / transpalet)." : ""}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="v3-section-card">
        <div className="v3-eyebrow">Actiuni disponibile</div>
        <h2 className="v3-section-title">Material → Serviciu → Utilaj</h2>
        <div className="v3-pivot-actions">
          {actions.map((action) => (
            <span key={action} className="v3-mini-badge v3-mini-badge-soft">
              {action}
            </span>
          ))}
        </div>
        <div className="v3-tier-summary">
          <span>Nivel selectat: {minLevel ?? "BRONZ"}</span>
          <span>Bronz: manopera standard</span>
          <span>Argint: transport + manipulare</span>
          <span>Aur: utilaj rental</span>
          <span>Platina: garantie + mentenanta 2 ani</span>
        </div>
        {isConsumable ? (
          <div className="v3-inline-note">
            Consumabil detectat: mentenanta si reparatia sunt dezactivate. Ramane doar fluxul de cumparare.
          </div>
        ) : null}
      </section>

      <section className="v3-section-card v3-section-card-soft">
        <div className="v3-eyebrow">Servicii asociate</div>
        <h2 className="v3-section-title">Fluxuri My Darrin recomandate pentru acest material</h2>
        <div className="v3-catalog-grid">
          {fallbackServices.map((service) => (
            <article key={service.slug} className="v3-catalog-card">
              <div className={`v3-catalog-media ${accentClass(service.accent)}`}>
                <Pill>{service.mediaType}</Pill>
                <span className="v3-rating-badge">{service.rating}</span>
              </div>
              <div className="v3-catalog-content">
                <div className="v3-catalog-category">{service.category}</div>
                <div className="v3-service-title">{service.title}</div>
                <p>{service.summary}</p>
                <div className="v3-service-meta">
                  <Link href={`/services/${service.slug}`} className="v3-dark-button">
                    Vezi serviciu
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="v3-section-card">
        <div className="v3-technical-grid">
          {(specs?.items ?? []).map((item) => (
            <div key={item.resource_id} className="v3-technical-card">
              <div className="v3-card-kicker">{item.resource_type}</div>
              <strong>{item.resource_name}</strong>
              <div className="v3-technical-list">
                {Object.entries(item.technical_specs ?? {}).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="v3-technical-row">
                    <span>{key}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
  targetAddress,
  placeId,
  technicalSpecs,
  catalogService,
}: {
  page: HomepageContent;
  slug: string;
  taxonomy?: PublicServiceTaxonomy | null;
  dynamicPrice?: PublicCatalogPrice | null;
  syncManifest?: PublicSyncManifest | null;
  targetAddress?: string;
  placeId?: string;
  technicalSpecs?: PublicServiceTechnicalSpecs | null;
  catalogService?: PublicCatalogServiceCard | null;
}) {
  const staticService = getPublicServiceBySlug(slug);
  const service = catalogService
    ? staticService
      ? mergeServiceWithCard(staticService, catalogService, 0)
      : buildServiceFromCatalogCard(catalogService, 0)
    : staticService;

  if (!service) {
    notFound();
  }

  const mediaAssets = service.media
    ? {
        images: service.media.images ?? [],
        videos: service.media.videos ?? [],
        documents: service.media.documents ?? [],
      }
    : normalizeMediaAssets(catalogService);
  const heroMedia = (mediaAssets.videos ?? [])[0] ?? (mediaAssets.images ?? [])[0] ?? null;
  const heroMediaType =
    (mediaAssets.videos ?? []).length > 0 ? "video" : (mediaAssets.images ?? []).length > 0 ? "image" : null;

  const classifications = resolveServiceClassifications(service, taxonomy);
  const resolvedPrice = resolveServicePrice(service, dynamicPrice);
  const deliveryBadge = resolveDeliveryBadge(service, dynamicPrice);
  const availabilityWarning = getAvailabilityWarning(dynamicPrice);
  const pricePulseKey = placeId ?? targetAddress ?? null;
  const activeIntervention =
    service.availableInterventions?.find((item) => item.label === service.interventionType) ?? service.availableInterventions?.[0];
    const checkoutHref = `/finalizare-proiect?slug=${encodeURIComponent(slug)}${
      activeIntervention?.label ? `&intervention=${encodeURIComponent(activeIntervention.label)}` : ""
    }${targetAddress ? `&target_address=${encodeURIComponent(targetAddress)}` : ""}${placeId ? `&place_id=${encodeURIComponent(placeId)}` : ""}&escrow_note=${encodeURIComponent("5%")}`;
    const cartHref = `/cos?slug=${encodeURIComponent(slug)}${targetAddress ? `&target_address=${encodeURIComponent(targetAddress)}` : ""}${placeId ? `&place_id=${encodeURIComponent(placeId)}` : ""}`;
  const contentBlocks =
    typeof catalogService?.level_attachments?.content_blocks === "object"
      ? (catalogService?.level_attachments?.content_blocks as Record<string, string>)
      : {};
  const serviceHeadline = contentBlocks.hero_headline || page.content.hero?.headline || service.title;
  const serviceSubheadline = contentBlocks.hero_subheadline || page.content.hero?.subheadline || service.description;
  const serviceBenefits = page.content.benefits?.length ? page.content.benefits : service.benefits?.length ? service.benefits : DEFAULT_SERVICE_BENEFITS;
  const baseTiers =
    page.content.serviceTiers?.length
      ? page.content.serviceTiers
      : [
          {
            tierKey: "bronze" as const,
            title: "Bronz",
            marginMultiplier: 0,
            benefitsMarkdown: "- Manopera standard\n- Evaluare rapida\n- Pret controlat",
          },
          {
            tierKey: "silver" as const,
            title: "Argint",
            marginMultiplier: 6,
            benefitsMarkdown: "- Bronz + Transport\n- Manipulare inclusa\n- Coordonare standard",
          },
          {
            tierKey: "gold" as const,
            title: "Aur",
            marginMultiplier: 12,
            benefitsMarkdown: "- Argint + Utilaj rental (Nacela)\n- Echipa extinsa\n- Programare prioritara",
          },
          {
            tierKey: "platinum" as const,
            title: "Platina",
            marginMultiplier: 20,
            benefitsMarkdown: "- Aur + Garantie extinsa\n- Mentenanta 24 luni\n- Management dedicat",
          },
        ];
  const serviceTiers = baseTiers.length < 4
    ? [
        {
          tierKey: "bronze" as const,
          title: "Bronz",
          marginMultiplier: 0,
          benefitsMarkdown: "- Manopera standard\n- Evaluare rapida\n- Pret controlat",
        },
        ...baseTiers,
      ]
    : baseTiers;
  const serviceSectionsOrder = page.content.serviceSectionsOrder?.length
    ? page.content.serviceSectionsOrder
    : [
        "hero",
        "pivot",
        "tiers",
        "technicalSpecs",
        "specialCatalog",
        "pricing",
        "rideshare",
        "benefits",
        "feedback",
        "safety",
        "crossSell",
      ];
  const relatedServices = publicServiceCatalog.filter((item) => item.slug !== service.slug).slice(0, 4);
  const safetyChecklist = publicSafetyChecklist[service.slug];
  const pricingNote = contentBlocks.pricing_note;
  const safetyNote = contentBlocks.safety_note;
  const crossSellItems = publicCrossSellMap[service.slug] ?? [];
  const pivotActions =
    service.availableInterventions?.length
      ? service.availableInterventions.map((item) => ({
          label: item.label,
          href: `/services/${item.serviceSlug}`,
          detail: item.taskLabel,
          meta: `${item.skill} · ${item.requiredPeople} oameni`,
        }))
      : (catalogService?.pivot_actions ?? ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"]).map((label) => ({
          label,
          href: `/services/${service.slug}`,
          detail: "Actiune recomandata",
          meta: "Flux deviz sincronizat",
        }));

  const serviceSectionContent: Record<string, ReactNode> = {
    hero: (
      <section className="v3-panel-card" key="hero">
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
            <VisualEditableText slug="service-detail" path="hero.headline" value={serviceHeadline} as="h1" className="v3-page-title" />
            <VisualEditableText slug="service-detail" path="hero.subheadline" value={serviceSubheadline} as="p" multiline className="v3-page-description" />

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
            <GeoAddressAutocomplete
              helperText="Selecteaza adresa exacta din Google Places pentru a recalcula pretul pe coordonate GPS exacte."
              pulseTargetId={`service:${slug}`}
            />

            <div className="v3-service-detail-actions">
              <Link href={checkoutHref} className={`v3-primary-button ${dynamicPrice?.availability_status === "partial_available" ? "v3-primary-button-warning" : ""}`}>
                {dynamicPrice?.availability_status === "partial_available" ? "Comanda cu verificare" : "Continua spre checkout"}
              </Link>
                <Link href={cartHref} className="v3-dark-button">
                  Adauga in cos
                </Link>
            </div>
            {pricingNote ? <div className="v3-inline-note">{pricingNote}</div> : null}
            {deliveryBadge ? <div className="v3-inline-note">{deliveryBadge}</div> : null}
            {availabilityWarning ? <div className="v3-warning-note">{availabilityWarning}</div> : null}
            {service.objectLabel ? (
              <div className="v3-object-recursion-card">
                <div className="v3-card-kicker">Pivot Material {"->"} Serviciu</div>
                <div className="v3-object-recursion-title">{service.objectLabel}</div>
                <div className="v3-object-recursion-grid">
                  {pivotActions.map((action) => (
                    <Link key={action.label} href={action.href} className="v3-object-recursion-item">
                      <strong>{action.label}</strong>
                      <span>{action.detail}</span>
                      <span>{action.meta}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className={`v3-detail-media ${accentClass(service.accent)}`}>
            {heroMedia ? (
              heroMediaType === "video" ? (
                <video className="v3-media-frame" src={heroMedia} controls />
              ) : (
                <Image className="v3-media-frame" src={heroMedia} alt={service.title} width={720} height={480} />
              )
            ) : (
              <div className="v3-detail-media-label">[{service.mediaType}] Galerie media configurata din Backoffice</div>
            )}
            <PriceLockup price={resolvedPrice} center pulseKey={pricePulseKey ? `${slug}:${pricePulseKey}` : null} />
            {(mediaAssets.documents ?? []).length ? (
              <div className="v3-document-list">
                {(mediaAssets.documents ?? []).slice(0, 3).map((doc) => (
                  <a key={doc} href={doc} target="_blank" rel="noreferrer" className="v3-document-chip">
                    {doc.split("/").pop()}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        </section>
      ),
    pivot: (
      <article className="v3-section-card v3-section-card-soft" key="pivot">
        <div className="v3-eyebrow">Pivot Material {"->"} Serviciu</div>
        <h2 className="v3-section-title">Selectezi materialul, noi activam serviciul potrivit</h2>
        <div className="v3-pivot-actions-grid">
          {pivotActions.map((action) => (
            <Link key={action.label} href={action.href} className="v3-pivot-action-card">
              <div className="v3-pivot-action-title">{action.label}</div>
              <div className="v3-pivot-action-copy">{action.detail}</div>
              <div className="v3-pivot-action-meta">{action.meta}</div>
            </Link>
          ))}
        </div>
      </article>
    ),
    pricing: (
      <article className="v3-section-card v3-section-card-soft" key="pricing">
        <div className="v3-eyebrow">Pret & disponibilitate</div>
        <h2 className="v3-section-title">Rezumatul comercial pentru serviciul selectat</h2>
        <div className="v3-inline-note">
          Formula deviz: (M+C) + (L+C) + (U+C) + T_p + T_i
        </div>
        <div className="v3-level-grid">
          <div className="v3-level-card">
            <PriceLockup price={resolvedPrice} center pulseKey={pricePulseKey ? `${slug}:pricing:${pricePulseKey}` : null} />
            {deliveryBadge ? <div className="v3-inline-note">{deliveryBadge}</div> : null}
            {availabilityWarning ? <div className="v3-warning-note">{availabilityWarning}</div> : null}
          </div>
        </div>
      </article>
    ),
    technicalSpecs: (
      <article className="v3-section-card" key="technicalSpecs">
        <div className="v3-eyebrow">Fisa tehnica</div>
        <h2 className="v3-section-title">Specificatii preluate din fisele de produs</h2>
        <div className="v3-technical-grid">
          {(technicalSpecs?.items?.length ? technicalSpecs.items : []).map((item) => (
            <div key={item.resource_id} className="v3-technical-card">
              <div className="v3-card-kicker">{item.resource_type}</div>
              <strong>{item.resource_name}</strong>
              <div className="v3-technical-table">
                {Object.entries(item.technical_specs ?? {})
                  .slice(0, 8)
                  .map(([key, value]) => (
                    <div key={key} className="v3-technical-row">
                      <span className="v3-technical-key">
                        <span className="v3-technical-icon" aria-hidden />
                        {key}
                      </span>
                      <strong>{String(value)}</strong>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          {!technicalSpecs?.items?.length ? (
            <div className="v3-technical-card v3-technical-card-empty">
              <div className="v3-card-kicker">Specificații in curs</div>
              <strong>Fișele tehnice se sincronizează din Backoffice</strong>
              <p>Vom afișa automat greutate, putere, consum si compatibilitati cand documentele sunt incarcate.</p>
            </div>
          ) : null}
        </div>
      </article>
    ),
    specialCatalog: (
      <article className="v3-section-card v3-section-card-soft" key="specialCatalog">
        <div className="v3-eyebrow">Configurator serviciu</div>
        <h2 className="v3-section-title">
          {service.specialCatalog ? "Aici clientul configureaza comanda de beton" : "Aici clientul configureaza serviciul ales"}
        </h2>
        <div className="v3-configurator-layout">
          <div className="v3-configurator-main">
            {service.specialCatalog ? (
              <>
                <div className="v3-configurator-block">
                  <div className="v3-configurator-block-title">Clasa si pachet comercial</div>
                  <div className="v3-configurator-choice-grid">
                    {service.specialCatalog.offers.map((offer) => (
                      <article key={offer.id} className="v3-configurator-choice-card">
                        <div className="v3-configurator-choice-top">
                          <span className={`v3-special-level-pill ${betonLevelClass(offer.nivel)}`}>{offer.nivel}</span>
                          {offer.optionalPompa ? <span className="v3-mini-badge">Pompa optionala</span> : null}
                        </div>
                        <strong>{formatMaterialCardTitle(offer.clasa)}</strong>
                        <span>Transport standard: {offer.cantitateTransport}</span>
                        <span>Sorturi: {offer.sorturi}</span>
                        {offer.furnizor ? <span>Furnizor: {offer.furnizor}</span> : null}
                        {offer.transportPret ? <span>Transport: {offer.transportPret}</span> : null}
                      </article>
                    ))}
                  </div>
                </div>

                <div className="v3-configurator-block">
                  <div className="v3-configurator-block-title">Date declarate pe pagina serviciului</div>
                  <div className="v3-configurator-field-grid">
                    <div className="v3-configurator-field">
                      <span>Adresa livrare</span>
                      <strong>{targetAddress ?? "Clientul declara adresa sau foloseste adresa deja selectata."}</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Cantitate</span>
                      <strong>Selector dedicat pentru volum in mc si praguri minime de comanda.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Clasa beton</span>
                      <strong>C20/25, C25/30, C30/37, C35/45 si alte clase aprobate.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Perioada de livrare</span>
                      <strong>Zi, interval orar, livrare programata sau urgenta.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Optiuni suplimentare</span>
                      <strong>Pompa, acces santier, observatii logistice si conditii speciale.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Confirmare comanda</span>
                      <strong>Recapitulare pret, nivel, furnizor si trimitere spre checkout.</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="v3-configurator-block">
                  <div className="v3-configurator-block-title">Nivelul serviciului</div>
                  <div className="v3-configurator-choice-grid">
                    {serviceTiers.map((tier, index) => (
                      <article key={tier.tierKey} className="v3-configurator-choice-card">
                        <span className="v3-mini-badge">{tier.title}</span>
                        <strong>{resolvedPrice.levels[index]?.price ?? resolvedPrice.startingPrice}</strong>
                        <span>{tier.benefitsMarkdown?.replace(/^- /gm, "").split("\n")[0] ?? "Configuratie standard."}</span>
                      </article>
                    ))}
                  </div>
                  <div className="v3-configurator-field-grid">
                    <div className="v3-configurator-field">
                      <span>Cantitate / durata</span>
                      <strong>Selector pentru unitati, ore sau zile de executie.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Solicita cu operator</span>
                      <strong>Disponibil pentru utilaje grele (ex: Autobetoniera Roman 9mc).</strong>
                    </div>
                  </div>
                </div>

                <div className="v3-configurator-block">
                  <div className="v3-configurator-block-title">Date declarate pe pagina serviciului</div>
                  <div className="v3-configurator-field-grid">
                    <div className="v3-configurator-field">
                      <span>Adresa executie</span>
                      <strong>{targetAddress ?? "Clientul confirma sau completeaza adresa de executie."}</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Tip interventie</span>
                      <strong>{activeIntervention?.label ?? service.interventionType ?? "Configurat pe pagina serviciului"}</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Nivel de serviciu</span>
                      <strong>Standard, premium sau pachet special aprobat in Backoffice.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Perioada / programare</span>
                      <strong>Data, interval, urgenta si conditiile de acces.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Detalii tehnice</span>
                      <strong>Poze, video, simptome, observatii si cerinte comerciale.</strong>
                    </div>
                    <div className="v3-configurator-field">
                      <span>Confirmare</span>
                      <strong>Recapitulare pret, garantie si trimitere clara catre checkout.</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="v3-configurator-summary">
            <div className="v3-configurator-summary-head">
              <div className="v3-eyebrow">Rezumat comanda</div>
              <PriceLockup price={resolvedPrice} pulseKey={pricePulseKey ? `${slug}:config:${pricePulseKey}` : null} />
            </div>
            <div className="v3-configurator-summary-list">
              <div>
                <span>Serviciu</span>
                <strong>{service.title}</strong>
              </div>
              <div>
                <span>Flux</span>
                <strong>{"Configurare -> recapitulare -> checkout -> executie"}</strong>
              </div>
              <div>
                <span>Adresa</span>
                <strong>{targetAddress ?? "Se completeaza sau se reconfirma aici."}</strong>
              </div>
              <div>
                <span>Model comercial</span>
                <strong>{service.specialCatalog ? "Clasa + volum + livrare" : "Nivel + interventie + programare"}</strong>
              </div>
            </div>
            <div className="v3-service-detail-actions">
              <Link href={checkoutHref} className={`v3-primary-button ${dynamicPrice?.availability_status === "partial_available" ? "v3-primary-button-warning" : ""}`}>
                Continua configurarea
              </Link>
              <Link href="/catalog" className="v3-dark-button">
                Inapoi in catalog
              </Link>
            </div>
          </aside>
        </div>
        {classifications ? (
          <div className="v3-taxonomy-grid">
            <article className="v3-taxonomy-card">
              <div className="v3-taxonomy-title">CAEN</div>
              <div className="v3-taxonomy-pills">{classifications.caen.map((item) => <span key={item} className="v3-taxonomy-pill">{item}</span>)}</div>
            </article>
            <article className="v3-taxonomy-card">
              <div className="v3-taxonomy-title">Uniclass</div>
              <div className="v3-taxonomy-pills">{classifications.uniclass.map((item) => <span key={item} className="v3-taxonomy-pill">{item}</span>)}</div>
            </article>
            <article className="v3-taxonomy-card">
              <div className="v3-taxonomy-title">ESCO</div>
              <div className="v3-taxonomy-pills">{classifications.esco.map((item) => <span key={item} className="v3-taxonomy-pill">{item}</span>)}</div>
            </article>
            <article className="v3-taxonomy-card">
              <div className="v3-taxonomy-title">Indicatori deviz</div>
              <div className="v3-taxonomy-pills">{classifications.indicators.map((item) => <span key={item} className="v3-taxonomy-pill">{item}</span>)}</div>
            </article>
          </div>
        ) : null}
      </article>
    ),
    safety: (
      <article className="v3-section-card v3-section-card-soft" key="safety">
        <div className="v3-eyebrow">Siguranta & rezilienta</div>
        <h2 className="v3-section-title">Certificari si documente obligatorii</h2>
        {safetyNote ? <p className="v3-page-description">{safetyNote}</p> : null}
        <div className="v3-benefits-grid">
          {(safetyChecklist?.certifications ?? ["eIDAS", "Asigurare malpraxis partener", "Declaratie conformitate"]).map((item) => (
            <div key={item} className="v3-benefit-card">
              {item}
            </div>
          ))}
        </div>
        {safetyChecklist?.declarationHref ? (
          <div className="v3-final-actions">
            <Link href={safetyChecklist.declarationHref} className="v3-ghost-chip">
              {safetyChecklist.declarationLabel ?? "Declaratie pe proprie raspundere"}
            </Link>
          </div>
        ) : null}
      </article>
    ),
    rideshare: (
      <article className="v3-section-card" key="rideshare">
        <div className="v3-eyebrow">Rideshare & logistica</div>
        <h2 className="v3-section-title">Optimizare transport prin rideshare</h2>
        <p className="v3-page-description">
          Grupam livrarile similare pentru a reduce costul transportului si timpul de executie. Selecteaza preferinta ta
          pentru rideshare inainte de comanda.
        </p>
        <div className="v3-benefits-grid">
          {[
            "Rute combinate pentru materiale si utilaje",
            "Scadere costuri transport",
            "Notificari automate pentru ETA",
            "Prioritizare santiere AUR / PLATINA",
          ].map((item) => (
            <div key={item} className="v3-benefit-card">
              {item}
            </div>
          ))}
        </div>
        <div className="v3-service-detail-actions">
          <button type="button" className="v3-primary-button">
            Activeaza rideshare
          </button>
          <button type="button" className="v3-dark-button">
            Pastreaza livrare standard
          </button>
        </div>
      </article>
    ),
    feedback: (
      <article className="v3-section-card" key="feedback">
        <div className="v3-eyebrow">Feedback System</div>
        <h2 className="v3-section-title">Lasa un feedback dupa executie</h2>
        <p className="v3-page-description">
          Ratingul si comentariul tau se reflecta in scorul providerului si in deciziile de alocare pentru lucrari viitoare.
        </p>
        <div className="grid gap-4 lg:grid-cols-[0.6fr_0.4fr]">
          <div className="v3-panel-card">
            <div className="v3-card-kicker">Review client</div>
            <div className="grid gap-3">
              <select className="v3-form-control">
                <option>5 - Excelent</option>
                <option>4 - Foarte bun</option>
                <option>3 - Bun</option>
                <option>2 - Acceptabil</option>
                <option>1 - Nesatisfacator</option>
              </select>
              <textarea className="v3-form-control min-h-28" placeholder="Descrie experienta ta cu serviciul..." />
              <button className="v3-primary-button" type="button">
                Trimite feedback
              </button>
            </div>
          </div>
          <div className="v3-section-card v3-section-card-soft">
            <div className="v3-card-kicker">Ultimele evaluari</div>
            <div className="v3-step-list">
              {[
                "Client - 5/5: executie rapida si curata",
                "Client - 4/5: comunicare buna, timpul de sosire usor intarziat",
                "Client - 5/5: recomand pentru mentenanta",
              ].map((item, index) => (
                <div key={item} className="v3-step-card v3-step-card-light">
                  <div className="v3-step-index">{index + 1}</div>
                  <div>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    ),
    crossSell: (
      <article className="v3-section-card" key="crossSell">
        <div className="v3-eyebrow">Cross-selling</div>
        <h2 className="v3-section-title">Materiale recomandate pentru acest serviciu</h2>
        <div className="v3-cross-sell-grid">
          {(crossSellItems.length ? crossSellItems : ["Rigips Smart 9.5mm", "SikaTop Seal-107", "Ceresit CT 17"]).map((item) => (
            <div key={item} className="v3-cross-sell-card">
              {item}
            </div>
          ))}
        </div>
      </article>
    ),
    tiers: (
      <article className="v3-section-card" key="tiers">
        <div className="v3-eyebrow">Pachete si niveluri</div>
        <h2 className="v3-section-title">Niveluri prezentate in carduri/tab-uri curate</h2>
        <div className="v3-tier-tabs">
          <div className="v3-tier-tab-row">
            {serviceTiers.map((tier, index) => (
              <div key={tier.tierKey} className={`v3-tier-tab ${index === 0 ? "v3-tier-tab-active" : ""}`}>
                <span>{tier.title}</span>
                <strong>{resolvedPrice.levels[index]?.price ?? resolvedPrice.startingPrice}</strong>
              </div>
            ))}
          </div>
          <div className="v3-tier-tab-content">
            {serviceTiers.map((tier, index) => (
              <div key={tier.tierKey} className={`v3-tier-card ${index === 1 ? "v3-tier-card-featured" : ""}`}>
                <div className="v3-tier-card-head">
                  <VisualEditableText slug="service-detail" path={`serviceTiers.${index}.title`} value={tier.title} as="div" className="v3-tier-card-title" />
                  <div className="v3-tier-card-price">
                    {resolvedPrice.levels[index]?.price ?? resolvedPrice.startingPrice}
                  </div>
                </div>
                <div className="v3-tier-card-meta">Marja +{tier.marginMultiplier ?? 0}% ? Vizibil public dupa aprobare</div>
                <div className="v3-tier-card-list">
                  {parseBenefits(tier.benefitsMarkdown ?? "Pachet configurabil din Backoffice.").map((benefit) => (
                    <div key={benefit} className="v3-tier-card-item">
                      <span className="v3-tier-card-icon" aria-hidden />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    ),
    benefits: (
      <article className="v3-section-card v3-section-card-soft" key="benefits">
        <div className="v3-eyebrow">Beneficii</div>
        <h2 className="v3-section-title">Ce vede vizitatorul dupa publicare</h2>
        <div className="v3-benefits-grid">
          {serviceBenefits.map((benefit, index) => (
            <div key={`${benefit}-${index}`} className="v3-benefit-card">
              <VisualEditableText slug="service-detail" path={`benefits.${index}`} value={benefit} as="div" />
            </div>
          ))}
        </div>
      </article>
    ),
  };

  return (
    <PublicShell page={page}>
      <div className="v3-grid-layout v3-grid-layout-tight">
        <PublicSidebar catalogServices={catalogService ? [catalogService] : undefined} />
        <div className="v3-page-stack">
          {serviceSectionContent.hero}
          <div className="v3-page-stack">
            {serviceSectionsOrder.filter((sectionKey) => sectionKey !== "hero").map((sectionKey) => serviceSectionContent[sectionKey] ?? null)}
          </div>
          <section className="v3-section-card">
            <div className="v3-eyebrow">Poate te intereseaza si</div>
            <h2 className="v3-section-title">Servicii complementare promovate sub pagina dedicata</h2>
            <div className="v3-catalog-grid">
              {relatedServices.map((related) => {
                const relatedPrice = resolveServicePrice(related);
                return (
                  <article key={related.slug} className="v3-catalog-card">
                    <div className={`v3-catalog-media ${accentClass(related.accent)}`}>
                      <Pill>{related.mediaType}</Pill>
                      <span className="v3-rating-badge">{related.rating}</span>
                    </div>
                    <div className="v3-catalog-content">
                      <div className="v3-catalog-category">{related.category}</div>
                      <div className="v3-service-title">{related.title}</div>
                      <p>{related.summary}</p>
                      <div className="v3-service-badges">
                        {related.badges.slice(0, 3).map((badge) => (
                          <span key={badge} className="v3-mini-badge">
                            {badge}
                          </span>
                        ))}
                      </div>
                      <div className="v3-service-meta">
                        <PriceLockup price={relatedPrice} compact />
                        <Link href={`/services/${related.slug}`} className="v3-dark-button">
                          Vezi serviciul
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
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
  accessPanel,
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
  accessPanel?: ReactNode;
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

      {accessPanel ? (
        <section className="v3-section-card v3-section-card-soft v3-role-access-shell">{accessPanel}</section>
      ) : null}
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
      accessPanel={
        <RoleAccessPanel
          title="Partener / Provider - acces si creare cont"
          description="Ai deja cont aprobat? Te autentifici si intri direct in fluxul operational. Pentru cont nou, pornesti cu cererea de partener si documentele obligatorii."
          loginHref="/account"
          registerHref="/partners/join"
          footerNote="Conturile partenerilor se activeaza dupa validare. Dupa aprobare apari live pe homepage."
        />
      }
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
      accessPanel={
        <RoleAccessPanel
          title="Investitor - acces si creare cont"
          description="Ai deja cont investitor aprobat? Intra direct cu autentificare. Pentru cont nou, incepi cu formularul dedicat investitorilor."
          loginHref="/account"
          registerHref="/investors/create"
          footerNote="Validarea investitorilor este separata si se confirma prin email."
        />
      }
    />
  );
}

export function PublicAboutPage({ page }: { page: HomepageContent }) {
  return (
    <GenericPublicLanding
      page={page}
      eyebrow="Despre My Darrin"
      title="Platforma My Darrin livreaza servicii la cerere, cu AI operational si executie verificata."
      description="Pastrezi acelasi stil V3 aprobat si o structura clara: cine suntem, cum functionam si ce garanteaza platforma."
      leftTitle="Ce oferim"
      leftItems={["Catalog standardizat", "AI pentru selectie rapida", "Flux comanda-plată-status", "Echipe verificate si raportare completa"]}
      rightTitle="De ce conteaza"
      rightItems={["Transparenta in preturi si termene", "Validare operationala pentru parteneri", "Date si media centralizate", "Acces rapid la suport si contact"]}
      primaryHref="/catalog"
      primaryLabel="Vezi servicii"
      secondaryHref="/contact"
      secondaryLabel="Contact"
    />
  );
}

export function PublicContactPage({ page }: { page: HomepageContent }) {
  return (
    <GenericPublicLanding
      page={page}
      eyebrow="Contact"
      title="Echipa My Darrin este pregatita pentru clienti, parteneri si investitori."
      description="Folosim aceeasi estetica aprobata V3 si oferim acces rapid la AI Darrin, onboarding si suport operational."
      leftTitle="Suport rapid"
      leftItems={["AI Darrin 24/7", "Status comanda in timp real", "Onboarding dedicat", "Raspuns documentat"]}
      rightTitle="Canale disponibile"
      rightItems={["Formular de contact in cont", "Email operational", "Workflow de ticketing in Backoffice", "Escaladare catre Super Admin"]}
      primaryHref="/account"
      primaryLabel="Deschide AI Darrin"
      secondaryHref="/account/create"
      secondaryLabel="Creeaza cont"
    />
  );
}

export function PublicLegalPage({ page }: { page: HomepageContent }) {
  return (
    <GenericPublicLanding
      page={page}
      eyebrow="Legal & Termeni"
      title="Transparenta legala pentru clienti, parteneri si investitori."
      description="Termenii, GDPR si politicile raman accesibile si clare, cu acelasi limbaj vizual V3 aprobat."
      leftTitle="Documente cheie"
      leftItems={["Termeni si conditii", "Politica de confidentialitate", "GDPR & protectia datelor", "Politica de plata"]}
      rightTitle="Conformitate"
      rightItems={["Roluri si permisiuni documentate", "Loguri si audit pentru actiuni", "Date minimizate si criptate", "Acces la suport legal la cerere"]}
      primaryHref="/contact"
      primaryLabel="Solicita asistenta"
      secondaryHref="/catalog"
      secondaryLabel="Inapoi la servicii"
    />
  );
}

export function PublicMarketplaceProviderPage({ page }: { page: HomepageContent }) {
  return (
    <GenericPublicLanding
      page={page}
      eyebrow="Marketplace Providers"
      title="Providerii My Darrin isi pot crea cont si publica materiale / utilaje"
      description="Dupa aprobarea SuperAdmin, produsele si utilajele devin vizibile public in Marketplace, cu comisioane configurabile."
      leftTitle="Pentru furnizori materiale"
      leftItems={[
        "Cont dedicat marketplace materiale",
        "Publicare produse si stocuri",
        "Aprobari si validari SuperAdmin",
        "Vizibilitate automata in catalog",
      ]}
      rightTitle="Pentru inchirieri utilaje"
      rightItems={[
        "Publicare utilaje si disponibilitate",
        "Calendar de inchiriere sincronizat",
        "Contracte si asigurari optionale",
        "Pachet standard de comisioane",
      ]}
      primaryHref="/partners/join"
      primaryLabel="Devino provider"
      secondaryHref="/materials"
      secondaryLabel="Vezi marketplace"
    />
  );
}

export function PublicHowItWorksPage({ page }: { page: HomepageContent }) {
  return (
    <GenericPublicLanding
      page={page}
      eyebrow="Cum functioneaza"
      title="Rapid, clar si fara pasi inutili"
      description="Platforma My Darrin urmeaza un flux standardizat: alegi, primesti deviz, alocam actorii si executia, apoi plata si garantia sunt securizate."
      leftTitle="Pasii principali"
      leftItems={[
        "Pasul 1: Descrii / Alegi",
        "Pasul 2: Primesti / selectezi serviciul si nivelele aferente",
        "Pasul 3: Primesti deviz",
        "Pasul 4: Alocare actori (serviciu, materiale, utilaje, transport, asigurare optional)",
        "Pasul 5: Executie",
        "Pasul 6: Plata securizata + garantie",
      ]}
      rightTitle="Ce primesti"
      rightItems={[
        "Proces clar, fara pasi inutili",
        "Preturi standardizate si transparente",
        "Alocare automata a resurselor",
        "Siguranta si garantie la final",
      ]}
      primaryHref="/catalog"
      primaryLabel="Vezi servicii"
      secondaryHref="/account"
      secondaryLabel="Vorbeste cu AI Darrin"
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
            <PublicAccountLoginForm />

            <div className="mt-8">
              <PublicAiDarrinChat defaultServiceSlug={publicServiceCatalog[0]?.slug} />
            </div>

            <Link href="/account/create" className="v3-auth-forgot-link">
              Ai uitat parola sau nu ai cont? Continua cu inregistrarea.
            </Link>

            <div className="v3-auth-inline-note">
              Fluxul activ public este crearea contului cu verificare telefon. Autentificarea sociala si loginul client final se conecteaza in etapa urmatoare, fara sa schimbam aceasta structura aprobata.
            </div>
          </div>
        </article>

        <div className="v3-auth-side-stack">
          <RoleAccessPanel
            title="Client - acces rapid"
            description="Ai deja cont client aprobat? Autentifica-te. Daca esti nou, creeaza contul in 3 pasi si vei aparea live dupa aprobare."
            loginHref="/account"
            registerHref="/account/create"
            footerNote="Structura urmeaza modelul marketplace (login + creare cont separat)."
          />
          <AccountEntryCard
            title="Client My Darrin"
            description="Cont dedicat pentru comenzi, statusuri si asistenta AI. Dupa aprobarea contului, vei aparea live in homepage."
            loginHref="/account"
            registerHref="/account/create"
          />
          <AccountEntryCard
            title="Partener / Provider"
            description="Fluxul de partener include documente obligatorii si aprobare operationala. Crearea contului se face separat."
            loginHref="/partners/join"
            registerHref="/partners/join"
          />
          <AccountEntryCard
            title="Investitor"
            description="Acces dedicat pentru interes investitional, rundele seed si comunicare. Conturile sunt validate separat."
            loginHref="/investors"
            registerHref="/investors/create"
          />
          <AccountEntryCard
            title="Admin Backoffice"
            description="Conturile administrative se acorda doar prin invitatie email si aprobare Super Admin."
            loginHref="/account/create/administrare"
            registerHref="/account/create/administrare"
            footerNote="Permisiunile sunt bifate din catalogul complet de module backoffice."
          />
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
        </div>
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

      <section className="v3-split-highlight">
        <InvestorSeedWidget />
        <LiveActivityFeed />
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
  subrole,
  eyebrow,
  title,
  description,
  backHref,
  nextSteps,
  roleBenefits,
}: {
  page: HomepageContent;
  leadId: number;
  role: "CLIENT" | "PARTNER" | "INVESTOR" | "ADMIN";
  subrole?: string;
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
        <PublicRoleCompletionForm leadId={leadId} role={role} subrole={subrole} />
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

export function PublicPartnerAccountCompletionPage({
  page,
  leadId,
  subrole,
}: {
  page: HomepageContent;
  leadId: number;
  subrole?: string;
}) {
  const context = (subrole ?? "services").toLowerCase();
  const contextConfig: Record<
    string,
    { eyebrow: string; title: string; description: string; roleBenefits: string[]; nextSteps: string[] }
  > = {
    services: {
      eyebrow: "Pasul 3 - Partener servicii",
      title: "Finalizeaza contul de partener servicii",
      description: "Contul partener este separat de client si intra in fluxul de aprobare operationala dupa finalizarea parolei.",
      roleBenefits: [
        "Traseu dedicat pentru prestatori verificati",
        "Documentele si disponibilitatea raman pe profilul partener",
        "Nu se amesteca cu datele clientului",
        "Accesul operational se deschide dupa aprobare",
      ],
      nextSteps: [
        "Datele intra in validarea operationala",
        "Super Admin sau echipa de verificare aproba accesul relevant",
        "Dupa aprobare, partenerul continua in dashboardul dedicat",
      ],
    },
    "materials-marketplace": {
      eyebrow: "Pasul 3 - Provider materiale",
      title: "Finalizeaza contul de provider materiale",
      description: "Contul de provider materiale intra in verificare pentru activarea marketplace-ului si a stocurilor.",
      roleBenefits: [
        "Catalog de materiale sincronizat",
        "Stocuri, livrare si SLA urmarite in timp real",
        "Comenzi marketplace direct din My Darrin",
        "Flux separat de partenerii de servicii",
      ],
      nextSteps: [
        "Documentele sunt validate de Super Admin",
        "Dupa aprobare, marketplace-ul devine activ",
        "Primesti acces la modulul de stocuri si livrare",
      ],
    },
    "materials-ip": {
      eyebrow: "Pasul 3 - Integrare IP",
      title: "Finalizeaza contul pentru integrare IP",
      description: "Integrarea IP necesita aprobare si verificarea conectarii la sistemul propriu de stocuri.",
      roleBenefits: [
        "Sincronizare automata prin API",
        "Acces la monitorizarea feed-urilor",
        "Validari tehnice aprobate de Super Admin",
        "Flux separat de marketplace manual",
      ],
      nextSteps: [
        "Se valideaza documentatia tehnica",
        "Se activeaza tokenul de integrare",
        "Stocurile se sincronizeaza automat",
      ],
    },
    rental: {
      eyebrow: "Pasul 3 - Provider rental",
      title: "Finalizeaza contul de provider inchirieri utilaje",
      description: "Contul de rental activeaza gestiunea flotei de utilaje si tarifele orare/zi.",
      roleBenefits: [
        "Flota utilaje vizibila pentru servicii AUR/PLATINA",
        "Tarife si disponibilitate gestionate centralizat",
        "Alocari rapide pentru santiere",
        "Flux separat de marketplace materiale",
      ],
      nextSteps: [
        "Se valideaza documentele utilajelor",
        "Se aproba accesul la centrul rental",
        "Utilajele devin vizibile in devize",
      ],
    },
    concrete: {
      eyebrow: "Pasul 3 - Provider betoane",
      title: "Finalizeaza contul de furnizor betoane",
      description: "Acces pentru livrari beton, clase comerciale si logistica programata.",
      roleBenefits: [
        "Catalog betoane cu niveluri Bronz-Platina",
        "Optiuni logistice si transport programat",
        "Comenzi directe din platforma",
        "Flux separat de partenerii de servicii",
      ],
      nextSteps: [
        "Se valideaza documentele statiei",
        "Se aproba accesul la catalogul betoanelor",
        "Intri in fluxul de livrari programate",
      ],
    },
  };
  const config = contextConfig[context] ?? contextConfig.services;
  return (
    <PublicRoleCompletionPage
      page={page}
      leadId={leadId}
      role="PARTNER"
      subrole={subrole}
      eyebrow={config.eyebrow}
      title={config.title}
      description={config.description}
      backHref={`/account/create/select-role?lead=${leadId}`}
      roleBenefits={config.roleBenefits}
      nextSteps={config.nextSteps}
    />
  );
}

export function PublicAdminAccountCompletionPage({ page, leadId }: { page: HomepageContent; leadId: number }) {
  return (
    <PublicRoleCompletionPage
      page={page}
      leadId={leadId}
      role="ADMIN"
      eyebrow="Pasul 3 - Admin"
      title="Finalizeaza contul de administrare"
      description="Contul Admin intra automat in verificare. Super Admin aloca permisiunile finale dupa audit."
      backHref={`/account/create/select-role?lead=${leadId}`}
      roleBenefits={[
        "Acces controlat in Backoffice doar dupa aprobare",
        "Permisiuni alocate granular pe module",
        "Audit complet pe actiuni administrative",
        "Flux separat de Client, Partener si Investitor",
      ]}
      nextSteps={[
        "Cererea este trimisa automat catre Super Admin",
        "Se verifica datele si documentele necesare",
        "Permisiunile se activeaza doar dupa aprobare",
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

              <div className="v3-admin-entry-card">
                <div className="v3-admin-entry-title">Acces admin prin invitatie</div>
                <p>
                  Fiecare admin invitat este aprobat de Super Admin, iar permisiunile sunt bifate din catalogul complet de
                  module Backoffice.
                </p>
                <div className="v3-admin-entry-actions">
                  <Link href="http://127.0.0.1:3001/login" className="v3-primary-button">
                    Autentifica-te
                  </Link>
                  <Link href="/contact" className="v3-dark-button">
                    Cere invitatie
                  </Link>
                </div>
                <div className="v3-inline-note">Rolurile sunt aprobate, pot fi anulate si sterse din Backoffice.</div>
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

export function PublicCartPage({
  page,
  cartEntries,
  checkoutHref,
}: {
  page: HomepageContent;
  cartEntries?: CartEntry[];
  checkoutHref?: string;
}) {
  const fallbackEntries: CartEntry[] = [
    { slug: "reparat-calorifer" },
    { slug: "montaj-centrala-termica" },
  ];
  const entries = cartEntries?.length ? cartEntries : fallbackEntries;

  const resolvedItems = entries
    .map((entry, index) => {
      const fallbackService = getPublicServiceBySlug(entry.slug);
      let resolvedService: ResolvedServiceRecord | null = null;

      if (entry.card) {
        const built = buildServiceFromCatalogCard(entry.card, index);
        resolvedService = fallbackService
          ? mergeServiceWithCard({ ...fallbackService }, entry.card, index)
          : built;
      } else if (fallbackService) {
        resolvedService = { ...fallbackService };
      }

      if (!resolvedService) {
        return null;
      }

      const resolvedPrice = resolveServicePrice(resolvedService, entry.dynamicPrice);
      const deliveryBadge = resolveDeliveryBadge(resolvedService, entry.dynamicPrice);
      return { service: resolvedService, price: resolvedPrice, deliveryBadge };
    })
    .filter(Boolean) as Array<{
    service: ResolvedServiceRecord;
    price: ResolvedServicePrice;
    deliveryBadge?: string | null;
  }>;

  const subtotal = resolvedItems.reduce((sum, item) => sum + parsePriceAmount(item.price.primaryValue), 0);
  const currencyLabel = resolvedItems[0]?.price.currencyLabel ?? "RON";
  const resolvedCheckoutHref =
    checkoutHref ??
    (resolvedItems[0]?.service.slug
      ? `/finalizare-proiect?slug=${encodeURIComponent(resolvedItems[0].service.slug)}`
      : "/finalizare-proiect");

  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Coș</div>
            <h1 className="v3-page-title">Coșul public este aliniat la V3 si pregatit pentru checkout</h1>
            <p className="v3-page-description">
              Carduri mari, sumare clare si CTA-uri puternice, in aceeasi geometrie aprobata pe homepage.
            </p>
          </div>
          <Link href={resolvedCheckoutHref} className="v3-primary-button">
            Continua spre checkout
          </Link>
        </div>
      </section>

      <section className="v3-section-card">
        {resolvedItems.length === 0 ? (
          <div className="v3-inline-note">Nu exista servicii in cos. Revino in catalog pentru selectie.</div>
        ) : null}
        <PublicCartClient
          fallbackItems={resolvedItems.map((item) => ({
            slug: item.service.slug,
            title: item.service.title,
            category: item.service.category ?? "General",
            summary: item.service.summary,
            mediaType: item.service.mediaType,
            accent: item.service.accent,
            startingPrice: item.price.startingPrice,
          }))}
        />
        {resolvedItems.length ? (
          <div className="v3-checkout-summary">
            <div>
              <span>Subtotal</span>
              <strong>
                {formatPriceAmount(subtotal)} {currencyLabel}
              </strong>
            </div>
            <div>
              <span>Total</span>
              <strong>
                {formatPriceAmount(subtotal)} {currencyLabel}
              </strong>
            </div>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}

export function PublicCheckoutPage({
  page,
  context,
}: {
  page: HomepageContent;
  context?: CheckoutContext;
}) {
  const fallbackService = context?.slug ? getPublicServiceBySlug(context.slug) : null;
  const resolvedService = context?.card
    ? fallbackService
      ? mergeServiceWithCard({ ...fallbackService }, context.card, 0)
      : buildServiceFromCatalogCard(context.card, 0)
    : fallbackService ?? null;
  const resolvedPrice = resolvedService ? resolveServicePrice(resolvedService, context?.dynamicPrice ?? null) : null;
  const totalLabel = resolvedPrice
    ? `${resolvedPrice.primaryValue} ${resolvedPrice.currencyLabel}`
    : resolvedService?.startingPrice ?? "de la 0 RON";

  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Checkout</div>
            <h1 className="v3-page-title">Checkout-ul pastreaza acelasi ritm vizual si ierarhie aprobata in homepage V3</h1>
            <p className="v3-page-description">
              Formular, sumar de comanda si CTA final intr-un layout coerent, pregatit pentru integrarea finala de plata.
            </p>
          </div>
        </div>
      </section>

      <section className="v3-split-highlight">
        <article className="v3-section-card">
          <GeoAddressAutocomplete helperText="Autocomplete-ul trimite place_id catre backend pentru calcul fiscal si geografic exact." />
          <PublicCheckoutFields />
        </article>
        <article className="v3-section-card v3-section-card-soft">
          <div className="v3-eyebrow">Rezumat</div>
          <h2 className="v3-section-title">{resolvedService?.title ?? "Serviciu selectat"}</h2>
          <div className="v3-checkout-summary">
            <div>
              <span>Subtotal</span>
              <strong>{totalLabel}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{totalLabel}</strong>
            </div>
          </div>
          {resolvedPrice?.minimumOrderNote ? (
            <div className="v3-inline-note">{resolvedPrice.minimumOrderNote}</div>
          ) : null}
          {context?.targetAddress ? (
            <div className="v3-inline-note">Adresa selectata: {context.targetAddress}</div>
          ) : null}
          <PublicCheckoutDraftSummary />
          <div className="v3-inline-note">Rideshare: doar furnizori validati & integrati (placeholder logic).</div>
          <div className="v3-object-recursion-card">
            <div className="v3-card-kicker">Pachetul de Siguranta My Darrin</div>
            <div className="v3-muted-copy">
              Aceasta lucrare este protejata de Polita de Asigurare My Darrin si beneficiaza de Garantia de Buna Executie
              (5% retinut in Escrow pana la receptie).
            </div>
          </div>
          <div className="v3-final-actions">
            <PublicCheckoutSubmit />
          </div>
        </article>
      </section>
    </PublicShell>
  );
}

export function PublicPaymentStatusPage({
  page,
  orderRef,
  orderStatus,
}: {
  page: HomepageContent;
  orderRef?: string | null;
  orderStatus?: import("@/lib/site-content").PublicOrderStatusSnapshot | null;
}) {
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
        {orderRef ? (
          <PublicPaymentStatusClient orderRef={orderRef} initialStatus={orderStatus ?? null} />
        ) : (
          <div className="v3-inline-note">
            Lipseste referinta comenzii. Revino in checkout pentru a genera un `order_ref`.
          </div>
        )}
      </section>
    </PublicShell>
  );
}

export function PublicClientOrdersPage({ page }: { page: HomepageContent }) {
  return (
    <PublicShell page={page}>
      <section className="v3-panel-card">
        <div className="v3-page-hero">
          <div>
            <div className="v3-eyebrow">Cont client</div>
            <h1 className="v3-page-title">Istoric comenzi & status live</h1>
            <p className="v3-page-description">Vezi comenzile tale, starea curenta si actualizari in timp real.</p>
          </div>
        </div>
      </section>
      <section className="v3-section-card">
        <ClientOrders />
      </section>
    </PublicShell>
  );
}

export function PublicClientAccountDashboardPage({ page }: { page: HomepageContent }) {
  return (
    <AccountDashboardShell
      page={page}
      roleLabel="Cont client"
      title="Dashboard client - comenzi, plati si status live"
      description="Pagina de administrare client urmeaza structura Backoffice: navigatie laterala, carduri de status si istoric complet."
      headerStats={[
        { label: "Comenzi active", value: "2", hint: "In lucru / confirmate" },
        { label: "Total comenzi", value: "18", hint: "Ultimele 12 luni" },
        { label: "Plati", value: "97%", hint: "Rata de conversie" },
      ]}
      sidebar={[
        {
          title: "Comenzi",
          items: [
            { label: "Istoric comenzi", href: "/my-account/orders" },
            { label: "Status live", href: "/my-account/orders" },
            { label: "Plati & facturi", href: "/my-account/orders" },
          ],
        },
        {
          title: "Profil",
          items: [
            { label: "Date personale", href: "/my-account" },
            { label: "Adrese & livrare", href: "/my-account" },
            { label: "Setari cont", href: "/my-account" },
          ],
        },
      ]}
      action={
        <Link href="/catalog" className="v3-primary-button">
          Comanda un serviciu
        </Link>
      }
    >
      <section className="v3-account-card">
        <div className="v3-account-card-head">
          <div>
            <div className="v3-eyebrow">Comenzile mele</div>
            <h2 className="v3-section-title">Istoric & status actual</h2>
          </div>
          <Link href="/my-account/orders" className="v3-ghost-chip">
            Vezi toate
          </Link>
        </div>
        <ClientOrders />
      </section>
      <section className="v3-account-grid">
        <div className="v3-account-card">
          <div className="v3-card-kicker">Preferinte</div>
          <h3 className="v3-section-title">Canale de comunicare</h3>
          <p className="v3-page-description">
            Controlezi notificarile pentru status comenzi, devize si plati direct din cont.
          </p>
        </div>
        <div className="v3-account-card">
          <div className="v3-card-kicker">Documente</div>
          <h3 className="v3-section-title">Facturi & rapoarte</h3>
          <p className="v3-page-description">
            Toate facturile si documentele sunt generate automat si raman atasate pe fiecare comanda.
          </p>
        </div>
      </section>
    </AccountDashboardShell>
  );
}

export function PublicPartnerAccountDashboardPage({ page, pending }: { page: HomepageContent; pending?: boolean }) {
  return (
    <AccountDashboardShell
      page={page}
      roleLabel="Cont partener / provider"
      title="Dashboard partener - lucrari, executie si validari"
      description="Structura urmeaza Backoffice: meniu lateral cu module, statusuri de lucru si actiuni rapide."
      statusNote={
        pending
          ? {
              title: "Cont in verificare",
              description: "Accesul operational se activeaza dupa aprobarea Super Admin.",
            }
          : undefined
      }
      headerStats={[
        { label: "Comenzi alocate", value: "6", hint: "Active" },
        { label: "Rata finalizare", value: "93%", hint: "Ultimele 30 zile" },
        { label: "Rating", value: "4.8", hint: "Evaluari clienti" },
      ]}
      sidebar={[
        {
          title: "Operatiuni",
          items: [
            { label: "Comenzi alocate", href: "/partners/account" },
            { label: "Programari", href: "/partners/account" },
            { label: "Livrari & executie", href: "/partners/account" },
          ],
        },
        {
          title: "Profil partener",
          items: [
            { label: "Documente & licente", href: "/partners/account" },
            { label: "Echipe & resurse", href: "/partners/account" },
            { label: "Setari cont", href: "/partners/account" },
          ],
        },
      ]}
      action={
        <Link href="/account" className="v3-primary-button">
          Intra in cont
        </Link>
      }
    >
      <section className="v3-account-card">
        <div className="v3-account-card-head">
          <div>
            <div className="v3-eyebrow">Executie</div>
            <h2 className="v3-section-title">Joburi active & status</h2>
          </div>
          <span className="v3-inline-note v3-inline-note-soft">Sincronizat cu Backoffice</span>
        </div>
        <div className="v3-account-timeline">
          {[
            "Job #2451 - Pregatire materiale",
            "Job #2452 - Echipa confirmata",
            "Job #2453 - In lucru",
          ].map((item) => (
            <div key={item} className="v3-account-timeline-row">
              <span className="v3-account-timeline-dot" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="v3-account-grid">
        <div className="v3-account-card">
          <div className="v3-card-kicker">Plati</div>
          <h3 className="v3-section-title">Decontari curente</h3>
          <p className="v3-page-description">Situatia platilor se actualizeaza dupa validarea executiei.</p>
        </div>
        <div className="v3-account-card">
          <div className="v3-card-kicker">Documente</div>
          <h3 className="v3-section-title">Acte, autorizari, asigurari</h3>
          <p className="v3-page-description">Documentele incarcate raman vizibile in timp real pentru echipa de audit.</p>
        </div>
      </section>
    </AccountDashboardShell>
  );
}

export function PublicProviderAccountDashboardPage({
  page,
  pending,
  providerType,
}: {
  page: HomepageContent;
  pending?: boolean;
  providerType?: string;
}) {
  const contextKey = (providerType ?? "").toLowerCase();
  const contexts: Record<
    string,
    {
      roleLabel: string;
      title: string;
      description: string;
      sidebar: AccountSidebarSection[];
      headerStats: Array<{ label: string; value: string; hint?: string }>;
    }
  > = {
    materials: {
      roleLabel: "Provider materiale",
      title: "Marketplace materiale - stocuri, livrari si SLA",
      description: "Gestionezi catalogul de produse si sincronizezi stocurile cu marketplace-ul My Darrin.",
      headerStats: [
        { label: "Comenzi materiale", value: "14", hint: "Saptamana curenta" },
        { label: "Stoc sincronizat", value: "OK", hint: "Ultimul sync" },
        { label: "SLA", value: "97%", hint: "Performanta" },
      ],
      sidebar: [
        {
          title: "Catalog materiale",
          items: [
            { label: "Produse active", href: "/marketplace/providers/materials" },
            { label: "Stocuri & livrari", href: "/marketplace/providers/materials" },
            { label: "Comenzi marketplace", href: "/marketplace/providers/materials" },
          ],
        },
        {
          title: "Profil provider",
          items: [
            { label: "Documente & conformitate", href: "/marketplace/providers/materials" },
            { label: "Setari integrare", href: "/marketplace/providers/materials" },
          ],
        },
      ],
    },
    "materials-ip": {
      roleLabel: "Provider materiale (Integrare IP)",
      title: "Integrare IP - sincronizare stocuri si feed",
      description: "Conectezi sistemul propriu de inventar cu platforma pentru actualizari automate.",
      headerStats: [
        { label: "Feed activ", value: "1", hint: "Integrare" },
        { label: "Sincronizari", value: "4/zi", hint: "Ritm" },
        { label: "SLA", value: "99%", hint: "Performanta" },
      ],
      sidebar: [
        {
          title: "Integrare",
          items: [
            { label: "Token API", href: "/marketplace/providers/materials/ip" },
            { label: "Endpoint-uri", href: "/marketplace/providers/materials/ip" },
            { label: "Log sincronizare", href: "/marketplace/providers/materials/ip" },
          ],
        },
        {
          title: "Conformitate",
          items: [
            { label: "Documente", href: "/marketplace/providers/materials/ip" },
            { label: "Audit securitate", href: "/marketplace/providers/materials/ip" },
          ],
        },
      ],
    },
    rental: {
      roleLabel: "Provider inchirieri utilaje",
      title: "Centru Rental - utilaje, tarife si disponibilitate",
      description: "Administrezi flota de utilaje si aloci resursele pentru lucrarile de nivel AUR/PLATINA.",
      headerStats: [
        { label: "Utilaje active", value: "9", hint: "Disponibile" },
        { label: "Rezervari", value: "5", hint: "Saptamana" },
        { label: "SLA", value: "95%", hint: "Performanta" },
      ],
      sidebar: [
        {
          title: "Flota utilaje",
          items: [
            { label: "Utilaje disponibile", href: "/marketplace/providers/rental" },
            { label: "Tarife & pachete", href: "/marketplace/providers/rental" },
            { label: "Rezervari", href: "/marketplace/providers/rental" },
          ],
        },
        {
          title: "Profil provider",
          items: [
            { label: "Documente utilaje", href: "/marketplace/providers/rental" },
            { label: "Asigurari", href: "/marketplace/providers/rental" },
          ],
        },
      ],
    },
    concrete: {
      roleLabel: "Provider betoane",
      title: "Livrare betoane - clase, transport si programari",
      description: "Configurezi clasele de beton, livrarile si optiunile logistice pentru santiere.",
      headerStats: [
        { label: "Comenzi beton", value: "7", hint: "Saptamana" },
        { label: "Capacitate", value: "85%", hint: "Utilizare" },
        { label: "SLA", value: "96%", hint: "Performanta" },
      ],
      sidebar: [
        {
          title: "Catalog betoane",
          items: [
            { label: "Clase active", href: "/marketplace/providers/concrete" },
            { label: "Livrari programate", href: "/marketplace/providers/concrete" },
            { label: "Tarife transport", href: "/marketplace/providers/concrete" },
          ],
        },
        {
          title: "Profil furnizor",
          items: [
            { label: "Documente statie", href: "/marketplace/providers/concrete" },
            { label: "Certificari", href: "/marketplace/providers/concrete" },
          ],
        },
      ],
    },
  };

  const fallbackContext = {
    roleLabel: "Cont provider",
    title: "Dashboard provider - stocuri, livrari si SLA",
    description: "Providerii gestioneaza resursele si materialele sincronizate cu Backoffice.",
    headerStats: [
      { label: "Comenzi livrare", value: "12", hint: "Saptamana curenta" },
      { label: "Disponibilitate", value: "OK", hint: "Stoc raportat" },
      { label: "SLA", value: "96%", hint: "Performanta" },
    ],
    sidebar: [
      {
        title: "Logistica",
        items: [
          { label: "Livrari active", href: "/providers/account" },
          { label: "Stocuri raportate", href: "/providers/account" },
          { label: "Programari", href: "/providers/account" },
        ],
      },
      {
        title: "Profil provider",
        items: [
          { label: "Contracte", href: "/providers/account" },
          { label: "Documente & conformitate", href: "/providers/account" },
          { label: "Setari cont", href: "/providers/account" },
        ],
      },
    ],
  };

  const context = contexts[contextKey] ?? fallbackContext;
  const resourceCards: Record<string, Array<{ kicker: string; title: string; description: string }>> = {
    materials: [
      {
        kicker: "Stocuri",
        title: "Gestiune produse & disponibilitate",
        description: "Actualizezi rapid stocurile si statusul produselor listate in marketplace.",
      },
      {
        kicker: "Livrare",
        title: "Comenzi marketplace",
        description: "Vizualizezi comenzile active si confirmi livrarile catre santiere.",
      },
    ],
    "materials-ip": [
      {
        kicker: "Integrare IP",
        title: "Flux API sincronizat",
        description: "Monitorizezi feed-urile si validezi ultimele sincronizari automate.",
      },
      {
        kicker: "Audit",
        title: "Log sincronizare",
        description: "Ai vizibilitate completa asupra erorilor si a statusului de integrare.",
      },
    ],
    rental: [
      {
        kicker: "Flota",
        title: "Utilaje disponibile",
        description: "Administrezi disponibilitatea utilajelor pentru lucrari AUR/PLATINA.",
      },
      {
        kicker: "Tarife",
        title: "Pachete orare / zi",
        description: "Actualizezi tarifele si conditiile de inchiriere pentru santiere.",
      },
    ],
    concrete: [
      {
        kicker: "Catalog",
        title: "Clase beton & cantitati",
        description: "Gestionezi clasele de beton, volumele si nivelurile comerciale.",
      },
      {
        kicker: "Logistica",
        title: "Transport & programari",
        description: "Setezi intervalele de livrare si optiunile logistice pe santier.",
      },
    ],
    default: [
      {
        kicker: "Operare",
        title: "Stocuri si livrari",
        description: "Gestionezi resursele si confirmarile livrarilor active.",
      },
      {
        kicker: "Conformitate",
        title: "Documente & SLA",
        description: "Pastrezi documentele active si indicatorii SLA la zi.",
      },
    ],
  };
  const cards = resourceCards[contextKey] ?? resourceCards.default;
  return (
    <AccountDashboardShell
      page={page}
      roleLabel={context.roleLabel}
      title={context.title}
      description={context.description}
      statusNote={
        pending
          ? {
              title: "Cont in verificare",
              description: "Accesul operational se activeaza dupa aprobarea Super Admin.",
            }
          : undefined
      }
      headerStats={context.headerStats}
      sidebar={context.sidebar}
      action={
        <Link href="/account" className="v3-primary-button">
          Autentifica-te
        </Link>
      }
    >
      <section className="v3-account-card">
        <div className="v3-account-card-head">
          <div>
            <div className="v3-eyebrow">Livrari</div>
            <h2 className="v3-section-title">Rute si confirmari</h2>
          </div>
          <span className="v3-inline-note v3-inline-note-soft">Backoffice live</span>
        </div>
        <div className="v3-account-timeline">
          {["Livrare #781 - Pregatita", "Livrare #782 - In tranzit", "Livrare #783 - Confirmata"].map((item) => (
            <div key={item} className="v3-account-timeline-row">
              <span className="v3-account-timeline-dot" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="v3-account-grid">
        {cards.map((card) => (
          <div key={card.title} className="v3-account-card">
            <div className="v3-card-kicker">{card.kicker}</div>
            <h3 className="v3-section-title">{card.title}</h3>
            <p className="v3-page-description">{card.description}</p>
          </div>
        ))}
      </section>
    </AccountDashboardShell>
  );
}

export function PublicInvestorAccountDashboardPage({ page, pending }: { page: HomepageContent; pending?: boolean }) {
  return (
    <AccountDashboardShell
      page={page}
      roleLabel="Cont investitor"
      title="Dashboard investitor - portofoliu si rapoarte"
      description="Datele investitorilor sunt centralizate in zona securizata, cu acces la rapoarte si comunicari."
      statusNote={
        pending
          ? {
              title: "Cont in verificare",
              description: "Accesul investitional se activeaza dupa validarea administrativa.",
            }
          : undefined
      }
      headerStats={[
        { label: "Portofoliu", value: "Activ", hint: "Seed + follow-on" },
        { label: "Rapoarte", value: "4", hint: "Ultimele 90 zile" },
        { label: "Comunicari", value: "Live", hint: "Status actual" },
      ]}
      sidebar={[
        {
          title: "Investitii",
          items: [
            { label: "Portofoliu", href: "/investors/account" },
            { label: "Rapoarte", href: "/investors/account" },
            { label: "Calendar", href: "/investors/account" },
          ],
        },
        {
          title: "Profil investitor",
          items: [
            { label: "Preferinte", href: "/investors/account" },
            { label: "Documente", href: "/investors/account" },
            { label: "Setari cont", href: "/investors/account" },
          ],
        },
      ]}
      action={
        <Link href="/account" className="v3-primary-button">
          Autentifica-te
        </Link>
      }
    >
      <section className="v3-account-card">
        <div className="v3-account-card-head">
          <div>
            <div className="v3-eyebrow">Rapoarte</div>
            <h2 className="v3-section-title">Indicatori & comunicari recente</h2>
          </div>
          <span className="v3-inline-note v3-inline-note-soft">Sincronizare BI</span>
        </div>
        <div className="v3-account-timeline">
          {["Raport GMV Q1", "Update rundă seed", "Analiza pipeline parteneri"].map((item) => (
            <div key={item} className="v3-account-timeline-row">
              <span className="v3-account-timeline-dot" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </AccountDashboardShell>
  );
}

export function PublicAdminAccountDashboardPage({ page, pending }: { page: HomepageContent; pending?: boolean }) {
  return (
    <AccountDashboardShell
      page={page}
      roleLabel="Administrare"
      title="Dashboard admin invitati"
      description="Accesul administrativ ramane controlat prin invitatii si permisiuni bifate de Super Admin."
      statusNote={
        pending
          ? {
              title: "Cont in verificare",
              description: "Permisiunile de administrare se activeaza dupa aprobarea Super Admin.",
            }
          : undefined
      }
      headerStats={[
        { label: "Permisiuni", value: "RBAC", hint: "Catalog complet" },
        { label: "Invitatii", value: "Active", hint: "Flux controlat" },
        { label: "Audit", value: "Live", hint: "Jurnal actiuni" },
      ]}
      sidebar={[
        {
          title: "Administrare",
          items: [
            { label: "Invitatii & roluri", href: "/admin/account" },
            { label: "Permisiuni", href: "/admin/account" },
            { label: "Audit", href: "/admin/account" },
          ],
        },
        {
          title: "Securitate",
          items: [
            { label: "Acces & sesiuni", href: "/admin/account" },
            { label: "Setari cont", href: "/admin/account" },
          ],
        },
      ]}
      action={
        <Link href="http://127.0.0.1:3001/login" className="v3-primary-button">
          Deschide Backoffice
        </Link>
      }
    >
      <section className="v3-account-card">
        <div className="v3-account-card-head">
          <div>
            <div className="v3-eyebrow">Invitatii</div>
            <h2 className="v3-section-title">Status cont administrativ</h2>
          </div>
          <span className="v3-inline-note v3-inline-note-soft">Super Admin approval</span>
        </div>
        <div className="v3-account-timeline">
          {[
            "Invitatie trimisa pe email",
            "Permisiuni selectate din catalogul backoffice",
            "Acces activat dupa aprobare",
          ].map((item) => (
            <div key={item} className="v3-account-timeline-row">
              <span className="v3-account-timeline-dot" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </AccountDashboardShell>
  );
}

export function PublicClientOrderDetailPage({
  page,
  orderRef,
}: {
  page: HomepageContent;
  orderRef: string;
}) {
  return (
    <PublicShell page={page}>
      <ClientOrderDetailPanel orderRef={orderRef} />
      <section className="v3-section-card">
        <PublicPaymentStatusClient orderRef={orderRef} initialStatus={null} />
      </section>
    </PublicShell>
  );
}
