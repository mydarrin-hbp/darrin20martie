"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { publicMaterialPivotMap, publicServiceCatalog } from "@/lib/public-site";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const CART_KEY = "mydarrin_cart_session";

type CartItem = {
  id: number;
  item_type: string;
  slug: string;
  title: string;
  category?: string | null;
  quantity: number;
  wants_installation: boolean;
  wants_delivery: boolean;
};

type CartResponse = {
  session_token: string;
  expires_at: string;
  rideshare_eligible: boolean;
  rideshare_providers: number;
  items: CartItem[];
};

type PublicRateCardSummary = {
  currency: string;
  base_price: number;
  legislation_code?: string | null;
  country_id?: number | null;
  zone_id?: number | null;
  is_active?: boolean;
};

type PublicCatalogServiceCard = {
  id: number;
  slug: string;
  name: string;
  rate_card?: PublicRateCardSummary | null;
};

type CartDevizResource = {
  resource_type: string;
  name: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  esco_code?: string | null;
};

type CartDevizPreview = {
  service_id: number;
  currency: string;
  cost_direct_total: number;
  indirect_costs: number;
  platform_maintenance: number;
  mydarrin_platform: number;
  vat_value: number;
  gross_total: number;
  resources: Record<string, CartDevizResource[]>;
};

function resolveInstallationService(materialSlug: string) {
  const pivotKey = Object.keys(publicMaterialPivotMap).find((key) => materialSlug.includes(key)) ?? null;
  if (!pivotKey) return null;
  const pivot = publicMaterialPivotMap[pivotKey];
  if (!pivot?.actions?.includes("Montaj")) return null;
  const keyword = pivot.label.split(" ")[0]?.toLowerCase();
  const match = publicServiceCatalog.find((service) =>
    service.objectLabel?.toLowerCase().includes(keyword ?? "")
  );
  return match ?? publicServiceCatalog[0];
}

function buildPackageBreakdown(serviceSlug: string) {
  const service = publicServiceCatalog.find((item) => item.slug === serviceSlug);
  if (!service) {
    return {
      title: serviceSlug,
      activities: [],
      materials: [],
      equipment: [],
      transport: ["Transport operational (estimare)"],
      indirectCosts: ["Regie & management My Darrin"],
      classifications: null,
    };
  }

  const activities = service.availableInterventions?.length
    ? service.availableInterventions.map((item) => `${item.label} · ${item.taskLabel}`)
    : ["Manopera standard (conform deviz)"];
  const materials = service.objectLabel
    ? [`Materiale pentru ${service.objectLabel}`, "Consumabile standard (din deviz)"]
    : ["Materiale standard (din deviz)"];
  const equipment = service.slug.includes("montaj") || service.slug.includes("instal")
    ? ["Echipamente specializate", "Utilaje rental (daca este cazul)"]
    : ["Utilaje / echipamente (daca este cazul)"];

  return {
    title: service.title,
    activities,
    materials,
    equipment,
    transport: ["Transport & logistica (din deviz)"],
    indirectCosts: ["Costuri indirecte + management (din deviz)"],
    classifications: service.classifications ?? null,
  };
}

