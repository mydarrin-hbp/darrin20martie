import { AdminHub } from "@/components/admin-hub";

export default function DesignSystemAdminPage() {
  return (
    <AdminHub
      title="Design System"
      description="Hub pentru consistenta vizuala a panoului administrativ si a experientelor conexe. In mediul actual se bazeaza pe stilurile globale, componentele shared si Visual Builder-ul activ, nu pe mockup-urile vechi."
      badge="Design hub"
      metrics={[
        { label: "Fundatie", value: "Shared UI", hint: "Sidebar, shell, module header, cards" },
        { label: "Vizualizare LIVE", value: "Live bridge", hint: "Visual Builder + homepage publica actuala" },
        { label: "Tema", value: "My Darrin", hint: "Space Grotesk + token-uri existente" },
        { label: "Backoffice", value: "Unificat", hint: "Tailwind + utilitare comune" },
      ]}
      quickLinks={[
        {
          title: "Visual Builder",
          description: "Administreaza varianta actuala a homepage-ului, header-ului si footer-ului din panoul activ.",
          href: "/system/public-site-content",
          cta: "Deschide builder",
        },
        {
          title: "Homepage publica live",
          description: "Verifica direct experienta publica actuala, nu iteratiile istorice de mockup.",
          href: "https://mydarrin.homebestpal.com/",
          cta: "Deschide homepage",
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
        { label: "Vizualizare iteratii", value: "ARCHIVED" },
        { label: "Token-uri dedicate", value: "PARTIAL" },
        { label: "Documentare UI", value: "IN PROGRES" },
      ]}
      focus={[
        "Zona centralizeaza designul in jurul builder-ului activ si al shell-ului executiv din backoffice.",
        "Componentele backoffice actuale devin baza unui design system administrativ coerent.",
        "Mockup-urile istorice raman doar ca redirect-uri de compatibilitate, nu ca sursa de adevar vizuala.",
      ]}
    />
  );
}
