"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { UserAdminCard } from "@/components/user-admin-card";
import { useAuth } from "@/components/auth-provider";
import { AdminUser, getAdminUsers } from "@/lib/api";

export default function InvestorsPage() {
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

  const investors = useMemo(() => users.filter((user) => user.role === "INVESTOR"), [users]);
  const target = 250000;
  const committed = investors.length * 25000;

  return (
    <div>
      <ModuleHeader
        title="Devino Investitor"
        description="Vizibilitate pentru investitori, verificari si schimbare rol direct din UI, pe baza utilizatorilor reali din backend."
        badge="SEED round"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Investitori" value={String(investors.length)} hint="Rol INVESTOR din backend" />
        <StatCard label="Suma angajata" value={`${committed.toLocaleString("ro-RO")} EUR`} hint="Estimare operationala SEED" />
        <StatCard label="Target runda" value={`${target.toLocaleString("ro-RO")} EUR`} hint="Pregatit pentru extindere" />
      </div>
      <section className="panel mt-6 p-6">
        <h3 className="text-xl font-semibold text-ink">Lista investitori</h3>
        <div className="mt-4 grid gap-3">
          {investors.length === 0 ? <div className="text-sm text-muted">Nu exista investitori inregistrati inca.</div> : null}
          {investors.map((investor) => (
            <UserAdminCard key={investor.id} user={investor} onChanged={load} showApprovalActions={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
