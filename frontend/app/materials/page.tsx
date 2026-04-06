import { PublicMaterialsPage } from "@/components/public-site-v3";
import { getPublicCatalogCategories, getPublicCatalogServices, getSitePageContent } from "@/lib/site-content";

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; subcategory?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const [page, categories, services] = await Promise.all([
    getSitePageContent("materials"),
    getPublicCatalogCategories(),
    getPublicCatalogServices({
      category: params.category,
      subcategory: params.subcategory,
      resourceTypes: ["MATERIAL"],
    }),
  ]);

  return (
    <PublicMaterialsPage
      page={page}
      categories={categories}
      materials={services}
      activeCategory={params.category ?? null}
      activeSubcategory={params.subcategory ?? null}
    />
  );
}
