"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  CatalogResourceRecord,
  CatalogResourceType,
  createCatalogResource,
  deleteCatalogResource,
  getCatalogResources,
  importEscoResourceFromFile,
  importEscoResourceFromUrl,
  updateCatalogResource,
} from "@/lib/api";

type ResourceForm = {
  esco_code: string;
  name_ro: string;
  name_en: string;
  resource_type: CatalogResourceType;
  base_price: string;
  unit: string;
  technical_specs: string;
};

const emptyForm: ResourceForm = {
  esco_code: "",
  name_ro: "",
  name_en: "",
  resource_type: "LABOR",
  base_price: "0",
  unit: "ora",
  technical_specs: "{}",
};

function parseSpecs(value: string) {
  try {
    return value.trim() ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function toPayload(form: ResourceForm) {
  return {
    esco_code: form.esco_code.trim() || null,
    name_ro: form.name_ro.trim(),
    name_en: form.name_en.trim(),
    resource_type: form.resource_type,
    base_price: Number(form.base_price),
    unit: form.unit.trim(),
    technical_specs: parseSpecs(form.technical_specs),
    is_active: true,
  };
}

export default function ResourcesPage() {
  const { token } = useAuth();
  const [resources, setResources] = useState<CatalogResourceRecord[]>([]);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, ResourceForm>>({});
  const [message, setMessage] = useState("");
  const [escoUrl, setEscoUrl] = useState("");
  const [escoFile, setEscoFile] = useState<File | null>(null);

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
          },
        ]),
      ),
    );
  }

  useEffect(() => {
    void load();
  }, [token]);

  const stats = useMemo(
    () => ({
      total: resources.length,
      labor: resources.filter((item) => item.resource_type === "LABOR").length,
      escoMapped: resources.filter((item) => Boolean(item.esco_code)).length,
    }),
    [resources],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await createCatalogResource(token, toPayload(form));
    setForm(emptyForm);
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

  return (
    <div>
      <ModuleHeader
        title="Backoffice Resources"
        description="Resursele din retelele de deviz sunt administrate aici. ESCO ramane sursa oficiala pentru manopera, iar materialele, utilajele si transportul au specificatii tehnice separate."
        badge="ESCO resources"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Resurse</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Manopera</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.labor}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Mapate ESCO</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.escoMapped}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
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
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <input className="field" placeholder="ESCO code / concept URI" value={form.esco_code} onChange={(event) => setForm((current) => ({ ...current, esco_code: event.target.value }))} />
            <input className="field" placeholder="Nume RO" value={form.name_ro} onChange={(event) => setForm((current) => ({ ...current, name_ro: event.target.value }))} />
            <input className="field" placeholder="Name EN" value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} />
            <div className="grid gap-3 md:grid-cols-3">
              <select className="field" value={form.resource_type} onChange={(event) => setForm((current) => ({ ...current, resource_type: event.target.value as CatalogResourceType }))}>
                <option value="LABOR">LABOR</option>
                <option value="MATERIAL">MATERIAL</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
                <option value="TRANSPORT">TRANSPORT</option>
              </select>
              <input className="field" placeholder="Pret baza" value={form.base_price} onChange={(event) => setForm((current) => ({ ...current, base_price: event.target.value }))} />
              <input className="field" placeholder="Unitate" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} />
            </div>
            <textarea className="field min-h-32 font-mono text-xs" placeholder='{"spec":"value"}' value={form.technical_specs} onChange={(event) => setForm((current) => ({ ...current, technical_specs: event.target.value }))} />
            <button className="btn-primary" type="submit">Salveaza resursa</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Resurse existente</h2>
          <div className="mt-5 grid gap-4">
            {resources.map((item) => (
              <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                  <div className="grid gap-3">
                    <input className="field" value={editing[item.id]?.esco_code ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], esco_code: event.target.value } }))} />
                    <input className="field" value={editing[item.id]?.name_ro ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_ro: event.target.value } }))} />
                    <input className="field" value={editing[item.id]?.name_en ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_en: event.target.value } }))} />
                    <div className="grid gap-3 md:grid-cols-3">
                      <select className="field" value={editing[item.id]?.resource_type ?? "LABOR"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], resource_type: event.target.value as CatalogResourceType } }))}>
                        <option value="LABOR">LABOR</option>
                        <option value="MATERIAL">MATERIAL</option>
                        <option value="EQUIPMENT">EQUIPMENT</option>
                        <option value="TRANSPORT">TRANSPORT</option>
                      </select>
                      <input className="field" value={editing[item.id]?.base_price ?? "0"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], base_price: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.unit ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], unit: event.target.value } }))} />
                    </div>
                    <textarea className="field min-h-28 font-mono text-xs" value={editing[item.id]?.technical_specs ?? "{}"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], technical_specs: event.target.value } }))} />
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                      <div className="font-semibold text-ink">{item.name_ro}</div>
                      <div className="mt-1">{item.resource_type}</div>
                      <div className="mt-2">{item.base_price} / {item.unit}</div>
                    </div>
                    <div className="grid gap-3">
                      <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
                      <Link href={`/backoffice/resources/prices?resource_id=${item.id}`} className="btn-secondary text-center">Configureaza preturi</Link>
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
