import { PublicServicePage } from "@/components/public-site-v3";
import {
  getPublicCatalogPrice,
  getPublicCatalogServiceBySlug,
  getPublicServiceTaxonomy,
  getPublicServiceTechnicalSpecs,
  getPublicSyncManifest,
  getSitePageContent,
} from "@/lib/site-content";

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: Promise<{ target_address?: string; place_id?: string }>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const targetAddress = resolvedParams.target_address;
  const placeId = resolvedParams.place_id;

  const [page, taxonomy, dynamicPrice, syncManifest, technicalSpecs, catalogService] = await Promise.all([
    getSitePageContent("service-detail"),
    getPublicServiceTaxonomy(params.slug),
    getPublicCatalogPrice(params.slug, { targetAddress, placeId }),
    getPublicSyncManifest(),
    getPublicServiceTechnicalSpecs(params.slug),
    getPublicCatalogServiceBySlug(params.slug),
  ]);

  return (
    <PublicServicePage
      page={page}
      slug={params.slug}
      taxonomy={taxonomy}
      dynamicPrice={dynamicPrice}
      syncManifest={syncManifest}
      targetAddress={targetAddress}
      placeId={placeId}
      technicalSpecs={technicalSpecs}
      catalogService={catalogService}
    />
  );
}
