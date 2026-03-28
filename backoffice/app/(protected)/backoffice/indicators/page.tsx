"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  calculateIndicators,
  CatalogActivityRecord,
  CountryRecord,
  getCatalogActivities,
  getCountries,
  getLocalities,
  getZones,
  importIndicators,
  IndicatorCalculationRecord,
  LocalityRecord,
  ZoneRecord,
} from "@/lib/api";

type LevelName = "BRONZ" | "ARGINT" | "AUR" | "PLATINUM";

export default function IndicatorsPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<CatalogActivityRecord[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [localities, setLocalities] = useState<LocalityRecord[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState(searchParams.get("activity_id") ?? "");
  const [countryId, setCountryId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [currency, setCurrency] = useState("RON");
  const [legislationCode, setLegislationCode] = useState("RO");
  const [level, setLevel] = useState<LevelName>("ARGINT");
  const [indicatorData, setIndicatorData] = useState<IndicatorCalculationRecord | null>(null);
  const [message, setMessage] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);

  async function loadActivities() {
    if (!token) return;
    const [activityData, countryData, zoneData, localityData] = await Promise.all([
      getCatalogActivities(token),
      getCountries(token),
      getZones(token),
      getLocalities(token),
    ]);
    setActivities(activityData);
    setCountries(countryData);
    setZones(zoneData);
    setLocalities(localityData);
  }

  useEffect(() => {
    void loadActivities();
  }, [token]);

  async function handleCalculate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!token || !selectedActivityId) return;
    const result = await calculateIndicators(token, Number(selectedActivityId), level, {
      countryId: countryId ? Number(countryId) : undefined,
      zoneId: zoneId ? Number(zoneId) : undefined,
      localityId: localityId ? Number(localityId) : undefined,
      currency: currency || undefined,
      legislationCode: legislationCode || undefined,
    });
    setIndicatorData(result);
    setMessage(`Indicatorii au fost calculati pentru nivelul ${level}.`);
  }

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !importFile) return;
    const result = await importIndicators(token, importFile);
    setMessage(`Import finalizat: ${result.created} create, ${result.updated} actualizate, ${result.skipped} ignorate.`);
    setImportFile(null);
    await loadActivities();
  }

  const stats = useMemo(
    () => ({
      activities: activities.length,
      rows: indicatorData?.rows.length ?? 0,
      totalCost: indicatorData?.total_estimated_cost ?? 0,
    }),
    [activities, indicatorData],
  );
  const filteredZones = zones.filter((zone) => !countryId || zone.country_id === Number(countryId));
  const filteredLocalities = localities.filter((item) => !zoneId || item.zone_id === Number(zoneId));

  return (
    <div>
      <ModuleHeader
        title="Indicatori Deviz"
        description="Aceasta suprafata calculeaza indicatorii tehnici reali din retelele de deviz, inclusiv consum, pierderi, coeficienti pe nivel si legatura CAEN/NACE pentru activitatea selectata."
        badge="Indicators"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Activitati</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.activities}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Randuri calculate</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.rows}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Cost estimat</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.totalCost}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Calculeaza indicatori</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCalculate}>
            <select className="field" value={selectedActivityId} onChange={(event) => setSelectedActivityId(event.target.value)}>
              <option value="">Alege activitate</option>
              {activities.map((item) => <option key={item.id} value={item.id}>{item.name_ro} ({item.uniclass_code})</option>)}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <select className="field" value={countryId} onChange={(event) => {
                const country = countries.find((item) => item.id === Number(event.target.value));
                setCountryId(event.target.value);
                setZoneId("");
                setLocalityId("");
                if (country) setCurrency(country.currency);
              }}>
                <option value="">Tara optionala</option>
                {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
              <select className="field" value={zoneId} onChange={(event) => { setZoneId(event.target.value); setLocalityId(""); }}>
                <option value="">Zona optionala</option>
                {filteredZones.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
              </select>
            </div>
            <select className="field" value={localityId} onChange={(event) => setLocalityId(event.target.value)}>
              <option value="">Localitate optionala</option>
              {filteredLocalities.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field" placeholder="Moneda" value={currency} onChange={(event) => setCurrency(event.target.value)} />
              <input className="field" placeholder="Cod legislatie" value={legislationCode} onChange={(event) => setLegislationCode(event.target.value)} />
            </div>
            <select className="field" value={level} onChange={(event) => setLevel(event.target.value as LevelName)}>
              <option value="BRONZ">BRONZ</option>
              <option value="ARGINT">ARGINT</option>
              <option value="AUR">AUR</option>
              <option value="PLATINUM">PLATINUM</option>
            </select>
            <button className="btn-primary" type="submit" disabled={!selectedActivityId}>Calculeaza indicatori deviz</button>
          </form>

          <h2 className="mt-8 text-xl font-semibold text-ink">Import indicatori istorici</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Importa fisierele istorice RPGD / RPGC / RPGB / RPGA sau alte fisiere similare in formatul indicatorilor clasici de deviz.</p>
          <form className="mt-4 grid gap-3" onSubmit={handleImport}>
            <input className="field" type="file" accept=".csv,.xlsx,.xlsm" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} />
            <button className="btn-primary" type="submit" disabled={!importFile}>Importa indicatori</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Rezultat calcul</h2>
          {indicatorData ? (
            <div className="mt-5 grid gap-4">
              <div className="rounded-3xl border border-border bg-white/80 p-4 text-sm text-muted">
                <div className="font-semibold text-ink">{indicatorData.activity_name_ro}</div>
                <div className="mt-1">Nivel: {indicatorData.level}</div>
                <div className="mt-1">CAEN/NACE: {JSON.stringify(indicatorData.caen_nace_link)}</div>
                <div className="mt-1">Context preturi: {JSON.stringify(indicatorData.pricing_context)}</div>
              </div>
              {indicatorData.rows.map((row) => (
                <article key={row.recipe_id} className="rounded-3xl border border-border bg-white/75 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-ink">{row.resource_name_ro}</div>
                      <div className="mt-1 text-sm text-muted">{row.resource_type} • coeficient {row.applied_coefficient} • consum {row.calculated_consumption} {row.consumption_unit}</div>
                      <div className="mt-1 text-sm text-muted">Pierderi: {row.waste_percentage}% {row.waste_formula ? `• ${row.waste_formula}` : ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted">Cost estimat</div>
                      <div className="text-2xl font-semibold text-ink">{row.estimated_cost}</div>
                    </div>
                  </div>
                </article>
              ))}
              <div className="grid gap-3 md:grid-cols-2">
                <Link href={`/backoffice/price-analysis/${indicatorData.activity_id}`} className="btn-secondary text-center">Editeaza reteta activitatii</Link>
                <Link href="/backoffice/activities" className="btn-secondary text-center">Inapoi la activitati</Link>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">Selecteaza o activitate si un nivel pentru a calcula indicatorii tehnici.</p>
          )}
        </section>
      </div>
    </div>
  );
}
