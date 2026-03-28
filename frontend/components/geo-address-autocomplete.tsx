"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Prediction = {
  place_id: string;
  description: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export function GeoAddressAutocomplete({
  label = "Adresa prestare",
  placeholder = "Introdu adresa exacta de executie",
  helperText,
}: {
  label?: string;
  placeholder?: string;
  helperText?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("target_address") ?? "");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, startTransition] = useTransition();

  const backendUrl = useMemo(() => `${API_BASE}/api/v1/public/geo-fiscal`, []);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 3) {
      setPredictions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`${backendUrl}/autocomplete?q=${encodeURIComponent(trimmed)}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          setPredictions([]);
          return;
        }
        const payload = (await response.json()) as { predictions?: Prediction[] };
        setPredictions(payload.predictions ?? []);
      } catch {
        setPredictions([]);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [backendUrl, inputValue]);

  const applySelection = (prediction: Prediction) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("target_address", prediction.description);
    params.set("place_id", prediction.place_id);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setInputValue(prediction.description);
      setPredictions([]);
    });
  };

  return (
    <div className="v3-address-autocomplete">
      <label className="v3-form-field">
        <span>{label}</span>
        <input
          className="v3-form-control v3-form-control-rect"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </label>
      {helperText ? <div className="v3-inline-note">{helperText}</div> : null}
      {loading ? <div className="v3-inline-note">Actualizam pretul pentru coordonatele selectate...</div> : null}
      {predictions.length ? (
        <div className="v3-address-suggestions">
          {predictions.map((prediction) => (
            <button
              type="button"
              key={prediction.place_id}
              className="v3-address-suggestion"
              onClick={() => applySelection(prediction)}
            >
              {prediction.description}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
