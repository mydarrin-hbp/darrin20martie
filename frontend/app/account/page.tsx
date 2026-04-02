import { Suspense } from "react";

import { PublicAccountPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AccountPage() {
  const page = await getSitePageContent("account");
  return (
    <Suspense fallback={null}>
      <PublicAccountPage page={page} />
    </Suspense>
  );
}
