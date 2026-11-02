import { useCallback, useEffect, useState } from "react";
import pRetry from "p-retry";
import type { SalesCatalogs } from "@/application/ports/salesRepository";

export type CatalogState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; catalogs: T };

/** Total attempts = 1 + CATALOG_RETRIES. Catalog reads are idempotent, so retrying them is safe. */
const CATALOG_RETRIES = 3;

export function useSaleCatalogs<T = SalesCatalogs>(loadCatalogs: () => Promise<T>) {
  const [state, setState] = useState<CatalogState<T>>({ status: "loading" });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    pRetry(loadCatalogs, {
      retries: CATALOG_RETRIES,
      minTimeout: 1000,
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

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  const hasError = state.status === "error";

  useEffect(() => {
    if (!hasError) return;

    const retryWhenBack = () => {
      if (document.visibilityState === "visible") retry();
    };

    document.addEventListener("visibilitychange", retryWhenBack);
    window.addEventListener("online", retryWhenBack);

    return () => {
      document.removeEventListener("visibilitychange", retryWhenBack);
      window.removeEventListener("online", retryWhenBack);
    };
  }, [hasError, retry]);

  return { state, retry };
}
