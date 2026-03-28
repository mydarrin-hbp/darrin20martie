import { AdminHub } from "@/components/admin-hub";

export default function IntegrationsAdminPage() {
  return (
    <AdminHub
      title="Integrari Externe"
      description="Hub administrativ pentru integrarile tehnice externe deja reflectate in proiect: Google Cloud, ESCO, clasificari standard si gateway-ul de securitate dintre backoffice si backend."
      badge="Integrations hub"
      metrics={[
        { label: "Cloud", value: "GCP", hint: "Cloud Run, Cloud SQL, Storage" },
        { label: "Clasificari", value: "ESCO", hint: "Import si browser backoffice" },
        { label: "Acces", value: "Gate + JWT", hint: "Protectie activa in fluxul admin" },
        { label: "Rute existente", value: "Pastrate", hint: "Fara impact pe compatibilitate" },
      ]}
      quickLinks={[
        {
          title: "Browser ESCO",
          description: "Exploreaza clasificari si resurse externe deja conectate la panoul administrativ.",
          href: "/backoffice/esco",
          cta: "Deschide ESCO",
        },
        {
          title: "Resurse si importuri",
          description: "Gestioneaza importurile de resurse si maparile necesare pentru fluxurile de deviz.",
          href: "/backoffice/resources",
          cta: "Deschide resurse",
        },
        {
          title: "Localitati si geografie",
          description: "Controleaza dimensiunea geografica folosita in preturi, costuri si extinderi de integrare.",
          href: "/backoffice/geography/localities",
          cta: "Deschide geografie",
        },
      ]}
      statusItems={[
        { label: "GCP scripts", value: "EXISTENT" },
        { label: "ESCO integration", value: "READY" },
        { label: "Security gate", value: "READY" },
        { label: "Conectori externi noi", value: "PENDING" },
      ]}
      focus={[
        "Pagina grupeaza integrarile deja prezente in cod, fara sa ascunda rutele tehnice existente.",
        "GCP si ESCO sunt tratate ca fundatii operationale ale administratiei V5.2.",
        "Hub-ul ramane locul natural pentru viitoare integrari ERP, plati, CRM sau asigurari.",
      ]}
    />
  );
}
