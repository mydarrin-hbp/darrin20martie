export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const BROWSER_PROXY_BASE = "/api/proxy";
export const BACKOFFICE_GATE_USERNAME = process.env.NEXT_PUBLIC_GATE_USERNAME ?? "ownergate";
export const BACKOFFICE_GATE_PASSWORD = process.env.NEXT_PUBLIC_GATE_PASSWORD ?? "CHANGE_ME";
export const BACKEND_GATE_AUTHORIZATION =
  process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION ?? "Basic CHANGE_ME";

export type AdminUser = {
  id: number;
  full_name?: string | null;
  email: string;
  phone?: string | null;
  city?: string | null;
  role: string | null;
  verification_status: string | null;
  permissions?: string[];
};

export type DomainRecord = {
  id: number;
  name_ro: string;
  name_en: string;
  slug: string;
  is_active: boolean;
  caen_codes: string[];
  uniclass_codes: string[];
  esco_codes: string[];
};

export type CategoryRecord = {
  id: number;
  domain_id: number;
  name_ro: string;
  name_en: string;
  slug: string;
  is_active: boolean;
  caen_codes: string[];
  uniclass_codes: string[];
  esco_codes: string[];
};

export type SubcategoryRecord = {
  id: number;
  category_id: number;
  name_ro: string;
  name_en: string;
  slug: string;
  is_active: boolean;
  caen_codes: string[];
  uniclass_codes: string[];
  esco_codes: string[];
};

export type ServiceRecord = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  description_extended?: string | null;
  is_active: boolean;
  images: string[];
  documents: string[];
  videos: string[];
  level_attachments: Record<string, string[]>;
  subcategory_ids: number[];
};

export type CountryRecord = {
  id: number;
  name: string;
  name_ro: string;
  name_en: string;
  slug: string;
  code: string;
  currency: string;
  is_active: boolean;
};
export type ZoneRecord = {
  id: number;
  country_id: number;
  name: string;
  name_ro: string;
  name_en: string;
  slug: string;
  multiplier: number;
  is_active: boolean;
};
export type LocalityRecord = {
  id: number;
  country_id: number;
  zone_id: number;
  name_ro: string;
  name_en: string;
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  country_name_ro: string;
  zone_name_ro: string;
};
export type UnitRecord = { id: number; name: string; symbol: string };
export type ActivityRecord = { id: number; name: string; code: string; unit_id: number; sort_order: number };
export type ServiceActivityRecord = { id: number; service_id: number; activity_id: number; quantity: number };
export type CatalogActivityRecord = {
  id: number;
  uniclass_code: string;
  name_ro: string;
  name_en: string;
  uom: string;
  domain_id: number;
  category_id: number;
  subcategory_id: number;
  description?: string | null;
  description_extended?: string | null;
  is_active: boolean;
  images: string[];
  documents: string[];
  videos: string[];
  level_attachments: Record<string, string[]>;
};

export type CatalogResourceType = "LABOR" | "MATERIAL" | "EQUIPMENT" | "TRANSPORT";

export type CatalogResourceRecord = {
  id: number;
  esco_code?: string | null;
  name_ro: string;
  name_en: string;
  resource_type: CatalogResourceType;
  base_price: number;
  unit: string;
  technical_specs: Record<string, unknown>;
  is_active: boolean;
};

export type AdminResourcePriceConfigRecord = {
  id: number;
  resource_id: number;
  country_id: number;
  zone_id: number | null;
  locality_id: number | null;
  currency: string;
  base_price: number;
  zone_multiplier: number;
  legislation_code: string;
  is_active: boolean;
  resource_name_ro: string;
  resource_type: CatalogResourceType;
};

export type PriceAnalysisRecipeRecord = {
  id: number;
  activity_id: number;
  resource_id: number;
  specific_consumption: number;
  consumption_unit?: string | null;
  waste_percentage: number;
  waste_formula?: string | null;
  coefficient_bronz: number;
  coefficient_argint: number;
  coefficient_aur: number;
  coefficient_platinum: number;
  level_coefficients: Record<string, number>;
  caen_nace_link: Record<string, unknown>;
  is_essential: boolean;
  activity_name_ro: string;
  resource_name_ro: string;
  resource_type: CatalogResourceType;
  resource_unit: string;
  resource_base_price: number;
  esco_code?: string | null;
};

