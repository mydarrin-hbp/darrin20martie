import { PublicInvestorAccountCompletionPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function InvestorCreatePage({
  searchParams,
}: {
  searchParams: { lead?: string };
}) {
  const page = await getSitePageContent("investors-create");
  const leadId = Number(searchParams.lead ?? "0");

  return <PublicInvestorAccountCompletionPage page={page} leadId={Number.isFinite(leadId) ? leadId : 0} />;
}
