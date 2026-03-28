"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { AdminUser, getCurrentUser, loginAdmin } from "@/lib/api";

type AuthContextValue = {
  token: string | null;
  user: AdminUser | null;
  gateUnlocked: boolean;
  loading: boolean;
  unlockGate: (username: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "mydarrin_backoffice_auth";
const GATE_KEY = "mydarrin_backoffice_gate";
const GATE_USERNAME = process.env.NEXT_PUBLIC_GATE_USERNAME ?? "ownergate";
const GATE_PASSWORD = process.env.NEXT_PUBLIC_GATE_PASSWORD ?? "CHANGE_ME";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gateStored = typeof window !== "undefined" ? window.localStorage.getItem(GATE_KEY) : null;
    if (gateStored === "unlocked") {
      setGateUnlocked(true);
    }

    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored) as { token: string };
    setToken(parsed.token);
    getCurrentUser(parsed.token)
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      gateUnlocked,
      loading,
      unlockGate: async (username, password) => {
        if (username !== GATE_USERNAME || password !== GATE_PASSWORD) {
          throw new Error("Credentialele pentru Security Gate sunt invalide.");
        }
        window.localStorage.setItem(GATE_KEY, "unlocked");
        setGateUnlocked(true);
      },
      login: async (email, password) => {
        const payload = await loginAdmin(email, password);
        if (!payload.role || !["ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
          throw new Error("Acest cont nu are acces in back office.");
        }
        if (!payload.permissions?.includes("backoffice:access")) {
          throw new Error("Acest cont nu are acces in back office.");
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: payload.access_token }));
        setToken(payload.access_token);
        const currentUser = await getCurrentUser(payload.access_token);
        setUser(currentUser);
      },
      logout: () => {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(GATE_KEY);
        setToken(null);
        setUser(null);
        setGateUnlocked(false);
      },
      refreshUser: async () => {
        if (!token) {
          return;
        }
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      },
    }),
    [gateUnlocked, loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
