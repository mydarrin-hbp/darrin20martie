"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { UserAdminCard } from "@/components/user-admin-card";
import { useAuth } from "@/components/auth-provider";
import { AdminUser, getAdminUsers } from "@/lib/api";

const roles = ["ALL", "CLIENT", "PARTNER", "INVESTOR", "ADMIN", "SUPER_ADMIN"] as const;
const statuses = ["ALL", "PENDING_DOCS", "UNDER_REVIEW", "VERIFIED", "PENDING", "APPROVED", "REJECTED"] as const;

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<(typeof roles)[number]>("ALL");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("ALL");
  const [search, setSearch] = useState("");

  async function load() {
    if (!token) return;
    const list = await getAdminUsers(token);
    setUsers(list);
  }

  useEffect(() => {
    void load();
  }, [token]);

  const stats = useMemo(
    () => ({
      total: users.length,
      clients: users.filter((user) => user.role === "CLIENT").length,
      partners: users.filter((user) => user.role === "PARTNER").length,
      investors: users.filter((user) => user.role === "INVESTOR").length,
    }),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) return false;
      if (statusFilter !== "ALL" && user.verification_status !== statusFilter) return false;
      if (!normalized) return true;
      const haystack = `${user.full_name ?? ""} ${user.email ?? ""} ${user.phone ?? ""} ${user.city ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [users, roleFilter, statusFilter, search]);

  return (
    <div>
      <ModuleHeader
        title="Gestionare Utilizatori"
        description="Administrare completa pentru clienti, parteneri, investitori si administratori. Statusurile de verificare sunt sincronizate cu fluxurile de onboarding."
        badge="User Control"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="panel p-5"><div className="text-sm text-muted">Total</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.total}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Clienti</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.clients}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Parteneri</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.partners}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Investitori</div><div className="mt-3 text-3xl font-semibold text-ink">{stats.investors}</div></div>
      </div>

      <section className="panel p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
          <input
            className="field"
            placeholder="Cauta dupa nume, email, telefon, oras"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="field" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-3">
          {filteredUsers.length === 0 ? <div className="text-sm text-muted">Nu exista utilizatori pentru filtrele selectate.</div> : null}
          {filteredUsers.map((user) => (
            <UserAdminCard key={user.id} user={user} onChanged={load} />
          ))}
        </div>
      </section>
    </div>
  );
}
