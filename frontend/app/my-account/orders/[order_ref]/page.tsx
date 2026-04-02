import { Suspense } from "react";

import { PublicClientOrderDetailPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function ClientOrderDetailPage({
  params,
}: {
  params: { order_ref: string };
}) {
  const page = await getSitePageContent("account");
  return (
    <Suspense fallback={null}>
      <PublicClientOrderDetailPage page={page} orderRef={params.order_ref} />
    </Suspense>
  );
}
