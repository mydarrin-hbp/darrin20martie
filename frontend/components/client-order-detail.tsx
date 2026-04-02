"use client";

import { useEffect, useState } from "react";

type ClientOrderDetail = {
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
  cost_direct: number;
  cost_regie: number;
  mentenanta_platforma: number;
  venit_platforma: number;
  garantie_buna_executie: number;
  insurance_premium: number;
  darrin_management_fee: number;
  tva: number;
  escrow_status: string;
  escrow_blocked_amount: number;
  asset_label?: string | null;
  intervention_label?: string | null;
  task_label?: string | null;
  skill_label?: string | null;
  required_people?: number | null;
};

type OrderDocument = {
  id: number;
  document_type: string;
  file_name: string;
  generated_at: string;
};

type OrderReview = {
  id: number;
  order_ref: string;
  rating: number;
  feedback: string;
  is_visible: boolean;
  admin_note?: string | null;
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

export function ClientOrderDetailPanel({ orderRef }: { orderRef: string }) {
  const [detail, setDetail] = useState<ClientOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<OrderDocument[]>([]);
  const [review, setReview] = useState<OrderReview | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let intervalId: number | null = null;
    const token = typeof window !== "undefined" ? window.localStorage.getItem("mydarrin_client_auth") : null;

    async function load() {
      if (!token) {
        if (active) {
          setError("Te rugam sa te autentifici pentru a vedea detaliile comenzii.");
        }
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/v1/orders/${orderRef}`, {
          headers: {
            ...(GATE ? { "X-Gate-Authorization": GATE } : {}),
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.detail ?? "Nu am putut incarca comanda.");
        }
        if (active) {
          setDetail(payload as ClientOrderDetail);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Nu am putut incarca comanda.");
        }
      }
    }

    async function loadDocuments() {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE}/api/v1/orders/${orderRef}/documents`, {
          headers: {
            ...(GATE ? { "X-Gate-Authorization": GATE } : {}),
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        const payload = await response.json().catch(() => []);
        if (!response.ok) {
          return;
        }
        if (active) {
          setDocuments(payload as OrderDocument[]);
        }
      } catch {
        if (active) {
          setDocuments([]);
        }
      }
    }

    async function loadReview() {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE}/api/v1/orders/${orderRef}/review`, {
          headers: {
            ...(GATE ? { "X-Gate-Authorization": GATE } : {}),
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (response.status === 404) {
          if (active) {
            setReview(null);
          }
          return;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          return;
        }
        if (active) {
          setReview(payload as OrderReview);
        }
      } catch {
        if (active) {
          setReview(null);
        }
      }
    }

    void load();
    void loadDocuments();
    void loadReview();
    intervalId = window.setInterval(() => {
      void load();
      void loadDocuments();
    }, 5000);
    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [orderRef]);

  async function handleDownload(doc: OrderDocument) {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("mydarrin_client_auth") : null;
    if (!token) {
      setError("Te rugam sa te autentifici pentru descarcare.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/v1/orders/${orderRef}/documents/${doc.id}/download`, {
        headers: {
          ...(GATE ? { "X-Gate-Authorization": GATE } : {}),
          Authorization: `Bearer ${token}`,
        },
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

  async function handleSubmitReview() {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("mydarrin_client_auth") : null;
    if (!token) {
      setReviewMessage("Te rugam sa te autentifici pentru a lasa o recenzie.");
      return;
    }
    setReviewMessage(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/orders/${orderRef}/review`, {
        method: "POST",
        headers: {
          ...(GATE ? { "X-Gate-Authorization": GATE } : {}),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, feedback }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail ?? "Nu am putut trimite recenzia.");
      }
      setReview(payload as OrderReview);
      setReviewMessage("Recenzia ta a fost trimisa. Multumim!");
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : "Nu am putut trimite recenzia.");
    }
  }

  if (error) {
    return <div className="v3-warning-note">{error}</div>;
  }

  if (!detail) {
    return <div className="v3-inline-note">Se incarca detaliile comenzii...</div>;
  }

  return (
    <div className="v3-section-card">
      <div className="v3-page-hero">
        <div>
          <div className="v3-eyebrow">Comanda {detail.order_ref}</div>
          <h1 className="v3-page-title">{detail.service_name}</h1>
          <p className="v3-page-description">{detail.target_address}</p>
        </div>
      </div>
      <div className="v3-checkout-summary">
        <div>
          <span>Total</span>
          <strong>
            {detail.total_facturabil.toFixed(2)} {detail.currency}
          </strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{detail.status}</strong>
        </div>
      </div>
      <div className="v3-inline-note">
        Furnizor: {detail.provider_name ?? "In alocare"} {detail.provider_ref ? `(${detail.provider_ref})` : ""}
      </div>

      <div className="v3-section-card mt-6">
        <div className="v3-section-title">Facturi & Documente</div>
        {documents.length === 0 ? (
          <div className="v3-inline-note">Nu exista documente disponibile inca.</div>
        ) : (
          <div className="v3-cart-grid">
            {documents.map((doc) => (
              <button key={doc.id} className="v3-cart-card" type="button" onClick={() => void handleDownload(doc)}>
                <div className="v3-cart-media v3-service-accent-coral">PDF</div>
                <div>
                  <div className="v3-service-title">{doc.document_type}</div>
                  <p>{doc.file_name}</p>
                  <div className="v3-inline-note">Genereaza: {new Date(doc.generated_at).toLocaleDateString("ro-RO")}</div>
                </div>
                <div className="v3-price-text">Descarca</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="v3-section-card mt-6">
        <div className="v3-section-title">Recenzie comanda</div>
        {review ? (
          <div>
            <div className="v3-inline-note">Rating: {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
            <p>{review.feedback}</p>
          </div>
        ) : detail.status === "PAID" || detail.status === "COMPLETED" ? (
          <div className="v3-form-grid">
            <label className="v3-form-field">
              <span>Rating</span>
              <select className="v3-form-input" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="v3-form-field">
              <span>Feedback</span>
              <textarea className="v3-form-input" value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} />
            </label>
            {reviewMessage ? <div className="v3-inline-note">{reviewMessage}</div> : null}
            <button className="v3-primary-button" type="button" onClick={() => void handleSubmitReview()}>
              Trimite recenzia
            </button>
          </div>
        ) : (
          <div className="v3-inline-note">Poti lasa o recenzie dupa finalizarea comenzii.</div>
        )}
      </div>
    </div>
  );
}
