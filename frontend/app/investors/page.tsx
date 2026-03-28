import { PublicInvestorLandingPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function InvestorsPage() {
  const page = await getSitePageContent("investors");
  return <PublicInvestorLandingPage page={page} />;
}
