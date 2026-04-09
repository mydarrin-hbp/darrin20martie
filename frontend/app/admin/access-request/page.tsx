import { PublicAdminAccountCompletionPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function AdminAccessRequestPage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  const page = await getSitePageContent("admin-access-request");
  const leadId = Number(searchParams.lead ?? "0");

  return <PublicAdminAccountCompletionPage page={page} leadId={Number.isFinite(leadId) ? leadId : 0} />;
}
