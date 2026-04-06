import { PublicPartnerAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function PartnerAccountPage({
  searchParams,
}: {
  searchParams?: { pending?: string };
}) {
  const page = await getSitePageContent("partner-account");
  const pending = searchParams?.pending === "1";
  return <PublicPartnerAccountDashboardPage page={page} pending={pending} />;
}
