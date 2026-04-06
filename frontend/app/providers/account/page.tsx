import { PublicProviderAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function ProviderAccountPage({
  searchParams,
}: {
  searchParams?: { pending?: string; type?: string };
}) {
  const page = await getSitePageContent("provider-account");
  const pending = searchParams?.pending === "1";
  const providerType = searchParams?.type;
  return <PublicProviderAccountDashboardPage page={page} pending={pending} providerType={providerType} />;
}
