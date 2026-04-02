import { Suspense } from "react";

import { PublicContactPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function ContactPage() {
  const page = await getSitePageContent("contact");
  return (
    <Suspense fallback={null}>
      <PublicContactPage page={page} />
    </Suspense>
  );
}
