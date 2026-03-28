import { AdminHub } from "@/components/admin-hub";

export default function AiDarrinAdminPage() {
  return (
    <AdminHub
      title="AI Darrin"
      description="Hub administrativ pentru capabilitatile AI deja prezente in backend. Organizeaza interactiunea dintre AI Robot Darrin, catalog, deviz si executie fara a impune o noua schema de navigatie."
      badge="AI hub"
      metrics={[
        { label: "Backend", value: "Activ", hint: "Router AI inclus in API" },
        { label: "Conexiuni", value: "3", hint: "Catalog, Deviz, Estimates" },
        { label: "Rol", value: "Copilot", hint: "Interpretare si asistare operationala" },
        { label: "UI dedicat", value: "Hub V5.2", hint: "Punct unic de intrare in backoffice" },
      ]}
      quickLinks={[
        {
          title: "Indicatori si retete",
          description: "Conecteaza analizele AI cu indicatorii tehnici si retetele deja administrate in backoffice.",
          href: "/backoffice/indicators",
          cta: "Deschide indicatori",
        },
        {
          title: "Configurari deviz",
          description: "Revizueste regulile si multiplicatorii care alimenteaza deciziile automatizate sau asistate.",
          href: "/deviz-configs",
          cta: "Deschide devize",
        },
      ]}
      statusItems={[
        { label: "Router AI backend", value: "READY" },
        { label: "Hub backoffice", value: "READY" },
        { label: "UI conversational dedicat", value: "PENDING" },
        { label: "Integrare executie", value: "FOUNDATION" },
      ]}
      focus={[
        "AI Darrin este pozitionat ca strat transversal peste catalog, deviz si comenzi.",
        "Hub-ul creeaza un punct administrativ clar fara sa presupuna endpointuri noi in aceasta iteratie.",
        "Extensia viitoare poate introduce o consola AI dedicata pe aceeasi ruta principala.",
      ]}
    />
  );
}
