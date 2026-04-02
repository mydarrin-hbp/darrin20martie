"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

type LiveActivityItem = {
  order_ref: string;
  service_name: string;
  locality_slug?: string | null;
  status: string;
  finished_at?: string | null;
  message: string;
};

type LiveActivityResponse = {
  items: LiveActivityItem[];
};

const fallbackFeed: LiveActivityItem[] = [
  {
    order_ref: "ORD-DEMO",
    service_name: "Hidroizolatie",
    locality_slug: "bucuresti",
    status: "PAID",
    finished_at: new Date().toISOString(),
    message: "Hidroizolatie realizata cu SikaTop Seal-107 in Bucuresti",
  },
];

export function LiveActivityFeed() {
  const [items, setItems] = useState<LiveActivityItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/public/orders/live-feed`, {
          headers: GATE ? { "X-Gate-Authorization": GATE } : undefined,
        });
        if (!response.ok) {
          throw new Error("live-feed");
        }
        const payload = (await response.json()) as LiveActivityResponse;
        if (active) {
          setItems(payload.items ?? []);
        }
      } catch {
        if (active) {
          setItems(fallbackFeed);
        }
      }
    }

    void loadFeed();
    const timer = setInterval(loadFeed, 20000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="v3-live-feed">
      <div className="v3-card-kicker">Live de pe santier</div>
      <h3 className="v3-section-title">Activitate recenta</h3>
      <div className="v3-live-feed-list">
        {items.map((item) => (
          <div key={item.order_ref} className="v3-live-feed-row">
            <span className="v3-live-feed-status">{item.status}</span>
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
