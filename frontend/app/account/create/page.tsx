import { Suspense } from "react";

import { PublicAccountCreatePage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AccountCreatePage() {
  const page = await getSitePageContent("account-create");
  return (
    <Suspense fallback={null}>
      <PublicAccountCreatePage page={page} />
    </Suspense>
  );
}
