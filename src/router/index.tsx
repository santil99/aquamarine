import { AuthService } from "@/application/services/authService";
import { ExpensesService } from "@/application/services/expensesService";
import { SalesService } from "@/application/services/salesService";
import type { TransactionInput } from "@/domain/shared/transactionInput";
import type { ExpenseCatalogs } from "@/domain/expenses/expenseForm";
import type { ExpenseSearchFilters } from "@/domain/expenses/expenseSearch";
import type { SaleSearchFilters } from "@/domain/sales/saleSearch";
import type { ReportPeriodId } from "@/domain/reports/reportPeriod";
import { activeBusiness } from "@/infrastructure/business/mockBusinessContext";
import { supabaseAuthRepository } from "@/infrastructure/supabase/supabaseAuthRepository";
import { supabaseExpensesRepository } from "@/infrastructure/supabase/supabaseExpensesRepository";
import { supabaseSalesImageStorage } from "@/infrastructure/supabase/supabaseSalesImageStorage";
import { supabaseSalesRepository } from "@/infrastructure/supabase/supabaseSalesRepository";
import { AppRoutes } from "@/router/routes";
import type { SearchCatalogs } from "@/presentation/features/search/views/SearchView";

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
const loadSalesReport = (periodId: ReportPeriodId) =>
  salesService.getSalesReport(activeBusiness, periodId);

const dependencies = {
  auth: authService,
  loadUser,
  timeZone: activeBusiness.timeZone,
  listSales,
  listExpenses,
  loadCatalogs,
  loadSearchCatalogs,
  loadExpenseCatalogs,
  registerSale,
  registerExpense,
  loadExpense,
  updateExpense,
  deleteExpense,
  loadSale,
  updateSale,
  deleteSale,
  searchSales,
  searchExpenses,
  loadMonthlySalesTotals,
  loadMonthlyExpenseTotals,
  loadMonthlyDailySales,
  loadSalesReport,
};

export type AppDependencies = typeof dependencies;

export default function AppRouter() {
  return <AppRoutes dependencies={dependencies} />;
}


