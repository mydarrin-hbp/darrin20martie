import type { Metadata } from "next";
import Script from "next/script";

import { PublicCatalogPage } from "@/components/public-site-v3";
import {
  getPublicCatalogPrice,
  getPublicCatalogServices,
  getPublicServiceTaxonomy,
  getPublicSyncManifest,
  getSitePageContent,
} from "@/lib/site-content";
import { publicServiceCatalog } from "@/lib/public-site";

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://mydarrin.homebestpal.com";
}

function titleize(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{
    domain?: string;
    category?: string;
    subcategory?: string;
  }>;
}): Promise<Metadata> {
  const params = (await searchParams) ?? {};
  const label = params.subcategory ?? params.category ?? params.domain;
  const suffix = label ? ` - ${titleize(label)}` : "";
  const page = await getSitePageContent("catalog");
  const description =
    page.content.hero?.subheadline ?? "Catalog servicii My Darrin sincronizat cu backoffice.";
  const title = `Catalog servicii${suffix} | My Darrin`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${resolveBaseUrl()}/catalog`,
      type: "website",
    },
  };
}

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

  const baseUrl = resolveBaseUrl();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: catalogServices.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/services/${service.slug}`,
      name: service.name,
    })),
  };

  return (
    <>
      <Script
        id="catalog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
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
    </>
  );
}