export type IndicatorCalculationRecord = {
  activity_id: number;
  activity_name_ro: string;
  level: "BRONZ" | "ARGINT" | "AUR" | "PLATINUM";
  domain_id: number;
  category_id: number;
  subcategory_id: number;
  caen_nace_link: Record<string, unknown>;
  pricing_context: Record<string, unknown>;
  total_estimated_cost: number;
  rows: Array<{
    recipe_id: number;
    resource_id: number;
    resource_name_ro: string;
    resource_type: CatalogResourceType;
    esco_code?: string | null;
    specific_consumption: number;
    calculated_consumption: number;
    consumption_unit: string;
    waste_percentage: number;
    waste_formula?: string | null;
    applied_coefficient: number;
    level: "BRONZ" | "ARGINT" | "AUR" | "PLATINUM";
    base_price: number;
    estimated_cost: number;
    is_essential: boolean;
  }>;
};

export type EntityAttachmentRecord = {
  id: number;
  entity_type: string;
  entity_id: number;
  attachment_type: string;
  level_name?: string | null;
  file_name: string;
  mime_type: string;
  secure_url: string;
  created_at: string;
};

export type PriceConfigRecord = {
  id: number;
  service_id: number;
  country_id: number;
  zone_id: number | null;
  currency: string;
  legislation_code: string;
  base_price: number;
  legislation_coefficient: number;
  zone_coefficient_override: number | null;
  urgency_coefficient: number;
  basic_level_coefficient: number;
  standard_level_coefficient: number;
  premium_level_coefficient: number;
  indirect_cost_percentage: number;
  platform_maintenance_percentage: number;
  mydarrin_platform_percentage: number;
  vat_percentage: number;
  platform_margin_coefficient: number;
  vat_coefficient: number;
  is_active: boolean;
};

export type DevizRuleRecord = {
  id: number;
  service_id: number | null;
  country_id: number | null;
  level_name: "BRONZ" | "ARGINT" | "AUR" | "PLATINUM";
  label: string;
  multiplier: number;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
};

export type EscoImportResult = {
  uri: string;
  class_name: string;
  resource_table: string | null;
  relations_created: number;
  skill_relations_created: number;
  source_url?: string | null;
  source_file_name?: string | null;
};

export type BackofficeServiceCreateRecipeInput = {
  resource_type: "MANOPERA" | "MATERIAL" | "UTILAJ" | "TRANSPORT" | "CONSUMABIL" | "ALTELE";
  resource_id: number;
  activity_id?: number | null;
  specific_consumption: number;
  consumption_unit: string;
  waste_percentage: number;
  level_coefficients: Record<"BRONZ" | "ARGINT" | "AUR" | "PLATINUM", number>;
};

export type BackofficeServiceCreateRequest = {
  domain_id: number;
  category_id: number;
  subcategory_id: number;
  service_name_ro: string;
  service_name_en?: string | null;
  service_slug?: string | null;
  service_code?: string | null;
  short_description_ro?: string | null;
  short_description_en?: string | null;
  is_active: boolean;
  caen_codes: string[];
  uniclass_activity_ids: number[];
  esco_occupations: string[];
  recipe_items: BackofficeServiceCreateRecipeInput[];
  default_costs: {
    labor_hourly_rate: number;
    indirect_cost_percentage: number;
    platform_maintenance_percentage: number;
    mydarrin_platform_percentage: number;
    vat_percentage: number;
  };
};

export type BackofficeServiceCreateResponse = {
  service_id: number;
  service_code: string;
  service_name_ro: string;
  service_name_en?: string | null;
  service_slug: string;
  hierarchy: Record<string, unknown>;
  classifications: Record<string, unknown>;
  service: ServiceRecord;
  default_costs: Record<string, unknown>;
  price_analysis_recipes: Array<{
    recipe_id: number;
    activity_id: number;
    activity_name_ro: string;
    resource_id: number;
    resource_name_ro: string;
    resource_type: string;
    requested_resource_type: string;
    specific_consumption: number;
    consumption_unit: string;
    waste_percentage: number;
    level_coefficients: Record<string, number>;
  }>;
  attachments: Array<{
    attachment_type: string;
    file_name: string;
    secure_url: string;
  }>;
};

