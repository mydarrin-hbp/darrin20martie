import {
  PublicAdminAccountDashboardPage,
  PublicClientAccountDashboardPage,
  PublicInvestorAccountDashboardPage,
  PublicPartnerAccountDashboardPage,
  PublicProviderAccountDashboardPage,
} from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

type RoleKey = "client" | "partner" | "investor" | "provider" | "admin";

const ROLE_COMPONENTS: Record<RoleKey, (props: { page: Awaited<ReturnType<typeof getSitePageContent>> }) => JSX.Element> = {
  client: PublicClientAccountDashboardPage,
  partner: PublicPartnerAccountDashboardPage,
  investor: PublicInvestorAccountDashboardPage,
  provider: PublicProviderAccountDashboardPage,
  admin: PublicAdminAccountDashboardPage,
};

export default async function MyAccountPage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const page = await getSitePageContent("my-account");
  const roleParam = (searchParams?.role ?? "client").toLowerCase() as RoleKey;
  const Component = ROLE_COMPONENTS[roleParam] ?? PublicClientAccountDashboardPage;
  return <Component page={page} />;
}
