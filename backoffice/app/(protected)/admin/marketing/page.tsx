import { AdminHub } from "@/components/admin-hub";

export default function MarketingAdminPage() {
  return (
    <AdminHub
      title="Marketing"
      description="Hub administrativ pentru crestere, continut si coordonare comerciala. In iteratia curenta se sprijina pe fluxurile de clienti, parteneri, investitori si pe homepage-ul actual sincronizat prin Visual Builder."
      badge="Marketing hub"
      metrics={[
        { label: "Surse lead", value: "3", hint: "Clienti, Parteneri, Investitori" },
        { label: "Continut", value: "Homepage", hint: "Preview-uri disponibile in repo" },
        { label: "Administrare", value: "Centralizata", hint: "Hub nou in meniul backoffice" },
        { label: "Automatizare", value: "Pregatit", hint: "Poate lega AI si BI ulterior" },
      ]}
      quickLinks={[
        {
          title: "Inscriere clienti",
          description: "Administreaza fluxul de onboarding si datele comerciale de intrare pentru segmentul client.",
          href: "/clients",
          cta: "Deschide clienti",
        },
        {
          title: "Devino Partener",
          description: "Controleaza intrarea in ecosistemul de provideri si retea operationala.",
          href: "/partners",
          cta: "Deschide parteneri",
        },
        {
          title: "Devino Investitor",
          description: "Centralizeaza interesul investitional si fluxurile aferente din suprafata administrativa.",
          href: "/investors",
          cta: "Deschide investitori",
        },
        {
          title: "Visual Builder",
          description: "Revizuieste si actualizeaza homepage-ul activ, header-ul, footer-ul si ordinea sectiunilor publice.",
          href: "/system/public-site-content",
          cta: "Deschide builder",
        },
      ]}
      statusItems={[
        { label: "Lead funnels", value: "READY" },
        { label: "Hub marketing", value: "READY" },
        { label: "Campanii dedicate", value: "PENDING" },
        { label: "Analytics marketing", value: "FOUNDATION" },
      ]}
      focus={[
        "Marketingul devine un modul explicit in backoffice, fara a dubla paginile comerciale existente.",
        "Fluxurile existente de clienti, parteneri si investitori raman sursa operationala pentru crestere.",
        "Hub-ul pregateste terenul pentru continut, campanii si raportare dedicate.",
      ]}
    />
  );
}
