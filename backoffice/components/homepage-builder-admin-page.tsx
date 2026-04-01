"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/components/auth-provider";
import { getSiteContentPage, listSiteContentPages, patchContentSync, updateSiteContentPage } from "@/lib/api";

type Tier = { tierKey: "silver" | "gold" | "platinum"; title: string; marginMultiplier?: number; benefitsMarkdown?: string };
type BuilderContent = {
  meta?: { goLiveDomain?: string };
  branding?: { logoText?: string; logoSubtext?: string; slogan?: string };
  header?: { locationLabel?: string; searchPlaceholder?: string; menu?: string[]; language?: string };
  hero?: { headline?: string; subheadline?: string; primaryCta?: string; secondaryCta?: string };
  benefits?: string[];
  quickCategories?: Array<{ title: string; media?: string }>;
  footer?: { columns?: Record<string, string[]>; apps?: string[]; copyright?: string };
  serviceTiers?: Tier[];
  serviceSectionsOrder?: string[];
};

const defaultContent: BuilderContent = {
  meta: { goLiveDomain: "www.mydarrin.com" },
  branding: { logoText: "My Darrin", logoSubtext: "Home Best Pal", slogan: "Servicii la cerere, fara frictiune" },
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
  },
  benefits: ["Pret standardizat", "Garantie", "Asigurare", "Profesionisti verificati"],
  quickCategories: [{ title: "Acasa", media: "IMAGINE" }, { title: "Auto", media: "IMAGINE" }, { title: "Industrial", media: "IMAGINE" }],
  footer: {
    columns: {
      servicii: ["Catalog", "Pagina serviciu", "Comenzi rapide"],
      companie: ["Despre", "Contact", "Investitori"],
      legal: ["Termeni", "GDPR", "Politici"],
    },
    apps: ["iOS", "Android"],
    copyright: "Copyright My Darrin | Operated by Home Best Pal",
  },
  serviceTiers: [
    { tierKey: "silver", title: "Argint", marginMultiplier: 0, benefitsMarkdown: "- Configuratie standard\n- Executie eficienta" },
    { tierKey: "gold", title: "Aur", marginMultiplier: 12, benefitsMarkdown: "- Programare prioritara\n- Coordonare extinsa" },
    { tierKey: "platinum", title: "Platina", marginMultiplier: 20, benefitsMarkdown: "- Management dedicat\n- SLA premium" },
  ],
  serviceSectionsOrder: ["hero", "pricing", "specialCatalog", "tiers", "benefits"],
};

const sectionLabels: Record<string, string> = {
  hero: "Hero & introducere",
  pricing: "Pret & disponibilitate",
  specialCatalog: "Configurator materiale",
  tiers: "Service tiers",
  benefits: "Beneficii",
};

function splitLines(value?: string[] | null) {
  return (value ?? []).join("\n");
}

function parseLines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function previewHref(slug: string) {
  if (slug === "homepage") return "http://127.0.0.1:3001/homepage-preview-v2";
  if (slug === "catalog") return "http://127.0.0.1:3001/catalog";
  if (slug === "service-detail") return "http://127.0.0.1:3001/services/montaj-centrala-termica";
  return "http://127.0.0.1:3001/homepage-preview-v2";
}

function Section({
  title,
  copy,
  open,
  onToggle,
  children,
}: {
  title: string;
  copy: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <article className="panel px-6 py-6">
      <div className="builder-section-head">
        <div>
          <div className="builder-section-title">{title}</div>
          <div className="builder-section-copy">{copy}</div>
        </div>
        <button type="button" className="btn-secondary" onClick={onToggle}>
          {open ? "Ascunde" : "Edit"}
        </button>
      </div>
      {open ? <div className="builder-section-body">{children}</div> : null}
    </article>
  );
}

