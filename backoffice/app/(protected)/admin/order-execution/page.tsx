import { AdminHub } from "@/components/admin-hub";

export default function OrderExecutionAdminPage() {
  return (
    <AdminHub
      title="Gestionare Comenzi (Executie)"
      description="Hub pentru executia comenzilor plecand din retetele tehnice deja definite. Modulele existente de comenzi si configurari de deviz raman active si sunt grupate intr-o zona operationala unica."
      badge="Execution hub"
      metrics={[
        { label: "Flux activ", value: "Orders", hint: "Snapshot operational deja prezent" },
        { label: "Calcul", value: "Cost + Deviz", hint: "Baza pentru costuri finale" },
        { label: "Principiu", value: "Reteta -> Comanda", hint: "Executia deriva din serviciu" },
        { label: "Backward", value: "Complet", hint: "Pagina /orders ramane neschimbata" },
      ]}
      quickLinks={[
        {
          title: "Fluxul complet al comenzii",
          description: "Monitorizeaza comenzile si statusurile operationale pe baza entitatilor reale disponibile in backend.",
          href: "/orders",
          cta: "Deschide comenzi",
        },
        {
          title: "Configurari de cost, nivel si multiplicatori",
          description: "Controleaza regulile de deviz, coeficientii si straturile de cost folosite in executie.",
          href: "/deviz-configs",
          cta: "Deschide devize",
        },
      ]}
      statusItems={[
        { label: "Management comenzi", value: "READY" },
        { label: "Configurari deviz", value: "READY" },
        { label: "GBE / asigurare", value: "MODELARE" },
        { label: "Endpoint comenzi dedicat", value: "PARTIAL" },
      ]}
      focus={[
        "Comanda este tratata ca executie a retetei tehnice definite in catalog.",
        "Costurile finale folosesc infrastructura existenta de configurari si multiplicatori.",
        "Zona este pregatita pentru extinderea unui endpoint dedicat de business fara schimbari de meniu.",
      ]}
    />
  );
}
