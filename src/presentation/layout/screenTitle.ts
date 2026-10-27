import { matchPath } from "react-router";
import type { Texts } from "@/presentation/texts/types";

interface ScreenTitleRule {
  readonly path: string;
  readonly title: (texts: Texts) => string;
}

// Order matters: "/sales/new" must come before "/sales/:id", which would also match "new".
const SCREEN_TITLE_RULES: readonly ScreenTitleRule[] = [
  { path: "/sales/new", title: (texts) => texts.newSale.title },
  { path: "/sales/:id", title: (texts) => texts.saleDetail.title },
  { path: "/sales", title: (texts) => texts.salesList.title },
  { path: "/expenses/new", title: (texts) => texts.newExpense.title },
  { path: "/expenses/:id", title: (texts) => texts.expenseDetail.title },
  { path: "/expenses", title: (texts) => texts.expensesList.title },
  { path: "/search", title: (texts) => texts.search.title },
  { path: "/summary", title: (texts) => texts.summary.title },
  { path: "/reports", title: (texts) => texts.reports.title },
];

export function getScreenTitle(pathname: string, texts: Texts): string {
  const rule = SCREEN_TITLE_RULES.find(({ path }) => matchPath(path, pathname));
  return rule ? rule.title(texts) : "";
}
