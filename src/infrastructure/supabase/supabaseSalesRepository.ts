import type { SalesRepository } from "@/application/ports/salesRepository";
import { getDayRangeInTimeZone } from "@/domain/business/businessDay";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

interface SaleRow {
  id: string;
  amount: string;
  category: { name: string } | null;
  payment_method: { name: string } | null;
}

export const supabaseSalesRepository: SalesRepository = {
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
};

function toSaleListItem(row: SaleRow): SaleListItem {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category?.name ?? "",
    paymentMethod: row.payment_method?.name ?? null,
  };
}
