import { PublicCheckoutPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function CheckoutPage() {
  const page = await getSitePageContent("checkout");
  return <PublicCheckoutPage page={page} />;
}
