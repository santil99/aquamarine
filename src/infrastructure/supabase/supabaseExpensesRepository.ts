import type { ExpensesRepository } from "@/application/ports/expensesRepository";
import { addMonths, getDayRangeInTimeZone } from "@/domain/business/businessDay";
import type { ExpenseCatalogOption, ExpenseDetail } from "@/domain/expenses/expenseForm";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import type { ExpenseSearchItem } from "@/domain/expenses/expenseSearch";
import { escapeLikePattern } from "@/infrastructure/supabase/escapeLikePattern";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

interface ExpenseRow {
  id: string;
  amount: string;
  created_at: string;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

interface ExpenseSearchRow extends ExpenseRow {
  detail: string | null;
}

interface ExpenseDetailRow {
  id: string;
  amount: string;
  created_at: string;
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

  async search(business, filters) {
    const from = getDayRangeInTimeZone(filters.dateFrom, business.timeZone).start;
    const to = getDayRangeInTimeZone(filters.dateTo, business.timeZone).end;

    let query = supabase
      .from("expenses")
      .select(
        "id, amount::text, created_at, detail, category:expense_categories(name), payment_method:payment_methods(name)",
      )
      .gte("created_at", from.toISOString())
      .lt("created_at", to.toISOString());

    if (filters.detail) query = query.ilike("detail", `%${escapeLikePattern(filters.detail)}%`);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);

    const { data, error } = await query
      .order("created_at", { ascending: false })
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

  async create(expense, userId) {
    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      amount: expense.amount,
      category_id: expense.categoryId,
      payment_method_id: expense.paymentMethodId,
      detail: expense.detail,
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
        "id, amount::text, created_at, detail, category_id, payment_method_id, category:expense_categories(name), payment_method:payment_methods(name)",
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

    return data.length > 0;
  },

  async delete(id) {
    const { data, error } = await supabase.from("expenses").delete().eq("id", id).select("id");

    if (error) {
      throw error;
    }

    return data.length > 0;
  },
};

function toExpenseDetail(row: ExpenseDetailRow): ExpenseDetail {
  return {
    id: row.id,
    amount: row.amount,
    createdAt: row.created_at,
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
    createdAt: row.created_at,
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