export type EscoIscoGroupRecord = {
  concept_uri: string;
  concept_type?: string | null;
  code?: string | null;
  preferred_label?: string | null;
  alt_labels: string[];
  status?: string | null;
  in_scheme?: string | null;
  description?: string | null;
};

export type EscoSkillRecord = {
  concept_uri: string;
  concept_type?: string | null;
  preferred_label?: string | null;
  alt_labels: string[];
  status?: string | null;
  reuse_level?: string | null;
  skill_types: string[];
  in_scheme?: string | null;
  description?: string | null;
};

export type EscoOccupationRecord = {
  concept_uri: string;
  concept_type?: string | null;
  isco_group?: string | null;
  code?: string | null;
  preferred_label?: string | null;
  alt_labels: string[];
  status?: string | null;
  in_scheme?: string | null;
  nace_code?: string | null;
  research_occupation: boolean;
  green_share?: number | null;
  description?: string | null;
};

export type EscoBrowseResponse<T> = {
  query?: string | null;
  count: number;
  items: T[];
};

export type SiteContentPageRecord = {
  slug: string;
  title: string;
  status: string;
  content: Record<string, unknown>;
  notes?: string | null;
  updated_at?: string | null;
};

export type SiteContentPageListItemRecord = {
  slug: string;
  title: string;
  status: string;
  updated_at?: string | null;
};

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown | FormData;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = typeof window === "undefined" ? API_BASE : BROWSER_PROXY_BASE;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const requestBody: BodyInit | undefined = options.body
    ? isFormData
      ? (options.body as FormData)
      : JSON.stringify(options.body)
    : undefined;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "X-Gate-Authorization": BACKEND_GATE_AUTHORIZATION,
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: requestBody,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(payload.detail ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function loginAdmin(email: string, password: string) {
  return request<{
    access_token: string;
    token_type: string;
    user_id: number;
    full_name?: string | null;
    email: string;
    phone?: string | null;
    city?: string | null;
    role: string | null;
    verification_status: string | null;
    permissions: string[];
  }>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function getCurrentUser(token: string) {
  return request<AdminUser>("/api/v1/auth/me", { token });
}

export function getAdminUsers(token: string) {
  return request<AdminUser[]>("/api/v1/admin/users", { token });
}

export function getPendingUsers(token: string) {
  return request<AdminUser[]>("/api/v1/admin/users/pending", { token });
}

export function activateUser(token: string, userId: number) {
  return request<AdminUser>(`/api/v1/admin/users/${userId}/activate`, { method: "PUT", token });
}

export function deactivateUser(token: string, userId: number) {
  return request<AdminUser>(`/api/v1/admin/users/${userId}/deactivate`, { method: "PUT", token });
}

export function updateUserRole(token: string, userId: number, role: "CLIENT" | "PARTNER" | "INVESTOR" | "ADMIN" | "SUPER_ADMIN") {
  return request<AdminUser>(`/api/v1/admin/users/${userId}/role`, {
    method: "PUT",
    token,
    body: { role },
  });
}

export function updateUserProfile(
  token: string,
  userId: number,
  body: Partial<{
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    role: "CLIENT" | "PARTNER" | "INVESTOR" | "ADMIN" | "SUPER_ADMIN" | null;
    verification_status: "PENDING" | "APPROVED" | "REJECTED" | null;
  }>,
) {
  return request<AdminUser>(`/api/v1/admin/users/${userId}`, {
    method: "PUT",
    token,
    body,
  });
}

export function getDomains(token: string) {
  return request<DomainRecord[]>("/api/v1/backoffice/domains", { token });
}

export function createDomain(token: string, body: Omit<DomainRecord, "id">) {
  return request<DomainRecord>("/api/v1/backoffice/domains", { method: "POST", token, body });
}

export function updateDomain(token: string, id: number, body: Partial<Omit<DomainRecord, "id">>) {
  return request<DomainRecord>(`/api/v1/backoffice/domains/${id}`, { method: "PUT", token, body });
}

export function deleteDomain(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/domains/${id}`, { method: "DELETE", token });
}

export function getCategories(token: string, domainId?: number) {
  const query = domainId ? `?domain_id=${domainId}` : "";
  return request<CategoryRecord[]>(`/api/v1/backoffice/categories${query}`, { token });
}

export function createCategory(token: string, body: Omit<CategoryRecord, "id">) {
  return request<CategoryRecord>("/api/v1/backoffice/categories", { method: "POST", token, body });
}

export function updateCategory(token: string, id: number, body: Partial<Omit<CategoryRecord, "id">>) {
  return request<CategoryRecord>(`/api/v1/backoffice/categories/${id}`, { method: "PUT", token, body });
}

export function deleteCategory(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/categories/${id}`, { method: "DELETE", token });
}

export function getSubcategories(token: string, options?: { domainId?: number; categoryId?: number }) {
  const params = new URLSearchParams();
  if (options?.domainId) {
    params.set("domain_id", String(options.domainId));
  }
  if (options?.categoryId) {
    params.set("category_id", String(options.categoryId));
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<SubcategoryRecord[]>(`/api/v1/backoffice/subcategories${query}`, { token });
}

export function createSubcategory(token: string, body: Omit<SubcategoryRecord, "id">) {
  return request<SubcategoryRecord>("/api/v1/backoffice/subcategories", { method: "POST", token, body });
}

export function updateSubcategory(token: string, id: number, body: Partial<Omit<SubcategoryRecord, "id">>) {
  return request<SubcategoryRecord>(`/api/v1/backoffice/subcategories/${id}`, { method: "PUT", token, body });
}

export function deleteSubcategory(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/subcategories/${id}`, { method: "DELETE", token });
}

export function importCatalogCodes(token: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<{
    domains_created: number;
    domains_updated: number;
    categories_created: number;
    categories_updated: number;
    subcategories_created: number;
    subcategories_updated: number;
  }>("/api/v1/backoffice/import-caen-uniclass-esco", { method: "POST", token, body });
}

export function getServices(token: string) {
  return request<ServiceRecord[]>("/api/v1/catalog/services", { token });
}

export function createService(
  token: string,
  body: {
    name: string;
    slug: string;
    description?: string | null;
    description_extended?: string | null;
    is_active: boolean;
    images?: string[];
    documents?: string[];
    videos?: string[];
    level_attachments?: Record<string, string[]>;
    subcategory_ids: number[];
  },
) {
  return request<ServiceRecord>("/api/v1/catalog/services", { method: "POST", token, body });
}

export function updateService(
  token: string,
  id: number,
  body: Partial<{
    name: string;
    slug: string;
    description?: string | null;
    description_extended?: string | null;
    is_active: boolean;
    images?: string[];
    documents?: string[];
    videos?: string[];
    level_attachments?: Record<string, string[]>;
    subcategory_ids: number[];
  }>,
) {
  return request<ServiceRecord>(`/api/v1/catalog/services/${id}`, { method: "PUT", token, body });
}

export function deleteService(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/catalog/services/${id}`, { method: "DELETE", token });
}

export function getCountries(token: string) {
  return request<CountryRecord[]>("/api/v1/geography/countries", { token });
}

export function getZones(token: string) {
  return request<ZoneRecord[]>("/api/v1/geography/zones", { token });
}

export function getLocalities(token: string, options?: { countryId?: number; zoneId?: number }) {
  const params = new URLSearchParams();
  if (options?.countryId) params.set("country_id", String(options.countryId));
  if (options?.zoneId) params.set("zone_id", String(options.zoneId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<LocalityRecord[]>(`/api/v1/backoffice/localities${query}`, { token });
}

export function createLocality(token: string, body: Omit<LocalityRecord, "id" | "country_name_ro" | "zone_name_ro">) {
  return request<LocalityRecord>("/api/v1/backoffice/localities", { method: "POST", token, body });
}

export function updateLocality(
  token: string,
  id: number,
  body: Partial<Omit<LocalityRecord, "id" | "country_id" | "country_name_ro" | "zone_name_ro">>,
) {
  return request<LocalityRecord>(`/api/v1/backoffice/localities/${id}`, { method: "PUT", token, body });
}

export function deleteLocality(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/localities/${id}`, { method: "DELETE", token });
}

export function getUnits(token: string) {
  return request<UnitRecord[]>("/api/v1/activities/units", { token });
}

export function getActivities(token: string) {
  return request<ActivityRecord[]>("/api/v1/activities", { token });
}

export function getServiceActivityLinks(token: string) {
  return request<ServiceActivityRecord[]>("/api/v1/activities/service-links", { token });
}

export function getCatalogActivities(
  token: string,
  options?: { domainId?: number; categoryId?: number; subcategoryId?: number },
) {
  const params = new URLSearchParams();
  if (options?.domainId) params.set("domain_id", String(options.domainId));
  if (options?.categoryId) params.set("category_id", String(options.categoryId));
  if (options?.subcategoryId) params.set("subcategory_id", String(options.subcategoryId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<CatalogActivityRecord[]>(`/api/v1/backoffice/activities${query}`, { token });
}

export function getCatalogActivity(token: string, id: number) {
  return request<CatalogActivityRecord>(`/api/v1/backoffice/activities/${id}`, { token });
}

export function createCatalogActivity(token: string, body: Omit<CatalogActivityRecord, "id">) {
  return request<CatalogActivityRecord>("/api/v1/backoffice/activities", { method: "POST", token, body });
}

export function updateCatalogActivity(token: string, id: number, body: Partial<Omit<CatalogActivityRecord, "id">>) {
  return request<CatalogActivityRecord>(`/api/v1/backoffice/activities/${id}`, { method: "PUT", token, body });
}

export function deleteCatalogActivity(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/activities/${id}`, { method: "DELETE", token });
}

export function importUniclassCatalog(
  token: string,
  file: File,
  options?: { domainId?: number; categoryId?: number; subcategoryId?: number; defaultUom?: string },
) {
  const body = new FormData();
  body.append("file", file);
  if (options?.domainId) body.append("domain_id", String(options.domainId));
  if (options?.categoryId) body.append("category_id", String(options.categoryId));
  if (options?.subcategoryId) body.append("subcategory_id", String(options.subcategoryId));
  body.append("default_uom", options?.defaultUom ?? "unit");
  return request<{ created: number; updated: number; skipped: number }>("/api/v1/backoffice/import-uniclass", {
    method: "POST",
    token,
    body,
  });
}

export function getCatalogResources(token: string, resourceType?: CatalogResourceType) {
  const query = resourceType ? `?resource_type=${resourceType}` : "";
  return request<CatalogResourceRecord[]>(`/api/v1/backoffice/resources${query}`, { token });
}

export function createCatalogResource(token: string, body: Omit<CatalogResourceRecord, "id">) {
  return request<CatalogResourceRecord>("/api/v1/backoffice/resources", { method: "POST", token, body });
}

export function updateCatalogResource(token: string, id: number, body: Partial<Omit<CatalogResourceRecord, "id">>) {
  return request<CatalogResourceRecord>(`/api/v1/backoffice/resources/${id}`, { method: "PUT", token, body });
}

export function deleteCatalogResource(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/resources/${id}`, { method: "DELETE", token });
}

export function getCatalogResourcePrices(
  token: string,
  options?: { resourceId?: number; countryId?: number; localityId?: number },
) {
  const params = new URLSearchParams();
  if (options?.resourceId) params.set("resource_id", String(options.resourceId));
  if (options?.countryId) params.set("country_id", String(options.countryId));
  if (options?.localityId) params.set("locality_id", String(options.localityId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<AdminResourcePriceConfigRecord[]>(`/api/v1/backoffice/resources/prices${query}`, { token });
}

export function createCatalogResourcePrice(token: string, body: Omit<AdminResourcePriceConfigRecord, "id" | "resource_name_ro" | "resource_type">) {
  return request<AdminResourcePriceConfigRecord>("/api/v1/backoffice/resources/prices", { method: "POST", token, body });
}

export function updateCatalogResourcePrice(
  token: string,
  id: number,
  body: Partial<Omit<AdminResourcePriceConfigRecord, "id" | "resource_name_ro" | "resource_type" | "resource_id" | "country_id">>,
) {
  return request<AdminResourcePriceConfigRecord>(`/api/v1/backoffice/resources/prices/${id}`, { method: "PUT", token, body });
}

export function deleteCatalogResourcePrice(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/resources/prices/${id}`, { method: "DELETE", token });
}

export function importCatalogResourcePrices(
  token: string,
  file: File,
  bodyValues: { countryId: number; currency: string; legislationCode: string; zoneId?: number; localityId?: number },
) {
  const body = new FormData();
  body.append("file", file);
  body.append("country_id", String(bodyValues.countryId));
  body.append("currency", bodyValues.currency);
  body.append("legislation_code", bodyValues.legislationCode);
  if (bodyValues.zoneId) body.append("zone_id", String(bodyValues.zoneId));
  if (bodyValues.localityId) body.append("locality_id", String(bodyValues.localityId));
  return request<{ created: number; updated: number; skipped: number }>("/api/v1/backoffice/resources/import", {
    method: "POST",
    token,
    body,
  });
}

export function getPriceAnalysisRecipes(token: string, activityId?: number) {
  const query = activityId ? `?activity_id=${activityId}` : "";
  return request<PriceAnalysisRecipeRecord[]>(`/api/v1/backoffice/price-analysis${query}`, { token });
}

export function createPriceAnalysisRecipe(token: string, body: Omit<PriceAnalysisRecipeRecord, "id" | "activity_name_ro" | "resource_name_ro" | "resource_type" | "resource_unit" | "resource_base_price" | "esco_code">) {
  return request<PriceAnalysisRecipeRecord>("/api/v1/backoffice/price-analysis", { method: "POST", token, body });
}

export function updatePriceAnalysisRecipe(
  token: string,
  id: number,
  body: Partial<Omit<PriceAnalysisRecipeRecord, "id" | "activity_name_ro" | "resource_name_ro" | "resource_type" | "resource_unit" | "resource_base_price" | "esco_code">>,
) {
  return request<PriceAnalysisRecipeRecord>(`/api/v1/backoffice/price-analysis/${id}`, { method: "PUT", token, body });
}

export function deletePriceAnalysisRecipe(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/backoffice/price-analysis/${id}`, { method: "DELETE", token });
}

export function calculateIndicators(
  token: string,
  activityId: number,
  level: "BRONZ" | "ARGINT" | "AUR" | "PLATINUM" = "ARGINT",
  options?: { countryId?: number; zoneId?: number; localityId?: number; currency?: string; legislationCode?: string },
) {
  const params = new URLSearchParams();
  params.set("activity_id", String(activityId));
  params.set("level", level);
  if (options?.countryId) params.set("country_id", String(options.countryId));
  if (options?.zoneId) params.set("zone_id", String(options.zoneId));
  if (options?.localityId) params.set("locality_id", String(options.localityId));
  if (options?.currency) params.set("currency", options.currency);
  if (options?.legislationCode) params.set("legislation_code", options.legislationCode);
  return request<IndicatorCalculationRecord>(
    `/api/v1/backoffice/indicators/calculate?${params.toString()}`,
    { token },
  );
}

export function getActivityAttachments(token: string, activityId: number) {
  return request<{ items: EntityAttachmentRecord[] }>(`/api/v1/backoffice/activities/attachments?activity_id=${activityId}`, { token });
}

export function uploadActivityAttachment(
  token: string,
  bodyValues: { activityId: number; attachmentType: string; levelName?: string; file: File },
) {
  const body = new FormData();
  body.append("activity_id", String(bodyValues.activityId));
  body.append("attachment_type", bodyValues.attachmentType);
  if (bodyValues.levelName) body.append("level_name", bodyValues.levelName);
  body.append("file", bodyValues.file);
  return request<EntityAttachmentRecord>("/api/v1/backoffice/activities/attachments", { method: "POST", token, body });
}

export function getServiceAttachments(token: string, serviceId: number) {
  return request<{ items: EntityAttachmentRecord[] }>(`/api/v1/backoffice/services/attachments?service_id=${serviceId}`, { token });
}

export function uploadServiceAttachment(
  token: string,
  bodyValues: { serviceId: number; attachmentType: string; levelName?: string; file: File },
) {
  const body = new FormData();
  body.append("service_id", String(bodyValues.serviceId));
  body.append("attachment_type", bodyValues.attachmentType);
  if (bodyValues.levelName) body.append("level_name", bodyValues.levelName);
  body.append("file", bodyValues.file);
  return request<EntityAttachmentRecord>("/api/v1/backoffice/services/attachments", { method: "POST", token, body });
}

export function createBackofficeServiceFlow(
  token: string,
  payload: BackofficeServiceCreateRequest,
  files?: { mainImage?: File | null; demoVideo?: File | null; instructionsPdf?: File | null },
) {
  const body = new FormData();
  body.append("payload", JSON.stringify(payload));
  if (files?.mainImage) body.append("main_image", files.mainImage);
  if (files?.demoVideo) body.append("demo_video", files.demoVideo);
  if (files?.instructionsPdf) body.append("instructions_pdf", files.instructionsPdf);
  return request<BackofficeServiceCreateResponse>("/api/v1/backoffice/services/create", { method: "POST", token, body });
}

export function importIndicators(token: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<{ created: number; updated: number; skipped: number }>(
    "/api/v1/backoffice/indicators/import",
    { method: "POST", token, body },
  );
}

export function importEscoResourceFromUrl(token: string, sourceUrl: string) {
  const body = new FormData();
  body.append("source_url", sourceUrl);
  return request<EscoImportResult>("/api/v1/backoffice/esco/import-resource", {
    method: "POST",
    token,
    body,
  });
}

export function importEscoResourceFromFile(token: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<EscoImportResult>("/api/v1/backoffice/esco/import-resource", {
    method: "POST",
    token,
    body,
  });
}

export function getEscoIscoGroups(token: string, options?: { q?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.q?.trim()) params.set("q", options.q.trim());
  if (options?.limit) params.set("limit", String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<EscoBrowseResponse<EscoIscoGroupRecord>>(`/api/v1/backoffice/esco/isco-groups${query}`, { token });
}

export function getEscoSkills(token: string, options?: { q?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.q?.trim()) params.set("q", options.q.trim());
  if (options?.limit) params.set("limit", String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<EscoBrowseResponse<EscoSkillRecord>>(`/api/v1/backoffice/esco/skills${query}`, { token });
}

export function getEscoOccupations(token: string, options?: { q?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (options?.q?.trim()) params.set("q", options.q.trim());
  if (options?.limit) params.set("limit", String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<EscoBrowseResponse<EscoOccupationRecord>>(`/api/v1/backoffice/esco/occupations${query}`, { token });
}

export function getPriceConfigs(token: string) {
  return request<PriceConfigRecord[]>("/api/v1/cost/admin-configs", { token });
}

export function createPriceConfig(token: string, body: Omit<PriceConfigRecord, "id">) {
  return request<PriceConfigRecord>("/api/v1/cost/admin-configs", { method: "POST", token, body });
}

export function updatePriceConfig(token: string, id: number, body: Partial<Omit<PriceConfigRecord, "id">>) {
  return request<PriceConfigRecord>(`/api/v1/cost/admin-configs/${id}`, { method: "PUT", token, body });
}

export function deletePriceConfig(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/cost/admin-configs/${id}`, { method: "DELETE", token });
}

