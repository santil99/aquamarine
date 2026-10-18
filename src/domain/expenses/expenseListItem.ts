export interface ExpenseListItem {
  id: string;
  transactionDate: string;
  amount: string;
  category: string;
  paymentMethod: string | null;
}
