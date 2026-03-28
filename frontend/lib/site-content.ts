export type HomepageContent = {
  slug: string;
  title: string;
  status: string;
  updated_at?: string | null;
  content: {
    meta?: {
      brand?: string;
      subBrand?: string;
      domain?: string;
      goLiveDomain?: string;
      theme?: {
        cta?: string;
        structure?: string;
        ai?: string;
        aiHover?: string;
        background?: string;
        surface?: string;
      };
    };
    branding?: {
      logoText?: string;
      logoSubtext?: string;
      slogan?: string;
      logoUrl?: string;
      faviconUrl?: string;
    };
    design?: {
      fonts?: {
        display?: string;
        body?: string;
        accent?: string;
      };
      fontSizes?: {
        hero?: string;
        sectionTitle?: string;
        body?: string;
        label?: string;
      };
      colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        surface?: string;
        text?: string;
      };
    };
    mediaLibrary?: {
      heroVideoUrl?: string;
      heroImageUrl?: string;
      bannerUrls?: string[];
      logoVariants?: string[];
    };
    header?: {
      locationLabel?: string;
      searchPlaceholder?: string;
      menu?: string[];
      language?: string;
    };
    hero?: {
      headline?: string;
      subheadline?: string;
      primaryCta?: string;
      secondaryCta?: string;
      mediaType?: string;
    };
    quickCategories?: Array<{ title: string; media?: string }>;
    dualEntry?: { aiCardTitle?: string; catalogCardTitle?: string };
    featuredServices?: Array<{
      slug: string;
      title: string;
      rating: string;
      startingPrice: string;
      featured?: boolean;
    }>;
    howItWorks?: string[];
    benefits?: string[];
    finalCta?: { primary?: string; secondary?: string };
    footer?: {
      columns?: Record<string, string[]>;
      apps?: string[];
    };
    syncFlow?: string[];
  };
};

const API_BASE = process.env.API_BASE_URL_PUBLIC ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.BACKEND_GATE_AUTHORIZATION ?? process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

function createFallbackPage(slug: string): HomepageContent {
  const titles: Record<string, string> = {
    homepage: "Homepage Publica My Darrin",
    account: "Contul Meu",
    "account-create": "Creare cont",
    "account-create-select-role": "Selectare rol",
    "account-create-client": "Date client",
    "account-create-administrare": "Acces administrare",
    catalog: "Catalog servicii",
    cart: "Cosul meu",
    checkout: "Checkout",
    "payment-status": "Status plata",
    "partners-join": "Devino partener",
    "partners-join-create": "Creare cont partener",
    investors: "Devino investitor",
    "investors-create": "Creare cont investitor",
    "service-detail": "Pagina serviciu",
  };

  return {
    slug,
    title: titles[slug] ?? "Pagina publica My Darrin",
    status: "draft",
    content: {
      meta: {
        brand: "My Darrin",
        subBrand: "Home Best Pal",
        domain: "mydarrin.homebestpal.com",
        goLiveDomain: "www.mydarrin.com",
        theme: {
          cta: "#EF7F1A",
          structure: "#1E2E4D",
          ai: "#09A299",
          aiHover: "#117A73",
          background: "#FFFFFF",
          surface: "#F5F6F7",
        },
      },
      branding: {
        logoText: "My Darrin",
        logoSubtext: "Home Best Pal",
        slogan: "Servicii la cerere, fara frictiune",
        logoUrl: "",
        faviconUrl: "",
      },
      design: {
        fonts: {
          display: "Inter",
          body: "Inter",
          accent: "Inter",
        },
        fontSizes: {
          hero: "64px",
          sectionTitle: "44px",
          body: "16px",
          label: "11px",
        },
        colors: {
          primary: "#1E2E4D",
          secondary: "#09A299",
          accent: "#EF7F1A",
          background: "#FFFFFF",
          surface: "#F5F6F7",
          text: "#1E2E4D",
        },
      },
      mediaLibrary: {
        heroVideoUrl: "",
        heroImageUrl: "",
        bannerUrls: [],
        logoVariants: [],
      },
      header: {
        locationLabel: "Bucuresti, Sector 3",
        searchPlaceholder: "Descrie ce ai nevoie... (poti incarca poze/video)",
        menu: ["Servicii", "Industrii", "Devino Partener", "Devino Investitor", "Contact"],
        language: "RO",
      },
      hero: {
        headline: "Servicii la cerere. Oriunde. Oricand.",
        subheadline: "AI + profesionisti verificati pentru orice nevoie - acasa, birou sau industrie.",
        primaryCta: "Vezi servicii",
        secondaryCta: "Vorbeste cu Darrin",
        mediaType: "VIDEO",
      },
      quickCategories: [
        { title: "Acasa", media: "IMAGINE" },
        { title: "Auto", media: "IMAGINE" },
        { title: "Industrial", media: "IMAGINE" },
        { title: "HoReCa", media: "IMAGINE" },
        { title: "Agricultura", media: "IMAGINE" },
        { title: "Logistica", media: "IMAGINE" },
        { title: "Institutii", media: "IMAGINE" },
      ],
      dualEntry: {
        aiCardTitle: "Spune problema",
        catalogCardTitle: "Alege serviciu",
      },
      featuredServices: [
        {
          slug: "reparat-calorifer",
          title: "Reparat calorifer",
          rating: "4.9",
          startingPrice: "de la 189 lei",
          featured: true,
        },
        {
          slug: "montaj-aer-conditionat",
          title: "Montaj aer conditionat",
          rating: "4.8",
          startingPrice: "de la 449 lei",
        },
      ],
      howItWorks: ["Descrii / Alegi", "Primesti deviz", "Alegi furnizor", "Executie", "Plata securizata + garantie"],
      benefits: ["Pret standardizat", "Garantie", "Asigurare", "Profesionisti verificati"],
      finalCta: { primary: "Incepe acum", secondary: "Devino partener" },
      footer: {
        columns: {
          servicii: ["Catalog", "Pagina serviciu", "Comenzi rapide"],
          companie: ["Despre", "Contact", "Investitori"],
          legal: ["Termeni", "GDPR", "Politici"],
        },
        apps: ["iOS", "Android"],
      },
      syncFlow: [
        "Super Admin configureaza serviciul in Backoffice",
        "Imagini, video si documente sunt salvate",
        "Serviciul devine vizibil automat pe homepage, catalog si pagina serviciului",
        "Super Admin verifica si aproba versiunea publica",
      ],
    },
  };
}

