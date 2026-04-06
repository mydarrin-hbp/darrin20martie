"use client";

import { useEffect, useMemo, useState } from "react";

type CheckoutDraft = {
  contactName: string;
  contactPhone: string;
  accessWindow: string;
  technicalNotes: string;
};

const STORAGE_KEY = "mydarrin_checkout_draft";

function readDraft(): CheckoutDraft {
  if (typeof window === "undefined") {
    return { contactName: "", contactPhone: "", accessWindow: "", technicalNotes: "" };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { contactName: "", contactPhone: "", accessWindow: "", technicalNotes: "" };
    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      contactName: parsed.contactName ?? "",
      contactPhone: parsed.contactPhone ?? "",
      accessWindow: parsed.accessWindow ?? "",
      technicalNotes: parsed.technicalNotes ?? "",
    };
  } catch {
    return { contactName: "", contactPhone: "", accessWindow: "", technicalNotes: "" };
  }
}

function writeDraft(draft: CheckoutDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function PublicCheckoutFields() {
  const initial = useMemo(readDraft, []);
  const [draft, setDraft] = useState<CheckoutDraft>(initial);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    writeDraft(draft);
    setSavedAt(new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }));
  }, [draft]);

  return (
    <div className="v3-form-grid">
      <div className="v3-inline-note v3-inline-note-soft">
        Datele se salveaza automat pentru a evita pierderea informatiilor in caz de refresh.
        {savedAt ? ` Ultima salvare: ${savedAt}.` : ""}
      </div>
      <label className="v3-form-field">
        <span>Persoana de contact</span>
        <input
          className="v3-form-control v3-form-control-rect"
          value={draft.contactName}
          onChange={(event) => setDraft((current) => ({ ...current, contactName: event.target.value }))}
          placeholder="Nume si prenume"
        />
      </label>
      <label className="v3-form-field">
        <span>Telefon</span>
        <input
          className="v3-form-control v3-form-control-rect"
          value={draft.contactPhone}
          onChange={(event) => setDraft((current) => ({ ...current, contactPhone: event.target.value }))}
          placeholder="+40 7xx xxx xxx"
        />
      </label>
      <label className="v3-form-field">
        <span>Interval orar acces</span>
        <input
          className="v3-form-control v3-form-control-rect"
          value={draft.accessWindow}
          onChange={(event) => setDraft((current) => ({ ...current, accessWindow: event.target.value }))}
          placeholder="Ex: 08:00 - 12:00"
        />
      </label>
      <label className="v3-form-field v3-form-field-full">
        <span>Observatii tehnice</span>
        <textarea
          className="v3-form-control v3-form-control-rect min-h-24"
          value={draft.technicalNotes}
          onChange={(event) => setDraft((current) => ({ ...current, technicalNotes: event.target.value }))}
          placeholder="Ex: etaj 4, fara lift, acces lateral"
        />
      </label>
    </div>
  );
}

export function PublicCheckoutDraftSummary() {
  const [draft, setDraft] = useState<CheckoutDraft>(() => ({ contactName: "", contactPhone: "", accessWindow: "", technicalNotes: "" }));

  useEffect(() => {
    setDraft(readDraft());
    const handler = () => setDraft(readDraft());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <div className="v3-inline-note v3-inline-note-soft">
      <div><strong>Contact:</strong> {draft.contactName || "Nesetat"} · {draft.contactPhone || "Nesetat"}</div>
      <div><strong>Interval acces:</strong> {draft.accessWindow || "Nesetat"}</div>
      <div><strong>Observatii:</strong> {draft.technicalNotes || "Nesetat"}</div>
    </div>
  );
}
