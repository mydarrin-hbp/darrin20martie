import { PublicProviderAccountDashboardPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function MarketplaceConcreteProviderPage({
  searchParams,
}: {
  searchParams?: { pending?: string };
}) {
  const page = await getSitePageContent("marketplace-concrete-provider");
  const pending = searchParams?.pending === "1";
  return <PublicProviderAccountDashboardPage page={page} pending={pending} providerType="concrete" />;
}
