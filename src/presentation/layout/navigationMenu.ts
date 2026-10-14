import { ChartColumn, List, Plus, Receipt, ReceiptText, Search, ShoppingBag, Wallet, type LucideIcon } from "lucide-react";
import type { Texts } from "@/presentation/texts/types";

export interface NavigationItem {
  readonly kind: "item";
  readonly path: string;
  readonly label: string;
  readonly Icon: LucideIcon;
}

export interface NavigationGroup {
  readonly kind: "group";
  readonly id: string;
  readonly label: string;
  readonly Icon: LucideIcon;
  readonly items: readonly NavigationItem[];
}

export type NavigationEntry = NavigationItem | NavigationGroup;

export function createNavigationMenu(texts: Texts["layout"]["navigation"]): NavigationEntry[] {
  return [
    {
      kind: "group",
      id: "sales",
      label: texts.groups.sales,
      Icon: ShoppingBag,
      items: [
        { kind: "item", path: "/sales/new", label: texts.newSale, Icon: Plus },
        { kind: "item", path: "/", label: texts.salesToday, Icon: List },
      ],
    },
    {
      kind: "group",
      id: "expenses",
      label: texts.groups.expenses,
      Icon: Wallet,
      items: [
        { kind: "item", path: "/expenses/new", label: texts.newExpense, Icon: ReceiptText },
        { kind: "item", path: "/expenses", label: texts.expenses, Icon: Receipt },
      ],
    },
    { kind: "item", path: "/search", label: texts.search, Icon: Search },
    { kind: "item", path: "/resumen", label: texts.summary, Icon: ChartColumn },
  ];
}
