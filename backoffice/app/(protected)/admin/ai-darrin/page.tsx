"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import {
  AiDarrinInterpretRequest,
  AiDarrinStatus,
  getAiDarrinStatus,
  getCountries,
  getLocalities,
  getServices,
  getZones,
  interpretAiDarrin,
  ServiceRecord,
  CountryRecord,
  ZoneRecord,
  LocalityRecord,
  syncAiDarrinDocs,
} from "@/lib/api";
import { getPublicSiteBaseUrl } from "@/lib/public-site";

export default function AiDarrinAdminPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState<AiDarrinStatus | null>(null);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [localities, setLocalities] = useState<LocalityRecord[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [currency, setCurrency] = useState("RON");
  const [legislationCode, setLegislationCode] = useState("RO");
  const [message, setMessage] = useState("Am nevoie de o interventie rapida pentru un calorifer care curge.");
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiModeLabel = status?.api_key_configured ? "Gemini live" : "Local fallback";
  const aiModeTone = status?.api_key_configured ? "text-emerald-600" : "text-amber-600";
  const publicSiteUrl = getPublicSiteBaseUrl();

  useEffect(() => {
    if (!token) return;
    Promise.all([getAiDarrinStatus(token), getServices(token), getCountries(token), getZones(token)]).then(
      ([statusData, serviceData, countryData, zoneData]) => {
        setStatus(statusData);
        setServices(serviceData);
        setCountries(countryData);
        setZones(zoneData);
        if (serviceData[0]) setServiceId(String(serviceData[0].id));
        if (countryData[0]) {
          setCountryId(String(countryData[0].id));
          setCurrency(countryData[0].currency);
          setLegislationCode(countryData[0].code);
        }
      },
    );
  }, [token]);

  useEffect(() => {
    if (!token || !countryId) {
      setLocalities([]);
      return;
    }
    getLocalities(token, { countryId: Number(countryId), zoneId: zoneId ? Number(zoneId) : undefined }).then(
      (data) => {
        setLocalities(data);
      },
    );
  }, [token, countryId, zoneId]);

  const filteredZones = useMemo(
    () => zones.filter((zone) => String(zone.country_id) === countryId),
    [zones, countryId],
  );

  const selectedCountry = useMemo(
    () => countries.find((country) => String(country.id) === countryId),
    [countries, countryId],
  );

  async function handleSync() {
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      const updated = await syncAiDarrinDocs(token);
      setStatus(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync AI a esuat.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleInterpret(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const payload: AiDarrinInterpretRequest = {
        service_id: Number(serviceId),
        country_id: Number(countryId),
        zone_id: Number(zoneId || 0),
        locality_id: localityId ? Number(localityId) : null,
        currency,
        legislation_code: legislationCode,
        message,
      };
      const result = await interpretAiDarrin(token, payload);
      setResponse(result);
      const freshStatus = await getAiDarrinStatus(token);
      setStatus(freshStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Interpretarea AI a esuat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ModuleHeader
        title="AI Darrin - Interpretare Live"
        description="Consola operationala pentru sincronizare baza de date, interpretare solicitari si feedback learning loop."
        badge="AI hub"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="panel p-5">
          <div className="text-sm text-muted">Documente indexate</div>
          <div className="mt-3 text-3xl font-semibold text-ink">{status?.documents_total ?? 0}</div>
        </div>
        <div className="panel p-5">
          <div className="text-sm text-muted">Provider AI</div>
          <div className="mt-3 text-2xl font-semibold text-ink">{status?.provider ?? "local-fallback"}</div>
        </div>
        <div className="panel p-5">
          <div className="text-sm text-muted">API Key</div>
          <div className="mt-3 text-2xl font-semibold text-ink">
            {status?.api_key_configured ? "Activ" : "Lipsa"}
          </div>
        </div>
        <div className="panel p-5">
          <div className="text-sm text-muted">Feedback total</div>
          <div className="mt-3 text-2xl font-semibold text-ink">
            {typeof status?.learning_snapshot === "object" ? (status?.learning_snapshot as any)?.total_feedback ?? 0 : 0}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button className="btn-primary" type="button" onClick={handleSync} disabled={syncing}>
          {syncing ? "Sincronizez..." : "Sincronizeaza baza AI"}
        </button>
        <a className="btn-secondary" href={`${publicSiteUrl}/account`} target="_blank" rel="noreferrer">
          Vizualizare LIVE AI (Public)
        </a>
        <div className="rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-muted">
          Mod AI curent: <strong className={aiModeTone}>{aiModeLabel}</strong>
        </div>
        {selectedCountry ? (
          <div className="rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-muted">
            Tara curenta: <strong>{selectedCountry.name_ro}</strong> · Moneda: {selectedCountry.currency} · Cod: {selectedCountry.code}
          </div>
        ) : null}
      </div>

      {error ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="panel p-6">
        <h3 className="text-xl font-semibold text-ink">Test interpretare AI Darrin</h3>
        <form className="mt-4 grid gap-4" onSubmit={handleInterpret}>
          <div className="grid gap-4 md:grid-cols-2">
            <select className="field" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
              <option value="">Selecteaza serviciul</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <select className="field" value={countryId} onChange={(event) => {
              setCountryId(event.target.value);
              const selected = countries.find((item) => String(item.id) === event.target.value);
              if (selected) {
                setCurrency(selected.currency);
                setLegislationCode(selected.code);
              }
            }}>
              <option value="">Selecteaza tara</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name_ro}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <select className="field" value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
              <option value="">Selecteaza zona</option>
              {filteredZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name_ro}
                </option>
              ))}
            </select>
            <select className="field" value={localityId} onChange={(event) => setLocalityId(event.target.value)}>
              <option value="">Selecteaza localitate (optional)</option>
              {localities.map((locality) => (
                <option key={locality.id} value={locality.id}>
                  {locality.name_ro}
                </option>
              ))}
            </select>
            <input className="field" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} placeholder="Currency" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <input className="field" value={legislationCode} onChange={(event) => setLegislationCode(event.target.value.toUpperCase())} placeholder="Legislation code" />
            <div className="rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-muted">
              AI foloseste deviz + indicatori din backoffice. Mesajul tau declanseaza interpretarea si devizul.
            </div>
          </div>

          <textarea className="field min-h-28" value={message} onChange={(event) => setMessage(event.target.value)} />

          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" type="submit" disabled={loading || !serviceId || !countryId}>
              {loading ? "Ruleaza..." : "Ruleaza interpretare"}
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                if (!services.length) return;
                setServiceId(serviceId || String(services[0].id));
                if (!countryId && countries[0]) {
                  setCountryId(String(countries[0].id));
                  setCurrency(countries[0].currency);
                  setLegislationCode(countries[0].code);
                }
                if (!zoneId && filteredZones[0]) {
                  setZoneId(String(filteredZones[0].id));
                }
                setMessage("Caloriferul din apartament pierde apa. Avem nevoie de interventie rapida azi.");
              }}
            >
              Test rapid cu exemplu
            </button>
          </div>
        </form>
      </section>

      {response ? (
        <section className="panel mt-6 p-6">
          <h3 className="text-xl font-semibold text-ink">Raspuns AI Darrin</h3>
          <pre className="mt-4 max-h-[520px] overflow-auto rounded-3xl border border-border bg-white/80 p-4 text-xs text-muted">
            {JSON.stringify(response, null, 2)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