export function getDevizRules(token: string) {
  return request<DevizRuleRecord[]>("/api/v1/deviz/admin-configs", { token });
}

export function createDevizRule(token: string, body: Omit<DevizRuleRecord, "id">) {
  return request<DevizRuleRecord>("/api/v1/deviz/admin-configs", { method: "POST", token, body });
}

export function updateDevizRule(token: string, id: number, body: Partial<Omit<DevizRuleRecord, "id">>) {
  return request<DevizRuleRecord>(`/api/v1/deviz/admin-configs/${id}`, { method: "PUT", token, body });
}

export function deleteDevizRule(token: string, id: number) {
  return request<{ message: string }>(`/api/v1/deviz/admin-configs/${id}`, { method: "DELETE", token });
}

export function listSiteContentPages(token: string) {
  return request<SiteContentPageListItemRecord[]>("/api/v1/backoffice/site-content", { token });
}

export function getSiteContentPage(token: string, slug: string) {
  return request<SiteContentPageRecord>(`/api/v1/backoffice/site-content/${slug}`, { token });
}

export function updateSiteContentPage(
  token: string,
  slug: string,
  body: Pick<SiteContentPageRecord, "title" | "status" | "content" | "notes">,
) {
  return request<SiteContentPageRecord>(`/api/v1/backoffice/site-content/${slug}`, {
    method: "PUT",
    token,
    body,
  });
}

export function getHomepageContent(token: string) {
  return getSiteContentPage(token, "homepage");
}

export function updateHomepageContent(
  token: string,
  body: Pick<SiteContentPageRecord, "title" | "status" | "content" | "notes">,
) {
  return updateSiteContentPage(token, "homepage", body);
}