export const homepageFallback: HomepageContent = createFallbackPage("homepage");

export type PublicServiceTaxonomy = {
  slug: string;
  service_name: string;
  domain?: string | null;
  category?: string | null;
  subcategories: string[];
  caen_codes: string[];
  uniclass_codes: string[];
  esco_codes: string[];
  indicator_codes: string[];
};

export type PublicCatalogPriceLevel = {
  level_name: string;
  label: string;
  description?: string | null;
  net_total: number;
  gross_total: number;
  recommended: boolean;
  sort_order: number;
};

export type PublicCatalogPrice = {
  slug: string;
  service_name: string;
  currency: string;
  currency_symbol?: string | null;
  legislation_code: string;
  country_code: string;
  zone_slug: string;
  locality_slug?: string | null;
  availability_status?: string;
  partial_availability?: {
    status: string;
    message: string;
    available_resource_types: string[];
    missing_resource_types: string[];
    target_address?: string | null;
  } | null;
  recommended_level: string;
  base_gross_total: number;
  delivery_badge?: string | null;
  delivery_lead_time_days?: number | null;
  levels: PublicCatalogPriceLevel[];
  last_calculated_at: string;
  source: string;
};

const PUBLIC_SERVICE_SOURCE_SLUGS: Record<string, string> = {
  "materiale-betoane": "livrare-beton-c25-30",
};

function resolveSourceSlug(slug: string) {
  return PUBLIC_SERVICE_SOURCE_SLUGS[slug] ?? slug;
}

export type PublicSyncManifest = {
  content_version: string;
  content_updated_at?: string | null;
  tracked_pages: string[];
  dynamic_pricing_enabled: boolean;
  status_stream_enabled: boolean;
};

export async function getSitePageContent(slug: string): Promise<HomepageContent> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/public/pages/${slug}`, {
      headers: GATE ? { "X-Gate-Authorization": GATE } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Site page content request failed");
    }

    return (await response.json()) as HomepageContent;
  } catch {
    return createFallbackPage(slug);
  }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  return getSitePageContent("homepage");
}

export async function getPublicServiceTaxonomy(slug: string): Promise<PublicServiceTaxonomy | null> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/public/pages/service-taxonomy/${resolveSourceSlug(slug)}`, {
      headers: GATE ? { "X-Gate-Authorization": GATE } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicServiceTaxonomy;
  } catch {
    return null;
  }
}

export async function getPublicCatalogPrice(slug: string, options?: { targetAddress?: string; placeId?: string }): Promise<PublicCatalogPrice | null> {
  try {
    const params = new URLSearchParams();
    if (options?.targetAddress) {
      params.set("target_address", options.targetAddress);
    }
    if (options?.placeId) {
      params.set("place_id", options.placeId);
    }
    const query = params.toString();
    const response = await fetch(`${API_BASE}/api/v1/public/sync/catalog-price/${resolveSourceSlug(slug)}${query ? `?${query}` : ""}`, {
      headers: GATE ? { "X-Gate-Authorization": GATE } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicCatalogPrice;
  } catch {
    return null;
  }
}

export async function getPublicSyncManifest(): Promise<PublicSyncManifest | null> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/public/sync/manifest`, {
      headers: GATE ? { "X-Gate-Authorization": GATE } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicSyncManifest;
  } catch {
    return null;
  }
}
