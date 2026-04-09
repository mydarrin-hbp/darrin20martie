import { Suspense } from "react";

import { PublicLegalPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function LegalPage() {
  const page = await getSitePageContent("legal");
  return (
    <Suspense fallback={null}>
      <PublicLegalPage page={page} />
    </Suspense>
  );
}
