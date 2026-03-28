import { PublicPaymentStatusPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function PaymentStatusPage() {
  const page = await getSitePageContent("payment-status");
  return <PublicPaymentStatusPage page={page} />;
}
