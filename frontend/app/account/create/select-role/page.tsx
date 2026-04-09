import { PublicAccountRoleSelectionPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AccountCreateSelectRolePage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  const page = await getSitePageContent("account-create-select-role");
  const leadId = Number(searchParams.lead ?? "0");

  return <PublicAccountRoleSelectionPage page={page} leadId={Number.isFinite(leadId) ? leadId : 0} />;
}
