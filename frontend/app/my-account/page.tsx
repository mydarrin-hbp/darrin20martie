import {
  PublicAdminAccountDashboardPage,
  PublicClientAccountDashboardPage,
  PublicInvestorAccountDashboardPage,
  PublicPartnerAccountDashboardPage,
  PublicProviderAccountDashboardPage,
} from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

type RoleKey = "client" | "partner" | "investor" | "provider" | "admin";

const ROLE_COMPONENTS: Record<RoleKey, (props: { page: Awaited<ReturnType<typeof getSitePageContent>>; pending?: boolean; providerType?: string }) => JSX.Element> = {
  client: PublicClientAccountDashboardPage,
  partner: PublicPartnerAccountDashboardPage,
  investor: PublicInvestorAccountDashboardPage,
  provider: PublicProviderAccountDashboardPage,
  admin: PublicAdminAccountDashboardPage,
};

export default async function MyAccountPage({
  searchParams,
}: {
  searchParams?: { role?: string; pending?: string; provider?: string; type?: string };
}) {
  const page = await getSitePageContent("my-account");
  const roleParam = (searchParams?.role ?? "client").toLowerCase() as RoleKey;
  const Component = ROLE_COMPONENTS[roleParam] ?? PublicClientAccountDashboardPage;
  const pending = searchParams?.pending === "1";
  const providerType = searchParams?.provider ?? searchParams?.type;
  return <Component page={page} pending={pending} providerType={providerType} />;
}
