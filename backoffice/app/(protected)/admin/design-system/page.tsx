import { AdminHub } from "@/components/admin-hub";

export default function DesignSystemAdminPage() {
  return (
    <AdminHub
      title="Design System"
      description="Hub pentru consistenta vizuala a panoului administrativ si a experientelor conexe. In mediul actual se bazeaza pe stilurile globale, componentele shared si paginile de preview deja existente."
      badge="Design hub"
      metrics={[
        { label: "Fundatie", value: "Shared UI", hint: "Sidebar, shell, module header, cards" },
        { label: "Preview", value: "2 pagini", hint: "homepage-preview si homepage-preview-v2" },
        { label: "Tema", value: "My Darrin", hint: "Space Grotesk + token-uri existente" },
        { label: "Backoffice", value: "Unificat", hint: "Tailwind + utilitare comune" },
      ]}
      quickLinks={[
        {
          title: "Preview homepage V1",
          description: "Verifica pagina de preview folosita pentru explorarea directiei vizuale a brandului.",
          href: "/homepage-preview",
          cta: "Deschide preview",
        },
        {
          title: "Preview homepage V2",
          description: "Verifica iteratia vizuala mai noua pastrata deja in proiect pentru aliniere de design.",
          href: "/homepage-preview-v2",
          cta: "Deschide preview V2",
        },
        {
          title: "Dashboard administrativ",
          description: "Observa aplicarea componentelor de baza si a structurii vizuale in panoul activ.",
          href: "/dashboard",
          cta: "Deschide dashboard",
        },
      ]}
      statusItems={[
        { label: "Componente shared", value: "READY" },
        { label: "Preview iteratii", value: "READY" },
        { label: "Token-uri dedicate", value: "PARTIAL" },
        { label: "Documentare UI", value: "IN PROGRES" },
      ]}
      focus={[
        "Zona centralizeaza designul fara a muta sau rescrie preview-urile existente.",
        "Componentele backoffice actuale devin baza unui design system administrativ coerent.",
        "Pagini de preview raman accesibile pentru decizii vizuale si iteratii viitoare.",
      ]}
    />
  );
}
