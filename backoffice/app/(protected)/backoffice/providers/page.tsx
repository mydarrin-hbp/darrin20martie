"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import { ProviderRecord, createProvider, deleteProvider, getProviders, updateProvider } from "@/lib/api";

type ProviderForm = {
  name: string;
  contact_email: string;
  provider_type: "MATERIAL" | "RENTAL";
  is_active: boolean;
};

const emptyForm: ProviderForm = {
  name: "",
  contact_email: "",
  provider_type: "MATERIAL",
  is_active: true,
};

function toPayload(form: ProviderForm) {
  return {
    name: form.name.trim(),
    contact_email: form.contact_email.trim() || null,
    provider_type: form.provider_type,
    is_active: form.is_active,
  };
}

export default function ProvidersPage() {
  const { token } = useAuth();
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [form, setForm] = useState<ProviderForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, ProviderForm>>({});
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "MATERIAL" | "RENTAL">("ALL");

  async function load() {
    if (!token) return;
    const data = await getProviders(token);
    setProviders(data);
    setEditing(
      Object.fromEntries(
        data.map((item) => [
          item.id,
          {
            name: item.name,
            contact_email: item.contact_email ?? "",
            provider_type: item.provider_type,
            is_active: item.is_active,
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
      total: providers.length,
      material: providers.filter((item) => item.provider_type === "MATERIAL").length,
      rental: providers.filter((item) => item.provider_type === "RENTAL").length,
    }),
    [providers],
  );

  const visibleProviders = useMemo(() => {
    if (filterType === "ALL") return providers;
    return providers.filter((item) => item.provider_type === filterType);
  }, [providers, filterType]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await createProvider(token, toPayload(form));
    setForm(emptyForm);
    setMessage("Providerul a fost creat.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    await updateProvider(token, id, toPayload(editing[id]));
    setMessage("Providerul a fost actualizat.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteProvider(token, id);
    setMessage("Providerul a fost sters.");
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Provideri & Marketplace"
        description="Gestioneaza furnizorii de materiale (bricolaj) si partenerii de inchirieri. Toti providerii sunt conectati cu acelasi model de servicii (reparatie, mentenanta, inlocuire, montaj, inchiriere) si pot fi activati/dezactivati direct din platforma."
        badge="Marketplace Admin"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Total provideri</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Materiale</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.material}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Rental</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.rental}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Adauga provider nou</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <input className="field" placeholder="Nume provider" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <input className="field" placeholder="Contact email" value={form.contact_email} onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))} />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="field"
                value={form.provider_type}
                onChange={(event) => setForm((current) => ({ ...current, provider_type: event.target.value as ProviderForm["provider_type"] }))}
              >
                <option value="MATERIAL">MATERIAL</option>
                <option value="RENTAL">RENTAL</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                />
                Activ in marketplace
              </label>
            </div>
            <button className="btn-primary" type="submit">Salveaza provider</button>
          </form>
        </section>

        <section className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Provideri existenti</h2>
            <select className="field max-w-[220px]" value={filterType} onChange={(event) => setFilterType(event.target.value as typeof filterType)}>
              <option value="ALL">Toate tipurile</option>
              <option value="MATERIAL">Materiale</option>
              <option value="RENTAL">Rental</option>
            </select>
          </div>
          <div className="mt-5 grid gap-4">
            {visibleProviders.length === 0 ? <div className="text-sm text-muted">Nu exista provideri inca.</div> : null}
            {visibleProviders.map((item) => (
              <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                  <div className="grid gap-3">
                    <input className="field" value={editing[item.id]?.name ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name: event.target.value } }))} />
                    <input className="field" value={editing[item.id]?.contact_email ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], contact_email: event.target.value } }))} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        className="field"
                        value={editing[item.id]?.provider_type ?? "MATERIAL"}
                        onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], provider_type: event.target.value as ProviderForm["provider_type"] } }))}
                      >
                        <option value="MATERIAL">MATERIAL</option>
                        <option value="RENTAL">RENTAL</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={editing[item.id]?.is_active ?? false}
                          onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], is_active: event.target.checked } }))}
                        />
                        Activ
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                      <div className="font-semibold text-ink">{item.name}</div>
                      <div className="mt-1">{item.provider_type}</div>
                      <div className="mt-2">{item.contact_email || "Email lipsa"}</div>
                      <div className="mt-2">{item.is_active ? "Activ" : "Inactiv"}</div>
                    </div>
                    <div className="grid gap-3">
                      <button className="btn-primary" type="button" onClick={() => void handleUpdate(item.id)}>Actualizeaza</button>
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
