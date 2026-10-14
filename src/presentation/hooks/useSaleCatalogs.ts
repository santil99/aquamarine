import { useEffect, useState } from "react";
import type { SalesCatalogs } from "@/application/ports/salesRepository";

export type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; catalogs: SalesCatalogs };

export function useSaleCatalogs(loadCatalogs: () => Promise<SalesCatalogs>) {
  const [state, setState] = useState<CatalogState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    loadCatalogs()
      .then((catalogs) => {
        if (isCurrent) setState({ status: "success", catalogs });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadCatalogs, attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return { state, retry };
}
