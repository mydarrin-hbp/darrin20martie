"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAdminShell } from "@/components/admin-shell-provider";
import { useAuth } from "@/components/auth-provider";

type SidebarItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
  moduleKey?: string;
  publicHref?: string;
  children?: SidebarItem[];
};

const sections: Array<{ title: string; items: SidebarItem[] }> = [
  {
    title: "Tablou de Bord",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard / Tablou de Bord",
        shortLabel: "DASH",
        icon: "DB",
        moduleKey: "dashboard",
        publicHref: "/",
      },
    ],
  },
  {
    title: "Visual Builder",
    items: [
      {
        href: "/system/public-site-content",
        label: "Design Center",
        shortLabel: "CMS",
        icon: "VB",
        moduleKey: "site_content",
        publicHref: "/",
        children: [
          { href: "/system/public-site-content", label: "Header / Footer", shortLabel: "HF", icon: "HF", moduleKey: "site_content", publicHref: "/" },
          { href: "/admin/design-system/homepage-builder", label: "Homepage Sections", shortLabel: "HP", icon: "HP", moduleKey: "visual_cms", publicHref: "/" },
        ],
      },
    ],
  },
  {
    title: "Catalog Servicii Tehnice",
    items: [
      {
        href: "/admin/catalog-services",
        label: "Domenii / Categorii / Servicii",
        shortLabel: "CAT",
        icon: "CT",
        moduleKey: "catalog",
        publicHref: "/catalog",
        children: [
          { href: "/backoffice/domains", label: "Domenii & Categorii", shortLabel: "DOM", icon: "DM", moduleKey: "catalog", publicHref: "/catalog" },
          { href: "/backoffice/services", label: "Servicii Finale", shortLabel: "SRV", icon: "SV", moduleKey: "catalog", publicHref: "/catalog" },
          { href: "/deviz-configs", label: "Tiers Management", shortLabel: "TR", icon: "TR", moduleKey: "catalog_pricing", publicHref: "/catalog" },
          { href: "/system/financial-settings", label: "Taxe & Nivele", shortLabel: "TX", icon: "TX", moduleKey: "financial", publicHref: "/catalog" },
          {
            href: "/backoffice/indicators",
            label: "Advanced Engine Settings",
            shortLabel: "ADV",
            icon: "AD",
            moduleKey: "catalog_pricing",
            children: [
              { href: "/backoffice/activities", label: "Unitless Activities", shortLabel: "UA", icon: "UA", moduleKey: "catalog_pricing" },
              { href: "/backoffice/indicators", label: "Indicatori Deviz", shortLabel: "ID", icon: "ID", moduleKey: "catalog_pricing" },
              { href: "/backoffice/resources/prices", label: "Cost Engine Specs", shortLabel: "CE", icon: "CE", moduleKey: "catalog_pricing" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Operatiuni & Fluxuri",
    items: [
      {
        href: "/orders",
        label: "Pipeline Operational",
        shortLabel: "OPS",
        icon: "OP",
        moduleKey: "operations",
        publicHref: "/checkout",
        children: [
          { href: "/orders", label: "Comenzi & Status", shortLabel: "ORD", icon: "OR", moduleKey: "operations" },
          { href: "/admin/order-execution", label: "Executie & Timeline", shortLabel: "EX", icon: "EX", moduleKey: "operations" },
          { href: "/backoffice/resources", label: "Assets de Executie", shortLabel: "AST", icon: "AS", moduleKey: "operations" },
        ],
      },
    ],
  },
  {
    title: "Resurse & Financial",
    items: [
      {
        href: "/system/financial-settings",
        label: "Labor / Materials / Tax",
        shortLabel: "FIN",
        icon: "RF",
        moduleKey: "financial",
        publicHref: "/catalog",
        children: [
          { href: "/cost/admin-configs/labor-rates", label: "Matrice Manopera", shortLabel: "LAB", icon: "LB", moduleKey: "financial" },
          { href: "/backoffice/resources/prices", label: "Matrice Materiale", shortLabel: "MAT", icon: "MT", moduleKey: "catalog_pricing" },
          { href: "/system/financial-settings", label: "Geo-Fiscal / VatSense", shortLabel: "VAT", icon: "VT", moduleKey: "financial" },
        ],
      },
    ],
  },
  {
    title: "Investor Dashboard",
    items: [
      {
        href: "/investors",
        label: "KPI & Documente",
        shortLabel: "INV",
        icon: "IN",
        moduleKey: "investors",
        publicHref: "/investors",
        children: [
          { href: "/investors", label: "Runda SEED", shortLabel: "SD", icon: "SD", moduleKey: "investors", publicHref: "/investors" },
          { href: "/admin/reports-bi", label: "Projected Revenue", shortLabel: "REV", icon: "RV", moduleKey: "financial" },
        ],
      },
    ],
  },
  {
    title: "Echipa & Permisiuni",
    items: [
      {
        href: "/admin/team",
        label: "RBAC & Activity Logs",
        shortLabel: "RBAC",
        icon: "TM",
        moduleKey: "team",
        publicHref: "/account/create/administrare",
        children: [
          { href: "/admin/team", label: "Invitatii & Roluri", shortLabel: "ADM", icon: "AD", moduleKey: "team" },
          { href: "/profile", label: "Profil Admin", shortLabel: "PR", icon: "PR", moduleKey: "team" },
          { href: "/admin/integrations", label: "Integrations", shortLabel: "API", icon: "AP", moduleKey: "team" },
        ],
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildPublicHref(publicHref: string | undefined, editMode: boolean, canDesignEdit: boolean, token: string | null) {
  if (!publicHref) {
    return null;
  }
  const params = new URLSearchParams();
  if (editMode && canDesignEdit) {
    params.set("edit_mode", "1");
    if (token) {
      params.set("admin_token", token);
    }
  }
  return `${publicHref}${params.toString() ? `?${params.toString()}` : ""}`;
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useAdminShell();
  const { user, token, editMode, canDesignEdit } = useAuth();
  if (user?.role === "PARTNER") {
    return (
      <aside className={clsx("admin-sidebar", collapsed && "admin-sidebar-collapsed")}>
        <div className="admin-sidebar-head">
          <div className={clsx("admin-sidebar-brand", collapsed && "admin-sidebar-brand-collapsed")}>
            <div className="admin-sidebar-brand-mark">MD</div>
            {!collapsed ? (
              <div>
                <div className="admin-sidebar-brand-label">My Darrin</div>
                <div className="admin-sidebar-brand-title">Partner App</div>
              </div>
            ) : null}
          </div>
          <button type="button" className="admin-sidebar-toggle" onClick={toggleCollapsed} title={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? ">" : "<"}
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section">
            {!collapsed ? <div className="admin-sidebar-section-title">Partener</div> : null}
            <div className="admin-sidebar-items">
              <div className="admin-sidebar-item-wrap">
                <div className="admin-sidebar-row" title={collapsed ? "Live Jobs" : undefined}>
                  <Link
                    href="/partner/live-jobs"
                    className={clsx("admin-sidebar-link", isActive(pathname, "/partner/live-jobs") && "admin-sidebar-link-active", collapsed && "admin-sidebar-link-collapsed")}
                  >
                    <span className="admin-sidebar-icon">JB</span>
                    {!collapsed ? <span className="admin-sidebar-label">Live Jobs & Claim</span> : null}
                  </Link>
                </div>
                {!collapsed ? (
                  <div className="admin-sidebar-children">
                    <div className="admin-sidebar-row">
                      <Link href="/profile" className={clsx("admin-sidebar-sublink", isActive(pathname, "/profile") && "admin-sidebar-sublink-active")}>
                        <span className="admin-sidebar-subicon">PR</span>
                        <span>Validare documente</span>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </nav>
      </aside>
    );
  }
  const allowedModules = new Set((user?.module_access ?? []).map((item) => item.toLowerCase()));
  const shouldFilter = user?.role === "ADMIN" && allowedModules.size > 0;
  const visibleSections: Array<{ title: string; items: SidebarItem[] }> = [];

  for (const section of sections) {
    const visibleItems: SidebarItem[] = [];
    for (const item of section.items) {
      const visibleChildren = item.children?.filter(
        (child) => !shouldFilter || !child.moduleKey || allowedModules.has(child.moduleKey),
      );
      const visibleSelf =
        !shouldFilter || !item.moduleKey || allowedModules.has(item.moduleKey) || (visibleChildren?.length ?? 0) > 0;
      if (!visibleSelf) {
        continue;
      }
      visibleItems.push({ ...item, children: visibleChildren });
    }
    if (visibleItems.length > 0) {
      visibleSections.push({ title: section.title, items: visibleItems });
    }
  }

  return (
    <aside className={clsx("admin-sidebar", collapsed && "admin-sidebar-collapsed")}>
      <div className="admin-sidebar-head">
        <div className={clsx("admin-sidebar-brand", collapsed && "admin-sidebar-brand-collapsed")}>
          <div className="admin-sidebar-brand-mark">MD</div>
          {!collapsed ? (
            <div>
              <div className="admin-sidebar-brand-label">My Darrin</div>
              <div className="admin-sidebar-brand-title">Executive v5.5</div>
            </div>
          ) : null}
        </div>
        <button type="button" className="admin-sidebar-toggle" onClick={toggleCollapsed} title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="admin-sidebar-nav">
        {visibleSections.map((section) => (
          <div key={section.title} className="admin-sidebar-section">
            {!collapsed ? <div className="admin-sidebar-section-title">{section.title}</div> : null}
            <div className="admin-sidebar-items">
              {section.items.map((item) => {
                const parentActive = isActive(pathname, item.href) || item.children?.some((child) => isActive(pathname, child.href));
                const publicHref = buildPublicHref(item.publicHref, editMode, canDesignEdit, token);

                return (
                  <div key={item.href} className="admin-sidebar-item-wrap">
                    <div className="admin-sidebar-row" title={collapsed ? item.label : undefined}>
                      <Link
                        href={item.href}
                        className={clsx("admin-sidebar-link", parentActive && "admin-sidebar-link-active", collapsed && "admin-sidebar-link-collapsed")}
                      >
                        <span className="admin-sidebar-icon">{item.icon}</span>
                        {!collapsed ? <span className="admin-sidebar-label">{item.label}</span> : null}
                      </Link>
                      {!collapsed && publicHref ? (
                        <Link href={publicHref} target="_blank" rel="noreferrer" className="admin-sidebar-live">
                          Live
                        </Link>
                      ) : null}
                    </div>

                    {!collapsed && item.children?.length ? (
                      <div className="admin-sidebar-children">
                        {item.children.map((child) => {
                          const childPublicHref = buildPublicHref(child.publicHref ?? item.publicHref, editMode, canDesignEdit, token);
                          return (
                            <div key={child.href} className="admin-sidebar-row">
                              <Link
                                href={child.href}
                                className={clsx("admin-sidebar-sublink", isActive(pathname, child.href) && "admin-sidebar-sublink-active")}
                              >
                                <span className="admin-sidebar-subicon">{child.icon}</span>
                                <span>{child.label}</span>
                              </Link>
                              {childPublicHref ? (
                                <Link href={childPublicHref} target="_blank" rel="noreferrer" className="admin-sidebar-live admin-sidebar-live-sub">
                                  Live
                                </Link>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
