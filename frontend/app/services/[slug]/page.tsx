import type { Metadata } from "next";
import Script from "next/script";

import { PublicServicePage } from "@/components/public-site-v3";
import {
  getPublicCatalogPrice,
  getPublicCatalogServiceBySlug,
  getPublicServiceTaxonomy,
  getPublicServiceTechnicalSpecs,
  getPublicSyncManifest,
  getSitePageContent,
} from "@/lib/site-content";

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
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [page, catalogService] = await Promise.all([
    getSitePageContent("service-detail"),
    getPublicCatalogServiceBySlug(params.slug),
  ]);
  const serviceName = catalogService?.name ?? titleize(params.slug);
  const description =
    catalogService?.description ??
    catalogService?.description_extended ??
    page.content.hero?.subheadline ??
    "Serviciu My Darrin disponibil in catalogul public.";

  return {
    title: `${serviceName} | My Darrin`,
    description,
    openGraph: {
      title: `${serviceName} | My Darrin`,
      description,
      url: `${resolveBaseUrl()}/services/${params.slug}`,
      type: "website",
    },
  };
}

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

  const baseUrl = resolveBaseUrl();
  const serviceName = catalogService?.name ?? titleize(params.slug);
  const serviceDescription =
    catalogService?.description ??
    catalogService?.description_extended ??
    page.content.hero?.subheadline ??
    "Serviciu My Darrin.";
  const offerPrice = dynamicPrice?.base_gross_total;
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: serviceDescription,
    provider: {
      "@type": "Organization",
      name: "My Darrin",
      url: baseUrl,
    },
    areaServed: {
      "@type": "Country",
      name: "Romania",
    },
    offers: offerPrice
      ? {
          "@type": "Offer",
          price: offerPrice,
          priceCurrency: dynamicPrice?.currency ?? "RON",
          url: `${baseUrl}/services/${params.slug}`,
          availability: "https://schema.org/InStock",
        }
      : undefined,
  };

  return (
    <>
      <Script
        id="service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
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
    </>
  );
}
