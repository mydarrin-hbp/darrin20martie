import { PublicCartPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function CartPage() {
  const page = await getSitePageContent("cart");
  return <PublicCartPage page={page} />;
}
