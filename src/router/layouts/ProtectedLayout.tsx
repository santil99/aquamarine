import { Navigate, Outlet, useNavigate } from "react-router";
import type { AuthService } from "@/application/services/authService";
import { useSessionStatus } from "@/router/layouts/useSessionStatus";
import { AppLayout } from "@/presentation/layout/AppLayout";

interface ProtectedLayoutProps {
  readonly auth: AuthService;
  readonly loadUser: () => ReturnType<AuthService["getCurrentUser"]>;
}

export function ProtectedLayout({ auth, loadUser }: ProtectedLayoutProps) {
  const navigate = useNavigate();
  const sessionStatus = useSessionStatus(auth);

  if (sessionStatus === "checking") return null;

  if (sessionStatus === "inactive") return <Navigate to="/login" replace />;

  const logout = async () => {
    await auth.signOut();
    await navigate("/login", { replace: true });
  };

  return (
    <AppLayout loadUser={loadUser} onLogout={logout}>
      <Outlet />
    </AppLayout>
  );
}
