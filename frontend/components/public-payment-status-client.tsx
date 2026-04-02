"use client";

import { useEffect, useMemo, useState } from "react";

import type { PublicOrderStatusSnapshot } from "@/lib/site-content";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

function statusTone(status?: string | null) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized.includes("PAID") || normalized.includes("APPROVED") || normalized.includes("CONFIRMED")) {
    return "success";
  }
  if (normalized.includes("FAILED") || normalized.includes("CANCEL") || normalized.includes("REJECT")) {
    return "warning";
  }
  return "default";
}

export function PublicPaymentStatusClient({
  orderRef,
  initialStatus,
}: {
  orderRef: string;
  initialStatus: PublicOrderStatusSnapshot | null;
}) {
  const [status, setStatus] = useState<PublicOrderStatusSnapshot | null>(initialStatus);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderRef) {
      return;
    }
    let active = true;
    let intervalId: number | null = null;

    async function poll() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/public/sync/order-status/${orderRef}`, {
          headers: GATE ? { "X-Gate-Authorization": GATE } : undefined,
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as PublicOrderStatusSnapshot;
        if (active) {
          setStatus(payload);
          setError(null);
        }
      } catch (pollError) {
        if (active) {
          setError(pollError instanceof Error ? pollError.message : "Nu am putut incarca statusul.");
        }
      }
    }

    void poll();
    intervalId = window.setInterval(() => void poll(), 5000);
    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [orderRef]);

  const tone = statusTone(status?.status);
  const statusClass =
    tone === "success" ? "v3-status-card v3-status-card-success" : "v3-status-card";

  const updatedAtLabel = useMemo(() => {
    if (!status?.updated_at) return "Actualizare: in asteptare";
    const date = new Date(status.updated_at);
    if (Number.isNaN(date.getTime())) {
      return `Actualizare: ${status.updated_at}`;
    }
    return `Actualizare: ${date.toLocaleString("ro-RO")}`;
  }, [status?.updated_at]);

  return (
    <div className="v3-status-grid">
      <article className={statusClass}>
        <div className="v3-status-label">{status?.status ?? "PENDING"}</div>
        <div className="v3-service-title">Status comanda {orderRef}</div>
        <p>{status?.message ?? "Urmarim tranzactia in timp real."}</p>
        <div className="v3-inline-note">{updatedAtLabel}</div>
      </article>
      <article className="v3-status-card">
        <div className="v3-status-label">SYNC</div>
        <div className="v3-service-title">Backoffice live</div>
        <p>
          {status?.provider_name
            ? `Operator: ${status.provider_name} (${status.provider_ref ?? "ID intern"})`
            : "Comanda este vizibila in Backoffice pentru monitorizare completa."}
        </p>
        {error ? <div className="v3-warning-note">{error}</div> : null}
      </article>
    </div>
  );
}
