import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { initialPageFor } from "../../lib/access";
import { pageRoutes } from "../../config/navigation";
import { LoginPage } from "../../pages/Login";
import { restoreSession, useAppDispatch, useAppSelector } from "../../state";
import type { PageName } from "../../types";
import { DashboardLayout } from "../Layout";
import { RequiredAuth } from "./RequiredAuth";
import { ScreenRoute } from "./ScreenRoute";

function LoginRoute() {
  const { session } = useAppSelector((state) => state.auth);
  if (session) return <Navigate to="/" replace />;
  return <LoginPage />;
}

function DefaultRoute() {
  const { session } = useAppSelector((state) => state.auth);
  return <Navigate to={pageRoutes[initialPageFor(session!.user)]} replace />;
}

const routes: [string, PageName][] = [
  ["requests", "Demandes"],
  ["technicians", "Techniciens"],
  ["clients", "Clients"],
  ["assignments", "Assignation"],
  ["services", "Prestations"],
  ["diagnostic-domains", "Domaines de diagnostic"],
  ["devices", "Appareils"],
  ["packages", "Forfaits"],
  ["package-requests", "Demandes forfaits"],
  ["wilaya-prices", "Prix par wilaya"],
  ["categories", "Catégories"],
  ["brands", "Marques"],
  ["products", "Produits"],
  ["orders", "Commandes"],
  ["replacement-parts", "Pièces de rechange"],
  ["partner-shops", "Magasins partenaires"],
  ["promo-codes", "Codes promo"],
  ["settings", "Réglages"],
  ["administrators", "Administrateurs"],
  ["profile", "Mon profil"],
];

export function AppRouter() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<RequiredAuth />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DefaultRoute />} />
          {routes.map(([path, page]) => (
            <Route
              key={path}
              path={path}
              element={<ScreenRoute page={page} />}
            />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
