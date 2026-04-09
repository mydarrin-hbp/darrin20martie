"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { publicSignupRoleOptions } from "@/lib/public-site";

type SignupRole = "CLIENT" | "PARTNER" | "INVESTOR" | "ADMIN";
type SignupSubrole =
  | "services"
  | "materials-marketplace"
  | "materials-ip"
  | "rental"
  | "concrete"
  | null
  | undefined;

type SignupLeadResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city?: string | null;
  status: string;
  selected_role?: SignupRole | null;
  selected_subrole?: string | null;
  phone_verified: boolean;
  sms_debug_code?: string | null;
  redirect_path?: string | null;
};

type RegisterUserResponse = {
  id: number;
  role: SignupRole;
  verification_status: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const GATE = process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION;

function apiHeaders() {
  return {
    "Content-Type": "application/json",
    ...(GATE ? { "X-Gate-Authorization": GATE } : {}),
  };
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof payload?.detail === "string"
        ? payload.detail
        : typeof payload?.message === "string"
          ? payload.message
          : "Nu am putut procesa cererea.";
    throw new Error(detail);
  }
  return payload as T;
}

function roleLabel(role: SignupRole) {
  return {
    CLIENT: "Client",
    PARTNER: "Partener",
    INVESTOR: "Investitor",
    ADMIN: "Admin",
  }[role];
}

function roleContextLabel(role: SignupRole, subrole?: SignupSubrole) {
  if (role !== "PARTNER") {
    return roleLabel(role);
  }
  return (
    {
      services: "Partener servicii",
      "materials-marketplace": "Provider materiale (Marketplace)",
      "materials-ip": "Provider materiale (Integrare IP)",
      rental: "Provider inchirieri utilaje",
      concrete: "Provider betoane",
    }[subrole ?? "services"] ?? roleLabel(role)
  );
}

function normalizeSubrole(value?: string | null): SignupSubrole {
  if (!value) return undefined;
  const allowed = new Set<Exclude<SignupSubrole, null | undefined>>([
    "services",
    "materials-marketplace",
    "materials-ip",
    "rental",
    "concrete",
  ]);
  return allowed.has(value as Exclude<SignupSubrole, null | undefined>)
    ? (value as SignupSubrole)
    : undefined;
}

function resolveRoleRedirect(role: SignupRole, subrole: SignupSubrole, leadId: number) {
  if (role === "CLIENT") {
    return `/account/create/client?lead=${leadId}`;
  }
  if (role === "INVESTOR") {
    return `/investors/create?lead=${leadId}`;
  }
  if (role === "ADMIN") {
    return `/admin/access-request?lead=${leadId}`;
  }
  if (role === "PARTNER") {
    const context = subrole ?? "services";
    if (context === "materials-marketplace") {
      return `/marketplace/providers/materials/create?lead=${leadId}&subrole=${context}`;
    }
    if (context === "materials-ip") {
      return `/marketplace/providers/materials/ip-integration?lead=${leadId}&subrole=${context}`;
    }
    if (context === "rental") {
      return `/marketplace/providers/rental/create?lead=${leadId}&subrole=${context}`;
    }
    if (context === "concrete") {
      return `/marketplace/providers/concrete/create?lead=${leadId}&subrole=${context}`;
    }
    return `/partners/join/create?lead=${leadId}&subrole=services`;
  }
  return `/account/create`;
}

