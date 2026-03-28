"use client";

import { useEffect, useMemo, useState } from "react";

import { getSiteContentPage, listSiteContentPages, updateSiteContentPage } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type HomepageBuilderContent = {
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
  dualEntry?: {
    aiCardTitle?: string;
    catalogCardTitle?: string;
  };
  featuredServices?: Array<{
    slug: string;
    title: string;
    rating: string;
    startingPrice: string;
    featured?: boolean;
  }>;
  howItWorks?: string[];
  benefits?: string[];
  finalCta?: {
    primary?: string;
    secondary?: string;
  };
  footer?: {
    columns?: Record<string, string[]>;
    apps?: string[];
  };
  syncFlow?: string[];
};

const defaultContent: HomepageBuilderContent = {
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
  ],
  howItWorks: ["Descrii / Alegi", "Primesti deviz", "Alegi furnizor", "Executie", "Plata securizata + garantie"],
  benefits: ["Pret standardizat", "Garantie", "Asigurare", "Profesionisti verificati"],
  finalCta: {
    primary: "Incepe acum",
    secondary: "Devino partener",
  },
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
};

function splitLines(value?: string[] | null) {
  return (value ?? []).join("\n");
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function HomepageBuilderAdminPage() {
  const { token } = useAuth();
  const [selectedSlug, setSelectedSlug] = useState("homepage");
  const [availablePages, setAvailablePages] = useState<Array<{ slug: string; title: string; status: string }>>([]);
  const [title, setTitle] = useState("Homepage Publica My Darrin");
  const [status, setStatus] = useState("published");
  const [notes, setNotes] = useState("");
  const [content, setContent] = useState<HomepageBuilderContent>(defaultContent);
  const [contentJson, setContentJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    Promise.all([listSiteContentPages(token), getSiteContentPage(token, selectedSlug)])
      .then(([pages, page]) => {
        const incoming = (page.content ?? {}) as HomepageBuilderContent;
        setAvailablePages(pages);
        setTitle(page.title);
        setStatus(page.status);
        setNotes(page.notes ?? "");
        setContent({
          ...defaultContent,
          ...incoming,
          meta: { ...defaultContent.meta, ...incoming.meta },
          branding: { ...defaultContent.branding, ...incoming.branding },
          design: {
            ...defaultContent.design,
            ...incoming.design,
            fonts: { ...defaultContent.design?.fonts, ...incoming.design?.fonts },
            fontSizes: { ...defaultContent.design?.fontSizes, ...incoming.design?.fontSizes },
            colors: { ...defaultContent.design?.colors, ...incoming.design?.colors },
          },
          mediaLibrary: { ...defaultContent.mediaLibrary, ...incoming.mediaLibrary },
          header: { ...defaultContent.header, ...incoming.header },
          hero: { ...defaultContent.hero, ...incoming.hero },
          dualEntry: { ...defaultContent.dualEntry, ...incoming.dualEntry },
          finalCta: { ...defaultContent.finalCta, ...incoming.finalCta },
          footer: {
            columns: { ...defaultContent.footer?.columns, ...incoming.footer?.columns },
            apps: incoming.footer?.apps ?? defaultContent.footer?.apps,
          },
        });
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Nu am putut incarca editorul paginilor publice.");
      })
      .finally(() => setLoading(false));
  }, [selectedSlug, token]);

  useEffect(() => {
    setContentJson(JSON.stringify(content, null, 2));
  }, [content]);

  const syncSummary = useMemo(() => {
    return [
      "Backoffice save",
      `PUT /api/v1/backoffice/site-content/${selectedSlug}`,
      "Persistare in site_content_pages",
      `GET /api/v1/public/pages/${selectedSlug}`,
      "Render public no-store",
    ];
  }, [selectedSlug]);

  function patchContent(patch: Partial<HomepageBuilderContent>) {
    setContent((current) => ({ ...current, ...patch }));
  }

  async function onSave() {
    if (!token) {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const parsed = JSON.parse(contentJson) as Record<string, unknown>;
      const page = await updateSiteContentPage(token, selectedSlug, {
        title,
        status,
        notes,
        content: parsed,
      });
      setContent((page.content ?? defaultContent) as HomepageBuilderContent);
      setMessage(`Pagina publica "${selectedSlug}" a fost salvata. Frontend-ul poate prelua imediat noua configuratie.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Salvarea a esuat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="panel px-6 py-6">
        <div className="text-xs uppercase tracking-[0.24em] text-muted">Web Design</div>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Public Pages Builder</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
          Regasesti aici toate paginile publice sincronizate cu frontendul. Selectezi pagina, editezi continutul
          aprobat si salvezi pe slugul corect, pastrand si controlul complet asupra JSON-ului.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
        <div className="grid gap-6">
          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Setari generale</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Pagina publica
                <select className="field" value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)}>
                  {availablePages.map((page) => (
                    <option key={page.slug} value={page.slug}>
                      {page.title} ({page.slug})
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Titlu pagina
                <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Status publicare
                <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Brand
                <input
                  className="field"
                  value={content.meta?.brand ?? ""}
                  onChange={(event) =>
                    patchContent({ meta: { ...content.meta, brand: event.target.value } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Sub-brand
                <input
                  className="field"
                  value={content.meta?.subBrand ?? ""}
                  onChange={(event) =>
                    patchContent({ meta: { ...content.meta, subBrand: event.target.value } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Domeniu staging
                <input
                  className="field"
                  value={content.meta?.domain ?? ""}
                  onChange={(event) =>
                    patchContent({ meta: { ...content.meta, domain: event.target.value } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Domeniu productie
                <input
                  className="field"
                  value={content.meta?.goLiveDomain ?? ""}
                  onChange={(event) =>
                    patchContent({ meta: { ...content.meta, goLiveDomain: event.target.value } })
                  }
                />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Note editoriale
              <textarea className="field min-h-32" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Branding</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Logo text
                <input
                  className="field"
                  value={content.branding?.logoText ?? ""}
                  onChange={(event) => patchContent({ branding: { ...content.branding, logoText: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Logo subtext
                <input
                  className="field"
                  value={content.branding?.logoSubtext ?? ""}
                  onChange={(event) => patchContent({ branding: { ...content.branding, logoSubtext: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted md:col-span-2">
                Slogan
                <input
                  className="field"
                  value={content.branding?.slogan ?? ""}
                  onChange={(event) => patchContent({ branding: { ...content.branding, slogan: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Logo URL
                <input
                  className="field"
                  value={content.branding?.logoUrl ?? ""}
                  onChange={(event) => patchContent({ branding: { ...content.branding, logoUrl: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Favicon URL
                <input
                  className="field"
                  value={content.branding?.faviconUrl ?? ""}
                  onChange={(event) => patchContent({ branding: { ...content.branding, faviconUrl: event.target.value } })}
                />
              </label>
            </div>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Design Assets</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Hero video URL
                <input
                  className="field"
                  value={content.mediaLibrary?.heroVideoUrl ?? ""}
                  onChange={(event) =>
                    patchContent({ mediaLibrary: { ...content.mediaLibrary, heroVideoUrl: event.target.value } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Hero image URL
                <input
                  className="field"
                  value={content.mediaLibrary?.heroImageUrl ?? ""}
                  onChange={(event) =>
                    patchContent({ mediaLibrary: { ...content.mediaLibrary, heroImageUrl: event.target.value } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Bannere
                <textarea
                  className="field min-h-32"
                  value={splitLines(content.mediaLibrary?.bannerUrls)}
                  onChange={(event) =>
                    patchContent({ mediaLibrary: { ...content.mediaLibrary, bannerUrls: parseLines(event.target.value) } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Variante logo
                <textarea
                  className="field min-h-32"
                  value={splitLines(content.mediaLibrary?.logoVariants)}
                  onChange={(event) =>
                    patchContent({ mediaLibrary: { ...content.mediaLibrary, logoVariants: parseLines(event.target.value) } })
                  }
                />
              </label>
            </div>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Fonturi si marimi</div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm text-muted">
                Font display
                <input
                  className="field"
                  value={content.design?.fonts?.display ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        fonts: { ...content.design?.fonts, display: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Font body
                <input
                  className="field"
                  value={content.design?.fonts?.body ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        fonts: { ...content.design?.fonts, body: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Font accent
                <input
                  className="field"
                  value={content.design?.fonts?.accent ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        fonts: { ...content.design?.fonts, accent: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Marime hero
                <input
                  className="field"
                  value={content.design?.fontSizes?.hero ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        fontSizes: { ...content.design?.fontSizes, hero: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Marime section title
                <input
                  className="field"
                  value={content.design?.fontSizes?.sectionTitle ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        fontSizes: { ...content.design?.fontSizes, sectionTitle: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Marime body
                <input
                  className="field"
                  value={content.design?.fontSizes?.body ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        fontSizes: { ...content.design?.fontSizes, body: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Marime label
                <input
                  className="field"
                  value={content.design?.fontSizes?.label ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        fontSizes: { ...content.design?.fontSizes, label: event.target.value },
                      },
                    })
                  }
                />
              </label>
            </div>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Culori</div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm text-muted">
                Primary
                <input
                  className="field"
                  value={content.design?.colors?.primary ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        colors: { ...content.design?.colors, primary: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Secondary
                <input
                  className="field"
                  value={content.design?.colors?.secondary ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        colors: { ...content.design?.colors, secondary: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Accent
                <input
                  className="field"
                  value={content.design?.colors?.accent ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        colors: { ...content.design?.colors, accent: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Background
                <input
                  className="field"
                  value={content.design?.colors?.background ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        colors: { ...content.design?.colors, background: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Surface
                <input
                  className="field"
                  value={content.design?.colors?.surface ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        colors: { ...content.design?.colors, surface: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Text
                <input
                  className="field"
                  value={content.design?.colors?.text ?? ""}
                  onChange={(event) =>
                    patchContent({
                      design: {
                        ...content.design,
                        colors: { ...content.design?.colors, text: event.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Theme CTA
                <input
                  className="field"
                  value={content.meta?.theme?.cta ?? ""}
                  onChange={(event) =>
                    patchContent({
                      meta: { ...content.meta, theme: { ...content.meta?.theme, cta: event.target.value } },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Theme structure
                <input
                  className="field"
                  value={content.meta?.theme?.structure ?? ""}
                  onChange={(event) =>
                    patchContent({
                      meta: { ...content.meta, theme: { ...content.meta?.theme, structure: event.target.value } },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Theme AI
                <input
                  className="field"
                  value={content.meta?.theme?.ai ?? ""}
                  onChange={(event) =>
                    patchContent({
                      meta: { ...content.meta, theme: { ...content.meta?.theme, ai: event.target.value } },
                    })
                  }
                />
              </label>
            </div>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Header</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Adresa utilizator
                <input
                  className="field"
                  value={content.header?.locationLabel ?? ""}
                  onChange={(event) =>
                    patchContent({ header: { ...content.header, locationLabel: event.target.value } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Limba default
                <input
                  className="field"
                  value={content.header?.language ?? ""}
                  onChange={(event) =>
                    patchContent({ header: { ...content.header, language: event.target.value } })
                  }
                />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Search placeholder
              <input
                className="field"
                value={content.header?.searchPlaceholder ?? ""}
                onChange={(event) =>
                  patchContent({ header: { ...content.header, searchPlaceholder: event.target.value } })
                }
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Meniu public
              <textarea
                className="field min-h-28"
                value={splitLines(content.header?.menu)}
                onChange={(event) =>
                  patchContent({ header: { ...content.header, menu: parseLines(event.target.value) } })
                }
              />
            </label>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Hero</div>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm text-muted">
                Headline
                <input
                  className="field"
                  value={content.hero?.headline ?? ""}
                  onChange={(event) => patchContent({ hero: { ...content.hero, headline: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Subheadline
                <textarea
                  className="field min-h-28"
                  value={content.hero?.subheadline ?? ""}
                  onChange={(event) => patchContent({ hero: { ...content.hero, subheadline: event.target.value } })}
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm text-muted">
                CTA principal
                <input
                  className="field"
                  value={content.hero?.primaryCta ?? ""}
                  onChange={(event) => patchContent({ hero: { ...content.hero, primaryCta: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                CTA secundar
                <input
                  className="field"
                  value={content.hero?.secondaryCta ?? ""}
                  onChange={(event) => patchContent({ hero: { ...content.hero, secondaryCta: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Media type
                <select
                  className="field"
                  value={content.hero?.mediaType ?? "VIDEO"}
                  onChange={(event) => patchContent({ hero: { ...content.hero, mediaType: event.target.value } })}
                >
                  <option value="VIDEO">VIDEO</option>
                  <option value="IMAGINE">IMAGINE</option>
                  <option value="SLIDE">SLIDE</option>
                </select>
              </label>
            </div>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">Liste administrabile</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Categorii rapide
                <textarea
                  className="field min-h-32"
                  value={splitLines((content.quickCategories ?? []).map((item) => `${item.title}|${item.media ?? "IMAGINE"}`))}
                  onChange={(event) =>
                    patchContent({
                      quickCategories: parseLines(event.target.value).map((line) => {
                        const [titlePart, mediaPart] = line.split("|");
                        return { title: titlePart?.trim() ?? "", media: mediaPart?.trim() || "IMAGINE" };
                      }),
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Featured services
                <textarea
                  className="field min-h-32"
                  value={splitLines(
                    (content.featuredServices ?? []).map(
                      (item) => `${item.slug}|${item.title}|${item.rating}|${item.startingPrice}|${item.featured ? "true" : "false"}`,
                    ),
                  )}
                  onChange={(event) =>
                    patchContent({
                      featuredServices: parseLines(event.target.value).map((line) => {
                        const [slug, titlePart, rating, startingPrice, featuredFlag] = line.split("|");
                        return {
                          slug: slug?.trim() ?? "",
                          title: titlePart?.trim() ?? "",
                          rating: rating?.trim() ?? "",
                          startingPrice: startingPrice?.trim() ?? "",
                          featured: featuredFlag?.trim() === "true",
                        };
                      }),
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                How it works
                <textarea
                  className="field min-h-32"
                  value={splitLines(content.howItWorks)}
                  onChange={(event) => patchContent({ howItWorks: parseLines(event.target.value) })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Beneficii
                <textarea
                  className="field min-h-32"
                  value={splitLines(content.benefits)}
                  onChange={(event) => patchContent({ benefits: parseLines(event.target.value) })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Footer links
                <textarea
                  className="field min-h-32"
                  value={Object.entries(content.footer?.columns ?? {})
                    .map(([column, values]) => `${column}:${values.join(", ")}`)
                    .join("\n")}
                  onChange={(event) =>
                    patchContent({
                      footer: {
                        ...content.footer,
                        columns: Object.fromEntries(
                          parseLines(event.target.value).map((line) => {
                            const [column, values] = line.split(":");
                            return [column?.trim() ?? "links", values ? values.split(",").map((item) => item.trim()).filter(Boolean) : []];
                          }),
                        ),
                      },
                    })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Flux sincronizare
                <textarea
                  className="field min-h-32"
                  value={splitLines(content.syncFlow)}
                  onChange={(event) => patchContent({ syncFlow: parseLines(event.target.value) })}
                />
              </label>
            </div>
          </article>

          <article className="panel px-6 py-6">
            <div className="mb-4 text-lg font-semibold text-ink">CTA final si dual entry</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Darrin AI card
                <input
                  className="field"
                  value={content.dualEntry?.aiCardTitle ?? ""}
                  onChange={(event) => patchContent({ dualEntry: { ...content.dualEntry, aiCardTitle: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Catalog card
                <input
                  className="field"
                  value={content.dualEntry?.catalogCardTitle ?? ""}
                  onChange={(event) =>
                    patchContent({ dualEntry: { ...content.dualEntry, catalogCardTitle: event.target.value } })
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                CTA final principal
                <input
                  className="field"
                  value={content.finalCta?.primary ?? ""}
                  onChange={(event) => patchContent({ finalCta: { ...content.finalCta, primary: event.target.value } })}
                />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                CTA final secundar
                <input
                  className="field"
                  value={content.finalCta?.secondary ?? ""}
                  onChange={(event) => patchContent({ finalCta: { ...content.finalCta, secondary: event.target.value } })}
                />
              </label>
            </div>
          </article>
        </div>

        <div className="grid gap-6">
          <article className="panel px-6 py-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-muted">JSON config</div>
                <div className="mt-2 text-lg font-semibold text-ink">Payload editabil pentru pagina selectata</div>
              </div>
              <span className="tag">{loading ? "Loading" : "Ready"}</span>
            </div>
            <textarea
              className="field min-h-[560px] font-mono text-xs leading-6"
              value={contentJson}
              onChange={(event) => setContentJson(event.target.value)}
              spellCheck={false}
            />
          </article>

          <article className="panel px-6 py-6">
            <div className="text-lg font-semibold text-ink">Sync preview</div>
            <div className="mt-4 grid gap-3">
              {syncSummary.map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={onSave} disabled={saving || loading}>
                {saving ? "Salvez..." : `Salveaza ${selectedSlug}`}
              </button>
            </div>

            {message ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          </article>
        </div>
      </section>
    </div>
  );
}
