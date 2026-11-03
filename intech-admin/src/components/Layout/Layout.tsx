import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, X } from "lucide-react";
import { NotificationsPanel } from "../NotificationsPanel";
import { Sidebar } from "../Sidebar";
import { Status } from "../Status";
import { Topbar } from "../Topbar";
import { RequestDetails } from "../../pages/Requests/components/RequestDetails";
import {
  pageDescriptions,
  pagePermission,
  pageRoutes,
} from "../../config/navigation";
import { hasPermission } from "../../lib/access";
import { logoutAdmin, useAppDispatch, useAppSelector } from "../../state";
import type { AdminUser, PageName, RequestSummary } from "../../types";

export interface ScreenOutletContext {
  base: string;
  token: string;
  user: AdminUser;
  query: string;
  onSelect: (row: import("../../types").ApiRow) => void;
}

function currentPage(pathname: string): PageName {
  return (
    (Object.entries(pageRoutes).find(
      ([, path]) => path === pathname,
    )?.[0] as PageName) || "Vue d’ensemble"
  );
}

export function DashboardLayout() {
  const session = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RequestSummary | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  if (!session) return null;
  const page = currentPage(location.pathname);
  const go = (name: PageName) => {
    navigate(pageRoutes[name]);
    setMobileNav(false);
    setQuery("");
    setSelected(null);
  };
  const onQueryChange = (value: string) => {
    setQuery(value);
    if (value && !["Demandes", "Clients"].includes(page))
      navigate(pageRoutes.Demandes);
  };
  const pageLabel =
    page === "Vue d’ensemble" ? "CENTRE DE PILOTAGE" : page.toUpperCase();
  const sessionUser = session.user;
  return (
    <div className="shell">
      <Sidebar
        page={page}
        user={sessionUser}
        mobileOpen={mobileNav}
        onClose={() => setMobileNav(false)}
        onNavigate={go}
      />
      <div className="main-column">
        <Topbar
          page={page}
          user={sessionUser}
          query={query}
          onQueryChange={onQueryChange}
          onMenu={() => setMobileNav(true)}
          onNotifications={() => setNotificationsOpen((open) => !open)}
          onLogout={() => {
            void dispatch(logoutAdmin()).then(() =>
              navigate("/login", { replace: true }),
            );
          }}
        />
        {notificationsOpen && (
          <NotificationsPanel
            base={session.base}
            token={session.token}
            user={sessionUser}
            onClose={() => setNotificationsOpen(false)}
            onNavigate={(name) => {
              if (hasPermission(sessionUser, pagePermission[name])) go(name);
              setNotificationsOpen(false);
            }}
          />
        )}
        <main className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {pageLabel}
              </span>
              <h1>
                {page === "Vue d’ensemble" ? "Bonjour, équipe InTech" : page}
              </h1>
              <p>
                {page === "Vue d’ensemble"
                  ? "La vue opérationnelle de vos demandes, assignations et services."
                  : pageDescriptions[page] ||
                    "Suivez et gérez cette partie de votre service InTech."}
              </p>
            </div>
          </div>
          <Outlet
            context={
              {
                base: session.base,
                token: session.token,
                user: sessionUser,
                query,
                onSelect: (row: import("../../types").ApiRow) =>
                  setSelected({
                    id: row.Référence ?? row._id ?? "—",
                    device: row.Appareil,
                    model: row.Type,
                    kind: row.Type,
                    issue: row.Statut,
                    status: row.Statut,
                    tech: row.Technicien,
                    date: row.Créée,
                    city: "—",
                    apiId: row._id,
                  }),
              } satisfies ScreenOutletContext
            }
          />
        </main>
        <footer className="footer">
          <span>
            <b>
              intech<span className="brand-period">.</span>
            </b>{" "}
            Espace d’administration
          </span>
          <span>API InTech · mode lecture</span>
        </footer>
      </div>
      {selected && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            className="detail-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Détail de la demande ${selected.id}`}
          >
            <div className="drawer-head">
              <div>
                <span className="eyebrow">DOSSIER DE SERVICE</span>
                <h2>{selected.id}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Fermer"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>
            <Status>{selected.status}</Status>
            <div className="drawer-device">
              <span className="device-glyph">
                <RefreshCw size={22} />
              </span>
              <div>
                <b>{selected.device}</b>
                <small>
                  {selected.model} · {selected.kind}
                </small>
              </div>
            </div>
            <RequestDetails
              base={session.base}
              token={session.token}
              id={selected.apiId}
              selected={selected}
            />
          </section>
        </div>
      )}
    </div>
  );
}
