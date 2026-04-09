import { redirect } from "next/navigation";

export default function HomepagePreviewLegacyRedirectPage() {
  redirect("/system/public-site-content");
}
