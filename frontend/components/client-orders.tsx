"use client";

import { useEffect, useState } from "react";

type ClientOrderSummary = {
  order_ref: string;
  status: string;
  service_name: string;
  total_facturabil: number;
  currency: string;
  target_address: string;
  locality_slug?: string | null;
  provider_ref?: string | null;
  provider_name?: string | null;
  created_at: string;
  updated_at?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

export function ClientOrders() {
  const [orders, setOrders] = useState<ClientOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let intervalId: number | null = null;
    const token = typeof window !== "undefined" ? window.localStorage.getItem("mydarrin_client_auth") : null;

    async function load() {
      if (!token) {
        if (active) {
          setLoading(false);
          setError("Te rugam sa te autentifici pentru a vedea comenzile tale.");
        }
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/v1/orders/my`, {
          headers: {
            ...(GATE ? { "X-Gate-Authorization": GATE } : {}),
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        const payload = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(payload?.detail ?? "Nu am putut incarca comenzile.");
        }
        if (active) {
          setOrders(payload as ClientOrderSummary[]);
          setError(null);
          setLoading(false);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Nu am putut incarca comenzile.");
          setLoading(false);
        }
      }
    }

    void load();
    intervalId = window.setInterval(() => void load(), 5000);

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  if (loading) {
    return <div className="v3-inline-note">Se incarca istoricul comenzilor...</div>;
  }

  if (error) {
    return <div className="v3-warning-note">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="v3-inline-note">Nu exista comenzi inregistrate pentru contul tau.</div>;
  }

  return (
    <div className="v3-cart-grid">
      {orders.map((order) => (
        <a key={order.order_ref} href={`/my-account/orders/${order.order_ref}`} className="v3-cart-card">
          <div className="v3-cart-media v3-service-accent-navy">ORD</div>
          <div>
            <div className="v3-service-title">{order.service_name}</div>
            <p>{order.target_address}</p>
            <div className="v3-inline-note">Status: {order.status}</div>
          </div>
          <div className="v3-price-text">
            {order.total_facturabil.toFixed(2)} {order.currency}
          </div>
        </a>
      ))}
    </div>
  );
}
