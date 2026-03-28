"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import { AdminUser, CountryRecord, getAdminUsers, getCountries, getServices, getZones, ServiceRecord, ZoneRecord } from "@/lib/api";

type GeneratedOrder = {
  id: string;
  client: string;
  service: string;
  country: string;
  zone: string;
  status: "Pending" | "In Progress" | "Completed";
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [clients, setClients] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }
    Promise.all([getAdminUsers(token), getServices(token), getCountries(token), getZones(token)]).then(([users, serviceList, countryList, zoneList]) => {
      setClients(users.filter((user) => user.role === "CLIENT"));
      setServices(serviceList);
      setCountries(countryList);
      setZones(zoneList);
    });
  }, [token]);

  const orders = useMemo<GeneratedOrder[]>(() => {
    const statuses: GeneratedOrder["status"][] = ["Pending", "In Progress", "Completed"];
    return clients.slice(0, 6).map((client, index) => ({
      id: `OPS-${1000 + index}`,
      client: client.email,
      service: services[index % Math.max(services.length, 1)]?.name ?? "Service demo",
      country: countries[index % Math.max(countries.length, 1)]?.name ?? "Romania",
      zone: zones[index % Math.max(zones.length, 1)]?.name ?? "Urban",
      status: statuses[index % statuses.length],
    }));
  }, [clients, countries, services, zones]);

  return (
    <div>
      <ModuleHeader
        title="Management Comenzi + Status"
        description="Panou operational pentru urmarirea comenzilor. Pana la expunerea endpointului dedicat `/api/v1/orders`, lista este generata din entitati reale backend deja disponibile."
        badge="Operational adapter"
      />
      <section className="panel p-6">
        <div className="grid gap-3">
          {orders.length === 0 ? <div className="text-sm text-muted">Nu exista suficiente date reale pentru snapshot-ul operational.</div> : null}
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-ink">{order.id}</div>
                  <div className="mt-1 text-sm text-muted">{order.client} · {order.service}</div>
                </div>
                <span className="tag">{order.status}</span>
              </div>
              <div className="mt-3 text-sm text-muted">{order.country} / {order.zone}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
