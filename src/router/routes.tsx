import { lazy } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router";
import type { AppDependencies } from "@/router";
import { LoginLayout } from "@/router/layouts/LoginLayout";
import { ProtectedLayout } from "@/router/layouts/ProtectedLayout";
import {
  type SaleFeedback,
  type SalesListNavigationState,
} from "@/presentation/features/sales/navigation/salesNavigation";

const ExpenseDetailView = lazy(() =>
  import("@/presentation/features/expenses/views/ExpenseDetailView").then((m) => ({ default: m.ExpenseDetailView })),
);
const ExpensesListView = lazy(() =>
  import("@/presentation/features/expenses/views/ExpensesListView").then((m) => ({ default: m.ExpensesListView })),
);
const NewExpenseView = lazy(() =>
  import("@/presentation/features/expenses/views/NewExpenseView").then((m) => ({ default: m.NewExpenseView })),
);
const SummaryView = lazy(() =>
  import("@/presentation/features/dashboard/views/SummaryView").then((m) => ({ default: m.SummaryView })),
);
const NewSaleView = lazy(() =>
  import("@/presentation/features/sales/views/NewSaleView").then((m) => ({ default: m.NewSaleView })),
);
const SaleDetailView = lazy(() =>
  import("@/presentation/features/sales/views/SaleDetailView").then((m) => ({ default: m.SaleDetailView })),
);
const SalesListView = lazy(() =>
  import("@/presentation/features/sales/views/SalesListView").then((m) => ({ default: m.SalesListView })),
);
const SearchView = lazy(() =>
  import("@/presentation/features/search/views/SearchView").then((m) => ({ default: m.SearchView })),
);

interface RouteProps {
  readonly deps: AppDependencies;
}

interface AppRoutesProps {
  readonly dependencies: AppDependencies;
}

export function AppRoutes({ dependencies: deps }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/login" element={<LoginLayout auth={deps.auth} />} />
      <Route element={<ProtectedLayout auth={deps.auth} loadUser={deps.loadUser} />}>
        <Route path="/" element={<Navigate to="/sales/new" replace />} />
        <Route path="/sales" element={<SalesListRoute deps={deps} />} />
        <Route path="/sales/new" element={<NewSaleRoute deps={deps} />} />
        <Route path="/sales/:id" element={<SaleDetailRoute deps={deps} />} />
        <Route path="/search" element={<SearchRoute deps={deps} />} />
        <Route path="/summary" element={<SummaryRoute deps={deps} />} />
        <Route path="/expenses" element={<ExpensesRoute deps={deps} />} />
        <Route path="/expenses/new" element={<NewExpenseRoute deps={deps} />} />
        <Route path="/expenses/:id" element={<ExpenseDetailRoute deps={deps} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function SearchRoute({ deps }: RouteProps) {
  const navigate = useNavigate();

  return (
    <SearchView
      loadCatalogs={deps.loadSearchCatalogs}
      searchSales={deps.searchSales}
      searchExpenses={deps.searchExpenses}
      timeZone={deps.timeZone}
      onOpenSale={(saleId) => navigate(`/sales/${saleId}`)}
      onOpenExpense={(expenseId) => navigate(`/expenses/${expenseId}`)}
    />
  );
}

function SummaryRoute({ deps }: RouteProps) {
  return (
    <SummaryView
      loadSales={deps.loadMonthlySalesTotals}
      loadExpenses={deps.loadMonthlyExpenseTotals}
      loadDailySales={deps.loadMonthlyDailySales}
      timeZone={deps.timeZone}
    />
  );
}

function ExpensesRoute({ deps }: RouteProps) {
  const navigate = useNavigate();

  return (
    <ExpensesListView
      listExpenses={deps.listExpenses}
      timeZone={deps.timeZone}
      onOpenExpense={(expenseId) => navigate(`/expenses/${expenseId}`)}
    />
  );
}

function NewExpenseRoute({ deps }: RouteProps) {
  return (
    <NewExpenseView
      timeZone={deps.timeZone}
      loadCatalogs={deps.loadExpenseCatalogs}
      registerExpense={deps.registerExpense}
    />
  );
}

function ExpenseDetailRoute({ deps }: RouteProps) {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  return (
    <ExpenseDetailView
      expenseId={id}
      loadExpense={deps.loadExpense}
      loadCatalogs={deps.loadExpenseCatalogs}
      updateExpense={deps.updateExpense}
      deleteExpense={deps.deleteExpense}
      onExit={() => navigate("/expenses")}
    />
  );
}

function useNavigationState<T>(): T {
  return (useLocation().state ?? {}) as T;
}

function SalesListRoute({ deps }: RouteProps) {
  const navigate = useNavigate();
  const { date, feedback } = useNavigationState<SalesListNavigationState>();

  return (
    <SalesListView
      listSales={deps.listSales}
      timeZone={deps.timeZone}
      initialDate={date}
      feedback={feedback}
      onOpenSale={(saleId, saleDate) =>
        navigate(`/sales/${saleId}`, { state: { date: saleDate } satisfies SalesListNavigationState })
      }
    />
  );
}

function NewSaleRoute({ deps }: RouteProps) {
  return (
    <NewSaleView
      timeZone={deps.timeZone}
      loadCatalogs={deps.loadCatalogs}
      registerSale={deps.registerSale}
    />
  );
}

function SaleDetailRoute({ deps }: RouteProps) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { date } = useNavigationState<SalesListNavigationState>();

  const exitToList = (feedback?: SaleFeedback) =>
    navigate("/sales", { state: { date, feedback } satisfies SalesListNavigationState });

  return (
    <SaleDetailView
      saleId={id}
      loadSale={deps.loadSale}
      loadCatalogs={deps.loadCatalogs}
      updateSale={deps.updateSale}
      deleteSale={deps.deleteSale}
      onExit={exitToList}
    />
  );
}
