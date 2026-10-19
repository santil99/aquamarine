import { useEffect, useState } from "react";

export type DetailState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "notFound" }
  | { status: "success"; data: T };

export function useDetailLoader<T>(id: string, loadDetail: (id: string) => Promise<T | null>) {
  const [state, setState] = useState<DetailState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    loadDetail(id)
      .then((data) => {
        if (!isCurrent) return;
        setState(data ? { status: "success", data } : { status: "notFound" });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadDetail, id, attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return { state, retry };
}
