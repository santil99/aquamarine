import { useEffect, useState } from "react";
import type { AuthService } from "@/application/services/authService";

export type SessionStatus = "checking" | "active" | "inactive";

export function useSessionStatus(auth: Pick<AuthService, "hasActiveSession">): SessionStatus {
  const [status, setStatus] = useState<SessionStatus>("checking");

  useEffect(() => {
    let isCurrent = true;

    auth
      .hasActiveSession()
      .then((active) => {
        if (isCurrent) setStatus(active ? "active" : "inactive");
      })
      .catch(() => {
        if (isCurrent) setStatus("inactive");
      });

    return () => {
      isCurrent = false;
    };
  }, [auth]);

  return status;
}
