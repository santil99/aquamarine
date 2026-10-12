export interface ExpenseListItem {
  id: string;
  createdAt: string;
  amount: string;
  category: string;
  paymentMethod: string | null;
}
