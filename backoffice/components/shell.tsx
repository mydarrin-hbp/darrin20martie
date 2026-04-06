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

        <div className="admin-quick-links">
          <a className="admin-quick-link" href="/catalog" target="_blank" rel="noreferrer">
            Catalog Materiale
          </a>
          <a className="admin-quick-link" href="/catalog?resource_type=EQUIPMENT" target="_blank" rel="noreferrer">
            Inchirieri Utilaje
          </a>
          <a className="admin-quick-link admin-quick-link-accent" href="/partners/join" target="_blank" rel="noreferrer">
            Devino Partener
          </a>
        </div>

        <main className="admin-canvas">{children}</main>

        <footer className="admin-footer">
          <div className="admin-footer-grid">
            <div>
              <div className="admin-footer-title">Domenii</div>
              <div className="admin-footer-links">
                <span>Constructii & Instalatii</span>
                <span>Electrice & Iluminat</span>
                <span>Utilaje Rental</span>
              </div>
            </div>
            <div>
              <div className="admin-footer-title">Servicii</div>
              <div className="admin-footer-links">
                <span>Catalog servicii</span>
                <span>Devizuri</span>
                <span>Comenzi live</span>
              </div>
            </div>
            <div>
              <div className="admin-footer-title">Parteneri</div>
              <div className="admin-footer-links">
                <span>Onboarding</span>
                <span>Documente</span>
                <span>Ratinguri</span>
              </div>
            </div>
            <div>
              <div className="admin-footer-title">Investitori</div>
              <div className="admin-footer-links">
                <span>Runde SEED</span>
                <span>Quorum live</span>
                <span>Raportare</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
