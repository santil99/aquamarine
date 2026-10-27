import { useEffect, useState } from "react";
import pRetry from "p-retry";
import type { SalesCatalogs } from "@/application/ports/salesRepository";

export type CatalogState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; catalogs: T };

/** Total attempts = 1 + CATALOG_RETRIES. Catalog reads are idempotent, so retrying them is safe. */
const CATALOG_RETRIES = 2;

export function useSaleCatalogs<T = SalesCatalogs>(loadCatalogs: () => Promise<T>) {
  const [state, setState] = useState<CatalogState<T>>({ status: "loading" });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    pRetry(loadCatalogs, {
      retries: CATALOG_RETRIES,
      minTimeout: 500,
      factor: 2,
      randomize: true,
      signal: controller.signal,
    })
      .then((catalogs) => {
        if (!controller.signal.aborted) setState({ status: "success", catalogs });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });

    return () => {
      controller.abort();
    };
  }, [loadCatalogs, attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return { state, retry };
}
