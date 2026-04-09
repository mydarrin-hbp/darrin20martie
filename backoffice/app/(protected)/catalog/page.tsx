import { redirect } from "next/navigation";

export default function CatalogRedirectPage() {
  redirect("/admin/catalog-services");
}
