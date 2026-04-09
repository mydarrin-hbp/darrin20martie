"use client";

import { useEffect, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import { getInsights, InsightsRecord } from "@/lib/api";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(amount);
}

export default function InsightsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<InsightsRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authToken = token ?? "";
    if (!authToken) return;
    let active = true;
    async function load() {
      try {
        const payload = await getInsights(authToken);
        if (active) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Nu am putut incarca insight-urile.");
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div>
      <ModuleHeader
        title="Insights & Analytics"
        description="Tablou executiv cu GMV, conversie plati, performanta furnizorilor si distributia pe categorii."
        badge="P3 analytics"
      />

      <div className="mb-6 panel p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-muted">Manual operare</div>
        <div className="mt-3 text-sm text-muted">
          <div>1. GMV reprezinta venitul total brut generat de comenzi.</div>
          <div>2. Conversia platii arata raportul comenzi platite vs total comenzi.</div>
          <div>3. Foloseste topurile pe categorii si furnizori pentru prioritizarea ofertelor.</div>
        </div>
      </div>

      {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!data ? (
        <div className="panel p-6 text-sm text-muted">Se incarca insight-urile...</div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="panel p-5">
              <div className="text-sm text-muted">GMV total</div>
              <div className="mt-3 text-3xl font-semibold text-ink">{formatCurrency(data.total_gmv, data.currency)}</div>
            </div>
            <div className="panel p-5">
              <div className="text-sm text-muted">Comenzi totale</div>
              <div className="mt-3 text-3xl font-semibold text-ink">{data.total_orders}</div>
            </div>
            <div className="panel p-5">
              <div className="text-sm text-muted">Comenzi platite</div>
              <div className="mt-3 text-3xl font-semibold text-ink">{data.paid_orders}</div>
            </div>
            <div className="panel p-5">
              <div className="text-sm text-muted">Conversie plata</div>
              <div className="mt-3 text-3xl font-semibold text-ink">{data.payment_conversion_rate.toFixed(2)}%</div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-ink">Comenzi pe categorii</h2>
                <span className="tag">Live</span>
              </div>
              <div className="mt-4 grid gap-3">
                {data.orders_by_category.length === 0 ? (
                  <div className="text-sm text-muted">Nu exista date suficiente.</div>
                ) : (
                  data.orders_by_category.map((item) => (
                    <div key={item.category} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/80 p-4">
                      <div>
                        <div className="text-sm font-semibold text-ink">{item.category}</div>
                        <div className="text-xs text-muted">{item.order_count} comenzi</div>
                      </div>
                      <div className="text-sm text-ink">{formatCurrency(item.gmv, data.currency)}</div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-ink">Performanta furnizori</h2>
                <span className="tag">Top 10</span>
              </div>
              <div className="mt-4 grid gap-3">
                {data.provider_performance.length === 0 ? (
                  <div className="text-sm text-muted">Nu exista furnizori alocati.</div>
                ) : (
                  data.provider_performance.map((item) => (
                    <div key={item.provider} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/80 p-4">
                      <div>
                        <div className="text-sm font-semibold text-ink">{item.provider}</div>
                        <div className="text-xs text-muted">{item.order_count} comenzi</div>
                      </div>
                      <div className="text-sm text-ink">{formatCurrency(item.gmv, data.currency)}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
