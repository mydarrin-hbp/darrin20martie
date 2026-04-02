import { Suspense } from "react";

import { PublicAboutPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AboutPage() {
  const page = await getSitePageContent("about");
  return (
    <Suspense fallback={null}>
      <PublicAboutPage page={page} />
    </Suspense>
  );
}
