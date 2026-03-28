"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-[1560px] gap-6 px-6 py-6">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="panel mb-6 flex items-center justify-between px-6 py-5">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted">Admin session</div>
            <div className="mt-2 text-lg font-semibold text-ink">{user?.email}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="tag">{user?.role}</span>
            <button
              className="btn-secondary"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
