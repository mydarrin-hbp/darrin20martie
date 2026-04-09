"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  AdminResourcePriceConfigRecord,
  CatalogResourceRecord,
  CountryRecord,
  createCatalogResourcePrice,
  deleteCatalogResourcePrice,
  getCatalogResourcePrices,
  getCatalogResources,
  getCountries,
  getLocalities,
  getZones,
  importCatalogResourcePrices,
  LocalityRecord,
  updateCatalogResourcePrice,
  ZoneRecord,
} from "@/lib/api";

type PriceForm = {
  resource_id: string;
  country_id: string;
  zone_id: string;
  locality_id: string;
  currency: string;
  base_price: string;
  zone_multiplier: string;
  legislation_code: string;
};

const emptyForm: PriceForm = {
  resource_id: "",
  country_id: "",
  zone_id: "",
  locality_id: "",
  currency: "RON",
  base_price: "0",
  zone_multiplier: "1",
  legislation_code: "RO",
};

function toPayload(form: PriceForm) {
  return {
    resource_id: Number(form.resource_id),
    country_id: Number(form.country_id),
    zone_id: form.zone_id ? Number(form.zone_id) : null,
    locality_id: form.locality_id ? Number(form.locality_id) : null,
    currency: form.currency.trim().toUpperCase(),
    base_price: Number(form.base_price),
    zone_multiplier: Number(form.zone_multiplier),
    legislation_code: form.legislation_code.trim().toUpperCase(),
    is_active: true,
  };
}

