"use client";

import { ResourceManager } from "@/components/resource-manager";

export default function RentalCenterPage() {
  return (
    <ResourceManager
      title="Centru Rental"
      description="Gestiune utilaje (buldo, nacele, scule) cu tarif pe ora/zi si disponibilitate. Utilajele sunt conectate automat la nivelurile AUR/PLATINA."
      badge="Rental"
      resourceTypeFilter="EQUIPMENT"
      stickyLabel="Salveaza utilaj"
    />
  );
}
