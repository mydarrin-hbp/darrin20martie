"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type SidebarItem = {
  href: string;
  label: string;
  children?: SidebarItem[];
};

const sections: Array<{ title: string; items: SidebarItem[] }> = [
  {
    title: "Core",
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    title: "Panou Administrare",
    items: [
      {
        href: "/backoffice/admin/catalog-services",
        label: "Catalog Servicii (Inginerie Deviz)",
        children: [
          { href: "/backoffice/domains", label: "Structura Domain > Category > Subcategory" },
          { href: "/backoffice/services", label: "Servicii finale" },
          { href: "/backoffice/activities", label: "Activitati Uniclass" },
          { href: "/backoffice/indicators", label: "Indicatori Deviz" },
          { href: "/deviz-configs", label: "Retete Deviz / Configurari" },
          { href: "/backoffice/resources", label: "Import bulk si resurse ESCO" },
          { href: "/backoffice/esco", label: "Clasificare CAEN / NACE / ESCO" },
        ],
      },
      {
        href: "/admin/order-execution",
        label: "Gestionare Comenzi (Executie)",
        children: [
          { href: "/orders", label: "Flux comanda complet" },
          { href: "/deviz-configs", label: "Calcul costuri finale + GBE + Asigurare" },
        ],
      },
      {
        href: "/admin/provider-management",
        label: "Management Provideri (Resurse & Logistica)",
        children: [
          { href: "/backoffice/resources", label: "Provideri materiale / utilaje / transport" },
          { href: "/backoffice/resources/prices", label: "Mapare simbol deviz -> pret live" },
        ],
      },
      { href: "/admin/reports-bi", label: "Rapoarte & BI" },
      {
        href: "/admin/design-system",
        label: "Design System",
        children: [{ href: "/admin/design-system/homepage-builder", label: "Public Pages Builder" }],
      },
      { href: "/admin/ai-darrin", label: "AI Darrin" },
      { href: "/admin/integrations", label: "Integrari Externe" },
      { href: "/admin/mobile", label: "Administrare Mobile" },
      { href: "/admin/marketing", label: "Marketing" },
    ],
  },
  {
    title: "Fluxuri Comerciale",
    items: [
      { href: "/partners", label: "Devino Partener" },
      { href: "/clients", label: "Inscriere Clienti" },
      { href: "/investors", label: "Devino Investitor" },
      { href: "/backoffice/geography/localities", label: "Localitati" },
      { href: "/profile", label: "Profil admin" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="panel sticky top-6 flex h-[calc(100vh-48px)] min-w-[280px] flex-col overflow-hidden p-5">
      <div className="mb-8 shrink-0">
        <div className="text-xs uppercase tracking-[0.24em] text-muted">My Darrin</div>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Back Office</h1>
        <p className="mt-2 text-sm text-muted">Caiet de Sarcini V4.1 + Biblia Tehnica</p>
      </div>

      <nav className="grid min-h-0 flex-1 gap-5 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.22em] text-muted">{section.title}</div>
            <div className="grid gap-2">
              {section.items.map((item) => {
                const parentActive = isActive(pathname, item.href) || item.children?.some((child) => isActive(pathname, child.href));

                return (
                  <div key={item.href} className="grid gap-2">
                    <Link
                      href={item.href}
                      className={clsx(
                        "rounded-2xl px-4 py-3 text-sm font-medium transition",
                        parentActive ? "bg-accent text-white" : "bg-white/65 text-ink hover:bg-white",
                      )}
                    >
                      {item.label}
                    </Link>

                    {item.children ? (
                      <div className="ml-3 grid gap-2 border-l border-black/10 pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={clsx(
                              "rounded-2xl px-4 py-2.5 text-xs font-medium transition",
                              isActive(pathname, child.href)
                                ? "bg-white text-ink shadow-sm"
                                : "bg-white/45 text-muted hover:bg-white/70 hover:text-ink",
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
