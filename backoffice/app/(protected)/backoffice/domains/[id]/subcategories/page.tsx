"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  CategoryRecord,
  createSubcategory,
  deleteSubcategory,
  DomainRecord,
  getCategories,
  getDomains,
  getSubcategories,
  SubcategoryRecord,
  updateSubcategory,
} from "@/lib/api";

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

type SubcategoryForm = {
  category_id: number;
  name_ro: string;
  name_en: string;
  slug: string;
  caen_codes: string;
  uniclass_codes: string;
  esco_codes: string;
};

const emptyForm: SubcategoryForm = {
  category_id: 0,
  name_ro: "",
  name_en: "",
  slug: "",
  caen_codes: "",
  uniclass_codes: "",
  esco_codes: "",
};

export default function DomainSubcategoriesPage() {
  const params = useParams<{ id: string }>();
  const domainId = Number(params.id);
  const { token } = useAuth();
  const [domain, setDomain] = useState<DomainRecord | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRecord[]>([]);
  const [form, setForm] = useState<SubcategoryForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, SubcategoryForm>>({});
  const [message, setMessage] = useState("");

  async function load() {
    if (!token || !domainId) {
      return;
    }
    const [domainList, categoryList, subcategoryList] = await Promise.all([
      getDomains(token),
      getCategories(token, domainId),
      getSubcategories(token, { domainId }),
    ]);
    const currentDomain = domainList.find((item) => item.id === domainId) ?? null;
    setDomain(currentDomain);
    setCategories(categoryList);
    setSubcategories(subcategoryList);
    setForm((current) => ({ ...current, category_id: current.category_id || categoryList[0]?.id || 0 }));
    setEditing(
      Object.fromEntries(
        subcategoryList.map((item) => [
          item.id,
          {
            category_id: item.category_id,
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

  const categoryNameMap = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.id, item.name_ro])),
    [categories],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    await createSubcategory(token, {
      category_id: form.category_id,
      name_ro: form.name_ro,
      name_en: form.name_en,
      slug: form.slug || slugify(form.name_ro),
      is_active: true,
      caen_codes: toCodeList(form.caen_codes),
      uniclass_codes: toCodeList(form.uniclass_codes),
      esco_codes: toCodeList(form.esco_codes),
    });
    setForm((current) => ({ ...emptyForm, category_id: current.category_id }));
    setMessage("Subcategoria a fost creata.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) {
      return;
    }
    const current = editing[id];
    await updateSubcategory(token, id, {
      category_id: current.category_id,
      name_ro: current.name_ro,
      name_en: current.name_en,
      slug: current.slug,
      caen_codes: toCodeList(current.caen_codes),
      uniclass_codes: toCodeList(current.uniclass_codes),
      esco_codes: toCodeList(current.esco_codes),
    });
    setMessage("Subcategoria a fost actualizata.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) {
      return;
    }
    await deleteSubcategory(token, id);
    setMessage("Subcategoria a fost stearsa.");
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title={domain ? `Subcategorii pentru ${domain.name_ro}` : "Subcategorii domeniu"}
        description="Aceasta zona gestioneaza granularitatea fina pentru catalog, cu coduri oficiale disponibile doar in Backoffice."
        badge="Domain subcategories"
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/backoffice/domains" className="btn-secondary">Inapoi la domenii</Link>
        <Link href={`/backoffice/domains/${domainId}/categories`} className="btn-secondary">Inapoi la categorii</Link>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <section className="panel p-6">
        <h2 className="text-xl font-semibold text-ink">Adauga subcategorie noua</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
          <select className="field" value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: Number(event.target.value) }))}>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
          </select>
          <input className="field" placeholder="Nume RO" value={form.name_ro} onChange={(event) => setForm((current) => ({ ...current, name_ro: event.target.value, slug: current.slug || slugify(event.target.value) }))} />
          <input className="field" placeholder="Name EN" value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} />
          <input className="field" placeholder="Slug global" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} />
          <input className="field" placeholder="CAEN codes" value={form.caen_codes} onChange={(event) => setForm((current) => ({ ...current, caen_codes: event.target.value }))} />
          <input className="field" placeholder="Uniclass codes" value={form.uniclass_codes} onChange={(event) => setForm((current) => ({ ...current, uniclass_codes: event.target.value }))} />
          <input className="field" placeholder="ESCO concept URIs" value={form.esco_codes} onChange={(event) => setForm((current) => ({ ...current, esco_codes: event.target.value }))} />
          <button className="btn-primary" type="submit">Salveaza subcategoria</button>
        </form>
      </section>

      <section className="panel mt-6 p-6">
        <h2 className="text-xl font-semibold text-ink">Subcategorii existente</h2>
        <div className="mt-5 grid gap-4">
          {subcategories.map((item) => (
            <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_0.9fr]">
                <div className="grid gap-3">
                  <select className="field" value={editing[item.id]?.category_id ?? item.category_id} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...current[item.id], category_id: Number(event.target.value) } }))}>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name_ro}</option>)}
                  </select>
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
                    <div className="mt-2">Categorie: {categoryNameMap[item.category_id] ?? "-"}</div>
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
