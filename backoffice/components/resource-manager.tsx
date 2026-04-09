"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  CatalogResourceRecord,
  CatalogResourceType,
  EntityAttachmentRecord,
  createCatalogResource,
  deleteCatalogResource,
  getCatalogResources,
  getResourceAttachments,
  importEscoResourceFromFile,
  importEscoResourceFromUrl,
  updateCatalogResource,
  uploadResourceAttachment,
} from "@/lib/api";

type ResourceForm = {
  esco_code: string;
  name_ro: string;
  name_en: string;
  resource_type: CatalogResourceType;
  base_price: string;
  unit: string;
  technical_specs: string;
  external_links?: string;
};

const emptyForm: ResourceForm = {
  esco_code: "",
  name_ro: "",
  name_en: "",
  resource_type: "LABOR",
  base_price: "0",
  unit: "ora",
  technical_specs: "{}",
  external_links: "",
};

function parseSpecs(value: string) {
  try {
    return value.trim() ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function normalizeLinks(raw?: string) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toPayload(form: ResourceForm) {
  const specs = parseSpecs(form.technical_specs);
  const links = normalizeLinks(form.external_links);
  if (links.length > 0) {
    specs.external_links = links;
  } else if (specs && typeof specs === "object" && "external_links" in specs) {
    delete specs.external_links;
  }
  return {
    esco_code: form.esco_code.trim() || null,
    name_ro: form.name_ro.trim(),
    name_en: form.name_en.trim(),
    resource_type: form.resource_type,
    base_price: Number(form.base_price),
    unit: form.unit.trim(),
    technical_specs: specs,
    is_active: true,
  };
}

export function ResourceManager({
  title,
  description,
  badge,
  resourceTypeFilter,
  stickyLabel = "Salveaza resursa",
}: {
  title: string;
  description: string;
  badge: string;
  resourceTypeFilter?: CatalogResourceType;
  stickyLabel?: string;
}) {
  const { token } = useAuth();
  const [resources, setResources] = useState<CatalogResourceRecord[]>([]);
  const [form, setForm] = useState<ResourceForm>({
    ...emptyForm,
    resource_type: resourceTypeFilter ?? emptyForm.resource_type,
  });
  const [editing, setEditing] = useState<Record<number, ResourceForm>>({});
  const [message, setMessage] = useState("");
  const [escoUrl, setEscoUrl] = useState("");
  const [escoFile, setEscoFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<Record<number, File | null>>({});
  const [attachmentTypes, setAttachmentTypes] = useState<Record<number, string>>({});
  const [attachments, setAttachments] = useState<Record<number, EntityAttachmentRecord[]>>({});

  async function load() {
    if (!token) return;
    const data = await getCatalogResources(token);
    setResources(data);
    setEditing(
      Object.fromEntries(
        data.map((item) => [
          item.id,
          {
            esco_code: item.esco_code ?? "",
            name_ro: item.name_ro,
            name_en: item.name_en,
            resource_type: item.resource_type,
            base_price: String(item.base_price),
            unit: item.unit,
            technical_specs: JSON.stringify(item.technical_specs ?? {}, null, 2),
            external_links: Array.isArray(item.technical_specs?.external_links)
              ? (item.technical_specs?.external_links as string[]).join("\n")
              : "",
          },
        ]),
      ),
    );
    const attachmentEntries = await Promise.all(
      data.map(async (item) => {
        const result = await getResourceAttachments(token, item.id).catch(() => ({ items: [] }));
        return [item.id, result.items] as const;
      }),
    );
    setAttachments(Object.fromEntries(attachmentEntries));
  }

  useEffect(() => {
    void load();
  }, [token]);

  const visibleResources = useMemo(
    () => (resourceTypeFilter ? resources.filter((item) => item.resource_type === resourceTypeFilter) : resources),
    [resources, resourceTypeFilter],
  );

  const stats = useMemo(
    () => ({
      total: visibleResources.length,
      labor: visibleResources.filter((item) => item.resource_type === "LABOR").length,
      material: visibleResources.filter((item) => item.resource_type === "MATERIAL").length,
      equipment: visibleResources.filter((item) => item.resource_type === "EQUIPMENT").length,
      transport: visibleResources.filter((item) => item.resource_type === "TRANSPORT").length,
    }),
    [visibleResources],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await createCatalogResource(token, toPayload(form));
    setForm({
      ...emptyForm,
      resource_type: resourceTypeFilter ?? emptyForm.resource_type,
    });
    setMessage("Resursa a fost creata.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    await updateCatalogResource(token, id, toPayload(editing[id]));
    setMessage("Resursa a fost actualizata.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteCatalogResource(token, id);
    setMessage("Resursa a fost stearsa.");
    await load();
  }

  async function handleEscoUrlImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !escoUrl.trim()) return;
    const result = await importEscoResourceFromUrl(token, escoUrl.trim());
    setMessage(`Import ESCO finalizat pentru ${result.uri}. Relatii noi: ${result.relations_created}.`);
    setEscoUrl("");
  }

  async function handleEscoFileImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !escoFile) return;
    const result = await importEscoResourceFromFile(token, escoFile);
    setMessage(`Import JSON ESCO finalizat pentru ${result.uri}. Relatii noi: ${result.relations_created}.`);
    setEscoFile(null);
  }

  async function handleAttachmentUpload(resourceId: number) {
    if (!token || !attachmentFiles[resourceId]) return;
    await uploadResourceAttachment(token, {
      resourceId,
      attachmentType: attachmentTypes[resourceId] ?? "DOCUMENT",
      file: attachmentFiles[resourceId] as File,
    });
    const result = await getResourceAttachments(token, resourceId);
    setAttachments((state) => ({ ...state, [resourceId]: result.items }));
    setAttachmentFiles((state) => ({ ...state, [resourceId]: null }));
    setMessage("Documentatia resursei a fost incarcata.");
  }

  return (
    <div>
      <ModuleHeader title={title} description={description} badge={badge} />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="panel p-5"><div className="text-sm text-muted">Total</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Materiale</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.material}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Utilaje</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.equipment}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Transport</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.transport}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <div className="sticky-actions">
            <div className="text-sm font-semibold text-ink">Actiuni rapide</div>
            <button className="btn-primary" type="submit" form="resource-create-form">{stickyLabel}</button>
          </div>

          <h2 className="text-xl font-semibold text-ink">Import ESCO din URL sau JSON</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Importa o resursa ESCO individuala direct dintr-un URL JSON public sau dintr-un fisier descarcat local.</p>
          <form className="mt-4 grid gap-3" onSubmit={handleEscoUrlImport}>
            <input className="field" placeholder="https://esco.ec.europa.eu/.../resource.json" value={escoUrl} onChange={(event) => setEscoUrl(event.target.value)} />
            <button className="btn-secondary" type="submit" disabled={!escoUrl.trim()}>Importa din URL</button>
          </form>
          <form className="mt-4 grid gap-3" onSubmit={handleEscoFileImport}>
            <input className="field" type="file" accept=".json,application/json" onChange={(event) => setEscoFile(event.target.files?.[0] ?? null)} />
            <button className="btn-secondary" type="submit" disabled={!escoFile}>Importa din JSON</button>
          </form>

          <div className="my-8 h-px bg-black/10" />

          <h2 className="text-xl font-semibold text-ink">Creeaza resursa noua</h2>
          <form id="resource-create-form" className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <input className="field" placeholder="ESCO code / concept URI" value={form.esco_code} onChange={(event) => setForm((current) => ({ ...current, esco_code: event.target.value }))} />
            <input className="field" placeholder="Nume RO" value={form.name_ro} onChange={(event) => setForm((current) => ({ ...current, name_ro: event.target.value }))} />
            <input className="field" placeholder="Name EN" value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} />
            <div className="grid gap-3 md:grid-cols-3">
              <select
                className="field"
                value={form.resource_type}
                onChange={(event) => setForm((current) => ({ ...current, resource_type: event.target.value as CatalogResourceType }))}
                disabled={Boolean(resourceTypeFilter)}
              >
                <option value="LABOR">LABOR</option>
                <option value="MATERIAL">MATERIAL</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
                <option value="TRANSPORT">TRANSPORT</option>
              </select>
              <input className="field" placeholder="Pret baza" value={form.base_price} onChange={(event) => setForm((current) => ({ ...current, base_price: event.target.value }))} />
              <input className="field" placeholder="Unitate" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} />
            </div>
            <textarea className="field min-h-32 font-mono text-xs" placeholder='{"spec":"value"}' value={form.technical_specs} onChange={(event) => setForm((current) => ({ ...current, technical_specs: event.target.value }))} />
            <textarea
              className="field min-h-24"
              placeholder="Link-uri externe (YouTube/Drive), cate unul pe linie"
              value={form.external_links ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, external_links: event.target.value }))}
            />
            <button className="btn-primary" type="submit">{stickyLabel}</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Resurse existente</h2>
          <div className="mt-5 grid gap-4">
            {visibleResources.map((item) => (
              <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                  <div className="grid gap-3">
                    <input className="field" value={editing[item.id]?.esco_code ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], esco_code: event.target.value } }))} />
                    <input className="field" value={editing[item.id]?.name_ro ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_ro: event.target.value } }))} />
                    <input className="field" value={editing[item.id]?.name_en ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_en: event.target.value } }))} />
                    <div className="grid gap-3 md:grid-cols-3">
                      <select
                        className="field"
                        value={editing[item.id]?.resource_type ?? "LABOR"}
                        onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], resource_type: event.target.value as CatalogResourceType } }))}
                        disabled={Boolean(resourceTypeFilter)}
                      >
                        <option value="LABOR">LABOR</option>
                        <option value="MATERIAL">MATERIAL</option>
                        <option value="EQUIPMENT">EQUIPMENT</option>
                        <option value="TRANSPORT">TRANSPORT</option>
                      </select>
                      <input className="field" value={editing[item.id]?.base_price ?? "0"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], base_price: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.unit ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], unit: event.target.value } }))} />
                    </div>
                    <textarea className="field min-h-28 font-mono text-xs" value={editing[item.id]?.technical_specs ?? "{}"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], technical_specs: event.target.value } }))} />
                    <textarea
                      className="field min-h-24"
                      placeholder="Link-uri externe (YouTube/Drive), cate unul pe linie"
                      value={editing[item.id]?.external_links ?? ""}
                      onChange={(event) =>
                        setEditing((state) => ({
                          ...state,
                          [item.id]: { ...state[item.id], external_links: event.target.value },
                        }))
                      }
                    />
                    <div className="resource-dropzone">
                      <div className="text-sm font-semibold text-ink">Media & Docs</div>
                      <p className="text-xs text-muted">PDF / Excel / Word / JPG / MP4 sau link-uri externe.</p>
                      <input
                        type="file"
                        className="field"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4"
                        onChange={(event) => setAttachmentFiles((state) => ({ ...state, [item.id]: event.target.files?.[0] ?? null }))}
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <select
                          className="field"
                          value={attachmentTypes[item.id] ?? "IMAGE"}
                          onChange={(event) => setAttachmentTypes((state) => ({ ...state, [item.id]: event.target.value }))}
                        >
                          <option value="IMAGE">IMAGE</option>
                          <option value="VIDEO">VIDEO</option>
                          <option value="DOCUMENT">DOCUMENT</option>
                        </select>
                        <button className="btn-secondary" type="button" onClick={() => void handleAttachmentUpload(item.id)}>
                          Upload
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(attachments[item.id] ?? []).map((attachment) => (
                          <Link key={attachment.id} href={attachment.secure_url} target="_blank" className="tag">
                            {attachment.attachment_type}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                      <div className="font-semibold text-ink">{item.name_ro}</div>
                      <div className="mt-1">{item.resource_type}</div>
                      <div className="mt-2">{item.base_price} / {item.unit}</div>
                      <div className="mt-2">Spec: {item.esco_code ?? "N/A"}</div>
                    </div>
                    <div className="grid gap-3">
                      <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Salveaza</button>
                      <button className="btn-secondary" type="button" onClick={() => void handleDelete(item.id)}>Sterge</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
