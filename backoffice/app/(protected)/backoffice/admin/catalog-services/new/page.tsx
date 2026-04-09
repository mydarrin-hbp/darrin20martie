"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  BackofficeServiceCreateRequest,
  BackofficeServiceCreateResponse,
  CatalogActivityRecord,
  CatalogResourceRecord,
  CategoryRecord,
  createBackofficeServiceFlow,
  DomainRecord,
  EscoOccupationRecord,
  getCatalogActivities,
  getCatalogResources,
  getCategories,
  getDomains,
  getEscoOccupations,
  getSubcategories,
  SubcategoryRecord,
} from "@/lib/api";
import { getPublicSiteBaseUrl } from "@/lib/public-site";

type UiResourceType = "MANOPERA" | "MATERIAL" | "UTILAJ" | "TRANSPORT" | "CONSUMABIL" | "ALTELE";

type RecipeItem = {
  key: string;
  resourceType: UiResourceType;
  resourceId: string;
  activityId: string;
  specificConsumption: string;
  consumptionUnit: string;
  wastePercentage: string;
  bronz: string;
  argint: string;
  aur: string;
  platinum: string;
};

const RESOURCE_TYPE_MAP: Record<UiResourceType, CatalogResourceRecord["resource_type"]> = {
  MANOPERA: "LABOR",
  MATERIAL: "MATERIAL",
  UTILAJ: "EQUIPMENT",
  TRANSPORT: "TRANSPORT",
  CONSUMABIL: "MATERIAL",
  ALTELE: "MATERIAL",
};