export function PublicCartClient({
  fallbackItems,
}: {
  fallbackItems: Array<{
    slug: string;
    title: string;
    category?: string | null;
    summary?: string;
    mediaType?: string;
    accent?: string;
    startingPrice?: string;
  }>;
}) {
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [devizByItem, setDevizByItem] = useState<Record<number, CartDevizPreview | null>>({});
  const [materialDevizByItem, setMaterialDevizByItem] = useState<Record<number, CartDevizPreview | null>>({});
  const [devizErrors, setDevizErrors] = useState<Record<number, string>>({});
  const [materialDevizErrors, setMaterialDevizErrors] = useState<Record<number, string>>({});

  const groupedItems = useMemo(() => {
    if (!cart?.items?.length) {
      return [];
    }
    const map = new Map<string, CartItem[]>();
    cart.items.forEach((item) => {
      const key = item.category || "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    });
    return Array.from(map.entries());
  }, [cart]);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("ro-RO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    []
  );

  const cartTotals = useMemo(() => {
    const totals = {
      currency: "RON",
      gross_total: 0,
      vat_value: 0,
      indirect_costs: 0,
      platform_maintenance: 0,
      mydarrin_platform: 0,
      cost_direct_total: 0,
    };
    const devizList = [
      ...Object.values(devizByItem).filter((item): item is CartDevizPreview => Boolean(item)),
      ...Object.values(materialDevizByItem).filter((item): item is CartDevizPreview => Boolean(item)),
    ];
    if (!devizList.length) return totals;
    totals.currency = devizList[0].currency;
    devizList.forEach((deviz) => {
      totals.gross_total += deviz.gross_total;
      totals.vat_value += deviz.vat_value;
      totals.indirect_costs += deviz.indirect_costs;
      totals.platform_maintenance += deviz.platform_maintenance;
      totals.mydarrin_platform += deviz.mydarrin_platform;
      totals.cost_direct_total += deviz.cost_direct_total;
    });
    return totals;
  }, [devizByItem, materialDevizByItem]);

  async function ensureSession() {
    const cached = window.localStorage.getItem(CART_KEY);
    const response = await fetch(`${API_BASE}/api/v1/public/cart/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_token: cached }),
    });
    const payload = await response.json();
    if (payload.session_token) {
      window.localStorage.setItem(CART_KEY, payload.session_token);
      return payload.session_token as string;
    }
    return cached ?? "";
  }

  async function fetchCart(sessionToken: string) {
    const response = await fetch(`${API_BASE}/api/v1/public/cart?session_token=${encodeURIComponent(sessionToken)}`);
    const payload = (await response.json()) as CartResponse;
    setCart(payload);
  }

  async function upsertItem(sessionToken: string, item: Partial<CartItem> & { slug: string; title: string; item_type: string }) {
    await fetch(`${API_BASE}/api/v1/public/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_token: sessionToken,
        item_type: item.item_type,
        slug: item.slug,
        title: item.title,
        category: item.category,
        quantity: item.quantity ?? 1,
        wants_installation: item.wants_installation ?? false,
        wants_delivery: item.wants_delivery ?? false,
      }),
    });
    await fetchCart(sessionToken);
  }

  async function fetchServiceCard(slug: string) {
    const response = await fetch(`${API_BASE}/api/v1/public/catalog/services/${slug}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PublicCatalogServiceCard;
  }

  async function fetchDevizPreview(serviceCard: PublicCatalogServiceCard, quantity: number) {
    const rateCard = serviceCard.rate_card;
    const payload = {
      service_id: serviceCard.id,
      country_id: rateCard?.country_id ?? 1,
      zone_id: rateCard?.zone_id ?? 1,
      currency: rateCard?.currency ?? "RON",
      legislation_code: rateCard?.legislation_code ?? "RO",
      requested_quantity: quantity,
    };
    const response = await fetch(`${API_BASE}/api/v1/public/cart/deviz-preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as CartDevizPreview;
  }

  function exportDevizPdf() {
    if (!cart) return;
    const devizList = [
      ...Object.entries(devizByItem).map(([id, deviz]) => ({ id: Number(id), deviz })),
      ...Object.entries(materialDevizByItem).map(([id, deviz]) => ({ id: Number(id), deviz })),
    ].filter((entry) => entry.deviz);
    if (!devizList.length) return;

    const now = new Date();
    const currency = cartTotals.currency;
    const rowsHtml = devizList
      .map(({ id, deviz }) => {
        const item = cart.items.find((entry) => entry.id === id);
        if (!deviz || !item) return "";
        const resourcesHtml = Object.entries(deviz.resources)
          .map(
            ([resourceType, rows]) =>
              `<div style="margin-top:8px;"><strong>${resourceType}</strong><ul style="margin:4px 0 0 18px;">${rows
                .map(
                  (row) =>
                    `<li>${row.name} (${row.quantity} ${row.unit} x ${priceFormatter.format(row.unit_cost)} ${currency}) = ${priceFormatter.format(
                      row.total_cost
                    )} ${currency}</li>`
                )
                .join("")}</ul></div>`
          )
          .join("");
        return `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin-top:12px;">
          <h3 style="margin:0 0 6px 0;">${item.title}</h3>
          <div style="font-size:12px;color:#6b7280;">${item.slug}</div>
          <div style="margin-top:8px;font-size:12px;">
            <div>Cost direct: <strong>${priceFormatter.format(deviz.cost_direct_total)} ${currency}</strong></div>
            <div>Costuri indirecte: <strong>${priceFormatter.format(deviz.indirect_costs)} ${currency}</strong></div>
            <div>Mentenanta platforma: <strong>${priceFormatter.format(deviz.platform_maintenance)} ${currency}</strong></div>
            <div>Platforma My Darrin: <strong>${priceFormatter.format(deviz.mydarrin_platform)} ${currency}</strong></div>
            <div>TVA: <strong>${priceFormatter.format(deviz.vat_value)} ${currency}</strong></div>
            <div>Total brut: <strong>${priceFormatter.format(deviz.gross_total)} ${currency}</strong></div>
          </div>
          ${resourcesHtml}
        </div>`;
      })
      .join("");

    const summaryHtml = `<div style="border:1px dashed #e5e7eb;border-radius:12px;padding:12px;margin-top:12px;">
      <h3 style="margin:0 0 6px 0;">Sumar cos</h3>
      <div>Cost direct: <strong>${priceFormatter.format(cartTotals.cost_direct_total)} ${currency}</strong></div>
      <div>Costuri indirecte: <strong>${priceFormatter.format(cartTotals.indirect_costs)} ${currency}</strong></div>
      <div>Mentenanta platforma: <strong>${priceFormatter.format(cartTotals.platform_maintenance)} ${currency}</strong></div>
      <div>Platforma My Darrin: <strong>${priceFormatter.format(cartTotals.mydarrin_platform)} ${currency}</strong></div>
      <div>TVA: <strong>${priceFormatter.format(cartTotals.vat_value)} ${currency}</strong></div>
      <div>Total brut: <strong>${priceFormatter.format(cartTotals.gross_total)} ${currency}</strong></div>
    </div>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Deviz My Darrin</title></head><body style="font-family:Arial,sans-serif;padding:24px;">
      <h1 style="margin:0;">Deviz My Darrin</h1>
      <div style="color:#6b7280;font-size:12px;">Generat: ${now.toLocaleString("ro-RO")}</div>
      ${summaryHtml}
      ${rowsHtml}
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      try {
        const sessionToken = await ensureSession();
        if (!sessionToken) return;
        const slugParam = searchParams.get("slug");
        if (slugParam) {
          const slug = slugParam.split(",")[0]?.trim();
          if (slug) {
            const service = publicServiceCatalog.find((item) => item.slug === slug);
            await upsertItem(sessionToken, {
              slug,
              title: service?.title ?? slug,
              item_type: "SERVICE",
              category: service?.category ?? "Servicii",
            });
          }
        }
        await fetchCart(sessionToken);
      } finally {
        if (active) setLoading(false);
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!cart?.items?.length) return;
    const serviceItems = cart.items.filter((item) => item.item_type === "SERVICE");
    serviceItems.forEach((item) => {
      if (devizByItem[item.id] !== undefined || devizErrors[item.id]) {
        return;
      }
      void (async () => {
        try {
          const serviceCard = await fetchServiceCard(item.slug);
          if (!serviceCard?.rate_card) {
            setDevizErrors((prev) => ({
              ...prev,
              [item.id]: "Nu exista rate-card activ pentru acest serviciu.",
            }));
            setDevizByItem((prev) => ({ ...prev, [item.id]: null }));
            return;
          }
          const deviz = await fetchDevizPreview(serviceCard, item.quantity);
          if (!deviz) {
            setDevizErrors((prev) => ({
              ...prev,
              [item.id]: "Deviz indisponibil (verifica rate-card/retete).",
            }));
            setDevizByItem((prev) => ({ ...prev, [item.id]: null }));
            return;
          }
          setDevizByItem((prev) => ({ ...prev, [item.id]: deviz }));
        } catch {
          setDevizErrors((prev) => ({ ...prev, [item.id]: "Eroare la generarea devizului." }));
          setDevizByItem((prev) => ({ ...prev, [item.id]: null }));
        }
      })();
    });
  }, [cart, devizByItem, devizErrors]);

  useEffect(() => {
    if (!cart?.items?.length) return;
    const materialItems = cart.items.filter((item) => item.item_type === "MATERIAL" && item.wants_installation);
    materialItems.forEach((item) => {
      if (materialDevizByItem[item.id] !== undefined || materialDevizErrors[item.id]) {
        return;
      }
      void (async () => {
        try {
          const installationService = resolveInstallationService(item.slug);
          if (!installationService) {
            setMaterialDevizErrors((prev) => ({
              ...prev,
              [item.id]: "Nu exista serviciu de montaj asociat.",
            }));
            setMaterialDevizByItem((prev) => ({ ...prev, [item.id]: null }));
            return;
          }
          const serviceCard = await fetchServiceCard(installationService.slug);
          if (!serviceCard?.rate_card) {
            setMaterialDevizErrors((prev) => ({
              ...prev,
              [item.id]: "Rate-card lipsa pentru montaj.",
            }));
            setMaterialDevizByItem((prev) => ({ ...prev, [item.id]: null }));
            return;
          }
          const deviz = await fetchDevizPreview(serviceCard, item.quantity);
          if (!deviz) {
            setMaterialDevizErrors((prev) => ({
              ...prev,
              [item.id]: "Deviz montaj indisponibil.",
            }));
            setMaterialDevizByItem((prev) => ({ ...prev, [item.id]: null }));
            return;
          }
          setMaterialDevizByItem((prev) => ({ ...prev, [item.id]: deviz }));
        } catch {
          setMaterialDevizErrors((prev) => ({ ...prev, [item.id]: "Eroare la deviz montaj." }));
          setMaterialDevizByItem((prev) => ({ ...prev, [item.id]: null }));
        }
      })();
    });
  }, [cart, materialDevizByItem, materialDevizErrors]);

  if (loading && !cart) {
    return <div className="v3-inline-note">Se incarca cosul persistent...</div>;
  }

  if (!cart || !cart.items.length) {
    return (
      <div className="v3-inline-note">
        Nu exista servicii in cos. Revino in catalog pentru selectie.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="v3-eyebrow">Sumar general</div>
        <h3 className="v3-section-title">Deviz total cos</h3>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Cost direct</span>
            <strong>
              {priceFormatter.format(cartTotals.cost_direct_total)} {cartTotals.currency}
            </strong>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Costuri indirecte</span>
            <strong>
              {priceFormatter.format(cartTotals.indirect_costs)} {cartTotals.currency}
            </strong>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Mentenanta platforma</span>
            <strong>
              {priceFormatter.format(cartTotals.platform_maintenance)} {cartTotals.currency}
            </strong>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Platforma My Darrin</span>
            <strong>
              {priceFormatter.format(cartTotals.mydarrin_platform)} {cartTotals.currency}
            </strong>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>TVA</span>
            <strong>
              {priceFormatter.format(cartTotals.vat_value)} {cartTotals.currency}
            </strong>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-2">
            <span>Total brut</span>
            <strong className="text-lg">
              {priceFormatter.format(cartTotals.gross_total)} {cartTotals.currency}
            </strong>
          </div>
        </div>
        <button type="button" className="v3-primary-btn mt-4" onClick={exportDevizPdf}>
          Exporta deviz PDF
        </button>
      </div>
      <div className="v3-inline-note v3-inline-note-soft">
        Rideshare eligibil: {cart.rideshare_eligible ? "DA" : "NU"} · furnizori validati: {cart.rideshare_providers}
      </div>
      {groupedItems.map(([group, items]) => (
        <div key={group} className="rounded-2xl border border-border bg-white p-5">
          <div className="v3-eyebrow">Categorie lucrare</div>
          <h3 className="v3-section-title">{group}</h3>
          <div className="v3-cart-grid">
            {items.map((item) => {
              const isMaterial = item.item_type === "MATERIAL";
              const installationService = isMaterial ? resolveInstallationService(item.slug) : null;
              const breakdown = !isMaterial ? buildPackageBreakdown(item.slug) : null;
              const materialDeviz = isMaterial ? materialDevizByItem[item.id] : null;
              return (
                <article key={item.id} className="v3-cart-card">
                  <div className="v3-cart-media v3-service-accent-navy">[{item.item_type}]</div>
                  <div>
                    <div className="v3-service-title">{item.title}</div>
                    <p>{item.slug}</p>
                    {isMaterial && installationService ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span>Adaugi montaj specializat?</span>
                        <button
                          type="button"
                          className="v3-ghost-chip"
                          onClick={async () => {
                            const sessionToken = window.localStorage.getItem(CART_KEY) ?? "";
                            if (!sessionToken) return;
                            await upsertItem(sessionToken, {
                              slug: item.slug,
                              title: item.title,
                              item_type: "MATERIAL",
                              category: item.category ?? "Materiale",
                              quantity: item.quantity ?? 1,
                              wants_installation: true,
                            });
                            await upsertItem(sessionToken, {
                              slug: installationService.slug,
                              title: installationService.title,
                              item_type: "SERVICE",
                              category: installationService.category ?? "Servicii",
                            });
                          }}
                        >
                          Adauga montaj
                        </button>
                      </div>
                    ) : null}
                    {isMaterial && item.wants_installation ? (
                      materialDeviz ? (
                        <div className="mt-3 grid gap-2 text-xs">
                          <div className="v3-inline-note v3-inline-note-soft">
                            Deviz montaj asociat (din backoffice).
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>Total montaj</span>
                            <strong>
                              {priceFormatter.format(materialDeviz.gross_total)} {materialDeviz.currency}
                            </strong>
                          </div>
                          <div className="grid gap-2">
                            {Object.entries(materialDeviz.resources).map(([resourceType, rows]) => (
                              <div key={resourceType} className="rounded-2xl border border-border bg-white p-3">
                                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                  {resourceType}
                                </div>
                                <div className="grid gap-2">
                                  {rows.map((row, index) => (
                                    <div
                                      key={`${row.name}-${index}`}
                                      className="flex flex-wrap items-center justify-between gap-2 text-xs"
                                    >
                                      <div>
                                        <strong>{row.name}</strong> {row.esco_code ? `(${row.esco_code})` : ""}
                                        <div className="text-[11px] text-muted-foreground">
                                          {row.quantity} {row.unit} x {priceFormatter.format(row.unit_cost)}{" "}
                                          {materialDeviz.currency}
                                        </div>
                                      </div>
                                      <div className="text-right font-semibold">
                                        {priceFormatter.format(row.total_cost)} {materialDeviz.currency}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : materialDevizErrors[item.id] ? (
                        <div className="mt-3 grid gap-2 text-xs">
                          <div className="v3-inline-note v3-inline-note-soft">
                            {materialDevizErrors[item.id]}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 v3-inline-note v3-inline-note-soft text-xs">Se calculeaza devizul de montaj...</div>
                      )
                    ) : null}
                    {!isMaterial && devizByItem[item.id] ? (
                      <div className="mt-3 grid gap-3 text-xs">
                        <div className="v3-inline-note v3-inline-note-soft">
                          Deviz real: manopera + materiale + utilaje + transport + costuri indirecte.
                        </div>
                        <div className="grid gap-2 rounded-2xl border border-border bg-white/60 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>Cost direct</span>
                            <strong>
                              {priceFormatter.format(devizByItem[item.id]!.cost_direct_total)}{" "}
                              {devizByItem[item.id]!.currency}
                            </strong>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>Costuri indirecte</span>
                            <strong>
                              {priceFormatter.format(devizByItem[item.id]!.indirect_costs)}{" "}
                              {devizByItem[item.id]!.currency}
                            </strong>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>Mentenanta platforma</span>
                            <strong>
                              {priceFormatter.format(devizByItem[item.id]!.platform_maintenance)}{" "}
                              {devizByItem[item.id]!.currency}
                            </strong>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>Platforma My Darrin</span>
                            <strong>
                              {priceFormatter.format(devizByItem[item.id]!.mydarrin_platform)}{" "}
                              {devizByItem[item.id]!.currency}
                            </strong>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>TVA</span>
                            <strong>
                              {priceFormatter.format(devizByItem[item.id]!.vat_value)}{" "}
                              {devizByItem[item.id]!.currency}
                            </strong>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border pt-2">
                            <span>Total brut</span>
                            <strong className="text-base">
                              {priceFormatter.format(devizByItem[item.id]!.gross_total)}{" "}
                              {devizByItem[item.id]!.currency}
                            </strong>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          {Object.entries(devizByItem[item.id]!.resources).map(([resourceType, rows]) => (
                            <div key={resourceType} className="rounded-2xl border border-border bg-white p-3">
                              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                {resourceType}
                              </div>
                              <div className="grid gap-2">
                                {rows.map((row, index) => (
                                  <div
                                    key={`${row.name}-${index}`}
                                    className="flex flex-wrap items-center justify-between gap-2 text-xs"
                                  >
                                    <div>
                                      <strong>{row.name}</strong> {row.esco_code ? `(${row.esco_code})` : ""}
                                      <div className="text-[11px] text-muted-foreground">
                                        {row.quantity} {row.unit} x {priceFormatter.format(row.unit_cost)} {devizByItem[item.id]!.currency}
                                      </div>
                                    </div>
                                    <div className="text-right font-semibold">
                                      {priceFormatter.format(row.total_cost)} {devizByItem[item.id]!.currency}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : !isMaterial && devizErrors[item.id] ? (
                      <div className="mt-3 grid gap-2 text-xs">
                        <div className="v3-inline-note v3-inline-note-soft">
                          {devizErrors[item.id]}
                        </div>
                        {breakdown ? (
                          <div className="v3-inline-note">
                            Afisam fallback provizoriu pana se activeaza devizul real.
                          </div>
                        ) : null}
                      </div>
                    ) : !isMaterial && breakdown ? (
                      <div className="mt-3 grid gap-3 text-xs">
                        <div className="v3-inline-note v3-inline-note-soft">
                          Pachet complet: manopera + materiale + utilaje + transport + costuri indirecte.
                        </div>
                        <div>
                          <strong>Manopera / activitati:</strong> {breakdown.activities.join(", ")}
                        </div>
                        <div>
                          <strong>Materiale:</strong> {breakdown.materials.join(", ")}
                        </div>
                        <div>
                          <strong>Utilaje / echipamente:</strong> {breakdown.equipment.join(", ")}
                        </div>
                        <div>
                          <strong>Transport:</strong> {breakdown.transport.join(", ")}
                        </div>
                        <div>
                          <strong>Costuri indirecte:</strong> {breakdown.indirectCosts.join(", ")}
                        </div>
                        {breakdown.classifications ? (
                          <div className="v3-inline-note">
                            Indicatori deviz: {breakdown.classifications.indicators?.join(", ") || "N/A"} · Uniclass:{" "}
                            {breakdown.classifications.uniclass?.join(", ") || "N/A"} · ESCO:{" "}
                            {breakdown.classifications.esco?.join(", ") || "N/A"}
                          </div>
                        ) : (
                          <div className="v3-inline-note">Indicatori deviz / Uniclass / ESCO: sincronizare in curs.</div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="v3-price-text">Cantitate: {item.quantity}</div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
