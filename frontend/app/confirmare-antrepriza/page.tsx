import { Suspense } from "react";

import { PublicPaymentStatusPage } from "@/components/public-site-v3";
import { getPublicOrderStatus, getSitePageContent } from "@/lib/site-content";

export default async function ConfirmareAntreprizaPage({
  searchParams,
}: {
  searchParams?: Promise<{ order_ref?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const orderRef = params.order_ref ?? "";
  const [page, orderStatus] = await Promise.all([
    getSitePageContent("payment-status"),
    orderRef ? getPublicOrderStatus(orderRef) : Promise.resolve(null),
  ]);
  return (
    <Suspense fallback={null}>
      <PublicPaymentStatusPage page={page} orderRef={orderRef || null} orderStatus={orderStatus} />
    </Suspense>
  );
}
