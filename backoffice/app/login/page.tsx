"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { BACKOFFICE_GATE_PASSWORD, BACKOFFICE_GATE_USERNAME } from "@/lib/api";


function LoginScreen() {
  const { gateUnlocked, login, unlockGate } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gateUsername, setGateUsername] = useState(BACKOFFICE_GATE_USERNAME);
  const [gatePassword, setGatePassword] = useState(BACKOFFICE_GATE_PASSWORD);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      await login(email, password);
      router.replace(searchParams.get("next") ?? "/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Autentificarea a esuat.");
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
                <input className="field" type="password" value={gatePassword} onChange={(event) => setGatePassword(event.target.value)} />
              </label>
            </div>
            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
              {loading ? "Verific..." : "Deblocheaza panoul"}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="panel p-8">
            <div className="text-sm font-medium text-muted">Autentificare admin cu JWT + RBAC</div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm text-muted">
                Email
                <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm text-muted">
                Parola
                <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
            </div>
            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
              {loading ? "Autentific..." : "Intra in back office"}
            </button>
          </form>
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
