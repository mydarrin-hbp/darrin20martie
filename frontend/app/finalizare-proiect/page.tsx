import { Suspense } from "react";

import { PublicCheckoutPage } from "@/components/public-site-v3";
import { getPublicCatalogPrice, getPublicCatalogServiceBySlug, getSitePageContent } from "@/lib/site-content";

export default async function FinalizareProiectPage({
  searchParams,
}: {
  searchParams?: Promise<{ slug?: string; target_address?: string; place_id?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const slug = params.slug ?? "reparat-calorifer";
  const targetAddress = params.target_address ?? null;
  const placeId = params.place_id ?? null;

  const [page, card, dynamicPrice] = await Promise.all([
    getSitePageContent("checkout"),
    getPublicCatalogServiceBySlug(slug),
    getPublicCatalogPrice(slug, { targetAddress: targetAddress ?? undefined, placeId: placeId ?? undefined }),
  ]);

  return (
    <Suspense fallback={null}>
      <PublicCheckoutPage
        page={page}
        context={{ slug, card, dynamicPrice, targetAddress, placeId }}
      />
    </Suspense>
  );
}
