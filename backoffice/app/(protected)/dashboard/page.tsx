"use client";

import { useEffect, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/components/auth-provider";
import { getAdminUsers, getCountries, getDevizRules, getPriceConfigs, getServices } from "@/lib/api";

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ users: 0, services: 0, countries: 0, priceConfigs: 0, devizRules: 0 });

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    Promise.allSettled([
      getAdminUsers(token),
      getServices(token),
      getCountries(token),
      getPriceConfigs(token),
      getDevizRules(token),
    ]).then((results) => {
      if (cancelled) {
        return;
      }

      const [users, services, countries, priceConfigs, devizRules] = results;

      setStats({
        users: users.status === "fulfilled" ? users.value.length : 0,
        services: services.status === "fulfilled" ? services.value.length : 0,
        countries: countries.status === "fulfilled" ? countries.value.length : 0,
        priceConfigs: priceConfigs.status === "fulfilled" ? priceConfigs.value.length : 0,
        devizRules: devizRules.status === "fulfilled" ? devizRules.value.length : 0,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div>
      <ModuleHeader
        title="Dashboard principal"
        description="Panou central pentru parteneri, catalog, investitori, configurari de pret, devize si administrare operationala."
        badge="Live admin overview"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Utilizatori" value={String(stats.users)} hint="CLIENT / PARTNER / INVESTOR / ADMIN" />
        <StatCard label="Servicii" value={String(stats.services)} hint="Catalog operational" />
        <StatCard label="Tari" value={String(stats.countries)} hint="Geografie activa" />
        <StatCard label="Preturi manuale" value={String(stats.priceConfigs)} hint="Cost Engine" />
        <StatCard label="Reguli deviz" value={String(stats.devizRules)} hint="Bronz / Argint / Aur / Platinum" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Fluxuri critice</h3>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <div className="rounded-2xl border border-border bg-white/70 px-4 py-3">Devino Partener: verificare KYC, cvorum si backup operational.</div>
            <div className="rounded-2xl border border-border bg-white/70 px-4 py-3">Catalog Servicii: CRUD si configurare nivele / preturi.</div>
            <div className="rounded-2xl border border-border bg-white/70 px-4 py-3">AI + Deviz + Cost Engine: control complet din back office.</div>
          </div>
        </section>
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Stare platforma</h3>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3"><span>Auth + RBAC</span><span className="tag">READY</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3"><span>Cost + Deviz Engine</span><span className="tag">READY</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3"><span>AI Robot Darrin</span><span className="tag">READY</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3"><span>Mobile MVP</span><span className="tag">READY</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
