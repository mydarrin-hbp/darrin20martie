import { Suspense } from "react";

import { PublicAdminAccessPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AccountCreateAdminPage() {
  const page = await getSitePageContent("account-create-administrare");

  return (
    <Suspense fallback={null}>
      <PublicAdminAccessPage page={page} />
    </Suspense>
  );
}
