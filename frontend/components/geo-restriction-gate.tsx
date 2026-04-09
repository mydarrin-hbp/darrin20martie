"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type RegionStatus = {
  country_code: string;
  supported: boolean;
  message?: string | null;
  partner_signup_href: string;
  investor_signup_href: string;
};

export function GeoRestrictionGate() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<RegionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const endpoint = useMemo(() => `${API_BASE}/api/v1/public/geo-fiscal/region-status`, []);

  useEffect(() => {
    if (searchParams.get("edit_mode") === "1") {
      return;
    }
    let active = true;
    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as RegionStatus;
      })
      .then((payload) => {
        if (active && payload) {
          setStatus(payload);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [endpoint, searchParams]);

  if (!status || status.supported || dismissed || searchParams.get("edit_mode") === "1") {
    return null;
  }

  const adminHref = "/account/create/administrare";
  const aiHref = "/account";

  return (
    <div className="v3-geo-gate-backdrop">
      <div className="v3-geo-gate-modal">
        <div className="v3-card-kicker">Disponibilitate regionala</div>
        <h2 className="v3-geo-gate-title">My Darrin nu a ajuns inca la tine</h2>
        <p className="v3-muted-copy">Serviciile nu sunt încă disponibile la adresa ta.</p>
        {status.message ? <div className="v3-inline-note">{status.message}</div> : null}
        <div className="v3-pill-row">
          <span className="v3-mini-badge">Tara detectata: {status.country_code}</span>
          <span className="v3-mini-badge">Acces parteneri si investitori activ</span>
        </div>
        <div className="v3-geo-gate-actions">
          <Link href={status.partner_signup_href} className="v3-primary-button">
            Devino partener
          </Link>
          <Link href={status.investor_signup_href} className="v3-dark-button">
            Devino investitor
          </Link>
          <Link href={adminHref} className="v3-ghost-chip">
            Admin My Darrin
          </Link>
          <Link href={aiHref} className="v3-ghost-chip">
            AI Darrin
          </Link>
        </div>
        <button type="button" className="v3-geo-gate-dismiss" onClick={() => setDismissed(true)}>
          Continua in modul preview
        </button>
      </div>
    </div>
  );
}
