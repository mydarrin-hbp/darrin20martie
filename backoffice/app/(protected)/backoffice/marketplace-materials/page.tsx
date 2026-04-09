"use client";

import { ResourceManager } from "@/components/resource-manager";

export default function MarketplaceMaterialsPage() {
  return (
    <ResourceManager
      title="Marketplace Materiale"
      description="Gestionare stocuri pentru provideri de bricolaj. Toate materialele sunt mapate pe unitati (buc, kg, mp) si raman sincronizate cu pivotul material -> serviciu."
      badge="Materiale"
      resourceTypeFilter="MATERIAL"
      stickyLabel="Salveaza material"
    />
  );
}