export function HomepageBuilderAdminPage() {
  const { token } = useAuth();
  const [selectedSlug, setSelectedSlug] = useState("homepage");
  const [pages, setPages] = useState<Array<{ slug: string; title: string; status: string }>>([]);
  const [title, setTitle] = useState("Homepage Publica My Darrin");
  const [status, setStatus] = useState("published");
  const [notes, setNotes] = useState("");
  const [content, setContent] = useState<BuilderContent>(defaultContent);
  const [contentJson, setContentJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [autosaveLabel, setAutosaveLabel] = useState("Pregatit pentru autosave");
  const [open, setOpen] = useState({ header: true, footer: false, homepage: true, service: true, raw: false });
  const [draggedSectionKey, setDraggedSectionKey] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([listSiteContentPages(token), getSiteContentPage(token, selectedSlug)])
      .then(([pageList, page]) => {
        setPages(pageList);
        setTitle(page.title);
        setStatus(page.status);
        setNotes(page.notes ?? "");
        const next = { ...defaultContent, ...(page.content as BuilderContent) };
        setContent(next);
        setContentJson(JSON.stringify(next, null, 2));
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Nu am putut incarca builderul."))
      .finally(() => setLoading(false));
  }, [selectedSlug, token]);

  useEffect(() => {
    setContentJson(JSON.stringify(content, null, 2));
  }, [content]);

  function patchLocal<K extends keyof BuilderContent>(key: K, value: BuilderContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function autosave(path: string, value: unknown, updater: () => void) {
    updater();
    if (!token) return;
    setAutosaveLabel(`Se salveaza ${path}...`);
    setError(null);
    try {
      await patchContentSync(token, { slug: selectedSlug, path, value });
      setAutosaveLabel(`Auto-saved: ${path}`);
    } catch (saveError) {
      setAutosaveLabel(`Autosave esuat: ${path}`);
      setError(saveError instanceof Error ? saveError.message : "Autosave esuat.");
    }
  }

  async function saveAll() {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const parsed = JSON.parse(contentJson) as Record<string, unknown>;
      await updateSiteContentPage(token, selectedSlug, { title, status, notes, content: parsed });
      setMessage(`Pagina "${selectedSlug}" a fost salvata complet.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Salvarea completa a esuat.");
    } finally {
      setSaving(false);
    }
  }

  function reorderSections(fromKey: string, toKey: string) {
    if (fromKey === toKey) {
      return;
    }
    const order = [...(content.serviceSectionsOrder ?? [])];
    const fromIndex = order.indexOf(fromKey);
    const toIndex = order.indexOf(toKey);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    void autosave("serviceSectionsOrder", order, () => patchLocal("serviceSectionsOrder", order));
  }

  return (
    <div className="grid gap-6">
      <section className="panel px-6 py-6">
        <div className="text-xs uppercase tracking-[0.24em] text-muted">Visual Builder</div>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Hybrid Service-CMS</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
          Header, footer, homepage si pagina de serviciu folosesc acum un builder mai compact, cu `Edit`, autosave si preview live.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.62fr_0.38fr]">
        <div className="grid gap-6">
          <article className="panel px-6 py-6">
            <div className="builder-section-head">
              <div>
                <div className="builder-section-title">Control pagina</div>
                <div className="builder-section-copy">Alegi pagina publica si urmaresti starea autosave.</div>
              </div>
              <span className="tag">{loading ? "Loading" : autosaveLabel}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Pagina publica
                <select className="field" value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)}>
                  {pages.map((page) => (
                    <option key={page.slug} value={page.slug}>{page.title} ({page.slug})</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Titlu pagina
                <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Status
                <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Domeniu productie
                <input
                  className="field"
                  value={content.meta?.goLiveDomain ?? ""}
                  onChange={(event) => patchLocal("meta", { ...content.meta, goLiveDomain: event.target.value })}
                  onBlur={(event) => void autosave("meta.goLiveDomain", event.target.value, () => patchLocal("meta", { ...content.meta, goLiveDomain: event.target.value }))}
                />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Note
              <textarea className="field min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
          </article>

          <Section title="Header & Branding" copy="Logo, slogan, limba si meniul principal." open={open.header} onToggle={() => setOpen((current) => ({ ...current, header: !current.header }))}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Logo text
                <input className="field" value={content.branding?.logoText ?? ""} onChange={(event) => patchLocal("branding", { ...content.branding, logoText: event.target.value })} onBlur={(event) => void autosave("branding.logoText", event.target.value, () => patchLocal("branding", { ...content.branding, logoText: event.target.value }))} />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Logo subtext
                <input className="field" value={content.branding?.logoSubtext ?? ""} onChange={(event) => patchLocal("branding", { ...content.branding, logoSubtext: event.target.value })} onBlur={(event) => void autosave("branding.logoSubtext", event.target.value, () => patchLocal("branding", { ...content.branding, logoSubtext: event.target.value }))} />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Slogan
              <input className="field" value={content.branding?.slogan ?? ""} onChange={(event) => patchLocal("branding", { ...content.branding, slogan: event.target.value })} onBlur={(event) => void autosave("branding.slogan", event.target.value, () => patchLocal("branding", { ...content.branding, slogan: event.target.value }))} />
            </label>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Meniu public
              <textarea className="field min-h-24" value={splitLines(content.header?.menu)} onChange={(event) => patchLocal("header", { ...content.header, menu: parseLines(event.target.value) })} onBlur={(event) => void autosave("header.menu", parseLines(event.target.value), () => patchLocal("header", { ...content.header, menu: parseLines(event.target.value) }))} />
            </label>
          </Section>

          <Section title="Footer" copy="Linkuri si app links din footer-ul public." open={open.footer} onToggle={() => setOpen((current) => ({ ...current, footer: !current.footer }))}>
            <label className="grid gap-2 text-sm text-muted">
              Coloane footer
              <textarea className="field min-h-28" value={Object.entries(content.footer?.columns ?? {}).map(([column, values]) => `${column}:${values.join(", ")}`).join("\n")} onChange={(event) => patchLocal("footer", { ...content.footer, columns: Object.fromEntries(parseLines(event.target.value).map((line) => { const [column, values] = line.split(":"); return [column?.trim() ?? "links", values ? values.split(",").map((item) => item.trim()).filter(Boolean) : []]; })) })} onBlur={(event) => void autosave("footer.columns", Object.fromEntries(parseLines(event.target.value).map((line) => { const [column, values] = line.split(":"); return [column?.trim() ?? "links", values ? values.split(",").map((item) => item.trim()).filter(Boolean) : []]; })), () => patchLocal("footer", { ...content.footer, columns: Object.fromEntries(parseLines(event.target.value).map((line) => { const [column, values] = line.split(":"); return [column?.trim() ?? "links", values ? values.split(",").map((item) => item.trim()).filter(Boolean) : []]; })) }))} />
            </label>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Copyright
              <input
                className="field"
                value={content.footer?.copyright ?? ""}
                onChange={(event) => patchLocal("footer", { ...content.footer, copyright: event.target.value })}
                onBlur={(event) => void autosave("footer.copyright", event.target.value, () => patchLocal("footer", { ...content.footer, copyright: event.target.value }))}
              />
            </label>
          </Section>

          <Section title="Homepage Sections" copy="Hero, categorii si beneficii homepage." open={open.homepage} onToggle={() => setOpen((current) => ({ ...current, homepage: !current.homepage }))}>
            <label className="grid gap-2 text-sm text-muted">
              Hero title
              <input className="field" value={content.hero?.headline ?? ""} onChange={(event) => patchLocal("hero", { ...content.hero, headline: event.target.value })} onBlur={(event) => void autosave("hero.headline", event.target.value, () => patchLocal("hero", { ...content.hero, headline: event.target.value }))} />
            </label>
            <label className="mt-4 grid gap-2 text-sm text-muted">
              Hero description
              <textarea className="field min-h-24" value={content.hero?.subheadline ?? ""} onChange={(event) => patchLocal("hero", { ...content.hero, subheadline: event.target.value })} onBlur={(event) => void autosave("hero.subheadline", event.target.value, () => patchLocal("hero", { ...content.hero, subheadline: event.target.value }))} />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-muted">
                Categorii rapide
                <textarea className="field min-h-24" value={splitLines((content.quickCategories ?? []).map((item) => `${item.title}|${item.media ?? "IMAGINE"}`))} onChange={(event) => patchLocal("quickCategories", parseLines(event.target.value).map((line) => { const [titlePart, mediaPart] = line.split("|"); return { title: titlePart?.trim() ?? "", media: mediaPart?.trim() || "IMAGINE" }; }))} onBlur={(event) => void autosave("quickCategories", parseLines(event.target.value).map((line) => { const [titlePart, mediaPart] = line.split("|"); return { title: titlePart?.trim() ?? "", media: mediaPart?.trim() || "IMAGINE" }; }), () => patchLocal("quickCategories", parseLines(event.target.value).map((line) => { const [titlePart, mediaPart] = line.split("|"); return { title: titlePart?.trim() ?? "", media: mediaPart?.trim() || "IMAGINE" }; })))} />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Beneficii
                <textarea className="field min-h-24" value={splitLines(content.benefits)} onChange={(event) => patchLocal("benefits", parseLines(event.target.value))} onBlur={(event) => void autosave("benefits", parseLines(event.target.value), () => patchLocal("benefits", parseLines(event.target.value)))} />
              </label>
            </div>
          </Section>

          {selectedSlug === "service-detail" ? (
            <Section title="Service Page Layout" copy="Reordonezi sectiunile si editezi tiers." open={open.service} onToggle={() => setOpen((current) => ({ ...current, service: !current.service }))}>
              <div className="builder-sortable-list">
                {(content.serviceSectionsOrder ?? []).map((key, index) => (
                  <div
                    key={key}
                    className={`builder-sortable-item ${draggedSectionKey === key ? "builder-sortable-item-dragging" : ""}`}
                    draggable
                    onDragStart={() => setDraggedSectionKey(key)}
                    onDragEnd={() => setDraggedSectionKey(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggedSectionKey) {
                        reorderSections(draggedSectionKey, key);
                      }
                      setDraggedSectionKey(null);
                    }}
                  >
                    <div>
                      <div className="builder-sortable-grip">⋮⋮</div>
                      <div className="builder-sortable-title">{sectionLabels[key] ?? key}</div>
                      <div className="builder-sortable-copy">Pozitie publica: {index + 1}</div>
                    </div>
                    <div className="builder-sortable-actions">
                      <span className="builder-sortable-hint">Drag & drop</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                {(content.serviceTiers ?? []).map((tier, index) => (
                  <div key={tier.tierKey} className="builder-tier-card">
                    <div className="builder-tier-kicker">{tier.tierKey.toUpperCase()}</div>
                    <label className="mt-3 grid gap-2 text-sm text-muted">
                      Titlu
                      <input className="field" value={tier.title} onChange={(event) => { const next = [...(content.serviceTiers ?? [])]; next[index] = { ...next[index], title: event.target.value }; patchLocal("serviceTiers", next); }} onBlur={(event) => { const next = [...(content.serviceTiers ?? [])]; next[index] = { ...next[index], title: event.target.value }; void autosave("serviceTiers", next, () => patchLocal("serviceTiers", next)); }} />
                    </label>
                    <label className="mt-4 grid gap-2 text-sm text-muted">
                      Marja (%)
                      <input className="field" type="number" value={tier.marginMultiplier ?? 0} onChange={(event) => { const next = [...(content.serviceTiers ?? [])]; next[index] = { ...next[index], marginMultiplier: Number(event.target.value) }; patchLocal("serviceTiers", next); }} onBlur={(event) => { const next = [...(content.serviceTiers ?? [])]; next[index] = { ...next[index], marginMultiplier: Number(event.target.value) }; void autosave("serviceTiers", next, () => patchLocal("serviceTiers", next)); }} />
                    </label>
                    <label className="mt-4 grid gap-2 text-sm text-muted">
                      Beneficii
                      <textarea className="field min-h-28" value={tier.benefitsMarkdown ?? ""} onChange={(event) => { const next = [...(content.serviceTiers ?? [])]; next[index] = { ...next[index], benefitsMarkdown: event.target.value }; patchLocal("serviceTiers", next); }} onBlur={(event) => { const next = [...(content.serviceTiers ?? [])]; next[index] = { ...next[index], benefitsMarkdown: event.target.value }; void autosave("serviceTiers", next, () => patchLocal("serviceTiers", next)); }} />
                    </label>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
        </div>

        <div className="grid gap-6">
          <article className="panel px-6 py-6">
            <div className="builder-section-head">
              <div>
                <div className="builder-section-title">Preview & sync</div>
                <div className="builder-section-copy">Verifici imediat in site-ul public.</div>
              </div>
              <span className="tag">{loading ? "Loading" : "Ready"}</span>
            </div>
            <div className="builder-preview-actions">
              <a className="btn-primary" href={previewHref(selectedSlug)} target="_blank" rel="noreferrer">Deschide live</a>
              <a className="btn-secondary" href={`${previewHref(selectedSlug)}${previewHref(selectedSlug).includes("?") ? "&" : "?"}edit_mode=1`} target="_blank" rel="noreferrer">Preview Edit Mode</a>
            </div>
            {message ? <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          </article>

          <Section title="Raw JSON override" copy="Fallback pentru bulk edits sau ajustari avansate." open={open.raw} onToggle={() => setOpen((current) => ({ ...current, raw: !current.raw }))}>
            <textarea className="field min-h-[520px] font-mono text-xs leading-6" value={contentJson} onChange={(event) => setContentJson(event.target.value)} spellCheck={false} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => void saveAll()} disabled={saving || loading}>{saving ? "Salvez..." : `Salveaza complet ${selectedSlug}`}</button>
            </div>
          </Section>
        </div>
      </section>
    </div>
  );
}
