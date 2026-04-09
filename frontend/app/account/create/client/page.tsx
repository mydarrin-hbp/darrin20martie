import { PublicClientAccountCompletionPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AccountCreateClientPage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  const page = await getSitePageContent("account-create-client");
  const leadId = Number(searchParams.lead ?? "0");

  return <PublicClientAccountCompletionPage page={page} leadId={Number.isFinite(leadId) ? leadId : 0} />;
}
