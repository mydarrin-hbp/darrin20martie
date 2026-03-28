"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import { CategoryRecord, createCategory, deleteCategory, DomainRecord, getCategories, getDomains, updateCategory } from "@/lib/api";

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

type CategoryForm = {
  name_ro: string;
  name_en: string;
  slug: string;
  caen_codes: string;
  uniclass_codes: string;
  esco_codes: string;
};

const emptyForm: CategoryForm = {
  name_ro: "",
  name_en: "",
  slug: "",
  caen_codes: "",
  uniclass_codes: "",
  esco_codes: "",
};

export default function DomainCategoriesPage() {
  const params = useParams<{ id: string }>();
  const domainId = Number(params.id);
  const { token } = useAuth();
  const [domain, setDomain] = useState<DomainRecord | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, CategoryForm>>({});
  const [message, setMessage] = useState("");

  async function load() {
    if (!token || !domainId) {
      return;
    }
    const [domainList, categoryList] = await Promise.all([getDomains(token), getCategories(token, domainId)]);
    const currentDomain = domainList.find((item) => item.id === domainId) ?? null;
    setDomain(currentDomain);
    setCategories(categoryList);
    setEditing(
      Object.fromEntries(
        categoryList.map((item) => [
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
  }, [token, domainId]);

  const codeCoverage = useMemo(
    () => categories.filter((item) => item.caen_codes.length || item.uniclass_codes.length || item.esco_codes.length).length,
    [categories],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    await createCategory(token, {
      domain_id: domainId,
      name_ro: form.name_ro,
      name_en: form.name_en,
      slug: form.slug || slugify(form.name_ro),
      is_active: true,
      caen_codes: toCodeList(form.caen_codes),
      uniclass_codes: toCodeList(form.uniclass_codes),
      esco_codes: toCodeList(form.esco_codes),
    });
    setForm(emptyForm);
    setMessage("Categoria a fost creata.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) {
      return;
    }
    const current = editing[id];
    await updateCategory(token, id, {
      domain_id: domainId,
      name_ro: current.name_ro,
      name_en: current.name_en,
      slug: current.slug,
      caen_codes: toCodeList(current.caen_codes),
      uniclass_codes: toCodeList(current.uniclass_codes),
      esco_codes: toCodeList(current.esco_codes),
    });
    setMessage("Categoria a fost actualizata.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) {
      return;
    }
    await deleteCategory(token, id);
    setMessage("Categoria a fost stearsa.");
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title={domain ? `Categorii pentru ${domain.name_ro}` : "Categorii domeniu"}
        description="Backoffice-ul stocheaza codurile oficiale doar aici. Suprafetele publice folosesc exclusiv name_ro si name_en."
        badge="Domain categories"
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/backoffice/domains" className="btn-secondary">Inapoi la domenii</Link>
        <Link href={`/backoffice/domains/${domainId}/subcategories`} className="btn-secondary">Vezi subcategoriile domeniului</Link>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Domeniu</div><div className="mt-3 text-lg font-semibold text-ink">{domain?.name_ro ?? "-"}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Categorii</div><div className="mt-3 text-3xl font-semibold text-ink">{categories.length}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Cu coduri</div><div className="mt-3 text-3xl font-semibold text-ink">{codeCoverage}</div></div>
      </div>

      <section className="panel p-6">
        <h2 className="text-xl font-semibold text-ink">Adauga categorie noua</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
          <input className="field" placeholder="Nume RO" value={form.name_ro} onChange={(event) => setForm((current) => ({ ...current, name_ro: event.target.value, slug: current.slug || slugify(event.target.value) }))} />
          <input className="field" placeholder="Name EN" value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} />
          <input className="field" placeholder="Slug global" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} />
          <input className="field" placeholder="CAEN codes" value={form.caen_codes} onChange={(event) => setForm((current) => ({ ...current, caen_codes: event.target.value }))} />
          <input className="field" placeholder="Uniclass codes" value={form.uniclass_codes} onChange={(event) => setForm((current) => ({ ...current, uniclass_codes: event.target.value }))} />
          <input className="field" placeholder="ESCO concept URIs" value={form.esco_codes} onChange={(event) => setForm((current) => ({ ...current, esco_codes: event.target.value }))} />
          <button className="btn-primary" type="submit">Salveaza categoria</button>
        </form>
      </section>

      <section className="panel mt-6 p-6">
        <h2 className="text-xl font-semibold text-ink">Categorii existente</h2>
        <div className="mt-5 grid gap-4">
          {categories.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_0.9fr]">
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
                <div className="flex flex-col justify-between gap-3">
                  <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                    <div className="font-semibold text-ink">{item.name_ro}</div>
                    <div className="mt-1">{item.name_en}</div>
                    <div className="mt-2">Slug: {item.slug}</div>
                  </div>
                  <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
                  <button className="btn-secondary" type="button" onClick={() => void handleDelete(item.id)}>Sterge</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
