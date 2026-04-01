import { Suspense } from "react";

import { PublicHomepage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function PublicHomepagePreviewV2Page() {
  const page = await getSitePageContent("homepage");
  return (
    <Suspense fallback={null}>
      <PublicHomepage page={page} />
    </Suspense>
  );
}
