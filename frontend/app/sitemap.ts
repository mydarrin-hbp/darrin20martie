import type { MetadataRoute } from "next";

import { getPublicCatalogServices } from "@/lib/site-content";

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://mydarrin.homebestpal.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveBaseUrl();
  const services = await getPublicCatalogServices();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/catalog`, lastModified: now },
    { url: `${baseUrl}/account`, lastModified: now },
    { url: `${baseUrl}/account/create`, lastModified: now },
    { url: `${baseUrl}/my-account`, lastModified: now },
    { url: `${baseUrl}/partners/join`, lastModified: now },
    { url: `${baseUrl}/partners/account`, lastModified: now },
    { url: `${baseUrl}/investors`, lastModified: now },
    { url: `${baseUrl}/investors/account`, lastModified: now },
    { url: `${baseUrl}/providers/account`, lastModified: now },
    { url: `${baseUrl}/admin/account`, lastModified: now },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: now,
  }));

  const domainRoutes: MetadataRoute.Sitemap = Array.from(new Set(services.map((item) => item.domain).filter(Boolean))).map((domain) => ({
    url: `${baseUrl}/catalog?domain=${encodeURIComponent(domain as string)}`,
    lastModified: now,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(new Set(services.map((item) => item.category).filter(Boolean))).map((category) => ({
    url: `${baseUrl}/catalog?category=${encodeURIComponent(category as string)}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...serviceRoutes, ...domainRoutes, ...categoryRoutes];
}
