import { Suspense } from "react";

import { PublicCartPage } from "@/components/public-site-v3";
import { getPublicCatalogPrice, getPublicCatalogServiceBySlug, getSitePageContent } from "@/lib/site-content";

function normalizeSlugs(slug?: string | string[]) {
  if (!slug) return [];
  const raw = Array.isArray(slug) ? slug : [slug];
  return raw
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export default async function CosPage({
  searchParams,
}: {
  searchParams?: Promise<{ slug?: string | string[]; target_address?: string; place_id?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const slugs = normalizeSlugs(params.slug);
  const targetAddress = params.target_address;
  const placeId = params.place_id;

  const resolvedSlugs = slugs.length ? slugs : ["reparat-calorifer"];
  const [page, cartEntries] = await Promise.all([
    getSitePageContent("cart"),
    Promise.all(
      resolvedSlugs.map(async (slug) => ({
        slug,
        card: await getPublicCatalogServiceBySlug(slug),
        dynamicPrice: await getPublicCatalogPrice(slug, { targetAddress, placeId }),
      })),
    ),
  ]);

  const checkoutHref = `/finalizare-proiect?slug=${encodeURIComponent(resolvedSlugs[0])}${
    targetAddress ? `&target_address=${encodeURIComponent(targetAddress)}` : ""
  }${placeId ? `&place_id=${encodeURIComponent(placeId)}` : ""}`;

  return (
    <Suspense fallback={null}>
      <PublicCartPage page={page} cartEntries={cartEntries} checkoutHref={checkoutHref} />
    </Suspense>
  );
}
