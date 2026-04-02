"use client";

import { useEffect, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/components/auth-provider";
import { getAdminUsers, getCountries, getDevizRules, getPriceConfigs, getProjectedRevenueMetric, getServices } from "@/lib/api";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    services: 0,
    countries: 0,
    priceConfigs: 0,
    devizRules: 0,
    projectedRevenue: 0,
    projectedOrders: 0,
    projectedCurrency: "RON",
    projectedStatuses: [] as string[],
    fullPackageClaimRate60s: 0,
    expiredJobs: 0,
    expiredJobItems: [] as Array<{
      order_ref: string;
      service_name: string;
      locality_slug?: string | null;
      missing_skill_label: string;
      expired_at?: string | null;
    }>,
  });

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
      getProjectedRevenueMetric(token),
    ]).then((results) => {
      if (cancelled) {
        return;
      }

      const [users, services, countries, priceConfigs, devizRules, projectedRevenue] = results;

      setStats({
        users: users.status === "fulfilled" ? users.value.length : 0,
        services: services.status === "fulfilled" ? services.value.length : 0,
        countries: countries.status === "fulfilled" ? countries.value.length : 0,
        priceConfigs: priceConfigs.status === "fulfilled" ? priceConfigs.value.length : 0,
        devizRules: devizRules.status === "fulfilled" ? devizRules.value.length : 0,
        projectedRevenue: projectedRevenue.status === "fulfilled" ? projectedRevenue.value.projected_revenue_total : 0,
        projectedOrders: projectedRevenue.status === "fulfilled" ? projectedRevenue.value.projected_order_count : 0,
        projectedCurrency: projectedRevenue.status === "fulfilled" ? projectedRevenue.value.currency : "RON",
        projectedStatuses: projectedRevenue.status === "fulfilled" ? projectedRevenue.value.statuses : [],
        fullPackageClaimRate60s: projectedRevenue.status === "fulfilled" ? projectedRevenue.value.full_package_claim_rate_60s : 0,
        expiredJobs: projectedRevenue.status === "fulfilled" ? projectedRevenue.value.expired_job_count : 0,
        expiredJobItems: projectedRevenue.status === "fulfilled" ? projectedRevenue.value.expired_jobs : [],
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <StatCard label="Utilizatori" value={String(stats.users)} hint="CLIENT / PARTNER / INVESTOR / ADMIN" />
        <StatCard label="Servicii" value={String(stats.services)} hint="Catalog operational" />
        <StatCard label="Tari" value={String(stats.countries)} hint="Geografie activa" />
        <StatCard label="Preturi manuale" value={String(stats.priceConfigs)} hint="Cost Engine" />
        <StatCard label="Reguli deviz" value={String(stats.devizRules)} hint="Bronz / Argint / Aur / Platinum" />
        <StatCard
          label="Venituri Proiectate"
          value={formatCurrency(stats.projectedRevenue, stats.projectedCurrency)}
          hint="Comenzi active incluse in forecast"
        />
        <StatCard label="Comenzi proiectate" value={String(stats.projectedOrders)} hint="PENDING / SEARCHING / ALLOCATED / IN PROGRESS" />
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
          <h3 className="text-xl font-semibold text-ink">Venituri Proiectate</h3>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <div className="rounded-2xl border border-border bg-white/70 px-4 py-4">
              <div className="text-sm text-muted">Forecast live din orders.total_facturabil</div>
              <div className="mt-2 text-3xl font-semibold text-ink">{formatCurrency(stats.projectedRevenue, stats.projectedCurrency)}</div>
              <div className="mt-2 text-sm text-muted">{stats.projectedOrders} comenzi incluse in proiectie</div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 px-4 py-4">
              <div className="text-sm text-muted">Statusuri incluse</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.projectedStatuses.length ? (
                  stats.projectedStatuses.map((status) => (
                    <span key={status} className="tag">
                      {status}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted">Nu exista statusuri active inca.</span>
                )}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white/70 px-4 py-4">
                <div className="text-sm text-muted">% claim in primele 60s</div>
                <div className="mt-2 text-3xl font-semibold text-ink">{stats.fullPackageClaimRate60s.toFixed(2)}%</div>
                <div className="mt-2 text-sm text-muted">Full Package Priority</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 px-4 py-4">
                <div className="text-sm text-muted">Joburi expirate</div>
                <div className="mt-2 text-3xl font-semibold text-ink">{stats.expiredJobs}</div>
                <div className="mt-2 text-sm text-muted">Nimeni nu a dat claim in zona respectiva</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 px-4 py-4">
              <div className="text-sm text-muted">Ultimele 5 joburi expirate</div>
              <div className="mt-3 grid gap-2">
                {stats.expiredJobItems.length ? (
                  stats.expiredJobItems.map((job) => (
                    <div key={`${job.order_ref}-${job.expired_at ?? "expired"}`} className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                      <div className="text-sm font-semibold text-ink">
                        {job.service_name} - {job.locality_slug ?? "zona necunoscuta"}
                      </div>
                      <div className="mt-1 text-sm text-muted">{job.missing_skill_label}</div>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted">Nu exista joburi expirate in ultimele inregistrari.</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
