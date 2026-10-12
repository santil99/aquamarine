import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router";
import { AuthService } from "@/application/services/authService";
import { SalesService } from "@/application/services/salesService";
import type { NewSaleInput } from "@/domain/sales/newSale";
import { activeBusiness } from "@/infrastructure/business/mockBusinessContext";
import { supabaseAuthRepository } from "@/infrastructure/supabase/supabaseAuthRepository";
import { supabaseSalesRepository } from "@/infrastructure/supabase/supabaseSalesRepository";
import { AppLayout } from "@/presentation/layout/AppLayout";
import { LoginView } from "@/presentation/views/LoginView";
import { NewSaleView } from "@/presentation/views/NewSaleView";
import { SalesListView } from "@/presentation/views/SalesListView";

const authService = new AuthService(supabaseAuthRepository);
const salesService = new SalesService(supabaseSalesRepository, supabaseAuthRepository);

const loadUser = () => authService.getCurrentUser();
const listSales = () => salesService.listToday(activeBusiness);
const loadCatalogs = () => salesService.loadCatalogs();
const registerSale = (input: NewSaleInput) => salesService.registerSale(input);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<SalesListView listSales={listSales} />} />
        <Route
          path="/sales/new"
          element={<NewSaleView loadCatalogs={loadCatalogs} registerSale={registerSale} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

type SessionStatus = "checking" | "active" | "inactive";

function useSessionStatus(): SessionStatus {
  const [status, setStatus] = useState<SessionStatus>("checking");

  useEffect(() => {
    let isCurrent = true;

    authService
      .hasActiveSession()
      .then((active) => {
        if (isCurrent) setStatus(active ? "active" : "inactive");
      })
      .catch(() => {
        if (isCurrent) setStatus("inactive");
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return status;
}

function LoginPage() {
  const navigate = useNavigate();
  const sessionStatus = useSessionStatus();

  if (sessionStatus === "checking") return null;

  if (sessionStatus === "active") return <Navigate to="/" replace />;

  return (
    <LoginView
      signIn={(email, password) => authService.signIn(email, password)}
      onSignedIn={() => navigate("/", { replace: true })}
    />
  );
}

function ProtectedLayout() {
  const navigate = useNavigate();
  const sessionStatus = useSessionStatus();

  if (sessionStatus === "checking") return null;

  if (sessionStatus === "inactive") return <Navigate to="/login" replace />;

  const logout = async () => {
    await authService.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <AppLayout loadUser={loadUser} onLogout={logout}>
      <Outlet />
    </AppLayout>
  );
}
