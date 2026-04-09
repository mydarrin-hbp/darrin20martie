import { Suspense } from "react";

import { PublicMaterialDetailPage } from "@/components/public-site-v3";
import {
  getPublicCatalogServiceBySlug,
  getPublicServiceTechnicalSpecs,
  getSitePageContent,
} from "@/lib/site-content";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, material, specs] = await Promise.all([
    getSitePageContent("materials"),
    getPublicCatalogServiceBySlug(slug),
    getPublicServiceTechnicalSpecs(slug),
  ]);

  return (
    <Suspense fallback={null}>
      <PublicMaterialDetailPage page={page} material={material} specs={specs} />
    </Suspense>
  );
}