const DEFAULT_RECIPE_ITEM = (): RecipeItem => ({
  key: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  resourceType: "MANOPERA",
  resourceId: "",
  activityId: "",
  specificConsumption: "1",
  consumptionUnit: "ora",
  wastePercentage: "0",
  bronz: "1",
  argint: "1",
  aur: "1",
  platinum: "1",
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildServiceCode(subcategoryId: string, name: string) {
  const stem = slugify(name).replace(/-/g, "").slice(0, 4).toUpperCase() || "SRV";
  return `${stem}${String(subcategoryId || "0").padStart(3, "0")}A1`;
}

export default function NewCatalogServicePage() {
  const { token } = useAuth();
  const router = useRouter();
  const publicBase = getPublicSiteBaseUrl();
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRecord[]>([]);
  const [activities, setActivities] = useState<CatalogActivityRecord[]>([]);
  const [resources, setResources] = useState<CatalogResourceRecord[]>([]);
  const [occupations, setOccupations] = useState<EscoOccupationRecord[]>([]);
  const [domainId, setDomainId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [serviceNameRo, setServiceNameRo] = useState("");
  const [serviceNameEn, setServiceNameEn] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [shortDescriptionRo, setShortDescriptionRo] = useState("");
  const [shortDescriptionEn, setShortDescriptionEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedCaenCodes, setSelectedCaenCodes] = useState<string[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([DEFAULT_RECIPE_ITEM()]);
  const [laborHourlyRate, setLaborHourlyRate] = useState("75");
  const [indirectCostPercentage, setIndirectCostPercentage] = useState("10");
  const [platformMaintenancePercentage, setPlatformMaintenancePercentage] = useState("3");
  const [platformPercentage, setPlatformPercentage] = useState("15");
  const [vatPercentage, setVatPercentage] = useState("21");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [demoVideo, setDemoVideo] = useState<File | null>(null);
  const [instructionsPdf, setInstructionsPdf] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [createdService, setCreatedService] = useState<BackofficeServiceCreateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitMode, setSubmitMode] = useState<"create-another" | "close">("close");

  useEffect(() => {
    if (!token) return;
    Promise.all([getDomains(token), getCatalogResources(token), getEscoOccupations(token, { limit: 25 })]).then(
      ([domainData, resourceData, occupationData]) => {
        setDomains(domainData);
        setResources(resourceData);
        setOccupations(occupationData.items);
      },
    );
  }, [token]);

  useEffect(() => {
    if (!token || !domainId) {
      setCategories([]);
      return;
    }
    getCategories(token, Number(domainId)).then(setCategories);
  }, [token, domainId]);

  useEffect(() => {
    if (!token || !categoryId) {
      setSubcategories([]);
      return;
    }
    getSubcategories(token, { categoryId: Number(categoryId) }).then(setSubcategories);
  }, [token, categoryId]);

  useEffect(() => {
    if (!token || !subcategoryId) {
      setActivities([]);
      return;
    }
    getCatalogActivities(token, {
      domainId: Number(domainId),
      categoryId: Number(categoryId),
      subcategoryId: Number(subcategoryId),
    }).then(setActivities);
  }, [token, domainId, categoryId, subcategoryId]);

  useEffect(() => {
    setServiceSlug(slugify(serviceNameRo));
  }, [serviceNameRo]);

  useEffect(() => {
    setServiceCode(buildServiceCode(subcategoryId, serviceNameRo));
  }, [subcategoryId, serviceNameRo]);

  const selectedDomain = domains.find((item) => item.id === Number(domainId));
  const selectedCategory = categories.find((item) => item.id === Number(categoryId));
  const selectedSubcategory = subcategories.find((item) => item.id === Number(subcategoryId));

  useEffect(() => {
    if (!selectedSubcategory) return;
    const isCalorifere = selectedSubcategory.name_ro.toLowerCase().includes("calorifer");
    if (!isCalorifere) return;

    setServiceNameRo((current) => current || "Reparat calorifer - interventie completa");
    setServiceNameEn((current) => current || "Radiator repair - complete intervention");
    setShortDescriptionRo((current) => current || "Diagnostic, etansare, reglaj si interventie completa pentru calorifere.");
    setShortDescriptionEn((current) => current || "Diagnosis, sealing, adjustment and complete intervention for radiators.");
    setLaborHourlyRate((current) => current || "75");
    setIndirectCostPercentage((current) => current || "10");
    setPlatformMaintenancePercentage((current) => current || "3");
    setPlatformPercentage((current) => current || "15");
    setVatPercentage((current) => current || "21");
    setRecipeItems((items) =>
      items.length === 1 && !items[0].resourceId && !items[0].activityId
        ? [
            {
              ...items[0],
              resourceType: "MANOPERA",
              specificConsumption: "2.5",
              consumptionUnit: "ora",
              wastePercentage: "0",
              bronz: "1",
              argint: "1",
              aur: "1.15",
              platinum: "1.3",
            },
          ]
        : items,
    );
  }, [selectedSubcategory]);

  const caenOptions = useMemo(() => {
    const values = [
      ...(selectedDomain?.caen_codes ?? []),
      ...(selectedCategory?.caen_codes ?? []),
      ...(selectedSubcategory?.caen_codes ?? []),
    ];
    return Array.from(new Set(values));
  }, [selectedCategory, selectedDomain, selectedSubcategory]);

  const payloadPreview = useMemo(
    () => ({
      hierarchy: {
        domain_id: Number(domainId || 0),
        domain_name_ro: selectedDomain?.name_ro ?? null,
        category_id: Number(categoryId || 0),
        category_name_ro: selectedCategory?.name_ro ?? null,
        subcategory_id: Number(subcategoryId || 0),
        subcategory_name_ro: selectedSubcategory?.name_ro ?? null,
      },
      classifications: {
        caen_codes: selectedCaenCodes,
        uniclass_activity_ids: selectedActivityIds,
        esco_occupations: selectedOccupations,
      },
      price_analysis_recipes: recipeItems.map((item) => ({
        resource_type: item.resourceType,
        resource_id: Number(item.resourceId || 0),
        activity_id: Number(item.activityId || 0),
        specific_consumption: Number(item.specificConsumption || 0),
        consumption_unit: item.consumptionUnit,
        waste_percentage: Number(item.wastePercentage || 0),
        level_coefficients: {
          BRONZ: Number(item.bronz || 0),
          ARGINT: Number(item.argint || 0),
          AUR: Number(item.aur || 0),
          PLATINUM: Number(item.platinum || 0),
        },
      })),
      default_costs: {
        labor_hourly_rate: Number(laborHourlyRate || 0),
        indirect_cost_percentage: Number(indirectCostPercentage || 0) / 100,
        platform_maintenance_percentage: Number(platformMaintenancePercentage || 0) / 100,
        mydarrin_platform_percentage: Number(platformPercentage || 0) / 100,
        vat_percentage: Number(vatPercentage || 0) / 100,
      },
    }),
    [
      categoryId,
      domainId,
      indirectCostPercentage,
      laborHourlyRate,
      platformMaintenancePercentage,
      platformPercentage,
      recipeItems,
      selectedActivityIds,
      selectedCaenCodes,
      selectedCategory?.name_ro,
      selectedDomain?.name_ro,
      selectedOccupations,
      selectedSubcategory?.name_ro,
      subcategoryId,
      vatPercentage,
    ],
  );

  function resetForm() {
    setDomainId("");
    setCategoryId("");
    setSubcategoryId("");
    setServiceNameRo("");
    setServiceNameEn("");
    setServiceSlug("");
    setServiceCode("");
    setShortDescriptionRo("");
    setShortDescriptionEn("");
    setIsActive(true);
    setSelectedCaenCodes([]);
    setSelectedActivityIds([]);
    setSelectedOccupations([]);
    setRecipeItems([DEFAULT_RECIPE_ITEM()]);
    setLaborHourlyRate("75");
    setIndirectCostPercentage("10");
    setPlatformMaintenancePercentage("3");
    setPlatformPercentage("15");
    setVatPercentage("21");
    setMainImage(null);
    setDemoVideo(null);
    setInstructionsPdf(null);
    setCreatedService(null);
  }

  function toggleString(values: string[], setter: (next: string[]) => void, value: string) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function toggleNumber(values: number[], setter: (next: number[]) => void, value: number) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function updateRecipeItem(key: string, patch: Partial<RecipeItem>) {
    setRecipeItems((items) => items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setLoading(true);
    setMessage("");
    setCreatedService(null);

    try {
      const payload: BackofficeServiceCreateRequest = {
        domain_id: Number(domainId),
        category_id: Number(categoryId),
        subcategory_id: Number(subcategoryId),
        service_name_ro: serviceNameRo,
        service_name_en: serviceNameEn || null,
        service_slug: serviceSlug,
        service_code: serviceCode,
        short_description_ro: shortDescriptionRo || null,
        short_description_en: shortDescriptionEn || null,
        is_active: isActive,
        caen_codes: selectedCaenCodes,
        uniclass_activity_ids: selectedActivityIds,
        esco_occupations: selectedOccupations,
        recipe_items: recipeItems.map((item) => ({
          resource_type: item.resourceType,
          resource_id: Number(item.resourceId),
          activity_id: item.activityId ? Number(item.activityId) : null,
          specific_consumption: Number(item.specificConsumption),
          consumption_unit: item.consumptionUnit,
          waste_percentage: Number(item.wastePercentage),
          level_coefficients: {
            BRONZ: Number(item.bronz),
            ARGINT: Number(item.argint),
            AUR: Number(item.aur),
            PLATINUM: Number(item.platinum),
          },
        })),
        default_costs: {
          labor_hourly_rate: Number(laborHourlyRate),
          indirect_cost_percentage: Number(indirectCostPercentage) / 100,
          platform_maintenance_percentage: Number(platformMaintenancePercentage) / 100,
          mydarrin_platform_percentage: Number(platformPercentage) / 100,
          vat_percentage: Number(vatPercentage) / 100,
        },
      };

      const result = await createBackofficeServiceFlow(token, payload, {
        mainImage,
        demoVideo,
        instructionsPdf,
      });
      setCreatedService(result);
      setMessage(`Serviciul ${result.service_code} a fost creat cu succes.`);
      if (submitMode === "create-another") {
        resetForm();
        setMessage(`Serviciul ${result.service_code} a fost creat cu succes. Formularul a fost resetat pentru un serviciu nou.`);
      } else {
        router.push("/backoffice/admin/catalog-services");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Crearea serviciului a esuat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Creare Serviciu Nou - Panou de Administrare My Darrin"
        description="Flux complet pentru creare serviciu nou direct din Backoffice, cu ierarhie, clasificari, reteta de deviz, costuri implicite si atasamente."
        badge="Create flow"
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/backoffice/admin/catalog-services" className="btn-secondary">Inapoi la hub</Link>
        <Link href="/backoffice/services" className="btn-secondary">Vezi servicii existente</Link>
        <a href={publicBase} className="btn-secondary" target="_blank" rel="noreferrer">Vizualizare LIVE</a>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Pas 1 - Selectare ierarhie</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <select className="field" value={domainId} onChange={(event) => { setDomainId(event.target.value); setCategoryId(""); setSubcategoryId(""); }}>
              <option value="">Selecteaza Domain</option>
              {domains.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setSubcategoryId(""); }} disabled={!domainId}>
              <option value="">Selecteaza Category</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
            <select className="field" value={subcategoryId} onChange={(event) => setSubcategoryId(event.target.value)} disabled={!categoryId}>
              <option value="">Selecteaza Subcategory</option>
              {subcategories.map((item) => <option key={item.id} value={item.id}>{item.name_ro}</option>)}
            </select>
          </div>
        </section>

        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Pas 2 - Date de baza serviciu</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="field" placeholder="service_name_ro" value={serviceNameRo} onChange={(event) => setServiceNameRo(event.target.value)} required />
            <input className="field" placeholder="service_name_en" value={serviceNameEn} onChange={(event) => setServiceNameEn(event.target.value)} />
            <input className="field" placeholder="service_slug" value={serviceSlug} onChange={(event) => setServiceSlug(slugify(event.target.value))} required />
            <input className="field" placeholder="service_code" value={serviceCode} onChange={(event) => setServiceCode(event.target.value.toUpperCase())} required />
            <textarea className="field min-h-28" placeholder="short_description_ro" value={shortDescriptionRo} onChange={(event) => setShortDescriptionRo(event.target.value)} />
            <textarea className="field min-h-28" placeholder="short_description_en" value={shortDescriptionEn} onChange={(event) => setShortDescriptionEn(event.target.value)} />
          </div>
          <label className="mt-4 inline-flex items-center gap-3 text-sm text-muted">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            is_active
          </label>
        </section>

        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Pas 3 - Clasificari</h3>
          <div className="mt-4 grid gap-6 xl:grid-cols-3">
            <div>
              <div className="mb-3 text-sm font-medium text-ink">CAEN / NACE</div>
              <div className="grid gap-2">
                {caenOptions.length === 0 ? <div className="text-sm text-muted">Codurile apar dupa selectarea ierarhiei.</div> : null}
                {caenOptions.map((code) => (
                  <label key={code} className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted">
                    <input type="checkbox" className="mr-3" checked={selectedCaenCodes.includes(code)} onChange={() => toggleString(selectedCaenCodes, setSelectedCaenCodes, code)} />
                    {code}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-ink">Uniclass Activity</div>
              <div className="grid max-h-72 gap-2 overflow-y-auto">
                {activities.length === 0 ? <div className="text-sm text-muted">Selecteaza mai intai subcategoria.</div> : null}
                {activities.map((activity) => (
                  <label key={activity.id} className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted">
                    <input type="checkbox" className="mr-3" checked={selectedActivityIds.includes(activity.id)} onChange={() => toggleNumber(selectedActivityIds, setSelectedActivityIds, activity.id)} />
                    {activity.uniclass_code} - {activity.name_ro}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-ink">ESCO occupations</div>
              <div className="grid max-h-72 gap-2 overflow-y-auto">
                {occupations.map((occupation) => (
                  <label key={occupation.concept_uri} className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-muted">
                    <input type="checkbox" className="mr-3" checked={selectedOccupations.includes(occupation.concept_uri)} onChange={() => toggleString(selectedOccupations, setSelectedOccupations, occupation.concept_uri)} />
                    {occupation.preferred_label ?? occupation.code ?? occupation.concept_uri}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-ink">Pas 4 - Reteta Deviz</h3>
            <button className="btn-secondary" type="button" onClick={() => setRecipeItems((items) => [...items, DEFAULT_RECIPE_ITEM()])}>+ Adauga resursa</button>
          </div>
          <div className="mt-4 grid gap-4">
            {recipeItems.map((item, index) => {
              const filteredResources = resources.filter((resource) => resource.resource_type === RESOURCE_TYPE_MAP[item.resourceType]);
              return (
                <article key={item.key} className="rounded-3xl border border-border bg-white/75 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-ink">Resursa #{index + 1}</div>
                    {recipeItems.length > 1 ? <button className="btn-secondary" type="button" onClick={() => setRecipeItems((items) => items.filter((recipe) => recipe.key !== item.key))}>Sterge</button> : null}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <select className="field" value={item.resourceType} onChange={(event) => updateRecipeItem(item.key, { resourceType: event.target.value as UiResourceType, resourceId: "" })}>
                      <option value="MANOPERA">MANOPERA</option>
                      <option value="MATERIAL">MATERIAL</option>
                      <option value="UTILAJ">UTILAJ</option>
                      <option value="TRANSPORT">TRANSPORT</option>
                      <option value="CONSUMABIL">CONSUMABIL</option>
                      <option value="ALTELE">ALTELE</option>
                    </select>
                    <select className="field" value={item.resourceId} onChange={(event) => updateRecipeItem(item.key, { resourceId: event.target.value })}>
                      <option value="">Selecteaza Resource_ID</option>
                      {filteredResources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name_ro}</option>)}
                    </select>
                    <select className="field" value={item.activityId} onChange={(event) => updateRecipeItem(item.key, { activityId: event.target.value })}>
                      <option value="">Activitate primara</option>
                      {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.uniclass_code} - {activity.name_ro}</option>)}
                    </select>
                    <input className="field" placeholder="Specific_Consumption" value={item.specificConsumption} onChange={(event) => updateRecipeItem(item.key, { specificConsumption: event.target.value })} />
                    <input className="field" placeholder="Consumption_Unit" value={item.consumptionUnit} onChange={(event) => updateRecipeItem(item.key, { consumptionUnit: event.target.value })} />
                    <input className="field" placeholder="Waste_Percentage" value={item.wastePercentage} onChange={(event) => updateRecipeItem(item.key, { wastePercentage: event.target.value })} />
                    <input className="field" placeholder="Bronz" value={item.bronz} onChange={(event) => updateRecipeItem(item.key, { bronz: event.target.value })} />
                    <input className="field" placeholder="Argint" value={item.argint} onChange={(event) => updateRecipeItem(item.key, { argint: event.target.value })} />
                    <input className="field" placeholder="Aur" value={item.aur} onChange={(event) => updateRecipeItem(item.key, { aur: event.target.value })} />
                    <input className="field" placeholder="Platinum" value={item.platinum} onChange={(event) => updateRecipeItem(item.key, { platinum: event.target.value })} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Pas 5 - Setari implicite costuri</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input className="field" placeholder="Manopera orara" value={laborHourlyRate} onChange={(event) => setLaborHourlyRate(event.target.value)} />
            <input className="field" placeholder="Indirect %" value={indirectCostPercentage} onChange={(event) => setIndirectCostPercentage(event.target.value)} />
            <input className="field" placeholder="Maintenance %" value={platformMaintenancePercentage} onChange={(event) => setPlatformMaintenancePercentage(event.target.value)} />
            <input className="field" placeholder="Mydarrin %" value={platformPercentage} onChange={(event) => setPlatformPercentage(event.target.value)} />
            <input className="field" placeholder="VAT %" value={vatPercentage} onChange={(event) => setVatPercentage(event.target.value)} />
          </div>
        </section>

        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Pas 6 - Atasamente</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-muted">
              Imagine principala
              <input className="field" type="file" accept="image/*" onChange={(event) => setMainImage(event.target.files?.[0] ?? null)} />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Video demo
              <input className="field" type="file" accept="video/*" onChange={(event) => setDemoVideo(event.target.files?.[0] ?? null)} />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              PDF instructiuni
              <input className="field" type="file" accept="application/pdf" onChange={(event) => setInstructionsPdf(event.target.files?.[0] ?? null)} />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            className="btn-secondary"
            type="submit"
            disabled={loading || !subcategoryId || !serviceNameRo}
            onClick={() => setSubmitMode("create-another")}
          >
            {loading && submitMode === "create-another" ? "Se salveaza..." : "Salveaza si creeaza altul"}
          </button>
          <button
            className="btn-primary"
            type="submit"
            disabled={loading || !subcategoryId || !serviceNameRo}
            onClick={() => setSubmitMode("close")}
          >
            {loading && submitMode === "close" ? "Se salveaza..." : "Salveaza si inchide"}
          </button>
        </div>
      </form>

      <section className="panel mt-6 p-6">
        <h3 className="text-xl font-semibold text-ink">Preview JSON live</h3>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium text-ink">hierarchy + classifications</div>
            <pre className="overflow-x-auto rounded-3xl border border-border bg-white/80 p-4 text-xs text-muted">
              {JSON.stringify(
                {
                  hierarchy: payloadPreview.hierarchy,
                  classifications: payloadPreview.classifications,
                },
                null,
                2,
              )}
            </pre>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-ink">price_analysis_recipes + default_costs</div>
            <pre className="overflow-x-auto rounded-3xl border border-border bg-white/80 p-4 text-xs text-muted">
              {JSON.stringify(
                {
                  price_analysis_recipes: payloadPreview.price_analysis_recipes,
                  default_costs: payloadPreview.default_costs,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </section>

      {createdService ? (
        <section className="panel mt-6 p-6">
          <h3 className="text-xl font-semibold text-ink">Rezultat creat</h3>
          <pre className="mt-4 overflow-x-auto rounded-3xl border border-border bg-white/80 p-4 text-xs text-muted">
            {JSON.stringify(createdService, null, 2)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
