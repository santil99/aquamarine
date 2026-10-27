import type { ExpensesRepository } from "@/application/ports/expensesRepository";
import { NotFoundError } from "@/application/errors";
import { addMonths } from "@/domain/business/businessDay";
import type { ExpenseCatalogOption, ExpenseDetail } from "@/domain/expenses/expenseForm";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import type { ExpenseSearchItem } from "@/domain/expenses/expenseSearch";
import { escapeLikePattern } from "@/infrastructure/supabase/escapeLikePattern";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

interface ExpenseCategoryAmountRow {
  amount: string;
  category: { name: string } | null;
}

interface ExpenseRow {
  id: string;
  amount: string;
  expense_date: string;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

interface ExpenseSearchRow extends ExpenseRow {
  detail: string | null;
}

interface ExpenseDetailRow {
  id: string;
  amount: string;
  expense_date: string;
  detail: string | null;
  category_id: string | number;
  payment_method_id: string | number | null;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

interface ExpenseCatalogRow {
  id: string | number;
  name: string;
}

export const supabaseExpensesRepository: ExpensesRepository = {
  async listForMonth(_business, monthStart) {
    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("expenses")
      .select(
        "id, amount::text, expense_date, category:expense_categories(name), payment_method:payment_methods(name)",
      )
      .gte("expense_date", monthStart)
      .lt("expense_date", addMonths(monthStart, 1))
      .order("expense_date", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<ExpenseRow[]>();

    if (error) {
      throw error;
    }

    return data.map(toExpenseListItem);
  },

  async listAmountsForMonth(_business, monthStart) {
    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("expenses")
      .select("amount::text, category:expense_categories(name)")
      .gte("expense_date", monthStart)
      .lt("expense_date", addMonths(monthStart, 1))
      .returns<ExpenseCategoryAmountRow[]>();

    if (error) {
      throw error;
    }

    return data.map((row) => ({ category: row.category?.name ?? "", amount: row.amount }));
  },

  async search(_business, filters) {
    let query = supabase
      .from("expenses")
      .select(
        "id, amount::text, expense_date, detail, category:expense_categories(name), payment_method:payment_methods(name)",
      )
      .gte("expense_date", filters.dateFrom)
      .lte("expense_date", filters.dateTo);

    if (filters.detail) query = query.ilike("detail", `%${escapeLikePattern(filters.detail)}%`);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);

    const { data, error } = await query
      .order("expense_date", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<ExpenseSearchRow[]>();

    if (error) {
      throw error;
    }

    return data.map(toExpenseSearchItem);
  },

  async listCategories() {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("id, name")
      .order("name")
      .returns<ExpenseCatalogRow[]>();

    if (error) {
      throw error;
    }

    return data.map(toCatalogOption);
  },

  async listPaymentMethods() {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("id, name")
      .order("name")
      .returns<ExpenseCatalogRow[]>();

    if (error) {
      throw error;
    }

    return data.map(toCatalogOption);
  },

  async create(record) {
    const { error } = await supabase.from("expenses").insert({
      user_id: record.userId,
      amount: record.amount,
      category_id: record.categoryId,
      payment_method_id: record.paymentMethodId,
      detail: record.detail,
      expense_date: record.transactionDate,
    });

    if (error) {
      throw error;
    }
  },

  async getById(id) {
    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("expenses")
      .select(
        "id, amount::text, expense_date, detail, category_id, payment_method_id, category:expense_categories(name), payment_method:payment_methods(name)",
      )
      .eq("id", id)
      .maybeSingle<ExpenseDetailRow>();

    if (error) {
      throw error;
    }

    return data ? toExpenseDetail(data) : null;
  },

  async update(id, changes) {
    const { data, error } = await supabase
      .from("expenses")
      .update({
        amount: changes.amount,
        category_id: changes.categoryId,
        payment_method_id: changes.paymentMethodId,
        detail: changes.detail,
      })
      .eq("id", id)
      .select("id");

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      throw new NotFoundError("Expense not found");
    }
  },

  async delete(id) {
    const { data, error } = await supabase.from("expenses").delete().eq("id", id).select("id");

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      throw new NotFoundError("Expense not found");
    }
  },
};

function toExpenseDetail(row: ExpenseDetailRow): ExpenseDetail {
  return {
    id: row.id,
    amount: row.amount,
    transactionDate: row.expense_date,
    categoryId: String(row.category_id),
    paymentMethodId: row.payment_method_id === null ? null : String(row.payment_method_id),
    detail: row.detail,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
  };
}

function toExpenseListItem(row: ExpenseRow): ExpenseListItem {
  return {
    id: row.id,
    transactionDate: row.expense_date,
    amount: row.amount,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
  };
}

function toExpenseSearchItem(row: ExpenseSearchRow): ExpenseSearchItem {
  return { ...toExpenseListItem(row), detail: row.detail };
}

function toCatalogOption(row: ExpenseCatalogRow): ExpenseCatalogOption {
  return { id: String(row.id), name: row.name };
}

