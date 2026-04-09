"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { UserAdminCard } from "@/components/user-admin-card";
import { useAuth } from "@/components/auth-provider";
import { AdminUser, getAdminUsers, getPendingUsers } from "@/lib/api";

export default function PartnersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pending, setPending] = useState<AdminUser[]>([]);

  async function load() {
    if (!token) {
      return;
    }
    const [allUsers, pendingUsers] = await Promise.all([getAdminUsers(token), getPendingUsers(token)]);
    setUsers(allUsers);
    setPending(pendingUsers);
  }

  useEffect(() => {
    void load();
  }, [token]);

  const partners = useMemo(() => users.filter((user) => user.role === "PARTNER"), [users]);

  return (
    <div>
      <ModuleHeader
        title="Devino Partener"
        description="Administrare KYC, schimbare rol si verificare pentru furnizorii care intra in reteaua My Darrin."
        badge="KYC + RBAC"
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Cereri in asteptare</h3>
          <div className="mt-4 grid gap-3">
            {pending.length === 0 ? <div className="text-sm text-muted">Nu exista cereri pendinte.</div> : null}
            {pending.map((user) => (
              <UserAdminCard key={user.id} user={user} onChanged={load} />
            ))}
          </div>
        </section>
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Parteneri verificati</h3>
          <div className="mt-4 grid gap-3">
            {partners.length === 0 ? <div className="text-sm text-muted">Nu exista parteneri activi inca.</div> : null}
            {partners.map((user) => (
              <UserAdminCard key={user.id} user={user} onChanged={load} showApprovalActions={false} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
