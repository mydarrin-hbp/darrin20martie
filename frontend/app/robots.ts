import type { MetadataRoute } from "next";

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://mydarrin.homebestpal.com";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/backoffice", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
