import type { ReactNode } from "react";

export interface DateNavigatorMode {
  readonly previousLabel: string;
  readonly nextLabel: string;
  readonly shift: (date: string, steps: number) => string;
  readonly formatLabel: (date: string) => string;
  readonly renderPicker: (value: string, onSelect: (date: string) => void) => ReactNode;
}
