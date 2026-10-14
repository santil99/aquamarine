import type { ExpensesRepository } from "@/application/ports/expensesRepository";
import { addMonths, getDayRangeInTimeZone } from "@/domain/business/businessDay";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

interface ExpenseRow {
  id: string;
  amount: string;
  created_at: string;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

export const supabaseExpensesRepository: ExpensesRepository = {
  async listForMonth(business, monthStart) {
    const from = getDayRangeInTimeZone(monthStart, business.timeZone).start;
    const to = getDayRangeInTimeZone(addMonths(monthStart, 1), business.timeZone).start;

    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("expenses")
      .select(
        "id, amount::text, created_at, category:expense_categories(name), payment_method:payment_methods(name)",
      )
      .gte("created_at", from.toISOString())
      .lt("created_at", to.toISOString())
      .order("created_at", { ascending: true })
      .returns<ExpenseRow[]>();

    if (error) {
      throw error;
    }

    return data.map(toExpenseListItem);
  },

  listCategories() {
    return notImplemented();
  },

  listPaymentMethods() {
    return notImplemented();
  },

  create() {
    return notImplemented();
  },

  getById() {
    return notImplemented();
  },

  update() {
    return notImplemented();
  },

  delete() {
    return notImplemented();
  },
};

function toExpenseListItem(row: ExpenseRow): ExpenseListItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    amount: row.amount,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
  };
}

function notImplemented(): never {
  throw new Error("Expenses repository method not implemented yet");
}
