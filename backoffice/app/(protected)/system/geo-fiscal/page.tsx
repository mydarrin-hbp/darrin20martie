"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import {
  CountryRecord,
  FinancialConfigRecord,
  LaborRateRecord,
  LocalityRecord,
  TaxRuleRecord,
  ZoneRecord,
  createCountry,
  createFinancialConfig,
  createLaborRate,
  createLocality,
  createTaxRule,
  createZone,
  deleteCountry,
  deleteFinancialConfig,
  deleteLaborRate,
  deleteLocality,
  deleteTaxRule,
  deleteZone,
  getCountries,
  getFinancialConfigs,
  getLaborRates,
  getLocalities,
  getTaxRules,
  getZones,
} from "@/lib/api";

const emptyCountry = {
  name: "",
  name_ro: "",
  name_en: "",
  slug: "",
  code: "",
  currency: "RON",
  is_active: true,
};

const emptyZone = {
  country_id: "",
  name: "",
  name_ro: "",
  name_en: "",
  slug: "",
  multiplier: "1",
  is_active: true,
};

const emptyLocality = {
  country_id: "",
  zone_id: "",
  name_ro: "",
  name_en: "",
  slug: "",
  latitude: "",
  longitude: "",
  is_active: true,
};

const emptyTaxRule = {
  country_code: "RO",
  locality_slug: "",
  service_type: "SERVICE",
  vat_percentage: "0.19",
  is_active: true,
};

const emptyFinancial = {
  country_id: "",
  zone_id: "",
  locality_id: "",
  service_family: "GENERAL",
  mydarrin_commission_percentage: "0.10",
  labor_margin_percentage: "0.15",
  material_margin_percentage: "0.10",
  rental_margin_percentage: "0.15",
  platform_fee_percentage: "0.03",
  indirect_cost_percentage: "0.00",
  escrow_guarantee_percentage: "0.05",
  insurance_percentage: "0.00",
  insurance_fixed_amount: "0.00",
  incomplete_load_fee: "0.00",
  pump_mobilization_fee: "0.00",
  pump_price_per_m3: "0.00",
  is_active: true,
};

const emptyLabor = {
  country_id: "",
  zone_id: "",
  locality_id: "",
  skill_code: "",
  skill_label: "",
  currency: "RON",
  base_rate: "0",
  weekend_multiplier: "1.25",
  holiday_multiplier: "1.5",
  night_multiplier: "1.35",
  is_active: true,
};

function toNullableNumber(value: string) {
  return value ? Number(value) : null;
}

