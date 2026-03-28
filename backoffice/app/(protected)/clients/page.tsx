"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { UserAdminCard } from "@/components/user-admin-card";
import { useAuth } from "@/components/auth-provider";
import { AdminUser, getAdminUsers } from "@/lib/api";

export default function ClientsPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);

  async function load() {
    if (!token) {
      return;
    }
    const list = await getAdminUsers(token);
    setUsers(list);
  }

  useEffect(() => {
    void load();
  }, [token]);

  const clients = useMemo(() => users.filter((user) => user.role === "CLIENT"), [users]);

  return (
    <div>
      <ModuleHeader
        title="Inscriere Clienti"
        description="Management clienti, profil extins si verificare operationala direct din utilizatorii reali existenti in backend."
        badge="Client onboarding"
      />
      <section className="panel p-6">
        <div className="grid gap-3">
          {clients.length === 0 ? <div className="text-sm text-muted">Nu exista clienti inregistrati inca.</div> : null}
          {clients.map((client) => (
            <UserAdminCard key={client.id} user={client} onChanged={load} showApprovalActions={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
