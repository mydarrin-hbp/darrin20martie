import { PublicPartnerAccountCompletionPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function MarketplaceMaterialsIpIntegrationPage({
  searchParams,
}: {
  searchParams: { lead?: string; subrole?: string };
}) {
  const page = await getSitePageContent("marketplace-materials-ip");
  const leadId = Number(searchParams.lead ?? "0");
  const subrole = searchParams.subrole ?? "materials-ip";

  return (
    <PublicPartnerAccountCompletionPage
      page={page}
      leadId={Number.isFinite(leadId) ? leadId : 0}
      subrole={subrole}
    />
  );
}