function resolvePostSignupRedirect(role: SignupRole, subrole: SignupSubrole, pending: boolean) {
  const pendingParam = pending ? "pending=1" : "";
  if (role === "CLIENT") {
    return `/my-account${pendingParam ? `?${pendingParam}` : ""}`;
  }
  if (role === "INVESTOR") {
    return `/investors/account${pendingParam ? `?${pendingParam}` : ""}`;
  }
  if (role === "ADMIN") {
    return `/admin/access-request${pendingParam ? `?${pendingParam}` : ""}`;
  }
  if (role === "PARTNER") {
    const context = subrole ?? "services";
    if (context === "materials-marketplace") {
      return `/marketplace/providers/materials${pendingParam ? `?${pendingParam}` : ""}`;
    }
    if (context === "materials-ip") {
      return `/marketplace/providers/materials/ip${pendingParam ? `?${pendingParam}` : ""}`;
    }
    if (context === "rental") {
      return `/marketplace/providers/rental${pendingParam ? `?${pendingParam}` : ""}`;
    }
    if (context === "concrete") {
      return `/marketplace/providers/concrete${pendingParam ? `?${pendingParam}` : ""}`;
    }
    return `/partners/account${pendingParam ? `?${pendingParam}` : ""}`;
  }
  return "/my-account";
}

