import { PublicPartnerAccountCompletionPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function PartnerCreatePage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  const page = await getSitePageContent("partners-join-create");
  const leadId = Number(searchParams.lead ?? "0");

  return <PublicPartnerAccountCompletionPage page={page} leadId={Number.isFinite(leadId) ? leadId : 0} />;
}
