"use client";

import { createContext, useContext, useMemo, useState } from "react";

type AdminShellContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const value = useMemo<AdminShellContextValue>(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
      setCollapsed,
    }),
    [collapsed],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) {
    throw new Error("useAdminShell must be used inside AdminShellProvider");
  }
  return context;
}
