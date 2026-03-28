"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  CatalogActivityRecord,
  CategoryRecord,
  createCatalogActivity,
  deleteCatalogActivity,
  DomainRecord,
  getCatalogActivities,
  getActivityAttachments,
  getCategories,
  getDomains,
  getSubcategories,
  importUniclassCatalog,
  SubcategoryRecord,
  uploadActivityAttachment,
  updateCatalogActivity,
} from "@/lib/api";

type ActivityForm = {
  uniclass_code: string;
  name_ro: string;
  name_en: string;
  uom: string;
  domain_id: string;
  category_id: string;
  subcategory_id: string;
  description: string;
  description_extended: string;
};

const emptyForm: ActivityForm = {
  uniclass_code: "",
  name_ro: "",
  name_en: "",
  uom: "unit",
  domain_id: "",
  category_id: "",
  subcategory_id: "",
  description: "",
  description_extended: "",
};

function toPayload(form: ActivityForm) {
  return {
    uniclass_code: form.uniclass_code.trim(),
    name_ro: form.name_ro.trim(),
    name_en: form.name_en.trim(),
    uom: form.uom.trim(),
    domain_id: Number(form.domain_id),
    category_id: Number(form.category_id),
    subcategory_id: Number(form.subcategory_id),
    description: form.description.trim() || null,
    description_extended: form.description_extended.trim() || null,
    images: [],
    documents: [],
    videos: [],
    level_attachments: {},
    is_active: true,
  };
}

