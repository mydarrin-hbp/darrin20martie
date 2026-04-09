import { PublicInvestorAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function InvestorAccountPage({
  searchParams,
}: {
  searchParams?: { pending?: string };
}) {
  const page = await getSitePageContent("investor-account");
  const pending = searchParams?.pending === "1";
  return <PublicInvestorAccountDashboardPage page={page} pending={pending} />;
}