export function PublicAccountRegisterForm() {
  const router = useRouter();
  const [registerStep, setRegisterStep] = useState<"email" | "password" | "phone" | "sms">("email");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [lead, setLead] = useState<SignupLeadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/signup-leads/start`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim() || null,
        }),
      });

      const payload = await parseApiResponse<SignupLeadResponse>(response);
      setLead(payload);
      setRegisterStep("sms");
      setMessage(
        payload.sms_debug_code
          ? `Datele au fost salvate. Cod SMS de test: ${payload.sms_debug_code}`
          : "Datele au fost salvate. Introdu codul SMS primit pentru a continua.",
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nu am putut salva datele initiale.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyPhone() {
    if (!lead) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/signup-leads/verify-phone`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          email: lead.email,
          code: smsCode.trim(),
        }),
      });

      const payload = await parseApiResponse<SignupLeadResponse>(response);
      setLead(payload);
      setMessage("Telefonul a fost validat. Poti continua catre alegerea rolului.");
      router.push(`/account/create/select-role?lead=${payload.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nu am putut valida codul SMS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="v3-signup-flow">
      <div className="v3-social-stack">
        <button type="button" className="v3-social-button">
          <span className="v3-social-mark v3-social-mark-google">G</span>
          <span>Conecteaza-te cu Google</span>
        </button>
        <button type="button" className="v3-social-button">
          <span className="v3-social-mark v3-social-mark-apple">A</span>
          <span>Conecteaza-te cu Apple</span>
        </button>
        <button type="button" className="v3-social-button">
          <span className="v3-social-mark v3-social-mark-facebook">f</span>
          <span>Conecteaza-te cu Facebook</span>
        </button>
      </div>

      <div className="v3-auth-divider">
        <span>sau continua cu datele tale</span>
      </div>

      <div className="v3-signup-progress">
        <div className={`v3-signup-progress-step ${registerStep === "email" ? "v3-signup-progress-step-active" : ""}`}>1. Email</div>
        <div className={`v3-signup-progress-step ${registerStep === "password" ? "v3-signup-progress-step-active" : registerStep !== "email" ? "v3-signup-progress-step-ready" : ""}`}>2. Parola</div>
        <div className={`v3-signup-progress-step ${registerStep === "phone" ? "v3-signup-progress-step-active" : registerStep === "sms" ? "v3-signup-progress-step-ready" : ""}`}>3. Telefon</div>
        <div className={`v3-signup-progress-step ${registerStep === "sms" ? "v3-signup-progress-step-active" : ""}`}>4. Cod SMS</div>
      </div>

      <div className="v3-register-form v3-register-form-card">
        <div className="v3-signup-card-head">
          <div className="v3-eyebrow">Cont nou</div>
          <h3 className="v3-signup-card-title">Flux rapid, in pasi clari (client, partener, investitor)</h3>
          <p className="v3-signup-card-copy">
            Pas cu pas: email, parola, telefon si cod SMS. Dupa validare alegi rolul potrivit si finalizezi contul.
          </p>
        </div>

        {registerStep === "email" ? (
          <form className="v3-form-grid" onSubmit={(event) => {
            event.preventDefault();
            if (!email.trim()) {
              setError("Introdu o adresa de email valida.");
              return;
            }
            setError(null);
            setRegisterStep("password");
          }}>
            <label className="v3-form-field v3-form-field-full">
              <span>Email</span>
              <input className="v3-form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@mydarrin.com" required />
            </label>
            <div className="v3-final-actions">
              <button type="submit" className="v3-primary-button">
                Continua
              </button>
            </div>
          </form>
        ) : null}

        {registerStep === "password" ? (
          <form className="v3-form-grid" onSubmit={(event) => {
            event.preventDefault();
            if (password.trim().length < 8) {
              setError("Parola trebuie sa aiba minim 8 caractere.");
              return;
            }
            window.localStorage.setItem("mydarrin_signup_password", password);
            setError(null);
            setRegisterStep("phone");
          }}>
            <label className="v3-form-field">
              <span>Prenume</span>
              <input className="v3-form-control" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Ana" required />
            </label>
            <label className="v3-form-field">
              <span>Nume</span>
              <input className="v3-form-control" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Popescu" required />
            </label>
            <label className="v3-form-field v3-form-field-full">
              <span>Parola</span>
              <div className="relative">
                <input
                  className="v3-form-control pr-12"
                  type={showSignupPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minim 8 caractere"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-orange-600"
                  onClick={() => setShowSignupPassword((value) => !value)}
                >
                  {showSignupPassword ? "Ascunde" : "Afiseaza"}
                </button>
              </div>
            </label>
            <div className="v3-final-actions">
              <button type="submit" className="v3-primary-button">
                Continua
              </button>
              <button type="button" className="v3-dark-button" onClick={() => setRegisterStep("email")}>
                Schimba email
              </button>
            </div>
          </form>
        ) : null}

        {registerStep === "phone" ? (
          <form className="v3-form-grid" onSubmit={startLead}>
            <label className="v3-form-field">
              <span>Telefon</span>
              <input className="v3-form-control" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+40 7xx xxx xxx" required />
            </label>
            <label className="v3-form-field v3-form-field-full">
              <span>Oras / adresa scurta</span>
              <input className="v3-form-control" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Bucuresti, Sector 3" />
            </label>
            <div className="v3-final-actions">
              <button type="submit" className="v3-primary-button" disabled={loading}>
                {loading ? "Se trimite..." : "Trimite SMS"}
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {registerStep === "sms" && lead ? (
        <div className="v3-form-section v3-signup-verification-card">
          <div className="v3-eyebrow">Validare telefon</div>
          <div className="v3-inline-note v3-inline-note-soft">
            Contul preliminar este deja salvat pentru {lead.first_name} {lead.last_name}. Mai lipseste confirmarea prin cod SMS.
          </div>
          <div className="v3-form-grid">
            <label className="v3-form-field">
              <span>Cod SMS</span>
              <input className="v3-form-control" value={smsCode} onChange={(event) => setSmsCode(event.target.value)} placeholder="000000" />
            </label>
          </div>
          <div className="v3-final-actions">
            <button type="button" className="v3-dark-button" disabled={loading || smsCode.trim().length < 4} onClick={verifyPhone}>
              {loading ? "Se verifica..." : "Verifica telefonul"}
            </button>
          </div>
        </div>
      ) : null}

      {message ? <div className="v3-feedback-card v3-feedback-success">{message}</div> : null}
      {error ? <div className="v3-feedback-card v3-feedback-error">{error}</div> : null}
    </div>
  );
}

export function PublicRoleSelectionForm({ leadId }: { leadId: number }) {
  const router = useRouter();
  const [lead, setLead] = useState<SignupLeadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLead() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/signup-leads/${leadId}`, {
          headers: GATE ? { "X-Gate-Authorization": GATE } : undefined,
        });
        const payload = await parseApiResponse<SignupLeadResponse>(response);
        if (!active) {
          return;
        }
        setLead(payload);
        const match = publicSignupRoleOptions.find((option) => option.role === payload.selected_role);
        setSelectedOptionId(match?.id ?? null);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Nu am putut incarca fluxul de rol.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLead();
    return () => {
      active = false;
    };
  }, [leadId]);

  async function continueWithRole(role: SignupRole, subrole?: SignupSubrole) {
    setLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined") {
        if (role === "PARTNER" && subrole) {
          window.localStorage.setItem("mydarrin_provider_type", subrole);
        } else if (role !== "PARTNER") {
          window.localStorage.removeItem("mydarrin_provider_type");
        }
      }
      const response = await fetch(`${API_BASE}/api/v1/auth/signup-leads/select-role`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ lead_id: leadId, role }),
      });
      await parseApiResponse<SignupLeadResponse>(response);
      router.push(resolveRoleRedirect(role, subrole ?? null, leadId));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nu am putut salva rolul.");
      setLoading(false);
    }
  }

  if (loading && !lead) {
    return <div className="v3-feedback-card">Se incarca pasul de selectie rol...</div>;
  }

  if (error && !lead) {
    return <div className="v3-feedback-card v3-feedback-error">{error}</div>;
  }

  if (!lead) {
    return null;
  }

  return (
    <div className="v3-signup-flow">
      <div className="v3-feedback-card">
        Telefon validat pentru {lead.first_name} {lead.last_name}. Alege acum traseul potrivit.
      </div>

      <div className="v3-role-grid">
        {publicSignupRoleOptions.map((option) => {
          const resolvedRole = option.role;
          return (
            <article key={option.id} className={`v3-role-card ${selectedOptionId === option.id ? "v3-role-card-active" : ""}`}>
              <div className="v3-role-header">
                <span className="v3-role-audience">{option.label}</span>
                <div className="v3-card-kicker">{option.audience}</div>
              </div>
              <p className="v3-role-description">{option.description}</p>
              <div className="v3-role-permissions">
                {option.permissions.map((permission) => (
                  <div key={permission} className="v3-role-permission">
                    {permission}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="v3-primary-button"
                disabled={loading}
                onClick={() => {
                  setSelectedOptionId(option.id);
                  const subrole = option.subrole as SignupSubrole | undefined;
                  void continueWithRole(resolvedRole, subrole);
                }}
              >
                {option.ctaLabel}
              </button>
            </article>
          );
        })}
      </div>

      <div className="v3-inline-note">
        Rolurile operationale (Admin, Provider) intra automat in verificare si necesita aprobare de `SUPER_ADMIN`.
      </div>

      {error ? <div className="v3-feedback-card v3-feedback-error">{error}</div> : null}
    </div>
  );
}

export function PublicRoleCompletionForm({
  leadId,
  role,
  subrole,
}: {
  leadId: number;
  role: SignupRole;
  subrole?: string;
}) {
  const normalizedSubrole = normalizeSubrole(subrole);
  const [lead, setLead] = useState<SignupLeadResponse | null>(null);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [partnerFiles, setPartnerFiles] = useState<File[]>([]);
  const [partnerDocStatus, setPartnerDocStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const cached = typeof window !== "undefined" ? window.localStorage.getItem("mydarrin_signup_password") : null;
    if (cached) {
      setPassword(cached);
    }

    async function loadLead() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/signup-leads/${leadId}`, {
          headers: GATE ? { "X-Gate-Authorization": GATE } : undefined,
        });
        const payload = await parseApiResponse<SignupLeadResponse>(response);
        if (active) {
          setLead(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Nu am putut incarca datele preliminare.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLead();
    return () => {
      active = false;
    };
  }, [leadId]);

  async function finalizeAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    setPartnerDocStatus(null);

    if (role === "PARTNER" && partnerFiles.length === 0) {
      setLoading(false);
      setError("Pentru parteneri sunt obligatorii documentele (PDF sau imagine).");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register-complete`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          lead_id: leadId,
          password,
          role,
        }),
      });
      const payload = await parseApiResponse<RegisterUserResponse>(response);
      if (role === "PARTNER") {
        for (const file of partnerFiles) {
          const formData = new FormData();
          formData.append("user_id", String(payload.id));
          formData.append("file", file);
          const uploadResponse = await fetch(`${API_BASE}/api/v1/public/partners/documents`, {
            method: "POST",
            headers: GATE ? { "X-Gate-Authorization": GATE } : undefined,
            body: formData,
          });
          await parseApiResponse(uploadResponse);
        }
        setPartnerDocStatus("Documentele au fost incarcate. Status: PENDING.");
      }
      const isApproved = payload.verification_status === "APPROVED";
      const statusCopy = isApproved ? "Contul este activ imediat." : "Contul a intrat in aprobarea operationala.";
      const redirectPath = resolvePostSignupRedirect(payload.role, normalizedSubrole ?? null, !isApproved);
      window.localStorage.removeItem("mydarrin_signup_password");
      window.location.href = redirectPath;
      return;
      setPassword("");
      setAccepted(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nu am putut finaliza contul.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !lead) {
    return <div className="v3-feedback-card">Se incarca pagina dedicata rolului...</div>;
  }

  return (
    <div className="v3-signup-flow">
      {lead ? (
        <div className="v3-feedback-card">
          Flux dedicat pentru {roleContextLabel(role, normalizedSubrole)}. Profilul preliminar exista deja pentru {lead.first_name} {lead.last_name} ({lead.email}).
        </div>
      ) : null}

      <form className="v3-register-form" onSubmit={finalizeAccount}>
        <div className="v3-form-grid">
          <label className="v3-form-field v3-form-field-full">
            <span>Parola contului {roleContextLabel(role, normalizedSubrole)}</span>
            <div className="relative">
              <input
                className="v3-form-control pr-12"
                type={showSignupPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Parola sigura"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-orange-600"
                onClick={() => setShowSignupPassword((value) => !value)}
              >
                {showSignupPassword ? "Ascunde" : "Afiseaza"}
              </button>
            </div>
          </label>
          {role === "PARTNER" ? (
            <label className="v3-form-field v3-form-field-full">
              <span>Documente partener (PDF / imagini)</span>
              <input
                className="v3-form-control"
                type="file"
                accept="application/pdf,image/*"
                multiple
                onChange={(event) => setPartnerFiles(Array.from(event.target.files ?? []))}
              />
            </label>
          ) : null}
        </div>

        <label className="v3-checkbox-field">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          <span>Confirm ca datele introduse sunt corecte si inteleg fluxul de aprobare pentru rolul selectat.</span>
        </label>

        <div className="v3-final-actions">
          <button type="submit" className="v3-primary-button" disabled={loading || !accepted}>
            {loading ? "Se finalizeaza..." : `Finalizeaza contul ${roleLabel(role)}`}
          </button>
        </div>
      </form>

      <div className="v3-mini-grid">
      <div className="v3-mini-card">
        <div className="v3-card-kicker">Profil curent</div>
        <strong>{roleContextLabel(role, normalizedSubrole)}</strong>
        <p>Pagina este dedicata exclusiv traseului selectat si ramane curata, fara campuri din alte roluri.</p>
      </div>
        <div className="v3-mini-card">
          <div className="v3-card-kicker">Aprobari</div>
          <strong>Regula de acces</strong>
          <p>Clientul se poate activa direct, iar rolurile operationale intra in aprobare. Backoffice-ul nu se acorda din acest flux public.</p>
        </div>
      </div>

      <div className="v3-final-actions">
        <Link href={`/account/create/select-role?lead=${leadId}`} className="v3-dark-button">
          Inapoi la selectie rol
        </Link>
      </div>

      {message ? <div className="v3-feedback-card v3-feedback-success">{message}</div> : null}
      {partnerDocStatus ? <div className="v3-feedback-card v3-feedback-success">{partnerDocStatus}</div> : null}
      {error ? <div className="v3-feedback-card v3-feedback-error">{error}</div> : null}
    </div>
  );
}