export default function ActivitiesPage() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRecord[]>([]);
  const [activities, setActivities] = useState<CatalogActivityRecord[]>([]);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, ActivityForm>>({});
  const [message, setMessage] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<Record<number, File | null>>({});
  const [attachmentTypes, setAttachmentTypes] = useState<Record<number, string>>({});
  const [attachmentLevels, setAttachmentLevels] = useState<Record<number, string>>({});

  async function load() {
    if (!token) return;
    const [domainData, categoryData, subcategoryData, activityData] = await Promise.all([
      getDomains(token),
      getCategories(token),
      getSubcategories(token),
      getCatalogActivities(token),
    ]);
    setDomains(domainData);
    setCategories(categoryData);
    setSubcategories(subcategoryData);
    setActivities(activityData);
    setEditing(
      Object.fromEntries(
        activityData.map((item) => [
          item.id,
          {
            uniclass_code: item.uniclass_code,
            name_ro: item.name_ro,
            name_en: item.name_en,
            uom: item.uom,
            domain_id: String(item.domain_id),
            category_id: String(item.category_id),
            subcategory_id: String(item.subcategory_id),
            description: item.description ?? "",
            description_extended: item.description_extended ?? "",
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
      total: activities.length,
      active: activities.filter((item) => item.is_active).length,
      recipeReady: activities.filter((item) => item.uniclass_code && item.subcategory_id).length,
    }),
    [activities],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await createCatalogActivity(token, toPayload(form));
    setForm(emptyForm);
    setMessage("Activitatea Uniclass a fost creata.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    await updateCatalogActivity(token, id, toPayload(editing[id]));
    setMessage("Activitatea a fost actualizata.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteCatalogActivity(token, id);
    setMessage("Activitatea a fost stearsa.");
    await load();
  }

  async function handleUploadAttachment(activityId: number) {
    if (!token || !attachmentFiles[activityId]) return;
    await uploadActivityAttachment(token, {
      activityId,
      attachmentType: attachmentTypes[activityId] ?? "IMAGE",
      levelName: attachmentLevels[activityId] || undefined,
      file: attachmentFiles[activityId] as File,
    });
    setMessage("Atasamentul activitatii a fost incarcat.");
    await getActivityAttachments(token, activityId);
    await load();
  }

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !importFile) return;
    const result = await importUniclassCatalog(token, importFile, {
      domainId: form.domain_id ? Number(form.domain_id) : undefined,
      categoryId: form.category_id ? Number(form.category_id) : undefined,
      subcategoryId: form.subcategory_id ? Number(form.subcategory_id) : undefined,
      defaultUom: form.uom || "unit",
    });
    setMessage(`Import finalizat: ${result.created} create, ${result.updated} actualizate, ${result.skipped} ignorate.`);
    setImportFile(null);
    await load();
  }

  const filteredCategories = categories.filter((item) => !form.domain_id || item.domain_id === Number(form.domain_id));
  const filteredSubcategories = subcategories.filter(
    (item) => !form.category_id || item.category_id === Number(form.category_id),
  );

  return (
    <div>
      <ModuleHeader
        title="Backoffice Activities"
        description="Aici administram activitatile WBS pe baza Uniclass si le legam direct de Domain / Category / Subcategory. Suprafetele publice vor consuma doar denumirile, nu codurile."
        badge="Uniclass admin"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Activitati</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Active</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.active}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Pregatite de reteta</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.recipeReady}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Creeaza activitate noua</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <input className="field" placeholder="Cod Uniclass" value={form.uniclass_code} onChange={(event) => setForm((current) => ({ ...current, uniclass_code: event.target.value }))} />
            <input className="field" placeholder="Nume RO" value={form.name_ro} onChange={(event) => setForm((current) => ({ ...current, name_ro: event.target.value }))} />
            <input className="field" placeholder="Name EN" value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} />
            <div className="grid gap-3 md:grid-cols-4">
              <input className="field" placeholder="UOM" value={form.uom} onChange={(event) => setForm((current) => ({ ...current, uom: event.target.value }))} />
              <select className="field" value={form.domain_id} onChange={(event) => setForm((current) => ({ ...current, domain_id: event.target.value, category_id: "", subcategory_id: "" }))}>
                <option value="">Alege domeniu</option>
                {domains.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
              <select className="field" value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value, subcategory_id: "" }))}>
                <option value="">Alege categorie</option>
                {filteredCategories.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
              <select className="field" value={form.subcategory_id} onChange={(event) => setForm((current) => ({ ...current, subcategory_id: event.target.value }))}>
                <option value="">Alege subcategorie</option>
                {filteredSubcategories.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
            </div>
            <textarea className="field min-h-28" placeholder="Descriere scurta" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <textarea className="field min-h-36" placeholder="Descriere extinsa" value={form.description_extended} onChange={(event) => setForm((current) => ({ ...current, description_extended: event.target.value }))} />
            <button className="btn-primary" type="submit">Salveaza activitatea</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Import Uniclass</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Incarca CSV/XLSX istoric. Daca alegi domeniu/categorie/subcategorie, importul se ancoreaza explicit in contextul selectat.</p>
          <form className="mt-4 grid gap-3" onSubmit={handleImport}>
            <input className="field" type="file" accept=".csv,.xlsx,.xlsm" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} />
            <button className="btn-primary" type="submit" disabled={!importFile}>Ruleaza importul</button>
          </form>
        </section>
      </div>

      <section className="panel mt-6 p-6">
        <h2 className="text-xl font-semibold text-ink">Activitati existente</h2>
        <div className="mt-5 grid gap-4">
          {activities.map((item) => {
            const current = editing[item.id];
            const categoryOptions = categories.filter((category) => category.domain_id === Number(current?.domain_id || 0));
            const subcategoryOptions = subcategories.filter((subcategory) => subcategory.category_id === Number(current?.category_id || 0));
            return (
              <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                  <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="field" value={current?.uniclass_code ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], uniclass_code: event.target.value } }))} />
                      <input className="field" value={current?.uom ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], uom: event.target.value } }))} />
                    </div>
                    <input className="field" value={current?.name_ro ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_ro: event.target.value } }))} />
                    <input className="field" value={current?.name_en ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_en: event.target.value } }))} />
                    <div className="grid gap-3 md:grid-cols-3">
                      <select className="field" value={current?.domain_id ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], domain_id: event.target.value, category_id: "", subcategory_id: "" } }))}>
                        <option value="">Domeniu</option>
                        {domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.name_ro}</option>)}
                      </select>
                      <select className="field" value={current?.category_id ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], category_id: event.target.value, subcategory_id: "" } }))}>
                        <option value="">Categorie</option>
                        {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name_ro}</option>)}
                      </select>
                      <select className="field" value={current?.subcategory_id ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], subcategory_id: event.target.value } }))}>
                        <option value="">Subcategorie</option>
                        {subcategoryOptions.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name_ro}</option>)}
                      </select>
                    </div>
                    <textarea className="field min-h-28" value={current?.description ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], description: event.target.value } }))} />
                    <textarea className="field min-h-32" value={current?.description_extended ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], description_extended: event.target.value } }))} />
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
                  </div>

                  <div className="flex flex-col justify-between gap-4">
                    <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                      <div className="font-semibold text-ink">{item.name_ro}</div>
                      <div className="mt-1">{item.uniclass_code}</div>
                      <div className="mt-2">UOM: {item.uom}</div>
                    </div>
                    <div className="grid gap-3">
                      <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
                      <Link href={`/backoffice/price-analysis/${item.id}`} className="btn-secondary text-center">Editeaza reteta</Link>
                      <Link href={`/backoffice/indicators?activity_id=${item.id}`} className="btn-secondary text-center">Calculeaza indicatori deviz</Link>
                      <button className="btn-secondary" type="button" onClick={() => void handleDelete(item.id)}>Sterge</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
