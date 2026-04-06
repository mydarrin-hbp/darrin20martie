"use client";

import { useState } from "react";

type AiMessage = {
  role: "user" | "assistant";
  content: string;
};

export function PublicAiDarrinChat({ defaultServiceSlug }: { defaultServiceSlug?: string }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${apiBase}/api/v1/ai/public/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          service_slug: defaultServiceSlug,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail ?? "Eroare AI.");
      }

      const summary = payload?.client_explanation || payload?.interpreted_summary || "AI Darrin a analizat cererea.";
      setMessages((prev) => [...prev, { role: "assistant", content: summary }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la AI Darrin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="v3-section-card">
      <div className="v3-eyebrow">AI Darrin Live</div>
      <h2 className="v3-section-title">Chat direct pentru clienti</h2>
      <p className="v3-page-description">
        Descrie problema ta in cateva cuvinte. AI Darrin interpreteaza cererea folosind baza de date My Darrin si propune urmatorii pasi.
      </p>

      <div className="mt-6 grid gap-4">
        <div className="rounded-3xl border border-border bg-white/80 p-4">
          {messages.length === 0 ? (
            <div className="text-sm text-muted">Scrie primul mesaj pentru a incepe conversatia.</div>
          ) : (
            <div className="grid gap-3">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`rounded-2xl px-4 py-3 text-sm ${item.role === "user" ? "bg-[#1E2E4D] text-white" : "bg-[#F4F6FA] text-ink"}`}
                >
                  {item.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <textarea
            className="v3-form-control min-h-28"
            placeholder="Ex: Caloriferul din apartament curge, am nevoie de interventie azi."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button className="v3-primary-button" type="button" onClick={sendMessage} disabled={loading}>
            {loading ? "Analizeaza..." : "Trimite catre Darrin"}
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
