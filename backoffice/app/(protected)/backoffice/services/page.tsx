"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  createService,
  deleteService,
  getServiceAttachments,
  getServices,
  patchContentSync,
  getSubcategories,
  ServiceRecord,
  SubcategoryRecord,
  updateService,
  uploadServiceAttachment,
} from "@/lib/api";

type ServiceTierForm = {
  tierKey: "silver" | "gold" | "platinum";
  title: string;
  marginMultiplier: string;
  benefitsMarkdown: string;
};

type ServiceForm = {
  name: string;
  slug: string;
  description: string;
  description_extended: string;
  subcategory_ids: string;
  service_tiers: ServiceTierForm[];
  level_attachments: Record<string, unknown>;
};

const defaultServiceTiers = (): ServiceTierForm[] => [
  {
    tierKey: "silver",
    title: "Argint",
    marginMultiplier: "0",
    benefitsMarkdown: "- Configuratie standard\n- Executie eficienta\n- Pret optimizat",
  },
  {
    tierKey: "gold",
    title: "Aur",
    marginMultiplier: "12",
    benefitsMarkdown: "- Programare prioritara\n- Coordonare extinsa\n- Documentatie completa",
  },
  {
    tierKey: "platinum",
    title: "Platina",
    marginMultiplier: "20",
    benefitsMarkdown: "- Management dedicat\n- SLA premium\n- Asistenta extinsa",
  },
];

function normalizeServiceTiers(levelAttachments: Record<string, unknown> | null | undefined): ServiceTierForm[] {
  const raw = Array.isArray(levelAttachments?.service_tiers) ? levelAttachments.service_tiers : [];
  const normalized = raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as Record<string, unknown>;
      const tierKey = String(record.tierKey ?? "").toLowerCase();
      if (tierKey !== "silver" && tierKey !== "gold" && tierKey !== "platinum") {
        return null;
      }
      return {
        tierKey,
        title: String(record.title ?? ""),
        marginMultiplier: String(record.marginMultiplier ?? "0"),
        benefitsMarkdown: String(record.benefitsMarkdown ?? ""),
      } as ServiceTierForm;
    })
    .filter((item): item is ServiceTierForm => Boolean(item));

  if (normalized.length === 3) {
    return normalized;
  }

  return defaultServiceTiers();
}

const emptyForm: ServiceForm = {
  name: "",
  slug: "",
  description: "",
  description_extended: "",
  subcategory_ids: "",
  service_tiers: defaultServiceTiers(),
  level_attachments: {},
};

function toPayload(form: ServiceForm) {
  const { service_tiers, level_attachments, ...rest } = form;
  return {
    name: rest.name.trim(),
    slug: rest.slug.trim(),
    description: rest.description.trim() || null,
    description_extended: rest.description_extended.trim() || null,
    is_active: true,
    images: [],
    documents: [],
    videos: [],
    level_attachments: {
      ...(level_attachments ?? {}),
      service_tiers: service_tiers.map((tier) => ({
        tierKey: tier.tierKey,
        title: tier.title.trim(),
        marginMultiplier: Number(tier.marginMultiplier || 0),
        benefitsMarkdown: tier.benefitsMarkdown,
      })),
    },
    subcategory_ids: rest.subcategory_ids.split(",").map((item) => Number(item.trim())).filter(Boolean),
  };
}

