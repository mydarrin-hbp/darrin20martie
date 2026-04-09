import { PublicAdminAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AdminAccountPage({
  searchParams,
}: {
  searchParams?: { pending?: string };
}) {
  const page = await getSitePageContent("admin-account");
  const pending = searchParams?.pending === "1";
  return <PublicAdminAccountDashboardPage page={page} pending={pending} />;
}
