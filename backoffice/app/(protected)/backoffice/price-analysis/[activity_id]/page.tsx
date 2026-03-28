"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  CatalogActivityRecord,
  CatalogResourceRecord,
  createPriceAnalysisRecipe,
  deletePriceAnalysisRecipe,
  getCatalogActivity,
  getCatalogResources,
  getPriceAnalysisRecipes,
  PriceAnalysisRecipeRecord,
  updatePriceAnalysisRecipe,
} from "@/lib/api";

type RecipeForm = {
  resource_id: string;
  specific_consumption: string;
  consumption_unit: string;
  waste_percentage: string;
  waste_formula: string;
  coefficient_bronz: string;
  coefficient_argint: string;
  coefficient_aur: string;
  coefficient_platinum: string;
  is_essential: boolean;
};

const emptyForm: RecipeForm = {
  resource_id: "",
  specific_consumption: "1",
  consumption_unit: "unit",
  waste_percentage: "0",
  waste_formula: "specific_consumption * (1 + waste_percentage/100)",
  coefficient_bronz: "1",
  coefficient_argint: "1.1",
  coefficient_aur: "1.2",
  coefficient_platinum: "1.35",
  is_essential: true,
};

function toPayload(activityId: number, form: RecipeForm) {
  return {
    activity_id: activityId,
    resource_id: Number(form.resource_id),
    specific_consumption: Number(form.specific_consumption),
    consumption_unit: form.consumption_unit,
    waste_percentage: Number(form.waste_percentage),
    waste_formula: form.waste_formula,
    coefficient_bronz: Number(form.coefficient_bronz),
    coefficient_argint: Number(form.coefficient_argint),
    coefficient_aur: Number(form.coefficient_aur),
    coefficient_platinum: Number(form.coefficient_platinum),
    level_coefficients: {
      BRONZ: Number(form.coefficient_bronz),
      ARGINT: Number(form.coefficient_argint),
      AUR: Number(form.coefficient_aur),
      PLATINUM: Number(form.coefficient_platinum),
    },
    caen_nace_link: {},
    is_essential: form.is_essential,
  };
}

