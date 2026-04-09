"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  AdminCollaboratorRecord,
  CountryRecord,
  getAdminCollaborators,
  getCountries,
  inviteAdminCollaborator,
  revokeAdminCollaborator,
} from "@/lib/api";

const roleOptions = [
  { value: "COUNTRY_MANAGER", label: "Country Manager" },
  { value: "PARTNER_MANAGER", label: "Partner Manager" },
  { value: "CONTENT_MANAGER", label: "Content Manager" },
  { value: "FINANCIAL_ADMIN", label: "Financial Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const roleModuleDefaults: Record<string, string[]> = {
  COUNTRY_MANAGER: ["catalog", "geo", "catalog_pricing"],
  PARTNER_MANAGER: ["partners", "partner_flow"],
  CONTENT_MANAGER: ["visual_cms", "cms", "site_content"],
  FINANCIAL_ADMIN: ["financial", "catalog_pricing", "investors"],
  SUPER_ADMIN: ["visual_cms", "catalog", "operations", "partners", "investors", "team", "geo", "cms", "financial", "catalog_pricing", "site_content", "partner_flow"],
};

const emptyForm = {
  email: "",
  full_name: "",
  role_key: "COUNTRY_MANAGER",
  country_access: ["RO"],
  design_edit: false,
};

function statusTone(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "bg-[#e8f7f2] text-[#117a73]";
    case "REVOKED":
      return "bg-[#fff1f0] text-[#c53b32]";
    default:
      return "bg-[#f3f6f8] text-[#5f6f86]";
  }
}

export default function TeamManagementPage() {
  const { token, user } = useAuth();
  const [admins, setAdmins] = useState<AdminCollaboratorRecord[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const canManageTeam = user?.role === "SUPER_ADMIN" || user?.module_access?.includes("team");
  const effectiveModules = useMemo(() => roleModuleDefaults[form.role_key] ?? [], [form.role_key]);

  async function load() {
    if (!token) {
      return;
    }
    const [adminsData, countriesData] = await Promise.all([getAdminCollaborators(token), getCountries(token)]);
    setAdmins(adminsData);
    setCountries(countriesData);
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = await inviteAdminCollaborator(token, {
        email: form.email,
        full_name: form.full_name || null,
        role_key: form.role_key,
        country_access: form.country_access.length ? form.country_access : ["GLOBAL"],
        module_access: effectiveModules,
        design_edit: form.design_edit,
      });
      setMessage(`Invitatia a fost pregatita pentru ${payload.email}.`);
      setForm(emptyForm);
      await load();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Nu am putut trimite invitatia.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(adminId: number) {
    if (!token) {
      return;
    }
    setRevokingId(adminId);
    setError("");
    setMessage("");
    try {
      const payload = await revokeAdminCollaborator(token, adminId);
      setMessage(`Accesul pentru ${payload.email} a fost revocat.`);
      await load();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Nu am putut revoca accesul.");
    } finally {
      setRevokingId(null);
    }
  }

  if (!canManageTeam) {
    return (
      <div>
        <ModuleHeader
          title="Gestiune Echipa"
          description="Accesul la colaboratori este rezervat super adminilor sau managerilor cu drept explicit de echipa."
          badge="Security"
        />
        <div className="panel p-6 text-sm text-muted">Nu ai acces la acest modul.</div>
      </div>
    );
  }

  return (
    <div>
      <ModuleHeader
        title="Gestiune Echipa"
        description="Invita colaboratori, controleaza accesul geografic si activeaza editorul vizual doar pentru rolurile potrivite."
        badge="Security"
      />

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}
      {error ? <div className="mb-6 rounded-2xl border border-[#f2c7c3] bg-[#fff6f5] px-4 py-3 text-sm text-[#9e3d35]">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="panel p-6" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">Adauga colaborator</h2>
              <p className="mt-1 text-sm text-muted">Creezi invitatia, alegi aria de lucru si, optional, dreptul de Visual Site Editor.</p>
            </div>
            <span className="tag">Invite</span>
          </div>

          <div className="mt-5 grid gap-3">
            <input
              className="field"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <input
              className="field"
              placeholder="Nume complet"
              value={form.full_name}
              onChange={(event) => setForm({ ...form, full_name: event.target.value })}
            />
            <select
              className="field"
              value={form.role_key}
              onChange={(event) => setForm({ ...form, role_key: event.target.value, design_edit: event.target.value === "CONTENT_MANAGER" })}
            >
              {roleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              className="field"
              value={form.country_access[0] ?? "GLOBAL"}
              onChange={(event) => setForm({ ...form, country_access: [event.target.value] })}
            >
              <option value="GLOBAL">Global</option>
              {countries.map((country) => (
                <option key={country.id} value={country.code}>
                  {country.name_ro}
                </option>
              ))}
            </select>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-white/60 px-4 py-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.design_edit}
              onChange={(event) => setForm({ ...form, design_edit: event.target.checked })}
              className="mt-1"
            />
            <span>
              <strong className="block text-ink">Visual Site Editor</strong>
              Permite deschiderea site-ului public in Edit Mode si salvarea continutului prin bridge-ul vizual.
            </span>
          </label>

          <div className="mt-4 rounded-2xl border border-border bg-white/60 px-4 py-3 text-sm text-muted">
            Module implicite: {effectiveModules.join(", ")}
          </div>

          <button className="btn-primary mt-4" type="submit" disabled={loading}>
            {loading ? "Se pregateste invitatia..." : "Trimite invitatia"}
          </button>
        </form>

        <div className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">Administratori existenti</h2>
              <p className="mt-1 text-sm text-muted">Tabel operational pentru rol, geografie, status si acces la editorul vizual.</p>
            </div>
            <span className="tag">{admins.length} inregistrari</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-border bg-white/60">
            <div className="grid grid-cols-[1.2fr_1.1fr_0.8fr_0.9fr_0.8fr_0.9fr] gap-3 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              <div>Nume</div>
              <div>Email</div>
              <div>Rol</div>
              <div>Acces tara</div>
              <div>Status</div>
              <div>Actiuni</div>
            </div>

            {admins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-[1.2fr_1.1fr_0.8fr_0.9fr_0.8fr_0.9fr] gap-3 border-b border-border/70 px-4 py-4 text-sm last:border-b-0"
              >
                <div>
                  <div className="font-semibold text-ink">{admin.full_name || "Fara nume"}</div>
                  <div className="mt-1 text-xs text-muted">{admin.design_edit ? "Visual editor activ" : "Backoffice standard"}</div>
                </div>
                <div className="text-muted">{admin.email}</div>
                <div>
                  <span className="tag">{admin.role_key}</span>
                </div>
                <div className="text-muted">{admin.country_access.length ? admin.country_access.join(", ") : "GLOBAL"}</div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(admin.invitation_status)}`}>
                    {admin.invitation_status}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {admin.invitation_url ? (
                    <a
                      href={admin.invitation_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#117a73] hover:underline"
                    >
                      Deschide link
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleRevoke(admin.id)}
                    disabled={revokingId === admin.id || admin.invitation_status === "REVOKED"}
                    className="rounded-full border border-[#f0d0cd] px-3 py-1.5 text-xs font-semibold text-[#9e3d35] transition hover:bg-[#fff1f0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {revokingId === admin.id ? "Se revoca..." : "Revoke Access"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
