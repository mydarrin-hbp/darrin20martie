"use client";

import Link from "next/link";

import { ModuleHeader } from "@/components/module-header";

const routes = [
  {
    href: "/backoffice/domains",
    title: "Domenii",
    description: "Administrare completa pentru cele 5 domenii principale, cu name_ro, name_en si coduri CAEN / Uniclass / ESCO stocate doar in Backoffice.",
  },
  {
    href: "/backoffice/domains",
    title: "Import clasificari",
    description: "Upload CSV/XLSX pentru importul de coduri oficiale si pentru seed incremental din fisiere istorice.",
  },
  {
    href: "/backoffice/domains",
    title: "Ierarhie operationala",
    description: "Gestionarea relatiilor Domeniu -> Categorie -> Subcategorie pentru fluxurile publice si mobile care afiseaza exclusiv denumirile.",
  },
  {
    href: "/backoffice/services",
    title: "Servicii finale",
    description: "Administrarea serviciilor finale, cu descrieri extinse, nivele si atasamente multiple pentru executie si prezentare.",
  },
  {
    href: "/backoffice/geography/localities",
    title: "Geografie avansata",
    description: "Structura Tara -> Zona -> Localitate pentru pricing precis, devize contextuale si AI asistat de geografie reala.",
  },
];

export default function CatalogPage() {
  return (
    <div>
      <ModuleHeader
        title="Catalog Servicii"
        description="Structura de clasificare a fost mutata in noul modul Backoffice Domains pentru a separa clar denumirile publice de codurile oficiale administrative."
        badge="Backoffice taxonomy"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {routes.map((route) => (
          <Link key={route.title} href={route.href} className="panel p-6 transition hover:-translate-y-0.5">
            <div className="text-xs uppercase tracking-[0.24em] text-muted">My Darrin</div>
            <h2 className="mt-3 text-xl font-semibold text-ink">{route.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{route.description}</p>
            <div className="mt-5 text-sm font-semibold text-accent">Deschide modulul</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
