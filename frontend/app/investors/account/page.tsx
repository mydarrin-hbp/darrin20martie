import { PublicInvestorAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function InvestorAccountPage() {
  const page = await getSitePageContent("investor-account");
  return <PublicInvestorAccountDashboardPage page={page} />;
}