export default function GeoFiscalPage() {
  const { token } = useAuth();
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [localities, setLocalities] = useState<LocalityRecord[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRuleRecord[]>([]);
  const [financialConfigs, setFinancialConfigs] = useState<FinancialConfigRecord[]>([]);
  const [laborRates, setLaborRates] = useState<LaborRateRecord[]>([]);
  const [message, setMessage] = useState("");

  const [countryForm, setCountryForm] = useState(emptyCountry);
  const [zoneForm, setZoneForm] = useState(emptyZone);
  const [localityForm, setLocalityForm] = useState(emptyLocality);
  const [taxRuleForm, setTaxRuleForm] = useState(emptyTaxRule);
  const [financialForm, setFinancialForm] = useState(emptyFinancial);
  const [laborForm, setLaborForm] = useState(emptyLabor);

  async function load() {
    if (!token) return;
    const [countryData, zoneData, localityData, taxRuleData, financialData, laborData] = await Promise.all([
      getCountries(token),
      getZones(token),
      getLocalities(token),
      getTaxRules(token),
      getFinancialConfigs(token),
      getLaborRates(token),
    ]);
    setCountries(countryData);
    setZones(zoneData);
    setLocalities(localityData);
    setTaxRules(taxRuleData);
    setFinancialConfigs(financialData);
    setLaborRates(laborData);
  }

  useEffect(() => {
    void load();
  }, [token]);

  const filteredZones = useMemo(
    () => zones.filter((item) => !localityForm.country_id || item.country_id === Number(localityForm.country_id)),
    [zones, localityForm.country_id],
  );

  async function handleCreateCountry(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createCountry(token, countryForm);
    setCountryForm(emptyCountry);
    setMessage("Country salvat.");
    await load();
  }

  async function handleCreateZone(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createZone(token, {
      ...zoneForm,
      country_id: Number(zoneForm.country_id),
      multiplier: Number(zoneForm.multiplier),
    });
    setZoneForm(emptyZone);
    setMessage("City/Zone salvata.");
    await load();
  }

  async function handleCreateLocality(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createLocality(token, {
      country_id: Number(localityForm.country_id),
      zone_id: Number(localityForm.zone_id),
      name_ro: localityForm.name_ro,
      name_en: localityForm.name_en,
      slug: localityForm.slug,
      latitude: localityForm.latitude ? Number(localityForm.latitude) : null,
      longitude: localityForm.longitude ? Number(localityForm.longitude) : null,
      is_active: localityForm.is_active,
    });
    setLocalityForm(emptyLocality);
    setMessage("Locality salvata.");
    await load();
  }

  async function handleCreateTaxRule(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createTaxRule(token, {
      country_code: taxRuleForm.country_code,
      locality_slug: taxRuleForm.locality_slug || null,
      service_type: taxRuleForm.service_type,
      vat_percentage: Number(taxRuleForm.vat_percentage),
      is_active: taxRuleForm.is_active,
    });
    setTaxRuleForm(emptyTaxRule);
    setMessage("Tax rule salvat.");
    await load();
  }

  async function handleCreateFinancialConfig(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createFinancialConfig(token, {
      country_id: toNullableNumber(financialForm.country_id),
      zone_id: toNullableNumber(financialForm.zone_id),
      locality_id: toNullableNumber(financialForm.locality_id),
      service_family: financialForm.service_family || null,
      mydarrin_commission_percentage: Number(financialForm.mydarrin_commission_percentage),
      labor_margin_percentage: Number(financialForm.labor_margin_percentage),
      material_margin_percentage: Number(financialForm.material_margin_percentage),
      rental_margin_percentage: Number(financialForm.rental_margin_percentage),
      platform_fee_percentage: Number(financialForm.platform_fee_percentage),
      indirect_cost_percentage: Number(financialForm.indirect_cost_percentage),
      escrow_guarantee_percentage: Number(financialForm.escrow_guarantee_percentage),
      insurance_percentage: Number(financialForm.insurance_percentage),
      insurance_fixed_amount: Number(financialForm.insurance_fixed_amount),
      incomplete_load_fee: Number(financialForm.incomplete_load_fee),
      pump_mobilization_fee: Number(financialForm.pump_mobilization_fee),
      pump_price_per_m3: Number(financialForm.pump_price_per_m3),
      is_active: financialForm.is_active,
    });
    setFinancialForm(emptyFinancial);
    setMessage("Financial config salvat.");
    await load();
  }

  async function handleCreateLaborRate(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createLaborRate(token, {
      country_id: toNullableNumber(laborForm.country_id),
      zone_id: toNullableNumber(laborForm.zone_id),
      locality_id: toNullableNumber(laborForm.locality_id),
      skill_code: laborForm.skill_code,
      skill_label: laborForm.skill_label,
      currency: laborForm.currency,
      base_rate: Number(laborForm.base_rate),
      weekend_multiplier: Number(laborForm.weekend_multiplier),
      holiday_multiplier: Number(laborForm.holiday_multiplier),
      night_multiplier: Number(laborForm.night_multiplier),
      is_active: laborForm.is_active,
    });
    setLaborForm(emptyLabor);
    setMessage("Labor rate salvat.");
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Financial Settings, Geo-Fiscal & Labor Matrix"
        description="Dashboard operational pentru marje My Darrin, garantie de buna executie, insurance premium, tari, localitati, TVA si matricea de manopera cu multiplicatori de weekend, sarbatori si noapte."
        badge="Financial"
      />

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <form className="panel p-6" onSubmit={handleCreateCountry}>
          <h2 className="text-xl font-semibold text-ink">Country & Currency</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="field" placeholder="Name" value={countryForm.name} onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })} />
            <input className="field" placeholder="Name RO" value={countryForm.name_ro} onChange={(e) => setCountryForm({ ...countryForm, name_ro: e.target.value })} />
            <input className="field" placeholder="Name EN" value={countryForm.name_en} onChange={(e) => setCountryForm({ ...countryForm, name_en: e.target.value })} />
            <input className="field" placeholder="Slug" value={countryForm.slug} onChange={(e) => setCountryForm({ ...countryForm, slug: e.target.value })} />
            <input className="field" placeholder="ISO Code" value={countryForm.code} onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })} />
            <input className="field" placeholder="Currency" value={countryForm.currency} onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value.toUpperCase() })} />
          </div>
          <button className="btn-primary mt-4" type="submit">Salveaza tara</button>
          <div className="mt-4 grid gap-3">
            {countries.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                <div className="font-semibold text-ink">{item.name_ro} · {item.code} · {item.currency}</div>
                <button className="btn-secondary mt-3" type="button" onClick={() => token && deleteCountry(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </form>

        <form className="panel p-6" onSubmit={handleCreateZone}>
          <h2 className="text-xl font-semibold text-ink">City / Zone</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className="field" value={zoneForm.country_id} onChange={(e) => setZoneForm({ ...zoneForm, country_id: e.target.value })}>
              <option value="">Alege tara</option>
              {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <input className="field" placeholder="Name" value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} />
            <input className="field" placeholder="Name RO" value={zoneForm.name_ro} onChange={(e) => setZoneForm({ ...zoneForm, name_ro: e.target.value })} />
            <input className="field" placeholder="Name EN" value={zoneForm.name_en} onChange={(e) => setZoneForm({ ...zoneForm, name_en: e.target.value })} />
            <input className="field" placeholder="Slug" value={zoneForm.slug} onChange={(e) => setZoneForm({ ...zoneForm, slug: e.target.value })} />
            <input className="field" placeholder="Multiplier" value={zoneForm.multiplier} onChange={(e) => setZoneForm({ ...zoneForm, multiplier: e.target.value })} />
          </div>
          <button className="btn-primary mt-4" type="submit">Salveaza zona</button>
          <div className="mt-4 grid gap-3">
            {zones.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                <div className="font-semibold text-ink">{item.name_ro}</div>
                <div>Country #{item.country_id} · Multiplier {item.multiplier}</div>
                <button className="btn-secondary mt-3" type="button" onClick={() => token && deleteZone(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </form>

        <form className="panel p-6" onSubmit={handleCreateLocality}>
          <h2 className="text-xl font-semibold text-ink">Locality</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className="field" value={localityForm.country_id} onChange={(e) => setLocalityForm({ ...localityForm, country_id: e.target.value, zone_id: "" })}>
              <option value="">Alege tara</option>
              {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={localityForm.zone_id} onChange={(e) => setLocalityForm({ ...localityForm, zone_id: e.target.value })}>
              <option value="">Alege zona</option>
              {filteredZones.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <input className="field" placeholder="Name RO" value={localityForm.name_ro} onChange={(e) => setLocalityForm({ ...localityForm, name_ro: e.target.value })} />
            <input className="field" placeholder="Name EN" value={localityForm.name_en} onChange={(e) => setLocalityForm({ ...localityForm, name_en: e.target.value })} />
            <input className="field" placeholder="Slug" value={localityForm.slug} onChange={(e) => setLocalityForm({ ...localityForm, slug: e.target.value })} />
            <input className="field" placeholder="Latitude" value={localityForm.latitude} onChange={(e) => setLocalityForm({ ...localityForm, latitude: e.target.value })} />
            <input className="field md:col-span-2" placeholder="Longitude" value={localityForm.longitude} onChange={(e) => setLocalityForm({ ...localityForm, longitude: e.target.value })} />
          </div>
          <button className="btn-primary mt-4" type="submit">Salveaza localitatea</button>
          <div className="mt-4 grid gap-3">
            {localities.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                <div className="font-semibold text-ink">{item.name_ro}</div>
                <div>{item.country_name_ro} / {item.zone_name_ro} · {item.slug}</div>
                <button className="btn-secondary mt-3" type="button" onClick={() => token && deleteLocality(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </form>

        <form className="panel p-6" onSubmit={handleCreateTaxRule}>
          <h2 className="text-xl font-semibold text-ink">Tax Rules</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="field" placeholder="Country code" value={taxRuleForm.country_code} onChange={(e) => setTaxRuleForm({ ...taxRuleForm, country_code: e.target.value.toUpperCase() })} />
            <input className="field" placeholder="Locality slug (optional)" value={taxRuleForm.locality_slug} onChange={(e) => setTaxRuleForm({ ...taxRuleForm, locality_slug: e.target.value })} />
            <select className="field" value={taxRuleForm.service_type} onChange={(e) => setTaxRuleForm({ ...taxRuleForm, service_type: e.target.value })}>
              <option value="SERVICE">SERVICE</option>
              <option value="LANDSCAPING">LANDSCAPING</option>
              <option value="CONSTRUCTION_MATERIAL">CONSTRUCTION_MATERIAL</option>
            </select>
            <input className="field" placeholder="VAT %" value={taxRuleForm.vat_percentage} onChange={(e) => setTaxRuleForm({ ...taxRuleForm, vat_percentage: e.target.value })} />
          </div>
          <button className="btn-primary mt-4" type="submit">Salveaza TVA</button>
          <div className="mt-4 grid gap-3">
            {taxRules.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                <div className="font-semibold text-ink">{item.country_code} · {item.service_type}</div>
                <div>{item.locality_slug ?? "global"} · TVA {item.vat_percentage}</div>
                <button className="btn-secondary mt-3" type="button" onClick={() => token && deleteTaxRule(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </form>

        <form className="panel p-6" onSubmit={handleCreateFinancialConfig}>
          <h2 className="text-xl font-semibold text-ink">Financial Config</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setFinancialForm((current) => ({
                  ...current,
                  service_family: "HVAC",
                  mydarrin_commission_percentage: "0.15",
                  labor_margin_percentage: "0.15",
                  escrow_guarantee_percentage: current.escrow_guarantee_percentage || "0.05",
                }))
              }
            >
              Preset manopera 15%
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setFinancialForm((current) => ({
                  ...current,
                  service_family: "CONCRETE",
                  mydarrin_commission_percentage: "0.10",
                  material_margin_percentage: "0.10",
                  escrow_guarantee_percentage: current.escrow_guarantee_percentage || "0.05",
                }))
              }
            >
              Preset materiale 10%
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setFinancialForm((current) => ({
                  ...current,
                  service_family: "RENTAL",
                  mydarrin_commission_percentage: "0.15",
                  rental_margin_percentage: "0.15",
                  escrow_guarantee_percentage: current.escrow_guarantee_percentage || "0.05",
                }))
              }
            >
              Preset inchirieri 15%
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className="field" value={financialForm.country_id} onChange={(e) => setFinancialForm({ ...financialForm, country_id: e.target.value })}>
              <option value="">Global country</option>
              {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={financialForm.zone_id} onChange={(e) => setFinancialForm({ ...financialForm, zone_id: e.target.value })}>
              <option value="">Global zone</option>
              {zones.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={financialForm.locality_id} onChange={(e) => setFinancialForm({ ...financialForm, locality_id: e.target.value })}>
              <option value="">Global locality</option>
              {localities.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={financialForm.service_family} onChange={(e) => setFinancialForm({ ...financialForm, service_family: e.target.value })}>
              <option value="GENERAL">GENERAL</option>
              <option value="HVAC">HVAC / Manopera</option>
              <option value="CONCRETE">CONCRETE / Materiale</option>
              <option value="RENTAL">RENTAL / Inchirieri</option>
              <option value="NAVAL">NAVAL</option>
            </select>
            <input className="field" placeholder="My Darrin %" value={financialForm.mydarrin_commission_percentage} onChange={(e) => setFinancialForm({ ...financialForm, mydarrin_commission_percentage: e.target.value })} />
            <input className="field" placeholder="Marja manopera %" value={financialForm.labor_margin_percentage} onChange={(e) => setFinancialForm({ ...financialForm, labor_margin_percentage: e.target.value })} />
            <input className="field" placeholder="Marja materiale %" value={financialForm.material_margin_percentage} onChange={(e) => setFinancialForm({ ...financialForm, material_margin_percentage: e.target.value })} />
            <input className="field" placeholder="Marja inchirieri %" value={financialForm.rental_margin_percentage} onChange={(e) => setFinancialForm({ ...financialForm, rental_margin_percentage: e.target.value })} />
            <input className="field" placeholder="Platform %" value={financialForm.platform_fee_percentage} onChange={(e) => setFinancialForm({ ...financialForm, platform_fee_percentage: e.target.value })} />
            <input className="field" placeholder="Indirecte %" value={financialForm.indirect_cost_percentage} onChange={(e) => setFinancialForm({ ...financialForm, indirect_cost_percentage: e.target.value })} />
            <input className="field" placeholder="Escrow %" value={financialForm.escrow_guarantee_percentage} onChange={(e) => setFinancialForm({ ...financialForm, escrow_guarantee_percentage: e.target.value })} />
            <input className="field" placeholder="Insurance %" value={financialForm.insurance_percentage} onChange={(e) => setFinancialForm({ ...financialForm, insurance_percentage: e.target.value })} />
            <input className="field" placeholder="Insurance fixed" value={financialForm.insurance_fixed_amount} onChange={(e) => setFinancialForm({ ...financialForm, insurance_fixed_amount: e.target.value })} />
            <input className="field" placeholder="Incomplete load fee" value={financialForm.incomplete_load_fee} onChange={(e) => setFinancialForm({ ...financialForm, incomplete_load_fee: e.target.value })} />
            <input className="field" placeholder="Pump mobilization" value={financialForm.pump_mobilization_fee} onChange={(e) => setFinancialForm({ ...financialForm, pump_mobilization_fee: e.target.value })} />
            <input className="field" placeholder="Pump per m3" value={financialForm.pump_price_per_m3} onChange={(e) => setFinancialForm({ ...financialForm, pump_price_per_m3: e.target.value })} />
          </div>
          <button className="btn-primary mt-4" type="submit">Salveaza financial config</button>
          <div className="mt-4 grid gap-3">
            {financialConfigs.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                <div className="font-semibold text-ink">{item.service_family ?? "GENERAL"}</div>
                <div>My Darrin {item.mydarrin_commission_percentage} · Manopera {item.labor_margin_percentage} · Materiale {item.material_margin_percentage} · Inchirieri {item.rental_margin_percentage}</div>
                <div>Platform {item.platform_fee_percentage} · Escrow {item.escrow_guarantee_percentage} · Insurance {item.insurance_fixed_amount}</div>
                <button className="btn-secondary mt-3" type="button" onClick={() => token && deleteFinancialConfig(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </form>

        <form className="panel p-6" onSubmit={handleCreateLaborRate}>
          <h2 className="text-xl font-semibold text-ink">Labor Matrix</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className="field" value={laborForm.country_id} onChange={(e) => setLaborForm({ ...laborForm, country_id: e.target.value })}>
              <option value="">Global country</option>
              {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={laborForm.zone_id} onChange={(e) => setLaborForm({ ...laborForm, zone_id: e.target.value })}>
              <option value="">Global zone</option>
              {zones.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={laborForm.locality_id} onChange={(e) => setLaborForm({ ...laborForm, locality_id: e.target.value })}>
              <option value="">Global locality</option>
              {localities.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <input className="field" placeholder="Skill code" value={laborForm.skill_code} onChange={(e) => setLaborForm({ ...laborForm, skill_code: e.target.value })} />
            <input className="field md:col-span-2" placeholder="Skill label" value={laborForm.skill_label} onChange={(e) => setLaborForm({ ...laborForm, skill_label: e.target.value })} />
            <input className="field" placeholder="Currency" value={laborForm.currency} onChange={(e) => setLaborForm({ ...laborForm, currency: e.target.value.toUpperCase() })} />
            <input className="field" placeholder="Base rate" value={laborForm.base_rate} onChange={(e) => setLaborForm({ ...laborForm, base_rate: e.target.value })} />
            <input className="field" placeholder="Weekend multiplier" value={laborForm.weekend_multiplier} onChange={(e) => setLaborForm({ ...laborForm, weekend_multiplier: e.target.value })} />
            <input className="field" placeholder="Holiday multiplier" value={laborForm.holiday_multiplier} onChange={(e) => setLaborForm({ ...laborForm, holiday_multiplier: e.target.value })} />
            <input className="field" placeholder="Night multiplier" value={laborForm.night_multiplier} onChange={(e) => setLaborForm({ ...laborForm, night_multiplier: e.target.value })} />
          </div>
          <button className="btn-primary mt-4" type="submit">Salveaza labor rate</button>
          <div className="mt-4 grid gap-3">
            {laborRates.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                <div className="font-semibold text-ink">{item.skill_label}</div>
                <div>{item.base_rate} {item.currency} · weekend {item.weekend_multiplier} · holiday {item.holiday_multiplier} · night {item.night_multiplier}</div>
                <button className="btn-secondary mt-3" type="button" onClick={() => token && deleteLaborRate(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