function ServiceTierEditor({
  tiers,
  onChange,
}: {
  tiers: ServiceTierForm[];
  onChange: (tiers: ServiceTierForm[]) => void;
}) {
  return (
    <div className="grid gap-4">
      {tiers.map((tier, index) => (
        <div key={tier.tierKey} className="rounded-2xl border border-border bg-white/80 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-ink">{tier.title || tier.tierKey}</div>
            <span className="tag">{tier.tierKey.toUpperCase()}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="field"
              placeholder="Titlu nivel"
              value={tier.title}
              onChange={(event) =>
                onChange(
                  tiers.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, title: event.target.value } : item,
                  ),
                )
              }
            />
            <input
              className="field"
              placeholder="Multiplicator marja (%)"
              value={tier.marginMultiplier}
              type="number"
              onChange={(event) =>
                onChange(
                  tiers.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, marginMultiplier: event.target.value } : item,
                  ),
                )
              }
            />
          </div>
          <textarea
            className="field mt-3 min-h-28"
            placeholder="Beneficii Markdown"
            value={tier.benefitsMarkdown}
            onChange={(event) =>
              onChange(
                tiers.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, benefitsMarkdown: event.target.value } : item,
                ),
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

function summarizeTierPrices(tiers: ServiceTierForm[]) {
  return tiers.map((tier) => ({
    label: tier.tierKey === "silver" ? "Arg" : tier.tierKey === "gold" ? "Aur" : "Pla",
    value: `+${Number(tier.marginMultiplier || 0)}%`,
  }));
}

export default function ServicesPage() {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRecord[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, ServiceForm>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<Record<number, File | null>>({});
  const [attachmentTypes, setAttachmentTypes] = useState<Record<number, string>>({});
  const [attachmentLevels, setAttachmentLevels] = useState<Record<number, string>>({});
  const [createTab, setCreateTab] = useState<"general" | "tiers">("general");
  const [editTabs, setEditTabs] = useState<Record<number, "general" | "tiers">>({});

  async function load() {
    if (!token) return;
    const [serviceData, subcategoryData] = await Promise.all([getServices(token), getSubcategories(token)]);
    setServices(serviceData);
    setSubcategories(subcategoryData);
    setEditing(
      Object.fromEntries(
        serviceData.map((item) => [
          item.id,
          {
            name: item.name,
            slug: item.slug,
            description: item.description ?? "",
            description_extended: item.description_extended ?? "",
            subcategory_ids: item.subcategory_ids.join(", "),
            service_tiers: normalizeServiceTiers(item.level_attachments),
            level_attachments: item.level_attachments ?? {},
          },
        ]),
      ),
    );
    setEditTabs(Object.fromEntries(serviceData.map((item) => [item.id, "general"])));
  }

  useEffect(() => {
    void load();
  }, [token]);

  const stats = useMemo(
    () => ({
      total: services.length,
      active: services.filter((item) => item.is_active).length,
      attachmentReady: services.filter((item) => (item.images?.length ?? 0) + (item.documents?.length ?? 0) + (item.videos?.length ?? 0) > 0).length,
    }),
    [services],
  );

  function validateForm(payload: ReturnType<typeof toPayload>) {
    if (!payload.name.trim()) {
      return "Numele serviciului este obligatoriu.";
    }
    if (!payload.slug.trim()) {
      return "Slug-ul serviciului este obligatoriu.";
    }
    if (payload.slug.includes(" ")) {
      return "Slug-ul nu poate contine spatii.";
    }
    const tiers = payload.level_attachments?.service_tiers ?? [];
    if (tiers.some((tier) => Number.isNaN(Number(tier.marginMultiplier)))) {
      return "Multiplicatorii de marja trebuie sa fie numerici.";
    }
    return "";
  }

  function validateAttachment(file: File, type: string) {
    if (type === "IMAGE" && !file.type.startsWith("image/")) {
      return "Pentru Imagine acceptam doar fisiere image/*.";
    }
    if (type === "VIDEO" && !file.type.startsWith("video/")) {
      return "Pentru Video acceptam doar fisiere video/*.";
    }
    if (type === "DOCUMENT" && file.type !== "application/pdf") {
      return "Pentru Document acceptam doar PDF.";
    }
    return "";
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setError("");
    setMessage("");
    const payload = toPayload(form);
    const validationError = validateForm(payload);
    if (validationError) {
      setError(validationError);
      return;
    }
    await createService(token, payload);
    await patchContentSync(token, {
      slug: "service-detail",
      path: "serviceTiers",
      value: payload.level_attachments.service_tiers,
    });
    setForm(emptyForm);
    setMessage("Serviciul a fost creat.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    setError("");
    setMessage("");
    const payload = toPayload(editing[id]);
    const validationError = validateForm(payload);
    if (validationError) {
      setError(validationError);
      return;
    }
    await updateService(token, id, payload);
    await patchContentSync(token, {
      slug: "service-detail",
      path: "serviceTiers",
      value: payload.level_attachments.service_tiers,
    });
    setMessage("Serviciul a fost actualizat.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    setError("");
    setMessage("");
    await deleteService(token, id);
    setMessage("Serviciul a fost sters.");
    await load();
  }

  async function handleUploadAttachment(serviceId: number) {
    if (!token || !attachmentFiles[serviceId]) return;
    setError("");
    setMessage("");
    const file = attachmentFiles[serviceId] as File;
    const attachmentType = attachmentTypes[serviceId] ?? "IMAGE";
    const attachmentError = validateAttachment(file, attachmentType);
    if (attachmentError) {
      setError(attachmentError);
      return;
    }
    await uploadServiceAttachment(token, {
      serviceId,
      attachmentType,
      levelName: attachmentLevels[serviceId] || undefined,
      file,
    });
    setMessage("Atasamentul serviciului a fost incarcat.");
    await getServiceAttachments(token, serviceId);
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Catalog Servicii Tehnice"
        description="Panou service-oriented pentru servicii finale, tier-uri comerciale, disponibilitate si tranzitia rapida catre design sau preview live."
        badge="Service engineering"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Servicii</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Active</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.active}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Cu atasamente</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.attachmentReady}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}
      {error ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Creeaza serviciu</h2>
          <div className="mt-4 flex gap-2">
            {[
              { key: "general", label: "General" },
              { key: "tiers", label: "Service Tiers" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCreateTab(tab.key as "general" | "tiers")}
                className={createTab === tab.key ? "btn-primary" : "btn-secondary"}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            {createTab === "general" ? (
              <>
                <input className="field" placeholder="Nume" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                <input className="field" placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
                <textarea className="field min-h-24" placeholder="Descriere scurta" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                <textarea className="field min-h-32" placeholder="Descriere extinsa" value={form.description_extended} onChange={(event) => setForm((current) => ({ ...current, description_extended: event.target.value }))} />
                <input className="field" placeholder="ID-uri subcategorii separate prin virgula" value={form.subcategory_ids} onChange={(event) => setForm((current) => ({ ...current, subcategory_ids: event.target.value }))} />
                <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                  Subcategorii disponibile: {subcategories.map((item) => `${item.id}:${item.name_ro}`).join(" | ")}
                </div>
              </>
            ) : (
              <ServiceTierEditor
                tiers={form.service_tiers}
                onChange={(tiers) => setForm((current) => ({ ...current, service_tiers: tiers }))}
              />
            )}
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">Salveaza serviciul</button>
              <button
                className="btn-secondary"
                type="button"
                disabled={!form.slug}
                onClick={() => {
                  if (!form.slug) return;
                  window.open(`http://127.0.0.1:3001/services/${form.slug}`, "_blank", "noopener,noreferrer");
                }}
              >
                Previzualizare Publica
              </button>
            </div>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Servicii existente</h2>
          <div className="mt-5 service-grid-shell">
            <div className="service-grid-head">
              <div>Serviciu</div>
              <div>Tiers</div>
              <div>Arg / Aur / Pla</div>
              <div>Lead Time</div>
              <div>Actiuni rapide</div>
            </div>
            {services.map((item) => {
              const current = editing[item.id];
              const tierSummary = summarizeTierPrices(current?.service_tiers ?? defaultServiceTiers());
              return (
                <article key={item.id} className="service-grid-row">
                  <div>
                    <div className="font-semibold text-ink">{item.name}</div>
                    <div className="service-grid-cell-muted">{item.slug}</div>
                    <div className="mt-2 text-xs text-muted">{current?.subcategory_ids || "Fara subcategorii"}</div>
                  </div>

                  <div className="service-grid-cell-muted">
                    {(current?.service_tiers ?? defaultServiceTiers()).map((tier) => tier.title).join(" / ")}
                  </div>

                  <div className="service-tier-prices">
                    {tierSummary.map((tier) => (
                      <div key={tier.label} className="service-tier-price-line">
                        <strong>{tier.label}</strong>
                        <span>{tier.value}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="service-status-pill">{item.is_active ? "Disponibil" : "Inactiv"}</div>
                    <div className="mt-2 text-xs text-muted">Lead Time: 24h</div>
                  </div>

                  <div className="service-grid-actions">
                    <button
                      type="button"
                      className="service-grid-action"
                      onClick={() =>
                        setEditTabs((state) => ({ ...state, [item.id]: "general" }))
                      }
                    >
                      Edit Tech
                    </button>
                    <button
                      type="button"
                      className="service-grid-action"
                      onClick={() =>
                        setEditTabs((state) => ({ ...state, [item.id]: "tiers" }))
                      }
                    >
                      Edit Design
                    </button>
                    <a href={`http://127.0.0.1:3001/services/${item.slug}`} target="_blank" rel="noreferrer" className="service-grid-action">
                      Preview Live
                    </a>
                  </div>

                  <div className="col-span-full mt-4 rounded-3xl border border-border bg-[#fbfbfc] p-5">
                    <div className="mb-4 flex gap-2">
                    {[
                      { key: "general", label: "General" },
                      { key: "tiers", label: "Service Tiers" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() =>
                          setEditTabs((state) => ({ ...state, [item.id]: tab.key as "general" | "tiers" }))
                        }
                        className={editTabs[item.id] === tab.key ? "btn-primary" : "btn-secondary"}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="grid gap-3">
                      {editTabs[item.id] === "tiers" ? (
                        <ServiceTierEditor
                          tiers={current?.service_tiers ?? defaultServiceTiers()}
                          onChange={(tiers) =>
                            setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], service_tiers: tiers } }))
                          }
                        />
                      ) : (
                        <>
                          <input className="field" value={current?.name ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name: event.target.value } }))} />
                          <input className="field" value={current?.slug ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], slug: event.target.value } }))} />
                          <textarea className="field min-h-24" value={current?.description ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], description: event.target.value } }))} />
                          <textarea className="field min-h-32" value={current?.description_extended ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], description_extended: event.target.value } }))} />
                          <input className="field" value={current?.subcategory_ids ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], subcategory_ids: event.target.value } }))} />
                          <div className="rounded-2xl border border-border bg-white/80 p-4">
                            <div className="text-sm font-semibold text-ink">Atasamente</div>
                            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_0.8fr_0.8fr_auto]">
                              <input className="field" type="file" onChange={(event) => setAttachmentFiles((state) => ({ ...state, [item.id]: event.target.files?.[0] ?? null }))} />
                              <select className="field" value={attachmentTypes[item.id] ?? "IMAGE"} onChange={(event) => setAttachmentTypes((state) => ({ ...state, [item.id]: event.target.value }))}>
                                <option value="IMAGE">Imagine</option>
                                <option value="DOCUMENT">Document</option>
                                <option value="VIDEO">Video</option>
                              </select>
                              <select className="field" value={attachmentLevels[item.id] ?? ""} onChange={(event) => setAttachmentLevels((state) => ({ ...state, [item.id]: event.target.value }))}>
                                <option value="">Fara nivel</option>
                                <option value="BRONZ">BRONZ</option>
                                <option value="ARGINT">ARGINT</option>
                                <option value="AUR">AUR</option>
                                <option value="PLATINUM">PLATINUM</option>
                              </select>
                              <button className="btn-secondary" type="button" onClick={() => void handleUploadAttachment(item.id)}>Upload</button>
                            </div>
                            <div className="mt-3 grid gap-2 md:grid-cols-3">
                              {[...(item.images ?? []), ...(item.documents ?? []), ...(item.videos ?? [])].map((url) => (
                                <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-white px-3 py-2 text-xs text-accent">
                                  {url.split("/").pop()}
                                </a>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                      <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                        <div className="font-semibold text-ink">{item.name}</div>
                        <div className="mt-1">{item.slug}</div>
                      </div>
                      <div className="grid gap-3">
                        <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
                        <button className="btn-secondary" type="button" onClick={() => void handleDelete(item.id)}>Sterge</button>
                        <a
                          href={`http://127.0.0.1:3001/services/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                        >
                          Previzualizare Publica
                        </a>
                      </div>
                    </div>
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
