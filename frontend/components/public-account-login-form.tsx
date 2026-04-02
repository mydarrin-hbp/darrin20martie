"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export function PublicAccountLoginForm() {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Introdu o adresa de email valida.");
      return;
    }
    setError(null);
    setStep("password");
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail ?? "Autentificare esuata.");
      }
      window.localStorage.setItem("mydarrin_client_auth", payload.access_token ?? "");
      window.localStorage.setItem("mydarrin_client_email", payload.email ?? email.trim());
      const rawRole =
        (payload.role ?? payload.user_role ?? payload.account_role ?? payload.profile_role ?? "").toString().toLowerCase();
      const roleParam =
        rawRole.includes("provider")
          ? "provider"
          : rawRole.includes("partner")
            ? "partner"
            : rawRole.includes("invest")
              ? "investor"
              : rawRole.includes("admin")
                ? "admin"
                : "client";
      if ((payload.verification_status ?? "").toUpperCase() === "APPROVED") {
        window.location.href = `/my-account?role=${roleParam}`;
        return;
      }
      setMessage("Autentificare reusita. Contul este in verificare.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Autentificare esuata.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {step === "email" ? (
        <form className="v3-auth-form-grid" onSubmit={handleContinue}>
          <label className="v3-form-field">
            <span>Adresa de e-mail</span>
            <input
              className="v3-form-control v3-form-control-rect"
              placeholder="email@mydarrin.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <div className="v3-auth-actions">
            <button type="submit" className="v3-primary-button v3-auth-primary">
              Continua
            </button>
            <a href="/account/create" className="v3-dark-button">
              Creeaza cont
            </a>
          </div>
          {error ? <div className="v3-feedback-card v3-feedback-error">{error}</div> : null}
        </form>
      ) : (
        <form className="v3-auth-form-grid" onSubmit={handleLogin}>
          <label className="v3-form-field">
            <span>Email</span>
            <input
              className="v3-form-control v3-form-control-rect"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="v3-form-field">
            <span>Parola</span>
            <input
              className="v3-form-control v3-form-control-rect"
              type="password"
              placeholder="Introdu parola"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <div className="v3-auth-actions">
            <button type="submit" className="v3-primary-button v3-auth-primary" disabled={loading}>
              {loading ? "Autentific..." : "Continua"}
            </button>
            <button type="button" className="v3-dark-button" onClick={() => setStep("email")}>
              Schimba email
            </button>
          </div>
          <div className="v3-auth-actions">
            <a href="/my-account/orders" className="v3-ghost-chip">
              Istoric comenzi
            </a>
          </div>
          {message ? <div className="v3-feedback-card v3-feedback-success">{message}</div> : null}
          {error ? <div className="v3-feedback-card v3-feedback-error">{error}</div> : null}
        </form>
      )}
    </>
  );
}
