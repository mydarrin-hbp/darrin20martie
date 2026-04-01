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
    serviceTiers?: Array<{
      tierKey: "silver" | "gold" | "platinum";
      title: string;
      marginMultiplier?: number;
      benefitsMarkdown?: string;
    }>;
    serviceSectionsOrder?: string[];
    howItWorks?: string[];
    benefits?: string[];
    finalCta?: { primary?: string; secondary?: string };
    footer?: {
      columns?: Record<string, string[]>;
      apps?: string[];
      copyright?: string;
    };
    syncFlow?: string[];
  };
};

const API_BASE = process.env.API_BASE_URL_PUBLIC ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.BACKEND_GATE_AUTHORIZATION ?? process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;
const PUBLIC_FETCH_TIMEOUT_MS = 3000;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await Promise.race([
      fetch(input, { ...init, signal: controller.signal }),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("public_fetch_timeout")), timeoutMs + 50),
      ),
    ]);
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPublicJson<T>(url: string): Promise<T> {
  const response = await fetchWithTimeout(
    url,
    {
      headers: GATE ? { "X-Gate-Authorization": GATE } : {},
      cache: "no-store",
    },
    PUBLIC_FETCH_TIMEOUT_MS,
  );

  const normalized = response as Response;

  if (!normalized.ok) {
    throw new Error(`Public request failed: ${normalized.status}`);
  }

  return (await normalized.json()) as T;
}

/*
async function fetchPublicJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: GATE ? { "X-Gate-Authorization": GATE } : {},
    cache: "no-store",
    signal: AbortSignal.timeout(PUBLIC_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Public request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
*/

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
      serviceTiers: [
        {
          tierKey: "silver",
          title: "Argint",
          marginMultiplier: 0,
          benefitsMarkdown: "- Configuratie standard\n- Raspuns rapid\n- Pret optimizat",
        },
        {
          tierKey: "gold",
          title: "Aur",
          marginMultiplier: 12,
          benefitsMarkdown: "- Prioritate in programare\n- Coordonare extinsa\n- Documentatie completa",
        },
        {
          tierKey: "platinum",
          title: "Platina",
          marginMultiplier: 20,
          benefitsMarkdown: "- Management dedicat\n- SLA premium\n- Flux complet asistat de Darrin",
        },
      ],
      serviceSectionsOrder: ["hero", "pricing", "specialCatalog", "tiers", "benefits"],
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
        copyright: "Copyright My Darrin | Operated by Home Best Pal",
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
  minimum_order_applied?: boolean;
  minimum_order_note?: string | null;
  recommended_level: string;
  base_gross_total: number;
  delivery_badge?: string | null;
  delivery_lead_time_days?: number | null;
  levels: PublicCatalogPriceLevel[];
  last_calculated_at: string;
  source: string;
};

export type PublicCatalogServiceCard = {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  description_extended?: string | null;
  domain?: string | null;
  category?: string | null;
  subcategories: string[];
  rating_aipl?: number | null;
  availability_status?: string | null;
  rate_card?: {
    currency: string;
    base_price: number;
    legislation_code?: string | null;
    country_id?: number | null;
    zone_id?: number | null;
    is_active?: boolean | null;
  } | null;
  images?: string[] | null;
  videos?: string[] | null;
  documents?: string[] | null;
  level_attachments?: Record<string, unknown> | null;
  equipment_types: string[];
  brands: string[];
  resource_types: string[];
};

export type PublicCatalogServiceListResponse = {
  items: PublicCatalogServiceCard[];
};

export type PublicTechnicalSpecItem = {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  technical_specs: Record<string, unknown>;
};

export type PublicServiceTechnicalSpecs = {
  slug: string;
  service_name: string;
  items: PublicTechnicalSpecItem[];
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
    return await fetchPublicJson<HomepageContent>(`${API_BASE}/api/v1/public/pages/${slug}`);
  } catch {
    return createFallbackPage(slug);
  }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  return getSitePageContent("homepage");
}

export async function getPublicServiceTaxonomy(slug: string): Promise<PublicServiceTaxonomy | null> {
  try {
    return await fetchPublicJson<PublicServiceTaxonomy>(
      `${API_BASE}/api/v1/public/pages/service-taxonomy/${resolveSourceSlug(slug)}`,
    );
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
    return await fetchPublicJson<PublicCatalogPrice>(
      `${API_BASE}/api/v1/public/sync/catalog-price/${resolveSourceSlug(slug)}${query ? `?${query}` : ""}`,
    );
  } catch {
    return null;
  }
}

export async function getPublicCatalogServices(params?: {
  domain?: string;
  category?: string;
  subcategory?: string;
  resourceTypes?: string[];
  equipmentTypes?: string[];
  brands?: string[];
}): Promise<PublicCatalogServiceCard[]> {
  try {
    const query = new URLSearchParams();
    if (params?.domain) {
      query.set("domain", params.domain);
    }
    if (params?.category) {
      query.set("category", params.category);
    }
    if (params?.subcategory) {
      query.set("subcategory", params.subcategory);
    }
    for (const value of params?.resourceTypes ?? []) {
      query.append("resource_type", value);
    }
    for (const value of params?.equipmentTypes ?? []) {
      query.append("equipment_type", value);
    }
    for (const value of params?.brands ?? []) {
      query.append("brand", value);
    }
    const queryString = query.toString();
    const response = await fetchPublicJson<PublicCatalogServiceListResponse>(
      `${API_BASE}/api/v1/public/catalog/services${queryString ? `?${queryString}` : ""}`,
    );
    return response.items ?? [];
  } catch {
    return [];
  }
}

export async function getPublicCatalogServiceBySlug(slug: string): Promise<PublicCatalogServiceCard | null> {
  try {
    return await fetchPublicJson<PublicCatalogServiceCard>(`${API_BASE}/api/v1/public/catalog/services/${slug}`);
  } catch {
    return null;
  }
}

export async function getPublicServiceTechnicalSpecs(slug: string): Promise<PublicServiceTechnicalSpecs | null> {
  try {
    return await fetchPublicJson<PublicServiceTechnicalSpecs>(
      `${API_BASE}/api/v1/public/catalog/services/${slug}/technical-specs`,
    );
  } catch {
    return null;
  }
}

export async function getPublicSyncManifest(): Promise<PublicSyncManifest | null> {
  try {
    return await fetchPublicJson<PublicSyncManifest>(`${API_BASE}/api/v1/public/sync/manifest`);
  } catch {
    return null;
  }
}
