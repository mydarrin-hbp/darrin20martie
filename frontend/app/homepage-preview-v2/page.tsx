import { Suspense } from "react";

import { PublicHomepage } from "@/components/public-site-v3";
import { getPublicCatalogServices, getSitePageContent } from "@/lib/site-content";

export default async function PublicHomepagePreviewV2Page() {
  const page = await getSitePageContent("homepage");
  const catalogServices = await getPublicCatalogServices();
  return (
    <Suspense fallback={null}>
      <PublicHomepage page={page} catalogServices={catalogServices} />
    </Suspense>
  );
}
