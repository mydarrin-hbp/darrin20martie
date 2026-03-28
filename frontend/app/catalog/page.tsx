import { PublicCatalogPage } from "@/components/public-site-v3";
import { getPublicCatalogPrice, getPublicServiceTaxonomy, getPublicSyncManifest, getSitePageContent } from "@/lib/site-content";
import { publicServiceCatalog } from "@/lib/public-site";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ target_address?: string; place_id?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const targetAddress = params.target_address;
  const placeId = params.place_id;
  const [page, taxonomyEntries, priceEntries, syncManifest] = await Promise.all([
    getSitePageContent("catalog"),
    Promise.all(publicServiceCatalog.map(async (service) => [service.slug, await getPublicServiceTaxonomy(service.slug)] as const)),
    Promise.all(
      publicServiceCatalog.map(async (service) => [service.slug, await getPublicCatalogPrice(service.slug, { targetAddress, placeId })] as const),
    ),
    getPublicSyncManifest(),
  ]);

  return (
    <PublicCatalogPage
      page={page}
      taxonomyBySlug={Object.fromEntries(taxonomyEntries)}
      dynamicPriceBySlug={Object.fromEntries(priceEntries)}
      syncManifest={syncManifest}
    />
  );
}
