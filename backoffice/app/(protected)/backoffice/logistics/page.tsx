"use client";

import { ResourceManager } from "@/components/resource-manager";

export default function LogisticsPage() {
  return (
    <ResourceManager
      title="Logistica & Livrare"
      description="Gestionare transportatori, rute si tarifare pentru livrarile de materiale si mobilizarea utilajelor."
      badge="Logistica"
      resourceTypeFilter="TRANSPORT"
      stickyLabel="Salveaza transport"
    />
  );
}
