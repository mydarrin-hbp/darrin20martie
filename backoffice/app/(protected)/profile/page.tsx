"use client";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <ModuleHeader
        title="Profil admin"
        description="Rezumatul sesiunii curente de administrare si verificarea RBAC pentru panoul complet de back office."
        badge="Admin identity"
      />
      <section className="panel p-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-border bg-white/70 p-4">
            <div className="text-sm text-muted">Nume</div>
            <div className="mt-2 text-lg font-semibold text-ink">{user?.full_name ?? "nesetat"}</div>
          </div>
          <div className="rounded-2xl border border-border bg-white/70 p-4">
            <div className="text-sm text-muted">Email</div>
            <div className="mt-2 text-lg font-semibold text-ink">{user?.email}</div>
          </div>
          <div className="rounded-2xl border border-border bg-white/70 p-4">
            <div className="text-sm text-muted">Telefon</div>
            <div className="mt-2 text-lg font-semibold text-ink">{user?.phone ?? "nesetat"}</div>
          </div>
          <div className="rounded-2xl border border-border bg-white/70 p-4">
            <div className="text-sm text-muted">Oras</div>
            <div className="mt-2 text-lg font-semibold text-ink">{user?.city ?? "nesetat"}</div>
          </div>
          <div className="rounded-2xl border border-border bg-white/70 p-4">
            <div className="text-sm text-muted">Rol</div>
            <div className="mt-2 text-lg font-semibold text-ink">{user?.role}</div>
          </div>
          <div className="rounded-2xl border border-border bg-white/70 p-4">
            <div className="text-sm text-muted">Verification</div>
            <div className="mt-2 text-lg font-semibold text-ink">{user?.verification_status}</div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-white/70 p-4">
          <div className="text-sm text-muted">Permisiuni active</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(user?.permissions ?? []).map((permission) => (
              <span key={permission} className="tag">
                {permission}
              </span>
            ))}
            {(user?.permissions ?? []).length === 0 ? <span className="text-sm text-muted">Nu exista permisiuni active.</span> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
