"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  CountryRecord,
  createLocality,
  deleteLocality,
  getCountries,
  getLocalities,
  getZones,
  LocalityRecord,
  updateLocality,
  ZoneRecord,
} from "@/lib/api";

type LocalityForm = {
  country_id: string;
  zone_id: string;
  name_ro: string;
  name_en: string;
  slug: string;
  latitude: string;
  longitude: string;
};

const emptyForm: LocalityForm = {
  country_id: "",
  zone_id: "",
  name_ro: "",
  name_en: "",
  slug: "",
  latitude: "",
  longitude: "",
};

function toPayload(form: LocalityForm) {
  return {
    country_id: Number(form.country_id),
    zone_id: Number(form.zone_id),
    name_ro: form.name_ro.trim(),
    name_en: form.name_en.trim(),
    slug: form.slug.trim(),
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    is_active: true,
  };
}

export default function LocalitiesPage() {
  const { token } = useAuth();
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [localities, setLocalities] = useState<LocalityRecord[]>([]);
  const [form, setForm] = useState<LocalityForm>(emptyForm);
  const [editing, setEditing] = useState<Record<number, LocalityForm>>({});
  const [message, setMessage] = useState("");

  async function load() {
    if (!token) return;
    const [countryData, zoneData, localityData] = await Promise.all([
      getCountries(token),
      getZones(token),
      getLocalities(token),
    ]);
    setCountries(countryData);
    setZones(zoneData);
    setLocalities(localityData);
    setEditing(
      Object.fromEntries(
        localityData.map((item) => [
          item.id,
          {
            country_id: String(item.country_id),
            zone_id: String(item.zone_id),
            name_ro: item.name_ro,
            name_en: item.name_en,
            slug: item.slug,
            latitude: item.latitude?.toString() ?? "",
            longitude: item.longitude?.toString() ?? "",
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
      total: localities.length,
      countries: new Set(localities.map((item) => item.country_id)).size,
      zones: new Set(localities.map((item) => item.zone_id)).size,
    }),
    [localities],
  );

  const filteredZones = zones.filter((item) => !form.country_id || item.country_id === Number(form.country_id));

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await createLocality(token, toPayload(form));
    setForm(emptyForm);
    setMessage("Localitatea a fost creata.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    const current = editing[id];
    await updateLocality(token, id, {
      zone_id: Number(current.zone_id),
      name_ro: current.name_ro.trim(),
      name_en: current.name_en.trim(),
      slug: current.slug.trim(),
      latitude: current.latitude ? Number(current.latitude) : null,
      longitude: current.longitude ? Number(current.longitude) : null,
      is_active: true,
    });
    setMessage("Localitatea a fost actualizata.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteLocality(token, id);
    setMessage("Localitatea a fost stearsa.");
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Localitati"
        description="Administram localitatile operationale pe structura Tara -> Zona -> Localitate, cu localizare bilingva si coordonate pentru pricing si AI context."
        badge="Advanced geography"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Localitati</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Tari</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.countries}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Zone</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.zones}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Creeaza localitate</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <div className="grid gap-3 md:grid-cols-2">
              <select className="field" value={form.country_id} onChange={(event) => setForm((current) => ({ ...current, country_id: event.target.value, zone_id: "" }))}>
                <option value="">Alege tara</option>
                {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
              <select className="field" value={form.zone_id} onChange={(event) => setForm((current) => ({ ...current, zone_id: event.target.value }))}>
                <option value="">Alege zona</option>
                {filteredZones.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field" placeholder="Nume RO" value={form.name_ro} onChange={(event) => setForm((current) => ({ ...current, name_ro: event.target.value }))} />
              <input className="field" placeholder="Name EN" value={form.name_en} onChange={(event) => setForm((current) => ({ ...current, name_en: event.target.value }))} />
            </div>
            <input className="field" placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field" placeholder="Latitudine" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} />
              <input className="field" placeholder="Longitudine" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} />
            </div>
            <button className="btn-primary" type="submit">Salveaza localitatea</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Localitati existente</h2>
          <div className="mt-5 grid gap-4">
            {localities.map((item) => {
              const current = editing[item.id];
              const zoneOptions = zones.filter((zone) => zone.country_id === Number(current?.country_id || 0));
              return (
                <article key={item.id} className="rounded-3xl border border-border bg-white/75 p-5">
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="grid gap-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <select className="field" value={current?.country_id ?? ""} disabled>
                          <option value={current?.country_id}>{countries.find((country) => country.id === Number(current?.country_id))?.name_ro ?? "Tara"}</option>
                        </select>
                        <select className="field" value={current?.zone_id ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], zone_id: event.target.value } }))}>
                          {zoneOptions.map((zone) => <option key={zone.id} value={zone.id}>{zone.name_ro}</option>)}
                        </select>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input className="field" value={current?.name_ro ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_ro: event.target.value } }))} />
                        <input className="field" value={current?.name_en ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], name_en: event.target.value } }))} />
                      </div>
                      <input className="field" value={current?.slug ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], slug: event.target.value } }))} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <input className="field" value={current?.latitude ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], latitude: event.target.value } }))} />
                        <input className="field" value={current?.longitude ?? ""} onChange={(event) => setEditing((state) => ({ ...state, [item.id]: { ...state[item.id], longitude: event.target.value } }))} />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                      <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
                        <div className="font-semibold text-ink">{item.name_ro}</div>
                        <div className="mt-1">{item.country_name_ro} / {item.zone_name_ro}</div>
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
