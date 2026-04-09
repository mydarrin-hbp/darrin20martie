import { AdminHub } from "@/components/admin-hub";

export default function ReportsBiAdminPage() {
  return (
    <AdminHub
      title="Rapoarte & BI"
      description="Hub pentru rapoarte executive, operational BI si control administrativ. In versiunea curenta se bazeaza pe dashboard, comenzi, resurse si configurari de deviz deja conectate la backend."
      badge="BI hub"
      metrics={[
        { label: "Surse", value: "4", hint: "Dashboard, Orders, Resources, Deviz" },
        { label: "KPIs", value: "Live", hint: "Statistici administrative disponibile" },
        { label: "Export", value: "Pregatit", hint: "Poate fi extins pe aceleasi API-uri" },
        { label: "Risc regresie", value: "Scazut", hint: "Doar extensie de navigatie" },
      ]}
      quickLinks={[
        {
          title: "Dashboard principal",
          description: "Vizualizeaza indicatorii rapizi despre utilizatori, servicii, tari, preturi manuale si reguli de deviz.",
          href: "/dashboard",
          cta: "Deschide dashboard",
        },
        {
          title: "Monitorizare operationala comenzi",
          description: "Foloseste lista operationala curenta ca baza pentru raportare pe executie si capacitate.",
          href: "/orders",
          cta: "Deschide operatiuni",
        },
        {
          title: "Control costuri si preturi",
          description: "Navigheaza spre preturi administrative si configurari pentru analize financiare si comparatii.",
          href: "/backoffice/resources/prices",
          cta: "Deschide preturi",
        },
      ]}
      statusItems={[
        { label: "Dashboard KPI", value: "READY" },
        { label: "Rapoarte comenzi", value: "PARTIAL" },
        { label: "Control costuri", value: "READY" },
        { label: "BI executiv", value: "FOUNDATION" },
      ]}
      focus={[
        "BI-ul din V5.2 se sprijina pe datele deja disponibile in backoffice.",
        "Pagina organizeaza clar sursele de raportare fara a duplica logica existenta.",
        "Extinderea spre exporturi dedicate poate folosi aceleasi endpointuri administrative.",
      ]}
    />
  );
}
