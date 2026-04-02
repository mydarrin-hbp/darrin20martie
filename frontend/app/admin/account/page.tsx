import { PublicAdminAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AdminAccountPage() {
  const page = await getSitePageContent("admin-account");
  return <PublicAdminAccountDashboardPage page={page} />;
}
