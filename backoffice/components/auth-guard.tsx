"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { gateUnlocked, user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (
      !gateUnlocked ||
      !token ||
      !user ||
      !["ADMIN", "SUPER_ADMIN"].includes(user.role ?? "") ||
      !user.permissions?.includes("backoffice:access")
    ) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [gateUnlocked, loading, pathname, router, token, user]);

  if (loading || !gateUnlocked || !token || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Se incarca sesiunea de administrare...</div>;
  }

  return <>{children}</>;
}
