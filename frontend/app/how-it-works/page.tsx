import { Suspense } from "react";

import { PublicHowItWorksPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function HowItWorksPage() {
  const page = await getSitePageContent("homepage");
  return (
    <Suspense fallback={null}>
      <PublicHowItWorksPage page={page} />
    </Suspense>
  );
}
