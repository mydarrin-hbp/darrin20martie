"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  createService,
  deleteService,
  getServiceAttachments,
  getServices,
  getSubcategories,
  ServiceRecord,
  SubcategoryRecord,
  updateService,
  uploadServiceAttachment,
} from "@/lib/api";

type ServiceForm = {
  name: string;
  slug: string;
  description: string;
  description_extended: string;
  subcategory_ids: string;
};

const emptyForm: ServiceForm = {
  name: "",
  slug: "",
  description: "",
  description_extended: "",
  subcategory_ids: "",
};

function toPayload(form: ServiceForm) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    description_extended: form.description_extended.trim() || null,
    is_active: true,
    images: [],
    documents: [],
    videos: [],
    level_attachments: {},
    subcategory_ids: form.subcategory_ids.split(",").map((item) => Number(item.trim())).filter(Boolean),
  };
}

export default function ServicesPage() {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRecord[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, ServiceForm>>({});
  const [message, setMessage] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<Record<number, File | null>>({});
  const [attachmentTypes, setAttachmentTypes] = useState<Record<number, string>>({});
  const [attachmentLevels, setAttachmentLevels] = useState<Record<number, string>>({});

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
      total: services.length,
      active: services.filter((item) => item.is_active).length,
      attachmentReady: services.filter((item) => (item.images?.length ?? 0) + (item.documents?.length ?? 0) + (item.videos?.length ?? 0) > 0).length,
    }),
    [services],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await createService(token, toPayload(form));
    setForm(emptyForm);
    setMessage("Serviciul a fost creat.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    await updateService(token, id, toPayload(editing[id]));
    setMessage("Serviciul a fost actualizat.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteService(token, id);
    setMessage("Serviciul a fost sters.");
    await load();
  }

  async function handleUploadAttachment(serviceId: number) {
    if (!token || !attachmentFiles[serviceId]) return;
    await uploadServiceAttachment(token, {
      serviceId,
      attachmentType: attachmentTypes[serviceId] ?? "IMAGE",
      levelName: attachmentLevels[serviceId] || undefined,
      file: attachmentFiles[serviceId] as File,
    });
    setMessage("Atasamentul serviciului a fost incarcat.");
    await getServiceAttachments(token, serviceId);
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Servicii finale"
        description="Aici administram serviciile finale consumate de deviz, AI si suprafetele publice, inclusiv descrierea extinsa si pachetul complet de atasamente."
        badge="Service delivery"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Servicii</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Active</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.active}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Cu atasamente</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.attachmentReady}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Creeaza serviciu</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <input className="field" placeholder="Nume" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <input className="field" placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            <textarea className="field min-h-24" placeholder="Descriere scurta" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <textarea className="field min-h-32" placeholder="Descriere extinsa" value={form.description_extended} onChange={(event) => setForm((current) => ({ ...current, description_extended: event.target.value }))} />
            <input className="field" placeholder="ID-uri subcategorii separate prin virgula" value={form.subcategory_ids} onChange={(event) => setForm((current) => ({ ...current, subcategory_ids: event.target.value }))} />
            <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
              Subcategorii disponibile: {subcategories.map((item) => `${item.id}:${item.name_ro}`).join(" | ")}
            </div>
            <button className="btn-primary" type="submit">Salveaza serviciul</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Servicii existente</h2>
          <div className="mt-5 grid gap-4">
            {services.map((item) => {
              const current = editing[item.id];
              return (
                <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="grid gap-3">
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
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                      <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                        <div className="font-semibold text-ink">{item.name}</div>
                        <div className="mt-1">{item.slug}</div>
                      </div>
                      <div className="grid gap-3">
                        <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
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
    </div>
  );
}
