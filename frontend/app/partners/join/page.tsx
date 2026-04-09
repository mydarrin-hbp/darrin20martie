import { Suspense } from "react";

import { PublicPartnerLandingPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function PartnerJoinPage() {
  const page = await getSitePageContent("partners-join");
  return (
    <Suspense fallback={null}>
      <PublicPartnerLandingPage page={page} />
    </Suspense>
  );
}
