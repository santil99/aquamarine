import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router";
import { AuthService } from "@/application/services/authService";
import { SalesService } from "@/application/services/salesService";
import type { NewSaleInput } from "@/domain/sales/newSale";
import type { SaleSearchFilters } from "@/domain/sales/saleSearch";
import { activeBusiness } from "@/infrastructure/business/mockBusinessContext";
import { supabaseAuthRepository } from "@/infrastructure/supabase/supabaseAuthRepository";
import { supabaseSalesRepository } from "@/infrastructure/supabase/supabaseSalesRepository";
import { AppLayout } from "@/presentation/layout/AppLayout";
import {
  type SaleFeedback,
  type SalesListNavigationState,
} from "@/presentation/navigation/salesNavigation";
import { LoginView } from "@/presentation/views/LoginView";
import { NewSaleView } from "@/presentation/views/NewSaleView";
import { SaleDetailView } from "@/presentation/views/SaleDetailView";
import { SalesListView } from "@/presentation/views/SalesListView";
import { SearchView } from "@/presentation/views/SearchView";

const authService = new AuthService(supabaseAuthRepository);
const salesService = new SalesService(supabaseSalesRepository, supabaseAuthRepository);

const loadUser = () => authService.getCurrentUser();
const listSales = (date: string) => salesService.listForDate(activeBusiness, date);
const loadCatalogs = () => salesService.loadCatalogs();
const registerSale = (input: NewSaleInput) => salesService.registerSale(input);
const loadSale = (id: string) => salesService.getSale(id);
const updateSale = (id: string, input: NewSaleInput) => salesService.updateSale(id, input);
const deleteSale = (id: string) => salesService.deleteSale(id);
const searchSales = (filters: SaleSearchFilters) =>
  salesService.searchSales(activeBusiness, filters);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<SalesListRoute />} />
        <Route path="/sales/new" element={<NewSaleRoute />} />
        <Route path="/sales/:id" element={<SaleDetailRoute />} />
        <Route path="/search" element={<SearchRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function SearchRoute() {
  const navigate = useNavigate();

  return (
    <SearchView
      loadCatalogs={loadCatalogs}
      searchSales={searchSales}
      timeZone={activeBusiness.timeZone}
      onOpenSale={(saleId) => navigate(`/sales/${saleId}`)}
    />
  );
}

function useNavigationState<T>(): T {
  return (useLocation().state ?? {}) as T;
}

function SalesListRoute() {
  const navigate = useNavigate();
  const { date, feedback } = useNavigationState<SalesListNavigationState>();

  return (
    <SalesListView
      listSales={listSales}
      timeZone={activeBusiness.timeZone}
      initialDate={date}
      feedback={feedback}
      onOpenSale={(saleId, saleDate) =>
        navigate(`/sales/${saleId}`, { state: { date: saleDate } satisfies SalesListNavigationState })
      }
    />
  );
}

function NewSaleRoute() {
  return <NewSaleView loadCatalogs={loadCatalogs} registerSale={registerSale} />;
}

function SaleDetailRoute() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { date } = useNavigationState<SalesListNavigationState>();

  const exitToList = (feedback?: SaleFeedback) =>
    navigate("/", { state: { date, feedback } satisfies SalesListNavigationState });

  return (
    <SaleDetailView
      saleId={id}
      timeZone={activeBusiness.timeZone}
      loadSale={loadSale}
      loadCatalogs={loadCatalogs}
      updateSale={updateSale}
      deleteSale={deleteSale}
      onExit={exitToList}
    />
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
    await navigate("/login", { replace: true });
  };

  return (
    <AppLayout loadUser={loadUser} onLogout={logout}>
      <Outlet />
    </AppLayout>
  );
}
