"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { publicServiceCatalog } from "@/lib/public-site";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const BACKEND_GATE_AUTHORIZATION = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

function parseEscrowPercent(note: string | null | undefined) {
  if (!note) {
    return 0;
  }
  const match = note.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!match) {
    return 0;
  }
  return Number(match[1].replace(",", "."));
}

export function PublicCheckoutSubmit() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const checkoutContext = useMemo(() => {
    const slug = searchParams.get("slug") ?? "reparat-calorifer";
    const interventionLabel = searchParams.get("intervention") ?? "";
    const targetAddress = searchParams.get("target_address") ?? "";
    const placeId = searchParams.get("place_id") ?? "";
    const requestedQuantityParam = searchParams.get("requested_quantity");
    const requestedQuantity = requestedQuantityParam ? Number(requestedQuantityParam) : undefined;
    const escrowRetention = parseEscrowPercent(searchParams.get("escrow_note"));
    const service = publicServiceCatalog.find((item) => item.slug === slug) ?? publicServiceCatalog[0];
    const selectedIntervention =
      service.availableInterventions?.find((item) => item.label === interventionLabel) ?? service.availableInterventions?.[0];

    return {
      slug,
      targetAddress,
      placeId,
      requestedQuantity,
      escrowRetention,
      service,
      selectedIntervention,
    };
  }, [searchParams]);

  async function handleConfirmOrder() {
    setError("");
    setMessage("");
    if (!checkoutContext.selectedIntervention?.label) {
      setError("Selecteaza tipul de interventie inainte sa trimiti comanda.");
      return;
    }
    if (!checkoutContext.targetAddress.trim()) {
      setError("Selecteaza adresa exacta de executie inainte sa trimiti comanda.");
      return;
    }

    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("mydarrin_client_auth") : null;
      const endpoint = token ? "/api/v1/orders" : "/api/v1/public/orders";
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(BACKEND_GATE_AUTHORIZATION ? { "X-Gate-Authorization": BACKEND_GATE_AUTHORIZATION } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
        body: JSON.stringify({
          slug: checkoutContext.slug,
          target_address: checkoutContext.targetAddress,
          place_id: checkoutContext.placeId || null,
          requested_quantity: checkoutContext.requestedQuantity,
          asset_label: checkoutContext.service.objectLabel ?? checkoutContext.service.title,
          intervention_label: checkoutContext.selectedIntervention.label,
          task_label: checkoutContext.selectedIntervention.taskLabel,
          skill_label: checkoutContext.selectedIntervention.skill,
          required_people: checkoutContext.selectedIntervention.requiredPeople,
          esco_codes: checkoutContext.selectedIntervention.escoCodes,
          nace_codes: checkoutContext.selectedIntervention.naceCodes,
          required_certification_codes:
            checkoutContext.selectedIntervention.label === "Inlocuire" || checkoutContext.selectedIntervention.label === "Montaj"
              ? ["GAS_AUTH", "ISCIR_AUTH"]
              : ["GAS_AUTH"],
          standard_consumables: [],
          escrow_retention: checkoutContext.escrowRetention,
        }),
      });
      const payload = await response.json().catch(() => ({ detail: "Request failed" }));
      if (!response.ok) {
        throw new Error(payload.detail ?? "Nu am putut crea comanda.");
      }
      setMessage(`Comanda ${payload.order_ref ?? ""} a fost creata.`);
      router.push(`/payment-status?order_ref=${encodeURIComponent(payload.order_ref ?? "")}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nu am putut crea comanda.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="v3-final-actions v3-final-actions-stacked">
      <button type="button" className="v3-primary-button" onClick={() => void handleConfirmOrder()} disabled={submitting}>
        {submitting ? "Se creeaza comanda..." : "Confirma comanda"}
      </button>
      {message ? <div className="v3-inline-note">{message}</div> : null}
      {error ? <div className="v3-warning-note">{error}</div> : null}
      {!checkoutContext.selectedIntervention?.label ? (
        <div className="v3-warning-note">Ontologia de obiect este obligatorie. Alege o interventie din pagina serviciului.</div>
      ) : null}
    </div>
  );
}
