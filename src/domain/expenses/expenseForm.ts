export interface ExpenseCatalogOption {
  id: string;
  name: string;
}

export interface ExpenseCatalogs {
  categories: ExpenseCatalogOption[];
  paymentMethods: ExpenseCatalogOption[];
}

export interface ExpenseInput {
  amount: string;
  categoryId: string;
  paymentMethodId: string | null;
  detail: string | null;
}

export interface ExpenseDetail extends ExpenseInput {
  id: string;
  createdAt: string;
  category: string;
  paymentMethod: string | null;
}

