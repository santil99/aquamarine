import type { SalesRepository } from "@/application/ports/salesRepository";
import { getDayRangeInTimeZone } from "@/domain/business/businessDay";
import type { SaleCatalogOption } from "@/domain/sales/newSale";
import type { SaleDetail } from "@/domain/sales/saleDetail";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

interface SaleRow {
  id: string;
  amount: string;
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
  created_at: string;
  detail: string | null;
  category_id: string | number;
  payment_method_id: string | number | null;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

export const supabaseSalesRepository: SalesRepository = {
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
    });

    if (error) {
      throw error;
    }
  },

  async listForDate(business, selectedDate) {
    const { start, end } = getDayRangeInTimeZone(selectedDate, business.timeZone);

    // Amount is cast to text so the decimal value is not parsed as a JS number.
    const { data, error } = await supabase
      .from("sales")
      .select(
        "id, amount::text, category:categories(name), payment_method:payment_methods(name)",
      )
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
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
        "id, amount::text, created_at, detail, category_id, payment_method_id, category:categories(name), payment_method:payment_methods(name)",
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
    createdAt: row.created_at,
    categoryId: String(row.category_id),
    paymentMethodId: row.payment_method_id === null ? null : String(row.payment_method_id),
    detail: row.detail,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
  };
}

function toCatalogOption(row: SaleCatalogRow): SaleCatalogOption {
  return { id: String(row.id), name: row.name };
}