export default function PriceAnalysisPage() {
  const { token } = useAuth();
  const params = useParams<{ activity_id: string }>();
  const activityId = Number(params.activity_id);
  const [activity, setActivity] = useState<CatalogActivityRecord | null>(null);
  const [resources, setResources] = useState<CatalogResourceRecord[]>([]);
  const [recipes, setRecipes] = useState<PriceAnalysisRecipeRecord[]>([]);
  const [form, setForm] = useState<RecipeForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, RecipeForm>>({});
  const [message, setMessage] = useState("");

  async function load() {
    if (!token || !activityId) return;
    const [activityData, resourceData, recipeData] = await Promise.all([
      getCatalogActivity(token, activityId),
      getCatalogResources(token),
      getPriceAnalysisRecipes(token, activityId),
    ]);
    setActivity(activityData);
    setResources(resourceData);
    setRecipes(recipeData);
    setEditing(
      Object.fromEntries(
        recipeData.map((item) => [
          item.id,
          {
            resource_id: String(item.resource_id),
            specific_consumption: String(item.specific_consumption),
            consumption_unit: item.consumption_unit ?? item.resource_unit,
            waste_percentage: String(item.waste_percentage),
            waste_formula: item.waste_formula ?? "",
            coefficient_bronz: String(item.coefficient_bronz),
            coefficient_argint: String(item.coefficient_argint),
            coefficient_aur: String(item.coefficient_aur),
            coefficient_platinum: String(item.coefficient_platinum),
            is_essential: item.is_essential,
          },
        ]),
      ),
    );
  }

  useEffect(() => {
    void load();
  }, [token, activityId]);

  const stats = useMemo(
    () => ({
      total: recipes.length,
      essential: recipes.filter((item) => item.is_essential).length,
      labor: recipes.filter((item) => item.resource_type === "LABOR").length,
    }),
    [recipes],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !activityId) return;
    await createPriceAnalysisRecipe(token, toPayload(activityId, form));
    setForm(emptyForm);
    setMessage("Randul din reteta a fost creat.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token || !activityId) return;
    await updatePriceAnalysisRecipe(token, id, toPayload(activityId, editing[id]));
    setMessage("Reteta a fost actualizata.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deletePriceAnalysisRecipe(token, id);
    setMessage("Randul a fost sters din reteta.");
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Price Analysis Recipe"
        description={activity ? `Editorul retelei pentru ${activity.name_ro} (${activity.uniclass_code}). Bronz foloseste resurse esentiale si coeficienti minimi, iar Platinum poate extinde reteta completa.` : "Editorul retetei de deviz pentru activitatea selectata."}
        badge="Deviz Engine v2"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Randuri reteta</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Esentiale</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.essential}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Manopera</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.labor}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Adauga resursa in reteta</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <select className="field" value={form.resource_id} onChange={(event) => setForm((current) => ({ ...current, resource_id: event.target.value }))}>
              <option value="">Alege resursa</option>
              {resources.map((item) => <option key={item.id} value={item.id}>{item.name_ro} ({item.resource_type})</option>)}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field" placeholder="Consum specific" value={form.specific_consumption} onChange={(event) => setForm((current) => ({ ...current, specific_consumption: event.target.value }))} />
              <input className="field" placeholder="Unitate consum" value={form.consumption_unit} onChange={(event) => setForm((current) => ({ ...current, consumption_unit: event.target.value }))} />
              <input className="field" placeholder="Pierderi %" value={form.waste_percentage} onChange={(event) => setForm((current) => ({ ...current, waste_percentage: event.target.value }))} />
              <input className="field" placeholder="Formula pierderi" value={form.waste_formula} onChange={(event) => setForm((current) => ({ ...current, waste_formula: event.target.value }))} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field" placeholder="Coeficient Bronz" value={form.coefficient_bronz} onChange={(event) => setForm((current) => ({ ...current, coefficient_bronz: event.target.value }))} />
              <input className="field" placeholder="Coeficient Argint" value={form.coefficient_argint} onChange={(event) => setForm((current) => ({ ...current, coefficient_argint: event.target.value }))} />
              <input className="field" placeholder="Coeficient Aur" value={form.coefficient_aur} onChange={(event) => setForm((current) => ({ ...current, coefficient_aur: event.target.value }))} />
              <input className="field" placeholder="Coeficient Platinum" value={form.coefficient_platinum} onChange={(event) => setForm((current) => ({ ...current, coefficient_platinum: event.target.value }))} />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted">
              <input type="checkbox" checked={form.is_essential} onChange={(event) => setForm((current) => ({ ...current, is_essential: event.target.checked }))} />
              Resursa esentiala pentru nivelul Bronz
            </label>
            <button className="btn-primary" type="submit">Salveaza randul</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Randuri existente</h2>
          <div className="mt-5 grid gap-4">
            {recipes.map((item) => (
              <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="grid gap-3">
                    <select className="field" value={editing[item.id]?.resource_id ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], resource_id: event.target.value } }))}>
                      <option value="">Alege resursa</option>
                      {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name_ro} ({resource.resource_type})</option>)}
                    </select>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="field" value={editing[item.id]?.specific_consumption ?? "0"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], specific_consumption: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.consumption_unit ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], consumption_unit: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.waste_percentage ?? "0"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], waste_percentage: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.waste_formula ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], waste_formula: event.target.value } }))} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="field" value={editing[item.id]?.coefficient_bronz ?? "1"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], coefficient_bronz: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.coefficient_argint ?? "1.1"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], coefficient_argint: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.coefficient_aur ?? "1.2"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], coefficient_aur: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.coefficient_platinum ?? "1.35"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], coefficient_platinum: event.target.value } }))} />
                    </div>
                    <label className="flex items-center gap-3 rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted">
                      <input type="checkbox" checked={editing[item.id]?.is_essential ?? false} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], is_essential: event.target.checked } }))} />
                      Esential pentru Bronz
                    </label>
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                      <div className="font-semibold text-ink">{item.resource_name_ro}</div>
                      <div className="mt-1">{item.resource_type} • {item.resource_base_price} / {item.resource_unit}</div>
                      <div className="mt-2">ESCO: {item.esco_code ?? "n/a"}</div>
                    </div>
                    <div className="grid gap-3">
                      <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
                      <Link href={`/backoffice/indicators?activity_id=${activityId}`} className="btn-secondary text-center">Vezi indicatori</Link>
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
