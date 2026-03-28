import { PublicHomepage } from "@/components/public-site-v3";
import { getSitePageContent } from "@/lib/site-content";

export default async function HomePage() {
  const page = await getSitePageContent("homepage");
  return <PublicHomepage page={page} />;
}
