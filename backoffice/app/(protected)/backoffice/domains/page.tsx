"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import { createDomain, deleteDomain, DomainRecord, getDomains, importCatalogCodes, updateDomain } from "@/lib/api";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toCodeList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type DomainForm = {
  name_ro: string;
  name_en: string;
  slug: string;
  caen_codes: string;
  uniclass_codes: string;
  esco_codes: string;
};

const emptyForm: DomainForm = {
  name_ro: "",
  name_en: "",
  slug: "",
  caen_codes: "",
  uniclass_codes: "",
  esco_codes: "",
};

export default function DomainsPage() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [form, setForm] = useState<DomainForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, DomainForm>>({});
  const [message, setMessage] = useState<string>("");
  const [importFile, setImportFile] = useState<File | null>(null);

  async function load() {
    if (!token) {
      return;
    }
    const data = await getDomains(token);
    setDomains(data);
    setEditing(
      Object.fromEntries(
        data.map((item) => [
          item.id,
          {
            name_ro: item.name_ro,
            name_en: item.name_en,
            slug: item.slug,
            caen_codes: item.caen_codes.join(", "),
            uniclass_codes: item.uniclass_codes.join(", "),
            esco_codes: item.esco_codes.join(", "),
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
      total: domains.length,
      active: domains.filter((item) => item.is_active).length,
      withCodes: domains.filter((item) => item.caen_codes.length || item.uniclass_codes.length || item.esco_codes.length).length,
    }),
    [domains],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    await createDomain(token, {
      name_ro: form.name_ro,
      name_en: form.name_en,
      slug: form.slug || slugify(form.name_ro),
      is_active: true,
      caen_codes: toCodeList(form.caen_codes),
      uniclass_codes: toCodeList(form.uniclass_codes),
      esco_codes: toCodeList(form.esco_codes),
    });
    setForm(emptyForm);
    setMessage("Domeniul a fost creat.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) {
      return;
    }
    const current = editing[id];
    await updateDomain(token, id, {
      name_ro: current.name_ro,
      name_en: current.name_en,
      slug: current.slug,
      caen_codes: toCodeList(current.caen_codes),
      uniclass_codes: toCodeList(current.uniclass_codes),
      esco_codes: toCodeList(current.esco_codes),
    });
    setMessage("Domeniul a fost actualizat.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) {
      return;
    }
    await deleteDomain(token, id);
    setMessage("Domeniul a fost sters.");
    await load();
  }

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !importFile) {
      return;
    }
    const result = await importCatalogCodes(token, importFile);
    setMessage(
      `Import finalizat: ${result.domains_created} domenii create, ${result.domains_updated} actualizate, ${result.categories_created} categorii create, ${result.subcategories_created} subcategorii create.`,
    );
    setImportFile(null);
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Backoffice Domains"
        description="Aici sunt gestionate exclusiv denumirile bilingve si codurile oficiale CAEN / Uniclass / ESCO. Suprafetele publice si mobile vor consuma doar name_ro si name_en."
        badge="Domains admin"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Domenii</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Active</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.active}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Cu coduri</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.withCodes}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Creeaza domeniu nou</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <input className="field" placeholder="Nume RO" value={form.name_ro} onChange={(event) => setForm((current) => ({ ...current, name_ro: event.target.value, slug: current.slug || slugify(event.target.value) }))} />
            <input className="field" placeholder="Name EN" value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} />
            <input className="field" placeholder="Slug global" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} />
            <input className="field" placeholder="CAEN codes, separate prin virgula" value={form.caen_codes} onChange={(event) => setForm((current) => ({ ...current, caen_codes: event.target.value }))} />
            <input className="field" placeholder="Uniclass codes, separate prin virgula" value={form.uniclass_codes} onChange={(event) => setForm((current) => ({ ...current, uniclass_codes: event.target.value }))} />
            <input className="field" placeholder="ESCO concept URIs, separate prin virgula" value={form.esco_codes} onChange={(event) => setForm((current) => ({ ...current, esco_codes: event.target.value }))} />
            <button className="btn-primary" type="submit">Salveaza domeniul</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Import CAEN / Uniclass / ESCO</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Accepta CSV sau XLSX. Coloane recomandate: `level`, `slug`, `name_ro`, `name_en`, `caen_codes`, `uniclass_codes`, `esco_codes`, `domain_slug`, `category_slug`.
          </p>
          <form className="mt-4 grid gap-3" onSubmit={handleImport}>
            <input className="field" type="file" accept=".csv,.xlsx,.xlsm" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} />
            <button className="btn-primary" type="submit" disabled={!importFile}>Ruleaza importul</button>
          </form>
        </section>
      </div>

      <section className="panel mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">Domenii existente</h2>
            <p className="mt-2 text-sm text-muted">Fiecare domeniu are acces rapid spre categorii si subcategorii.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {domains.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
                <div className="grid gap-3">
                  <input className="field" value={editing[item.id]?.name_ro ?? ""} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...current[item.id], name_ro: event.target.value } }))} />
                  <input className="field" value={editing[item.id]?.name_en ?? ""} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...current[item.id], name_en: event.target.value } }))} />
                  <input className="field" value={editing[item.id]?.slug ?? ""} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...current[item.id], slug: slugify(event.target.value) } }))} />
                </div>

                <div className="grid gap-3">
                  <textarea className="field min-h-24" value={editing[item.id]?.caen_codes ?? ""} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...current[item.id], caen_codes: event.target.value } }))} />
                  <textarea className="field min-h-24" value={editing[item.id]?.uniclass_codes ?? ""} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...current[item.id], uniclass_codes: event.target.value } }))} />
                  <textarea className="field min-h-24" value={editing[item.id]?.esco_codes ?? ""} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...current[item.id], esco_codes: event.target.value } }))} />
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                    <div className="font-semibold text-ink">{item.name_ro}</div>
                    <div className="mt-1">{item.name_en}</div>
                    <div className="mt-2">Slug: {item.slug}</div>
                  </div>

                  <div className="grid gap-3">
                    <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
                    <Link href={`/backoffice/domains/${item.id}/categories`} className="btn-secondary text-center">Gestioneaza categorii</Link>
                    <Link href={`/backoffice/domains/${item.id}/subcategories`} className="btn-secondary text-center">Gestioneaza subcategorii</Link>
                    <button className="btn-secondary" type="button" onClick={() => void handleDelete(item.id)}>Sterge</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
