"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import { AdminUser, getAdminUsers, updateUserProfile } from "@/lib/api";

const pipelineStatuses = ["PENDING", "PENDING_DOCS", "UNDER_REVIEW", "VERIFIED"] as const;

export default function OnboardingRequestsPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    if (!token) return;
    const list = await getAdminUsers(token);
    setUsers(list);
  }

  useEffect(() => {
    void load();
  }, [token]);

  const onboardingUsers = useMemo(
    () => users.filter((user) => pipelineStatuses.includes((user.verification_status ?? "PENDING_DOCS") as typeof pipelineStatuses[number])),
    [users],
  );

  async function handleStatusChange(userId: number, status: typeof pipelineStatuses[number]) {
    if (!token) return;
    await updateUserProfile(token, userId, { verification_status: status });
    setMessage(`Status actualizat la ${status}.`);
    await load();
  }

  return (
    <div>
      <ModuleHeader
        title="Onboarding Requests"
        description="Flux PENDING_DOCS -> UNDER_REVIEW -> VERIFIED. SuperAdmin vizualizeaza documentele (CUI, certificari ESCO) si aproba rapid."
        badge="RBAC"
      />

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <section className="panel p-6">
        <div className="grid gap-4">
          {onboardingUsers.length === 0 ? (
            <div className="text-sm text-muted">Nu exista cereri in fluxul de onboarding.</div>
          ) : null}

          {onboardingUsers.map((user) => (
            <div key={user.id} className="rounded-3xl border border-border bg-white/80 p-5">
              <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
                <div>
                  <div className="text-sm text-muted">User</div>
                  <div className="text-lg font-semibold text-ink">{user.full_name || user.email}</div>
                  <div className="text-sm text-muted">{user.email}</div>
                  <div className="mt-2 text-sm text-muted">Rol: {user.role}</div>
                  <div className="mt-2 text-sm text-muted">Status: {user.verification_status ?? "PENDING_DOCS"}</div>
                  <div className="mt-3 grid gap-2 text-sm text-muted">
                    <div>CUI: Document lipsa</div>
                    <div>Certificari ESCO: Document lipsa</div>
                    <div>Alte atasamente: N/A</div>
                  </div>
                </div>
                <div className="grid gap-3">
                  {pipelineStatuses.map((status) => (
                    <button
                      key={status}
                      className="btn-secondary"
                      type="button"
                      onClick={() => void handleStatusChange(user.id, status)}
                    >
                      Marcheaza {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
