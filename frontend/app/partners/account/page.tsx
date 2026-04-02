import { PublicPartnerAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function PartnerAccountPage() {
  const page = await getSitePageContent("partner-account");
  return <PublicPartnerAccountDashboardPage page={page} />;
}
