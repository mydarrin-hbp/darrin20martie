import { PublicServicePage } from "@/components/public-site-v3";
import { getPublicCatalogPrice, getPublicServiceTaxonomy, getPublicSyncManifest, getSitePageContent } from "@/lib/site-content";
import { publicServiceCatalog } from "@/lib/public-site";

export function generateStaticParams() {
  return publicServiceCatalog.map((service) => ({ slug: service.slug }));
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ target_address?: string; place_id?: string }>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const targetAddress = query.target_address;
  const placeId = query.place_id;
  const [page, taxonomy, dynamicPrice, syncManifest] = await Promise.all([
    getSitePageContent("service-detail"),
    getPublicServiceTaxonomy(slug),
    getPublicCatalogPrice(slug, { targetAddress, placeId }),
    getPublicSyncManifest(),
  ]);
  return <PublicServicePage page={page} slug={slug} taxonomy={taxonomy} dynamicPrice={dynamicPrice} syncManifest={syncManifest} />;
}
