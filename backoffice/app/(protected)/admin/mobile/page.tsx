import { AdminHub } from "@/components/admin-hub";

export default function MobileAdminPage() {
  return (
    <AdminHub
      title="Administrare Mobile"
      description="Hub pentru coordonarea aplicatiilor `mobile-client` si `mobile-partner` cu panoul de backoffice. Reflecta faptul ca aplicatiile mobile exista deja in repo si folosesc aceeasi fundatie de catalog, autentificare si comenzi."
      badge="Mobile hub"
      metrics={[
        { label: "Aplicatii", value: "2", hint: "mobile-client + mobile-partner" },
        { label: "Platforma", value: "Expo / RN", hint: "Fluxuri mobile separate" },
        { label: "Fundatie", value: "JWT + Catalog", hint: "Aceleasi concepte ca in admin" },
        { label: "Control admin", value: "Centralizat", hint: "Backoffice ca sursa de adevar" },
      ]}
      quickLinks={[
        {
          title: "Clienti si onboarding",
          description: "Coordoneaza zona comerciala si operationala consumata de aplicatia pentru clienti.",
          href: "/clients",
          cta: "Deschide clienti",
        },
        {
          title: "Parteneri si retea operationala",
          description: "Administreaza intrarile si procesarea pentru ecosistemul de parteneri.",
          href: "/partners",
          cta: "Deschide parteneri",
        },
        {
          title: "Catalog servicii",
          description: "Mentine nomenclatorul care alimenteaza atat backoffice-ul, cat si suprafetele mobile.",
          href: "/admin/catalog-services",
          cta: "Deschide catalog",
        },
      ]}
      statusItems={[
        { label: "mobile-client", value: "EXISTENT" },
        { label: "mobile-partner", value: "EXISTENT" },
        { label: "Hub administrativ", value: "READY" },
        { label: "Feature flags mobile", value: "PENDING" },
      ]}
      focus={[
        "Backoffice-ul devine punctul unic de control pentru datele si fluxurile mobile.",
        "Structura noua nu atinge codul mobil, dar face administrarea lui vizibila in meniu.",
        "Pagina poate fi extinsa ulterior cu versiuni, rollout-uri si moderare de continut mobil.",
      ]}
    />
  );
}
