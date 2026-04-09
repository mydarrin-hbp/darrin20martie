"use client";

import { useEffect, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import { AdminOrderReviewRecord, getBackofficeReviews, updateBackofficeReview } from "@/lib/api";

function ratingLabel(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<AdminOrderReviewRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadReviews() {
    if (!token) return;
    const data = await getBackofficeReviews(token);
    setReviews(data);
  }

  useEffect(() => {
    void loadReviews();
  }, [token]);

  async function handleToggle(review: AdminOrderReviewRecord, next: boolean) {
    if (!token) return;
    setError(null);
    setMessage(null);
    try {
      const updated = await updateBackofficeReview(token, review.id, { is_visible: next });
      setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setMessage("Recenzia a fost actualizata.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut actualiza recenzia.");
    }
  }

  async function handleNote(review: AdminOrderReviewRecord, note: string) {
    if (!token) return;
    setError(null);
    setMessage(null);
    try {
      const updated = await updateBackofficeReview(token, review.id, { admin_note: note });
      setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setMessage("Nota interna a fost salvata.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut salva nota.");
    }
  }

  return (
    <div>
      <ModuleHeader
        title="Recenzii & Rating"
        description="Moderare recenzii clienti pentru comenzi finalizate, cu control de vizibilitate si note interne."
        badge="P3 reviews"
      />

      <div className="mb-6 panel p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-muted">Manual operare</div>
        <div className="mt-3 text-sm text-muted">
          <div>1. Verifica rating-ul si feedback-ul pentru fiecare comanda finalizata.</div>
          <div>2. Foloseste `Ascunde public` atunci cand feedback-ul nu respecta criteriile QA.</div>
          <div>3. Completeaza `Nota interna` pentru justificari si audit intern.</div>
        </div>
      </div>

      {message ? <div className="mb-4 rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-muted">{message}</div> : null}
      {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="panel p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-ink">Feedback clienti</h2>
          <span className="tag">Live</span>
        </div>
        <div className="mt-4 grid gap-4">
          {reviews.length === 0 ? (
            <div className="text-sm text-muted">Nu exista recenzii inregistrate.</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">Comanda {review.order_ref}</div>
                    <div className="text-xs text-muted">{review.client_name ?? "Client public"}</div>
                  </div>
                  <span className="tag">{ratingLabel(review.rating)}</span>
                </div>
                <div className="mt-3 text-sm text-ink">{review.feedback}</div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className="field"
                    placeholder="Nota interna pentru QA"
                    defaultValue={review.admin_note ?? ""}
                    onBlur={(event) => void handleNote(review, event.target.value)}
                  />
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => void handleToggle(review, !review.is_visible)}
                  >
                    {review.is_visible ? "Ascunde public" : "Afiseaza public"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
