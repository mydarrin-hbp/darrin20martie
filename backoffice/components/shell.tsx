"use client";

import { useRouter } from "next/navigation";

import { useAdminShell } from "@/components/admin-shell-provider";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout, editMode, canDesignEdit, toggleEditMode } = useAuth();
  const { collapsed } = useAdminShell();
  const router = useRouter();

  return (
    <div className="admin-shell">
      <Sidebar />

      <div className={`admin-main ${collapsed ? "admin-main-collapsed" : ""}`}>
        <header className="admin-topbar">
          <div>
            <div className="admin-topbar-kicker">{user?.role === "PARTNER" ? "Partner Operations" : "Hybrid Service-CMS"}</div>
            <div className="admin-topbar-title">{user?.role === "PARTNER" ? "My Darrin Partner App" : "Executive Back Office"}</div>
            {user?.admin_role_key ? (
              <div className="admin-topbar-meta">
                {user.admin_role_key}
                {user.country_access?.length ? ` · ${user.country_access.join(", ")}` : ""}
              </div>
            ) : null}
          </div>

          <div className="admin-topbar-actions">
            {canDesignEdit ? (
              <button
                type="button"
                className={`admin-live-toggle ${editMode ? "admin-live-toggle-active" : ""}`}
                onClick={toggleEditMode}
              >
                {editMode ? "Live Edit Mode ON" : "Live Edit Mode OFF"}
              </button>
            ) : null}
            <div className="admin-session-pill">
              <span className="admin-session-dot" />
              <span>{user?.email}</span>
            </div>
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

        <main className="admin-canvas">{children}</main>
      </div>
    </div>
  );
}
