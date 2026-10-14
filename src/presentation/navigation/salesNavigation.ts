export type SaleFeedback = "saved" | "deleted";

export interface SalesListNavigationState {
  readonly date?: string;
  readonly feedback?: SaleFeedback;
}
