import { Suspense } from "react";

import { PublicHomepage } from "@/components/public-site-v3";
import { getPublicCatalogServices, getSitePageContent } from "@/lib/site-content";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string; live?: string; email?: string }>;
}) {
  const page = await getSitePageContent("homepage");
  const catalogServices = await getPublicCatalogServices();
  const params = (await searchParams) ?? {};
  const liveUserEmail = params.live ? params.email : undefined;
  return (
    <Suspense fallback={null}>
      <PublicHomepage
        page={page}
        roleHint={params.role}
        catalogServices={catalogServices}
        liveUserEmail={liveUserEmail}
      />
    </Suspense>
  );
}
