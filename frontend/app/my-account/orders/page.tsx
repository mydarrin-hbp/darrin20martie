import { Suspense } from "react";

import { PublicClientOrdersPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function ClientOrdersPage() {
  const page = await getSitePageContent("account");
  return (
    <Suspense fallback={null}>
      <PublicClientOrdersPage page={page} />
    </Suspense>
  );
}
