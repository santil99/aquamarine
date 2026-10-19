import { compareAmounts, sumAmounts } from "@/domain/shared/amount";

export interface CategoryAmount {
  category: string;
  amount: string;
}

export interface CategoryTotal {
  category: string;
  count: number;
  total: string;
}

/** Groups amounts by category, ordered from the highest total to the lowest. */
export function groupByCategory(amounts: CategoryAmount[]): CategoryTotal[] {
  const amountsByCategory = new Map<string, string[]>();

  for (const { category, amount } of amounts) {
    amountsByCategory.set(category, [...(amountsByCategory.get(category) ?? []), amount]);
  }

  return [...amountsByCategory]
    .map(([category, categoryAmounts]) => ({
      category,
      count: categoryAmounts.length,
      total: sumAmounts(categoryAmounts),
    }))
    .sort((left, right) => compareAmounts(right.total, left.total));
}
