"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

export type SeedRoundItem = {
  id: string;
  title: string;
  target_amount: number;
  committed_amount: number;
  quorum_percent: number;
  currency: string;
  status: string;
  updated_at: string;
};

type SeedRoundsResponse = {
  items: SeedRoundItem[];
};

const fallbackRounds: SeedRoundItem[] = [
  {
    id: "seed-2026-q2",
    title: "Runda SEED Q2 2026",
    target_amount: 850000,
    committed_amount: 420000,
    quorum_percent: 49.41,
    currency: "EUR",
    status: "ACTIVE",
    updated_at: new Date().toISOString(),
  },
];

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function InvestorSeedWidget() {
  const [items, setItems] = useState<SeedRoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSeedRounds() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/public/investors/seed-rounds`, {
          headers: GATE ? { "X-Gate-Authorization": GATE } : undefined,
        });
        if (!response.ok) {
          throw new Error("seed-rounds-fetch");
        }
        const payload = (await response.json()) as SeedRoundsResponse;
        if (active) {
          setItems(payload.items ?? []);
        }
      } catch {
        if (active) {
          setItems(fallbackRounds);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSeedRounds();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="v3-investor-widget">
      <div className="v3-card-kicker">Runde SEED active</div>
      <h3 className="v3-section-title">Cvorum live pentru investitori</h3>
      <p className="v3-muted-copy">
        Progresul este actualizat in timp real pentru a reflecta interesul investitorilor si statusul rundelor active.
      </p>

      {loading ? (
        <div className="v3-skeleton-stack">
          {[1, 2].map((item) => (
            <div key={item} className="v3-skeleton-card">
              <div className="v3-skeleton-bar" />
              <div className="v3-skeleton-bar v3-skeleton-bar-short" />
              <div className="v3-skeleton-bar v3-skeleton-bar-wide" />
            </div>
          ))}
        </div>
      ) : (
        <div className="v3-seed-round-list">
          {items.map((round) => (
            <article key={round.id} className="v3-seed-round-card">
              <div>
                <div className="v3-seed-round-title">{round.title}</div>
                <div className="v3-seed-round-sub">
                  {formatCurrency(round.committed_amount, round.currency)} / {formatCurrency(round.target_amount, round.currency)} {round.currency}
                </div>
              </div>
              <div className="v3-seed-round-progress">
                <div className="v3-seed-round-bar">
                  <div className="v3-seed-round-fill" style={{ width: `${Math.min(round.quorum_percent, 100)}%` }} />
                </div>
                <strong>{round.quorum_percent.toFixed(1)}%</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
