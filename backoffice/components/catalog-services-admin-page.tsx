import { AdminHub } from "@/components/admin-hub";

export function CatalogServicesAdminPage() {
  return (
    <AdminHub
      title="Catalog Servicii (Inginerie Deviz)"
      description="Hub administrativ pentru principiul central My Darrin: serviciul este indicatorul de deviz, iar comanda este executia retetei. Pagina extinde meniul existent si orchestreaza domenii, servicii, indicatori, retete si clasificari."
      badge="Admin hub"
      metrics={[
        { label: "Structura", value: "4 niveluri", hint: "Domain -> Category -> Subcategory -> Service" },
        { label: "Clasificari", value: "3 surse", hint: "CAEN / NACE, Uniclass, ESCO" },
        { label: "Motoare", value: "2 active", hint: "Cost Engine + Deviz Engine" },
        { label: "Compatibilitate", value: "100%", hint: "Rutele existente raman active" },
      ]}
      quickLinks={[
        {
          title: "Serviciu nou",
          description: "Porneste fluxul complet de creare serviciu, inclusiv ierarhie, clasificari, reteta de deviz, costuri implicite si atasamente.",
          href: "/backoffice/admin/catalog-services/new",
          cta: "+ Serviciu nou",
        },
        {
          title: "Structura ierarhica a catalogului",
          description: "Gestioneaza nomenclatorul principal si legaturile oficiale dintre domenii, categorii si subcategorii.",
          href: "/backoffice/domains",
          cta: "Deschide domenii",
        },
        {
          title: "Servicii finale si atasamente pe nivel",
          description: "Administreaza serviciile finale, descrierile si materialele auxiliare folosite in experienta comerciala si operationala.",
          href: "/backoffice/services",
          cta: "Deschide servicii",
        },
        {
          title: "Indicatori, activitati si retete de deviz",
          description: "Navigheaza spre activitati, indicatori si configurari de deviz pentru a modela reteta tehnica a unui serviciu.",
          href: "/backoffice/indicators",
          cta: "Deschide indicatori",
        },
      ]}
      statusItems={[
        { label: "CRUD catalog", value: "READY" },
        { label: "Servicii finale", value: "READY" },
        { label: "Indicatori deviz", value: "READY" },
        { label: "Creare serviciu compusa", value: "READY" },
      ]}
      focus={[
        "Structura Domain -> Category -> Subcategory -> Service ramane sursa unica pentru catalog.",
        "Retetele de deviz si configurarea preturilor sunt accesibile fara a schimba rutele istorice.",
        "Fluxul nou de creare serviciu este expus pe ruta exacta /backoffice/admin/catalog-services/new.",
      ]}
    />
  );
}
