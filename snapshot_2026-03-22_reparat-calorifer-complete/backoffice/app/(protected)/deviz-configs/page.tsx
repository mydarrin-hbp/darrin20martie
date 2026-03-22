"use client";

import { FormEvent, useEffect, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import {
  CountryRecord,
  createDevizRule,
  createPriceConfig,
  deleteDevizRule,
  deletePriceConfig,
  DevizRuleRecord,
  getCountries,
  getDevizRules,
  getPriceConfigs,
  getServices,
  getZones,
  PriceConfigRecord,
  ServiceRecord,
  ZoneRecord,
} from "@/lib/api";

const defaultPriceForm = {
  service_id: 1,
  country_id: 1,
  zone_id: 1,
  currency: "RON",
  legislation_code: "RO-STD",
  base_price: 1000,
  legislation_coefficient: 1,
  zone_coefficient_override: null as number | null,
  urgency_coefficient: 1.2,
  basic_level_coefficient: 1,
  standard_level_coefficient: 1.15,
  premium_level_coefficient: 1.3,
  indirect_cost_percentage: 0.1,
  platform_maintenance_percentage: 0.03,
  mydarrin_platform_percentage: 0.15,
  vat_percentage: 0.21,
  platform_margin_coefficient: 0.15,
  vat_coefficient: 0.21,
  is_active: true,
};

const defaultRuleForm: {
  service_id: number | null;
  country_id: number | null;
  level_name: DevizRuleRecord["level_name"];
  label: string;
  multiplier: number;
  description: string;
  sort_order: number;
  is_active: boolean;
} = {
  service_id: null as number | null,
  country_id: null as number | null,
  level_name: "BRONZ",
  label: "Bronz",
  multiplier: 1,
  description: "Nivel de baza",
  sort_order: 1,
  is_active: true,
};

export default function DevizConfigsPage() {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [priceConfigs, setPriceConfigs] = useState<PriceConfigRecord[]>([]);
  const [rules, setRules] = useState<DevizRuleRecord[]>([]);
  const [priceForm, setPriceForm] = useState(defaultPriceForm);
  const [ruleForm, setRuleForm] = useState(defaultRuleForm);

  async function load() {
    if (!token) {
      return;
    }
    const [serviceList, countryList, zoneList, configList, ruleList] = await Promise.all([
      getServices(token),
      getCountries(token),
      getZones(token),
      getPriceConfigs(token),
      getDevizRules(token),
    ]);
    setServices(serviceList);
    setCountries(countryList);
    setZones(zoneList);
    setPriceConfigs(configList);
    setRules(ruleList);
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function submitPriceConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    await createPriceConfig(token, priceForm);
    await load();
  }

  async function submitRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    await createDevizRule(token, ruleForm);
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Configurari Devize"
        description="Preturi manuale, coeficienti si indicatori pentru Cost Engine si Deviz Engine, conectate direct la endpointurile administrative reale."
        badge="Cost + Deviz"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={submitPriceConfig} className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Configurare pret manual</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className="field" value={priceForm.service_id} onChange={(e) => setPriceForm({ ...priceForm, service_id: Number(e.target.value) })}>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <select className="field" value={priceForm.country_id} onChange={(e) => setPriceForm({ ...priceForm, country_id: Number(e.target.value) })}>
              {countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}
            </select>
            <select className="field" value={priceForm.zone_id ?? ""} onChange={(e) => setPriceForm({ ...priceForm, zone_id: Number(e.target.value) })}>
              {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
            </select>
            <input className="field" value={priceForm.currency} onChange={(e) => setPriceForm({ ...priceForm, currency: e.target.value })} placeholder="Currency" />
            <input className="field" value={priceForm.legislation_code} onChange={(e) => setPriceForm({ ...priceForm, legislation_code: e.target.value })} placeholder="Legislation" />
            <input className="field" type="number" value={priceForm.base_price} onChange={(e) => setPriceForm({ ...priceForm, base_price: Number(e.target.value) })} placeholder="Base price" />
            <input className="field" type="number" step="0.01" value={priceForm.indirect_cost_percentage} onChange={(e) => setPriceForm({ ...priceForm, indirect_cost_percentage: Number(e.target.value) })} placeholder="Indirecte %" />
            <input className="field" type="number" step="0.01" value={priceForm.platform_maintenance_percentage} onChange={(e) => setPriceForm({ ...priceForm, platform_maintenance_percentage: Number(e.target.value) })} placeholder="Mentenanta %" />
            <input className="field" type="number" step="0.01" value={priceForm.mydarrin_platform_percentage} onChange={(e) => setPriceForm({ ...priceForm, mydarrin_platform_percentage: Number(e.target.value) })} placeholder="My Darrin %" />
            <input className="field" type="number" step="0.01" value={priceForm.vat_percentage} onChange={(e) => setPriceForm({ ...priceForm, vat_percentage: Number(e.target.value) })} placeholder="TVA %" />
          </div>
          <button className="btn-primary mt-4" type="submit">Adauga pret</button>
        </form>

        <form onSubmit={submitRule} className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Regula nivel deviz</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className="field" value={ruleForm.service_id ?? ""} onChange={(e) => setRuleForm({ ...ruleForm, service_id: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Toate serviciile</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <select className="field" value={ruleForm.country_id ?? ""} onChange={(e) => setRuleForm({ ...ruleForm, country_id: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Toate tarile</option>
              {countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}
            </select>
            <select className="field" value={ruleForm.level_name} onChange={(e) => setRuleForm({ ...ruleForm, level_name: e.target.value as DevizRuleRecord["level_name"] })}>
              <option value="BRONZ">Bronz</option>
              <option value="ARGINT">Argint</option>
              <option value="AUR">Aur</option>
              <option value="PLATINUM">Platinum</option>
            </select>
            <input className="field" value={ruleForm.label} onChange={(e) => setRuleForm({ ...ruleForm, label: e.target.value })} placeholder="Label" />
            <input className="field" type="number" step="0.01" value={ruleForm.multiplier} onChange={(e) => setRuleForm({ ...ruleForm, multiplier: Number(e.target.value) })} placeholder="Multiplier" />
            <input className="field" type="number" value={ruleForm.sort_order} onChange={(e) => setRuleForm({ ...ruleForm, sort_order: Number(e.target.value) })} placeholder="Sort order" />
          </div>
          <textarea className="field mt-3 min-h-28" value={ruleForm.description ?? ""} onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })} />
          <button className="btn-primary mt-4" type="submit">Adauga regula</button>
        </form>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Preturi manuale</h3>
          <div className="mt-4 grid gap-3">
            {priceConfigs.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="font-semibold text-ink">Config #{item.id}</div>
                <div className="mt-1 text-sm text-muted">
                  Service {item.service_id} · Country {item.country_id} · Zone {item.zone_id ?? "global"} · {item.base_price} {item.currency}
                </div>
                  <div className="mt-1 text-sm text-muted">
                    Indirecte {item.indirect_cost_percentage} Â· Mentenanta {item.platform_maintenance_percentage} Â· MyDarrin {item.mydarrin_platform_percentage} Â· TVA {item.vat_percentage}
                  </div>
                  <button className="btn-secondary mt-4" onClick={() => token && deletePriceConfig(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Reguli Bronz / Argint / Aur / Platinum</h3>
          <div className="mt-4 grid gap-3">
            {rules.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="font-semibold text-ink">{item.label}</div>
                <div className="mt-1 text-sm text-muted">
                  {item.level_name} · multiplier {item.multiplier} · service {item.service_id ?? "global"} · country {item.country_id ?? "global"}
                </div>
                <button className="btn-secondary mt-4" onClick={() => token && deleteDevizRule(token, item.id).then(load)}>Sterge</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
