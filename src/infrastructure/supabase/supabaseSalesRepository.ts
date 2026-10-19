import type { SalesRepository } from "@/application/ports/salesRepository";
import { addMonths } from "@/domain/business/businessDay";
import type { SaleCatalogOption } from "@/domain/sales/saleCatalog";
import type { SaleDetail } from "@/domain/sales/saleDetail";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import type { SaleSearchItem } from "@/domain/sales/saleSearch";
import { escapeLikePattern } from "@/infrastructure/supabase/escapeLikePattern";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

interface SaleCategoryAmountRow {
  amount: string;
  category: { name: string } | null;
}

interface SaleDailyAmountRow {
  amount: string;
  sale_date: string;
}

interface SaleRow {
  id: string;
  amount: string;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

interface SaleSearchRow {
  id: string;
  amount: string;
  sale_date: string;
  detail: string | null;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

interface SaleCatalogRow {
  id: string | number;
  name: string;
}

interface SaleDetailRow {
  id: string;
  amount: string;
  sale_date: string;
  detail: string | null;
  category_id: string | number;
  payment_method_id: string | number | null;
  images: string[] | null;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

export const supabaseSalesRepository: SalesRepository = {
  async listAmountsForMonth(_business, monthStart) {
    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("sales")
      .select("amount::text, category:categories(name)")
      .gte("sale_date", monthStart)
      .lt("sale_date", addMonths(monthStart, 1))
      .returns<SaleCategoryAmountRow[]>();

    if (error) {
      throw error;
    }

    return data.map((row) => ({ category: row.category?.name ?? "", amount: row.amount }));
  },

  async listDailyAmountsForMonth(_business, monthStart) {
    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("sales")
      .select("amount::text, sale_date")
      .gte("sale_date", monthStart)
      .lt("sale_date", addMonths(monthStart, 1))
      .returns<SaleDailyAmountRow[]>();

    if (error) {
      throw error;
    }

    return data.map((row) => ({ transactionDate: row.sale_date, amount: row.amount }));
  },

  async search(_business, filters) {
    let query = supabase
      .from("sales")
      .select(
        "id, amount::text, sale_date, detail, category:categories(name), payment_method:payment_methods(name)",
      )
      .gte("sale_date", filters.dateFrom)
      .lte("sale_date", filters.dateTo);

    if (filters.minAmount) query = query.gte("amount", filters.minAmount);
    if (filters.maxAmount) query = query.lte("amount", filters.maxAmount);
    if (filters.detail) query = query.ilike("detail", `%${escapeLikePattern(filters.detail)}%`);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.paymentMethodId) query = query.eq("payment_method_id", filters.paymentMethodId);

    const { data, error } = await query
      .order("sale_date", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<SaleSearchRow[]>();

    if (error) {
      throw error;
    }

    return data.map(toSaleSearchItem);
  },

  async listCatalogs() {
    const [categories, paymentMethods] = await Promise.all([
      supabase.from("categories").select("id, name").order("name").returns<SaleCatalogRow[]>(),
      supabase.from("payment_methods").select("id, name").order("name").returns<SaleCatalogRow[]>(),
    ]);

    if (categories.error) throw categories.error;
    if (paymentMethods.error) throw paymentMethods.error;

    return {
      categories: categories.data.map(toCatalogOption),
      paymentMethods: paymentMethods.data.map(toCatalogOption),
    };
  },

  async create(record) {
    const { error } = await supabase.from("sales").insert({
      user_id: record.userId,
      amount: record.amount,
      category_id: record.categoryId,
      payment_method_id: record.paymentMethodId,
      detail: record.detail,
      sale_date: record.transactionDate,
      images: record.imagePaths,
    });

    if (error) {
      throw error;
    }
  },

  async listForDate(_business, selectedDate) {
    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("sales")
      .select(
        "id, amount::text, category:categories(name), payment_method:payment_methods(name)",
      )
      .eq("sale_date", selectedDate)
      .order("created_at", { ascending: true })
      .returns<SaleRow[]>();

    if (error) {
      throw error;
    }

    return data.map(toSaleListItem);
  },

  async getById(id) {
    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("sales")
      .select(
        "id, amount::text, sale_date, detail, category_id, payment_method_id, images, category:categories(name), payment_method:payment_methods(name)",
      )
      .eq("id", id)
      .maybeSingle<SaleDetailRow>();

    if (error) {
      throw error;
    }

    return data ? toSaleDetail(data) : null;
  },

  async update(id, changes) {
    const { error } = await supabase
      .from("sales")
      .update({
        amount: changes.amount,
        category_id: changes.categoryId,
        payment_method_id: changes.paymentMethodId,
        detail: changes.detail,
        images: changes.imagePaths,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  },

  async delete(id) {
    const { error } = await supabase.from("sales").delete().eq("id", id);

    if (error) {
      throw error;
    }
  },
};

function toSaleListItem(row: SaleRow): SaleListItem {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
  };
}

function toSaleDetail(row: SaleDetailRow): SaleDetail {
  return {
    id: row.id,
    amount: row.amount,
    transactionDate: row.sale_date,
    categoryId: String(row.category_id),
    paymentMethodId: row.payment_method_id === null ? null : String(row.payment_method_id),
    detail: row.detail,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
    imagePaths: row.images ?? [],
  };
}

function toSaleSearchItem(row: SaleSearchRow): SaleSearchItem {
  return {
    id: row.id,
    amount: row.amount,
    transactionDate: row.sale_date,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
    detail: row.detail,
  };
}

function toCatalogOption(row: SaleCatalogRow): SaleCatalogOption {
  return { id: String(row.id), name: row.name };
}
