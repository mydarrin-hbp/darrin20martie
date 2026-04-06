"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { BACKOFFICE_GATE_PASSWORD, BACKOFFICE_GATE_USERNAME, acceptAdminInvite } from "@/lib/api";
import { getPublicSiteBaseUrl } from "@/lib/public-site";


function LoginScreen() {
  const { gateUnlocked, login, unlockGate } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);
  const [gateUsername, setGateUsername] = useState(BACKOFFICE_GATE_USERNAME);
  const [gatePassword, setGatePassword] = useState(BACKOFFICE_GATE_PASSWORD);
  const [showGatePassword, setShowGatePassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inviteToken = searchParams.get("invite");
  const publicBase = getPublicSiteBaseUrl();

  async function onUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await unlockGate(gateUsername, gatePassword);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Gate invalid.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password, rememberMe);
      router.replace(searchParams.get("next") ?? "/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Autentificarea a esuat.");
    } finally {
      setLoading(false);
    }
  }

  async function onAcceptInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteToken) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await acceptAdminInvite(inviteToken, invitePassword, inviteFullName || undefined);
      setEmail("");
      setPassword("");
      setInvitePassword("");
      router.replace("/login?next=/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Activarea invitatiei a esuat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="text-xs uppercase tracking-[0.26em] text-muted">My Darrin</div>
          <h1 className="mt-4 max-w-3xl text-6xl font-semibold leading-[0.9] text-ink">Back Office Web Admin Panel</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted">
            Control complet pentru parteneri, catalog, clienti, investitori, devize, comenzi si profil admin.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Aplicatia este protejata cu parola puternica si nu trebuie expusa public pana la deploy-ul final pe Google Platform.
          </p>
        </section>

        {!gateUnlocked ? (
          <form onSubmit={onUnlock} className="panel p-8">
            <div className="text-sm font-medium text-muted">Security Gate obligatoriu</div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm text-muted">
                Username gate
                <input className="field" value={gateUsername} onChange={(event) => setGateUsername(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Parola gate
                <div className="relative">
                  <input
                    className="field pr-12"
                    type={showGatePassword ? "text" : "password"}
                    value={gatePassword}
                    onChange={(event) => setGatePassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 text-xs font-semibold text-accent"
                    onClick={() => setShowGatePassword((value) => !value)}
                  >
                    {showGatePassword ? "Ascunde" : "Arata"}
                  </button>
                </div>
              </label>
            </div>
            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
              {loading ? "Verific..." : "Deblocheaza panoul"}
            </button>
          </form>
        ) : inviteToken ? (
          <form onSubmit={onAcceptInvite} className="panel p-8">
            <div className="text-sm font-medium text-muted">Activare colaborator</div>
            <div className="mt-2 text-sm leading-6 text-muted">
              Invitatie valida detectata. Seteaza parola si activeaza accesul in Back Office.
            </div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm text-muted">
                Nume complet
                <input className="field" value={inviteFullName} onChange={(event) => setInviteFullName(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Parola noua
                <input className="field" type="password" value={invitePassword} onChange={(event) => setInvitePassword(event.target.value)} />
              </label>
            </div>
            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
              {loading ? "Activez..." : "Activeaza contul"}
            </button>
          </form>
        ) : (
          <div className="panel p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-muted">
              <span>{authMode === "login" ? "Autentificare admin cu JWT + RBAC" : "Creare cont profesionist"}</span>
              <div className="inline-flex rounded-full border border-border bg-white/80 p-1">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${authMode === "login" ? "bg-ink text-white" : "text-ink/70"}`}
                  onClick={() => setAuthMode("login")}
                >
                  Intrare in cont
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${authMode === "signup" ? "bg-ink text-white" : "text-ink/70"}`}
                  onClick={() => setAuthMode("signup")}
                >
                  Creare cont
                </button>
              </div>
            </div>

            {authMode === "login" ? (
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm text-muted">
                  Email
                  <input
                    className="field"
                    value={email}
                    autoComplete="username"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-sm text-muted">
                  Parola
                  <div className="relative">
                    <input
                      className="field pr-12"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      autoComplete="current-password"
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 text-xs font-semibold text-accent"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? "Ascunde" : "Arata"}
                    </button>
                  </div>
                </label>
                <label className="flex items-center gap-3 text-sm text-muted">
                  <input
                    className="h-4 w-4 accent-ink"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Pastreaza sesiunea in Chrome
                </label>
                {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
                <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
                  {loading ? "Autentific..." : "Intra in back office"}
                </button>
                <button type="button" className="btn-secondary w-full" onClick={() => setAuthMode("signup")}>
                  Nu ai cont? Creeaza cont
                </button>
              </form>
            ) : (
              <div className="mt-6 grid gap-4 text-sm text-muted">
                <p>
                  Conturile profesionale sunt aprobate controlat. Trimite cererea de acces si vei primi o invitatie oficiala pentru
                  activare.
                </p>
                <div className="grid gap-3">
                  <a className="btn-primary w-full text-center" href={`${publicBase}/account/create/administrare`}>
                    Deschide cerere acces
                  </a>
                  <a className="btn-secondary w-full text-center" href={`${publicBase}/contact`}>
                    Contact My Darrin
                  </a>
                  <button type="button" className="btn-secondary w-full" onClick={() => setAuthMode("login")}>
                    Am deja cont, intra in cont
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 text-muted">Se incarca autentificarea...</main>}>
      <LoginScreen />
    </Suspense>
  );
}
