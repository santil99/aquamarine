import { Navigate, useNavigate } from "react-router";
import type { AuthService } from "@/application/services/authService";
import { useSessionStatus } from "@/router/layouts/useSessionStatus";
import { LoginView } from "@/presentation/features/auth/views/LoginView";

interface LoginLayoutProps {
  readonly auth: AuthService;
}

export function LoginLayout({ auth }: LoginLayoutProps) {
  const navigate = useNavigate();
  const sessionStatus = useSessionStatus(auth);

  if (sessionStatus === "checking") return null;

  if (sessionStatus === "active") return <Navigate to="/" replace />;

  return (
    <LoginView
      signIn={(email, password) => auth.signIn(email, password)}
      onSignedIn={() => navigate("/", { replace: true })}
    />
  );
}
