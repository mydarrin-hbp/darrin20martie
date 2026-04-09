"use client";

import { useState } from "react";

import { AdminUser, activateUser, deactivateUser, updateUserRole } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

const roleOptions = ["CLIENT", "PARTNER", "INVESTOR", "ADMIN", "SUPER_ADMIN"] as const;

export function UserAdminCard({
  user,
  onChanged,
  showApprovalActions = true,
}: {
  user: AdminUser;
  onChanged?: () => void | Promise<void>;
  showApprovalActions?: boolean;
}) {
  const { token, user: currentUser } = useAuth();
  const [role, setRole] = useState(user.role ?? "CLIENT");
  const [loading, setLoading] = useState(false);
  const canManageRole = currentUser?.role === "SUPER_ADMIN";

  async function run(action: () => Promise<unknown>) {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      await action();
      await onChanged?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white/70 p-4">
      <div className="font-semibold text-ink">{user.full_name?.trim() || user.email}</div>
      <div className="mt-1 text-sm text-muted">{user.email}</div>
      <div className="mt-2 grid gap-1 text-sm text-muted">
        <div>Rol: {user.role ?? "nedefinit"} · Status: {user.verification_status ?? "nedefinit"}</div>
        <div>Telefon: {user.phone || "lipsa"} · Oras: {user.city || "lipsa"}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(user.permissions ?? []).map((permission) => (
          <span key={permission} className="tag">
            {permission}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <select
          className="field"
          value={role}
          disabled={!canManageRole || loading}
          onChange={(event) => setRole(event.target.value)}
        >
          {roleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          className="btn-primary"
          type="button"
          disabled={!canManageRole || loading || role === (user.role ?? "CLIENT")}
          onClick={() => run(() => updateUserRole(token!, user.id, role as (typeof roleOptions)[number]))}
        >
          Salveaza rol
        </button>
      </div>

      {showApprovalActions ? (
        <div className="mt-3 flex flex-wrap gap-3">
          <button className="btn-primary" type="button" disabled={loading || !token} onClick={() => run(() => activateUser(token!, user.id))}>
            Aproba
          </button>
          <button className="btn-secondary" type="button" disabled={loading || !token} onClick={() => run(() => deactivateUser(token!, user.id))}>
            Respinge
          </button>
        </div>
      ) : null}
    </div>
  );
}
