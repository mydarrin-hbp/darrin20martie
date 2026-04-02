"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import {
  AdminOrderDetail,
  AdminOrderSummary,
  assignBackofficeOrderProvider,
  getBackofficeOrderDocuments,
  getBackofficeOrder,
  getBackofficeOrders,
  OrderDocumentRecord,
  updateBackofficeOrderStatus,
} from "@/lib/api";

const STATUS_OPTIONS = [
  "PENDING_PROVIDER_SELECTION",
  "SEARCHING_PROVIDER",
  "ASSIGNED",
  "IN_PROGRESS",
  "PAID",
  "COMPLETED",
  "CANCELLED",
];

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(amount);
}

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [documents, setDocuments] = useState<OrderDocumentRecord[]>([]);
  const [statusValue, setStatusValue] = useState("");
  const [providerRef, setProviderRef] = useState("");
  const [providerName, setProviderName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    if (!token) return;
    const data = await getBackofficeOrders(token);
    setOrders(data);
    if (!selectedId && data.length) {
      setSelectedId(data[0].id);
    }
  }

  async function loadDetail(orderId: number) {
    if (!token) return;
    const data = await getBackofficeOrder(token, orderId);
    setDetail(data);
    setStatusValue(data.status);
    setProviderRef(data.provider_ref ?? "");
    setProviderName(data.provider_name ?? "");
    const docs = await getBackofficeOrderDocuments(token, orderId);
    setDocuments(docs);
  }

  useEffect(() => {
    void loadOrders();
  }, [token]);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    }
  }, [selectedId]);

  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((item) => item.status !== "COMPLETED" && item.status !== "CANCELLED").length;
    const revenue = orders.reduce((sum, item) => sum + (item.total_facturabil || 0), 0);
    return { total, active, revenue };
  }, [orders]);

  async function handleStatusUpdate() {
    if (!token || !detail) return;
    setError("");
    setMessage("");
    try {
      const updated = await updateBackofficeOrderStatus(token, detail.id, {
        status: statusValue,
        provider_ref: providerRef || null,
        provider_name: providerName || null,
        message: "Status actualizat din Backoffice.",
      });
      setDetail(updated);
      setMessage("Statusul a fost actualizat.");
      await loadOrders();
      await loadDetail(updated.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut actualiza statusul.");
    }
  }

  async function handleAssign() {
    if (!token || !detail) return;
    setError("");
    setMessage("");
    try {
      const updated = await assignBackofficeOrderProvider(token, detail.id, {
        provider_ref: providerRef || null,
        provider_name: providerName || null,
      });
      setDetail(updated);
      setMessage("Furnizorul a fost alocat.");
      await loadOrders();
      await loadDetail(updated.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut aloca furnizorul.");
    }
  }

  async function handleDownload(doc: OrderDocumentRecord) {
    if (!token) return;
    setError("");
    try {
      const response = await fetch(`/api/proxy/api/v1/backoffice/orders/${detail?.id}/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Descarcare esuata");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.file_name || "document.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut descarca documentul.");
    }
  }

  async function handleExport(path: string, filename: string) {
    if (!token) return;
    setError("");
    try {
      const response = await fetch(`/api/proxy${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Export esuat");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut exporta datele.");
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Order Management & Execution"
        description="Panou operational pentru comenzi, statusuri, alocari si sincronizare in timp real cu clientii."
        badge="Orders live"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="text-sm text-muted">Comenzi totale</div>
          <div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div>
        </div>
        <div className="panel p-5">
          <div className="text-sm text-muted">Comenzi active</div>
          <div className="mt-3 text-3xl font-semibold text-ink">{stats.active}</div>
        </div>
        <div className="panel p-5">
          <div className="text-sm text-muted">Valoare cumulata</div>
          <div className="mt-3 text-3xl font-semibold text-ink">{formatCurrency(stats.revenue, "RON")}</div>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <button className="btn-secondary" type="button" onClick={() => void handleExport("/api/v1/backoffice/orders/export", "orders-export.csv")}>
          Export comenzi CSV
        </button>
        <button className="btn-secondary" type="button" onClick={() => void handleExport("/api/v1/backoffice/orders/documents/export", "order-documents-export.csv")}>
          Export facturi CSV
        </button>
      </div>

      {message ? <div className="mb-4 rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-muted">{message}</div> : null}
      {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Comenzi primite</h2>
            <span className="tag">Live</span>
          </div>
          <div className="mt-5 grid gap-3">
            {orders.length === 0 ? (
              <div className="text-sm text-muted">Nu exista comenzi inregistrate.</div>
            ) : null}
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={`rounded-2xl border p-4 text-left transition ${selectedId === order.id ? "border-accent bg-white" : "border-border bg-white/70"}`}
                onClick={() => setSelectedId(order.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">{order.order_ref}</div>
                    <div className="mt-1 text-sm text-muted">{order.service_name}</div>
                  </div>
                  <span className="tag">{order.status}</span>
                </div>
                <div className="mt-3 text-sm text-muted">{order.target_address}</div>
                <div className="mt-2 text-sm text-ink">{formatCurrency(order.total_facturabil, order.currency)}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Detalii comanda</h2>
            {detail ? <span className="tag">{detail.status}</span> : null}
          </div>

          {!detail ? (
            <div className="mt-5 text-sm text-muted">Selecteaza o comanda pentru detalii.</div>
          ) : (
            <div className="mt-5 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Client</div>
                  <div className="mt-2 text-sm text-ink">{detail.client_name ?? "Client public"}</div>
                  <div className="text-xs text-muted">{detail.client_email ?? "Fara email asociat"}</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Service</div>
                  <div className="mt-2 text-sm text-ink">{detail.service_name}</div>
                  <div className="text-xs text-muted">{detail.asset_label ?? "N/A"}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Locatie</div>
                <div className="mt-2 text-sm text-ink">{detail.target_address}</div>
                <div className="text-xs text-muted">{detail.locality_slug ?? "Zona necunoscuta"}</div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Valoare</div>
                  <div className="mt-2 text-lg font-semibold text-ink">{formatCurrency(detail.total_facturabil, detail.currency)}</div>
                  <div className="text-xs text-muted">TVA: {detail.tva.toFixed(2)} {detail.currency}</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Escrow</div>
                  <div className="mt-2 text-sm text-ink">{detail.escrow_status}</div>
                  <div className="text-xs text-muted">Blocat: {detail.escrow_blocked_amount.toFixed(2)} {detail.currency}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Alocare furnizor</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input className="field" placeholder="Provider ref" value={providerRef} onChange={(event) => setProviderRef(event.target.value)} />
                  <input className="field" placeholder="Provider name" value={providerName} onChange={(event) => setProviderName(event.target.value)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="btn-secondary" type="button" onClick={() => void handleAssign()}>
                    Aloca furnizor
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Status comanda</div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                  <select className="field" value={statusValue} onChange={(event) => setStatusValue(event.target.value)}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button className="btn-primary" type="button" onClick={() => void handleStatusUpdate()}>
                    Actualizeaza status
                  </button>
                </div>
                <div className="mt-3 text-xs text-muted">
                  Ultima actualizare: {detail.updated_at ? new Date(detail.updated_at).toLocaleString("ro-RO") : "N/A"}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Documente / Facturi</div>
                {documents.length === 0 ? (
                  <div className="mt-3 text-sm text-muted">Nu exista documente generate pentru comanda.</div>
                ) : (
                  <div className="mt-3 grid gap-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3">
                        <div>
                          <div className="text-sm font-semibold text-ink">{doc.document_type}</div>
                          <div className="text-xs text-muted">{doc.file_name}</div>
                        </div>
                        <button className="btn-secondary" type="button" onClick={() => void handleDownload(doc)}>
                          Descarca PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
