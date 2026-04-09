import { PublicPartnerAccountCompletionPage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function MarketplaceMaterialsCreatePage({
  searchParams,
}: {
  searchParams: { lead?: string; subrole?: string };
}) {
  const page = await getSitePageContent("marketplace-materials-create");
  const leadId = Number(searchParams.lead ?? "0");
  const subrole = searchParams.subrole ?? "materials-marketplace";

  return (
    <PublicPartnerAccountCompletionPage
      page={page}
      leadId={Number.isFinite(leadId) ? leadId : 0}
      subrole={subrole}
    />
  );
}
