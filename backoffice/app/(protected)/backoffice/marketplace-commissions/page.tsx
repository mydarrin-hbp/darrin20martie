"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import {
  MarketplaceCommissionRecord,
  createMarketplaceCommission,
  deleteMarketplaceCommission,
  getMarketplaceCommissions,
  updateMarketplaceCommission,
} from "@/lib/api";

type CommissionForm = {
  category: MarketplaceCommissionRecord["category"];
  min_percentage: string;
  max_percentage: string;
  is_active: boolean;
};

const defaultRows: CommissionForm[] = [
  { category: "MATERIAL", min_percentage: "7", max_percentage: "15", is_active: true },
  { category: "RENTAL", min_percentage: "10", max_percentage: "15", is_active: true },
  { category: "LABOR", min_percentage: "10", max_percentage: "15", is_active: true },
];

export default function MarketplaceCommissionsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<MarketplaceCommissionRecord[]>([]);
  const [editing, setEditing] = useState<Record<number, CommissionForm>>({});
  const [message, setMessage] = useState("");
  const [initRows, setInitRows] = useState(defaultRows);

  async function load() {
    if (!token) return;
    const data = await getMarketplaceCommissions(token);
    setRows(data);
    setEditing(
      Object.fromEntries(
        data.map((row) => [
          row.id,
          {
            category: row.category,
            min_percentage: String(row.min_percentage),
            max_percentage: String(row.max_percentage),
            is_active: row.is_active,
          },
        ]),
      ),
    );
  }

  useEffect(() => {
    void load();
  }, [token]);

  const summary = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((row) => row.is_active).length,
    }),
    [rows],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    for (const row of initRows) {
      await createMarketplaceCommission(token, {
        category: row.category,
        min_percentage: Number(row.min_percentage),
        max_percentage: Number(row.max_percentage),
        is_active: row.is_active,
      });
    }
    setMessage("Comisioanele standard au fost create.");
    await load();
  }

  async function handleUpdate(id: number) {
    if (!token) return;
    const row = editing[id];
    await updateMarketplaceCommission(token, id, {
      min_percentage: Number(row.min_percentage),
      max_percentage: Number(row.max_percentage),
      is_active: row.is_active,
    });
    setMessage("Comision actualizat.");
    await load();
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteMarketplaceCommission(token, id);
    setMessage("Comision sters.");
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Comisioane Marketplace"
        description="SuperAdmin configureaza aici intervalele de comision pentru materiale, inchirieri utilaje si manopera. Valorile sunt folosite in publicarea produselor aprobate."
        badge="Config comisioane"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="panel p-5"><div className="text-sm text-muted">Total grile</div><div className="mt-3 text-3xl font-semibold text-ink">{summary.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Active</div><div className="mt-3 text-3xl font-semibold text-ink">{summary.active}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      {rows.length === 0 ? (
        <form onSubmit={handleCreate} className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">Initializeaza grila standard</h2>
          <p className="mt-2 text-sm text-muted">Materiale 7-15%, Inchirieri 10-15%, Manopera 10-15%.</p>
          <button type="submit" className="btn-primary mt-4">Creeaza grila standard</button>
        </form>
      ) : null}

      <div className="grid gap-4">
        {rows.map((row) => (
          <div key={row.id} className="panel p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] items-center">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Categorie</div>
                <div className="text-lg font-semibold text-ink">{row.category}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Min (%)</div>
                <input
                  className="field"
                  value={editing[row.id]?.min_percentage ?? "0"}
                  onChange={(event) => setEditing((state) => ({ ...state, [row.id]: { ...state[row.id], min_percentage: event.target.value } }))}
                />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted">Max (%)</div>
                <input
                  className="field"
                  value={editing[row.id]?.max_percentage ?? "0"}
                  onChange={(event) => setEditing((state) => ({ ...state, [row.id]: { ...state[row.id], max_percentage: event.target.value } }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={editing[row.id]?.is_active ?? false}
                  onChange={(event) => setEditing((state) => ({ ...state, [row.id]: { ...state[row.id], is_active: event.target.checked } }))}
                />
                Activ
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => void handleUpdate(row.id)}>Salveaza</button>
              <button type="button" className="btn-secondary" onClick={() => void handleDelete(row.id)}>Sterge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