export default function ResourcePricesPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<CatalogResourceRecord[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [localities, setLocalities] = useState<LocalityRecord[]>([]);
  const [configs, setConfigs] = useState<AdminResourcePriceConfigRecord[]>([]);
  const [form, setForm] = useState<PriceForm>({ ...emptyForm, resource_id: searchParams.get("resource_id") ?? "" });
  const [editing, setEditing] = useState<Record<number, PriceForm>>({});
  const [message, setMessage] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);

  async function load() {
    if (!token) return;
    const [resourceData, countryData, zoneData, localityData, configData] = await Promise.all([
      getCatalogResources(token),
      getCountries(token),
      getZones(token),
      getLocalities(token),
      getCatalogResourcePrices(token),
    ]);
    setResources(resourceData);
    setCountries(countryData);
    setZones(zoneData);
    setLocalities(localityData);
    setConfigs(configData);
    setEditing(
      Object.fromEntries(
        configData.map((item) => [
          item.id,
          {
            resource_id: String(item.resource_id),
            country_id: String(item.country_id),
            zone_id: item.zone_id ? String(item.zone_id) : "",
            locality_id: item.locality_id ? String(item.locality_id) : "",
            currency: item.currency,
            base_price: String(item.base_price),
            zone_multiplier: String(item.zone_multiplier),
            legislation_code: item.legislation_code,
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
      total: configs.length,
      resources: new Set(configs.map((item) => item.resource_id)).size,
      countries: new Set(configs.map((item) => item.country_id)).size,
    }),
    [configs],
  );

  const filteredZones = zones.filter((zone) => !form.country_id || zone.country_id === Number(form.country_id));
  const filteredLocalities = localities.filter((locality) => !form.zone_id || locality.zone_id === Number(form.zone_id));

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await createCatalogResourcePrice(token, toPayload(form));
    setMessage("Configurarea de pret a fost creata.");
    setForm(emptyForm);
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    const current = editing[id];
    await updateCatalogResourcePrice(token, id, {
      zone_id: current.zone_id ? Number(current.zone_id) : null,
      locality_id: current.locality_id ? Number(current.locality_id) : null,
      currency: current.currency.trim().toUpperCase(),
      base_price: Number(current.base_price),
      zone_multiplier: Number(current.zone_multiplier),
      legislation_code: current.legislation_code.trim().toUpperCase(),
      is_active: true,
    });
    setMessage("Configurarea de pret a fost actualizata.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteCatalogResourcePrice(token, id);
    setMessage("Configurarea de pret a fost stearsa.");
    await load();
  }

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !importFile || !form.country_id) return;
    const result = await importCatalogResourcePrices(token, importFile, {
      countryId: Number(form.country_id),
      zoneId: form.zone_id ? Number(form.zone_id) : undefined,
      localityId: form.locality_id ? Number(form.locality_id) : undefined,
      currency: form.currency,
      legislationCode: form.legislation_code,
    });
    setMessage(`Import finalizat: ${result.created} create, ${result.updated} actualizate, ${result.skipped} ignorate.`);
    setImportFile(null);
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Resource Prices"
        description="Aici configuram preturile de baza pentru materiale, utilaje si echipamente pe tara, moneda si regiune. Calculul indicatorilor si Deviz Engine folosesc aceste configurari cu fallback la pretul de catalog."
        badge="Regional pricing"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Configurari</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Resurse acoperite</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.resources}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Tari</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.countries}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Configurare noua</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <select className="field" value={form.resource_id} onChange={(event) => setForm((current) => ({ ...current, resource_id: event.target.value }))}>
              <option value="">Alege resursa</option>
              {resources.filter((item) => item.resource_type !== "LABOR").map((item) => <option key={item.id} value={item.id}>{item.name_ro} ({item.resource_type})</option>)}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <select className="field" value={form.country_id} onChange={(event) => {
                const country = countries.find((item) => item.id === Number(event.target.value));
                setForm((current) => ({ ...current, country_id: event.target.value, zone_id: "", locality_id: "", currency: country?.currency ?? current.currency }));
              }}>
                <option value="">Alege tara</option>
                {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
              <select className="field" value={form.zone_id} onChange={(event) => setForm((current) => ({ ...current, zone_id: event.target.value, locality_id: "" }))}>
                <option value="">Zona default</option>
                {filteredZones.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
            </div>
            <select className="field" value={form.locality_id} onChange={(event) => setForm((current) => ({ ...current, locality_id: event.target.value }))}>
              <option value="">Localitate optionala</option>
              {filteredLocalities.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <div className="grid gap-3 md:grid-cols-4">
              <input className="field" placeholder="Moneda" value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} />
              <input className="field" placeholder="Pret baza" value={form.base_price} onChange={(event) => setForm((current) => ({ ...current, base_price: event.target.value }))} />
              <input className="field" placeholder="Multiplicator zona" value={form.zone_multiplier} onChange={(event) => setForm((current) => ({ ...current, zone_multiplier: event.target.value }))} />
              <input className="field" placeholder="Cod legislatie" value={form.legislation_code} onChange={(event) => setForm((current) => ({ ...current, legislation_code: event.target.value }))} />
            </div>
            <button className="btn-primary" type="submit">Salveaza pretul</button>
          </form>

          <h2 className="mt-8 text-xl font-semibold text-ink">Import preturi din fisiere istorice</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleImport}>
            <input className="field" type="file" accept=".csv,.xlsx,.xlsm" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} />
            <button className="btn-primary" type="submit" disabled={!importFile || !form.country_id}>Importa si actualizeaza preturi</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Configurari existente</h2>
          <div className="mt-5 grid gap-4">
            {configs.map((item) => (
              <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                  <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <select className="field" value={editing[item.id]?.country_id ?? ""} disabled>
                        <option value={editing[item.id]?.country_id}>{countries.find((country) => country.id === Number(editing[item.id]?.country_id))?.name_ro ?? "Tara"}</option>
                      </select>
                      <select className="field" value={editing[item.id]?.zone_id ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], zone_id: event.target.value, locality_id: "" } }))}>
                        <option value="">Zona default</option>
                        {zones.filter((zone) => zone.country_id === Number(editing[item.id]?.country_id)).map((zone) => <option key={zone.id} value={zone.id}>{zone.name_ro}</option>)}
                      </select>
                    </div>
                    <select className="field" value={editing[item.id]?.locality_id ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], locality_id: event.target.value } }))}>
                      <option value="">Localitate optionala</option>
                      {localities.filter((locality) => locality.zone_id === Number(editing[item.id]?.zone_id)).map((locality) => <option key={locality.id} value={locality.id}>{locality.name_ro}</option>)}
                    </select>
                    <div className="grid gap-3 md:grid-cols-4">
                      <input className="field" value={editing[item.id]?.currency ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], currency: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.base_price ?? "0"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], base_price: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.zone_multiplier ?? "1"} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], zone_multiplier: event.target.value } }))} />
                      <input className="field" value={editing[item.id]?.legislation_code ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], legislation_code: event.target.value } }))} />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                      <div className="font-semibold text-ink">{item.resource_name_ro}</div>
                      <div className="mt-1">{item.resource_type}</div>
                      <div className="mt-2">{item.base_price} {item.currency}</div>
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
