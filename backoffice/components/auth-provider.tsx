"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { AdminUser, getCurrentUser, loginAdmin } from "@/lib/api";

type AuthContextValue = {
  token: string | null;
  user: AdminUser | null;
  gateUnlocked: boolean;
  editMode: boolean;
  canDesignEdit: boolean;
  loading: boolean;
  unlockGate: (username: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toggleEditMode: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "mydarrin_backoffice_auth";
const GATE_KEY = "mydarrin_backoffice_gate";
const EDIT_MODE_KEY = "mydarrin_backoffice_edit_mode";
const GATE_USERNAME = process.env.NEXT_PUBLIC_GATE_USERNAME ?? "ownergate";
const GATE_PASSWORD = process.env.NEXT_PUBLIC_GATE_PASSWORD ?? "CHANGE_ME";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gateStored = typeof window !== "undefined" ? window.localStorage.getItem(GATE_KEY) : null;
    if (gateStored === "unlocked") {
      setGateUnlocked(true);
    }
    const editModeStored = typeof window !== "undefined" ? window.localStorage.getItem(EDIT_MODE_KEY) : null;
    if (editModeStored === "on") {
      setEditMode(true);
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
      editMode,
      canDesignEdit: Boolean(user?.design_edit || user?.permissions?.includes("design_edit:use") || user?.role === "SUPER_ADMIN"),
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
        if (!payload.role || !["ADMIN", "SUPER_ADMIN", "PARTNER"].includes(payload.role)) {
          throw new Error("Acest cont nu are acces in back office.");
        }
        const hasBackofficeAccess = payload.permissions?.includes("backoffice:access");
        const hasPartnerAccess = payload.permissions?.includes("partner:dashboard");
        if (!hasBackofficeAccess && !hasPartnerAccess) {
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
        window.localStorage.removeItem(EDIT_MODE_KEY);
        setToken(null);
        setUser(null);
        setGateUnlocked(false);
        setEditMode(false);
      },
      refreshUser: async () => {
        if (!token) {
          return;
        }
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      },
      toggleEditMode: () => {
        const nextValue = !editMode;
        window.localStorage.setItem(EDIT_MODE_KEY, nextValue ? "on" : "off");
        setEditMode(nextValue);
      },
    }),
    [editMode, gateUnlocked, loading, token, user],
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
