import { PublicCatalogPage } from "@/components/public-site-v3";
import {
  getPublicCatalogPrice,
  getPublicCatalogServices,
  getPublicServiceTaxonomy,
  getPublicSyncManifest,
  getSitePageContent,
} from "@/lib/site-content";
import { publicServiceCatalog } from "@/lib/public-site";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{
    target_address?: string;
    place_id?: string;
    domain?: string;
    category?: string;
    subcategory?: string;
    resource_type?: string | string[];
    equipment_type?: string | string[];
    brand?: string | string[];
  }>;
}) {
  const params = (await searchParams) ?? {};
  const targetAddress = params.target_address;
  const placeId = params.place_id;
  const resourceTypes = Array.isArray(params.resource_type)
    ? params.resource_type
    : params.resource_type
      ? [params.resource_type]
      : [];
  const equipmentTypes = Array.isArray(params.equipment_type)
    ? params.equipment_type
    : params.equipment_type
      ? [params.equipment_type]
      : [];
  const brands = Array.isArray(params.brand) ? params.brand : params.brand ? [params.brand] : [];
  const catalogServices = await getPublicCatalogServices({
    domain: params.domain,
    category: params.category,
    subcategory: params.subcategory,
    resourceTypes,
    equipmentTypes,
    brands,
  });
  const catalogSlugs = Array.from(
    new Set([
      ...publicServiceCatalog.map((service) => service.slug),
      ...catalogServices.map((service) => service.slug),
    ]),
  );
  const [page, syncManifest, taxonomyEntries, priceEntries] = await Promise.all([
    getSitePageContent("catalog"),
    getPublicSyncManifest(),
    Promise.all(catalogSlugs.map(async (slug) => [slug, await getPublicServiceTaxonomy(slug)] as const)),
    Promise.all(catalogSlugs.map(async (slug) => [slug, await getPublicCatalogPrice(slug, { targetAddress, placeId })] as const)),
  ]);

  return (
    <PublicCatalogPage
      page={page}
      catalogServices={catalogServices}
      taxonomyBySlug={Object.fromEntries(taxonomyEntries)}
      dynamicPriceBySlug={Object.fromEntries(priceEntries)}
      syncManifest={syncManifest}
      targetAddress={targetAddress}
      placeId={placeId}
      catalogMetaBySlug={Object.fromEntries(catalogServices.map((item) => [item.slug, item]))}
      activeFilters={{
        domain: params.domain ?? null,
        category: params.category ?? null,
        subcategory: params.subcategory ?? null,
        resourceTypes,
        equipmentTypes,
        brands,
      }}
    />
  );
}
