import { AdminHub } from "@/components/admin-hub";

export default function ProviderManagementAdminPage() {
  return (
    <AdminHub
      title="Management Provideri (Resurse & Logistica)"
      description="Hub administrativ pentru resurse, logistica si preturi. Acopera providerii de materiale, utilaje si transport folosind infrastructura existenta de resurse catalog si mapare de pret."
      badge="Resources hub"
      metrics={[
        { label: "Tipuri resurse", value: "4", hint: "Labor, Material, Equipment, Transport" },
        { label: "Mapare pret", value: "Live-ready", hint: "Preturi pe tara / zona / localitate" },
        { label: "Sursa externa", value: "ESCO", hint: "Import URL / JSON deja prezent" },
        { label: "Compatibilitate", value: "100%", hint: "Resursele existente sunt pastrate" },
      ]}
      quickLinks={[
        {
          title: "Provideri si resurse catalog",
          description: "Gestioneaza resursele de tip manopera, material, utilaj si transport, inclusiv importuri ESCO.",
          href: "/backoffice/resources",
          cta: "Deschide resurse",
        },
        {
          title: "Mapare simbol deviz la preturi live",
          description: "Configureaza preturile administrative pentru resurse in functie de geografie si legislatie.",
          href: "/backoffice/resources/prices",
          cta: "Deschide preturi",
        },
      ]}
      statusItems={[
        { label: "Catalog resurse", value: "READY" },
        { label: "Preturi administrative", value: "READY" },
        { label: "Import ESCO", value: "READY" },
        { label: "Provider master data", value: "EXTENSIBIL" },
      ]}
      focus={[
        "Resursele existente devin baza pentru managementul providerilor din V5.2.",
        "Maparea simbol deviz -> pret live este concentrata in zona de preturi administrative.",
        "Structura actuala permite introducerea unui registry de provideri fara a rupe meniul prezent.",
      ]}
    />
  );
}
