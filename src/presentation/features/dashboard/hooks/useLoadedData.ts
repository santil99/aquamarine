import { useEffect, useState } from "react";

export type LoadState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; data: T };

/** Loads once on mount and again on retry; remount the caller (with a key) to reload for new inputs. */
export function useLoadedData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    load()
      .then((data) => {
        if (isCurrent) setState({ status: "success", data });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [load, attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  };

  return { state, retry };
}
