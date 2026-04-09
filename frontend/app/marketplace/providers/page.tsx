import { Suspense } from "react";

import { PublicMarketplaceProviderPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function MarketplaceProvidersPage() {
  const page = await getSitePageContent("homepage");
  return (
    <Suspense fallback={null}>
      <PublicMarketplaceProviderPage page={page} />
    </Suspense>
  );
}
