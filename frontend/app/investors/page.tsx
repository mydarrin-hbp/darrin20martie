import { Suspense } from "react";

import { PublicInvestorLandingPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function InvestorsPage() {
  const page = await getSitePageContent("investors");
  return (
    <Suspense fallback={null}>
      <PublicInvestorLandingPage page={page} />
    </Suspense>
  );
}
