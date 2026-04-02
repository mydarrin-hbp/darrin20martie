"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { publicSelfSignupRoles } from "@/lib/public-site";

type SignupRole = "CLIENT" | "PARTNER" | "INVESTOR";

type SignupLeadResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city?: string | null;
  status: string;
  selected_role?: SignupRole | null;
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
  }[role];
}

export function PublicAccountRegisterForm() {
  const router = useRouter();
  const [registerStep, setRegisterStep] = useState<"email" | "password" | "phone" | "sms">("email");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
              <input className="v3-form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minim 8 caractere" required />
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
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);

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
        setSelectedRole(payload.selected_role ?? null);
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

  async function continueWithRole(role: SignupRole) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/signup-leads/select-role`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ lead_id: leadId, role }),
      });
      const payload = await parseApiResponse<SignupLeadResponse>(response);
      router.push(payload.redirect_path ?? "/account/create");
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
        {publicSelfSignupRoles.map((role) => {
          const resolvedRole = role.id.toUpperCase() as SignupRole;
          return (
            <article key={role.id} className={`v3-role-card ${selectedRole === resolvedRole ? "v3-role-card-active" : ""}`}>
              <div className="v3-role-header">
                <span className="v3-role-audience">{role.label}</span>
                <div className="v3-card-kicker">{role.audience}</div>
              </div>
              <p className="v3-role-description">{role.description}</p>
              <div className="v3-role-permissions">
                {role.permissions.map((permission) => (
                  <div key={permission} className="v3-role-permission">
                    {permission}
                  </div>
                ))}
              </div>
              <button type="button" className="v3-primary-button" disabled={loading} onClick={() => continueWithRole(resolvedRole)}>
                Continua ca {role.label}
              </button>
            </article>
          );
        })}
      </div>

      <div className="v3-inline-note">
        Accesul in Backoffice pentru `Admin` si `Super Admin` nu se cere din acest flux public. El se aproba doar de `SUPER_ADMIN`.
      </div>

      {error ? <div className="v3-feedback-card v3-feedback-error">{error}</div> : null}
    </div>
  );
}

export function PublicRoleCompletionForm({ leadId, role }: { leadId: number; role: SignupRole }) {
  const [lead, setLead] = useState<SignupLeadResponse | null>(null);
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
      const statusCopy =
        payload.verification_status === "APPROVED"
          ? "Contul este activ imediat."
          : "Contul a intrat in aprobarea operationala.";
      if (payload.verification_status === "APPROVED") {
        const roleParam =
          payload.role === "PARTNER"
            ? "partner"
            : payload.role === "INVESTOR"
              ? "investor"
              : "client";
        window.localStorage.removeItem("mydarrin_signup_password");
        window.location.href = `/my-account?role=${roleParam}`;
        return;
      }
      setMessage(`${statusCopy} Rol finalizat: ${roleLabel(payload.role)}.`);
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
          Flux dedicat pentru {roleLabel(role)}. Profilul preliminar exista deja pentru {lead.first_name} {lead.last_name} ({lead.email}).
        </div>
      ) : null}

      <form className="v3-register-form" onSubmit={finalizeAccount}>
        <div className="v3-form-grid">
          <label className="v3-form-field v3-form-field-full">
            <span>Parola contului {roleLabel(role)}</span>
            <input
              className="v3-form-control"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Parola sigura"
              required
            />
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
          <strong>{roleLabel(role)}</strong>
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
