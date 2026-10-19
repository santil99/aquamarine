import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router";
import { AuthService } from "@/application/services/authService";
import { ExpensesService } from "@/application/services/expensesService";
import { SalesService } from "@/application/services/salesService";
import type { TransactionInput } from "@/domain/shared/transactionInput";
import type { ExpenseCatalogs } from "@/domain/expenses/expenseForm";
import type { ExpenseSearchFilters } from "@/domain/expenses/expenseSearch";
import type { SaleSearchFilters } from "@/domain/sales/saleSearch";
import { activeBusiness } from "@/infrastructure/business/mockBusinessContext";
import { supabaseAuthRepository } from "@/infrastructure/supabase/supabaseAuthRepository";
import { supabaseExpensesRepository } from "@/infrastructure/supabase/supabaseExpensesRepository";
import { supabaseSalesImageStorage } from "@/infrastructure/supabase/supabaseSalesImageStorage";
import { supabaseSalesRepository } from "@/infrastructure/supabase/supabaseSalesRepository";
import { AppLayout } from "@/presentation/layout/AppLayout";
import {
  type SaleFeedback,
  type SalesListNavigationState,
} from "@/presentation/features/sales/navigation/salesNavigation";
import { ExpenseDetailView } from "@/presentation/features/expenses/views/ExpenseDetailView";
import { ExpensesListView } from "@/presentation/features/expenses/views/ExpensesListView";
import { LoginView } from "@/presentation/features/auth/views/LoginView";
import { NewExpenseView } from "@/presentation/features/expenses/views/NewExpenseView";
import { NewSaleView } from "@/presentation/features/sales/views/NewSaleView";
import { SaleDetailView } from "@/presentation/features/sales/views/SaleDetailView";
import { SalesListView } from "@/presentation/features/sales/views/SalesListView";
import { SearchView, type SearchCatalogs } from "@/presentation/features/search/views/SearchView";
import { SummaryView } from "@/presentation/features/dashboard/views/SummaryView";

const authService = new AuthService(supabaseAuthRepository);
const salesService = new SalesService(
  supabaseSalesRepository,
  supabaseAuthRepository,
  supabaseSalesImageStorage,
);
const expensesService = new ExpensesService(supabaseExpensesRepository, supabaseAuthRepository);

const loadUser = () => authService.getCurrentUser();
const listSales = (date: string) => salesService.listForDate(activeBusiness, date);
const listExpenses = (monthStart: string) => expensesService.listForMonth(activeBusiness, monthStart);
const loadCatalogs = () => salesService.loadCatalogs();
const loadSearchCatalogs = async (): Promise<SearchCatalogs> => {
  const [catalogs, expenseCategories] = await Promise.all([
    salesService.loadCatalogs(),
    expensesService.listCategories(),
  ]);

  return { ...catalogs, expenseCategories };
};
const loadExpenseCatalogs = async (): Promise<ExpenseCatalogs> => {
  const [categories, paymentMethods] = await Promise.all([
    expensesService.listCategories(),
    expensesService.listPaymentMethods(),
  ]);

  return { categories, paymentMethods };
};
const registerSale = (input: TransactionInput, transactionDate: string, newImages: Blob[]) =>
  salesService.registerSale(input, transactionDate, newImages);
const registerExpense = (input: TransactionInput, transactionDate: string) =>
  expensesService.create(input, transactionDate);
const loadExpense = (id: string) => expensesService.getById(id);
const updateExpense = (id: string, input: TransactionInput) => expensesService.update(id, input);
const deleteExpense = (id: string) => expensesService.delete(id);
const loadSale = (id: string) => salesService.getSale(id);
const updateSale = (id: string, input: TransactionInput, keptPaths: string[], newImages: Blob[]) =>
  salesService.updateSale(id, input, keptPaths, newImages);
const deleteSale = (id: string) => salesService.deleteSale(id);
const searchSales = (filters: SaleSearchFilters) =>
  salesService.searchSales(activeBusiness, filters);
const searchExpenses = (filters: ExpenseSearchFilters) =>
  expensesService.searchExpenses(activeBusiness, filters);
const loadMonthlySalesTotals = (monthStart: string) =>
  salesService.getCategoryTotalsForMonth(activeBusiness, monthStart);
const loadMonthlyExpenseTotals = (monthStart: string) =>
  expensesService.getCategoryTotalsForMonth(activeBusiness, monthStart);
const loadMonthlyDailySales = (monthStart: string) =>
  salesService.getDailyTotalsForMonth(activeBusiness, monthStart);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<SalesListRoute />} />
        <Route path="/sales/new" element={<NewSaleRoute />} />
        <Route path="/sales/:id" element={<SaleDetailRoute />} />
        <Route path="/search" element={<SearchRoute />} />
        <Route path="/resumen" element={<SummaryRoute />} />
        <Route path="/expenses" element={<ExpensesRoute />} />
        <Route path="/expenses/new" element={<NewExpenseRoute />} />
        <Route path="/expenses/:id" element={<ExpenseDetailRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function SearchRoute() {
  const navigate = useNavigate();

  return (
    <SearchView
      loadCatalogs={loadSearchCatalogs}
      searchSales={searchSales}
      searchExpenses={searchExpenses}
      timeZone={activeBusiness.timeZone}
      onOpenSale={(saleId) => navigate(`/sales/${saleId}`)}
      onOpenExpense={(expenseId) => navigate(`/expenses/${expenseId}`)}
    />
  );
}

function SummaryRoute() {
  return (
    <SummaryView
      loadSales={loadMonthlySalesTotals}
      loadExpenses={loadMonthlyExpenseTotals}
      loadDailySales={loadMonthlyDailySales}
      timeZone={activeBusiness.timeZone}
    />
  );
}

function ExpensesRoute() {
  const navigate = useNavigate();

  return (
    <ExpensesListView
      listExpenses={listExpenses}
      timeZone={activeBusiness.timeZone}
      onOpenExpense={(expenseId) => navigate(`/expenses/${expenseId}`)}
    />
  );
}

function NewExpenseRoute() {
  return (
    <NewExpenseView
      timeZone={activeBusiness.timeZone}
      loadCatalogs={loadExpenseCatalogs}
      registerExpense={registerExpense}
    />
  );
}

function ExpenseDetailRoute() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  return (
    <ExpenseDetailView
      expenseId={id}
      loadExpense={loadExpense}
      loadCatalogs={loadExpenseCatalogs}
      updateExpense={updateExpense}
      deleteExpense={deleteExpense}
      onExit={() => navigate("/expenses")}
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
  return (
    <NewSaleView
      timeZone={activeBusiness.timeZone}
      loadCatalogs={loadCatalogs}
      registerSale={registerSale}
    />
  );
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
