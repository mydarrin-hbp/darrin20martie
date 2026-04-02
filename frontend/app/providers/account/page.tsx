import { PublicProviderAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function ProviderAccountPage() {
  const page = await getSitePageContent("provider-account");
  return <PublicProviderAccountDashboardPage page={page} />;
}
