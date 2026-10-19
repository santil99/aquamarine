import { useEffect, useState, type ReactNode } from "react";
import type { AuthenticatedUser } from "@/application/ports/authRepository";
import { useTexts } from "@/presentation/texts/useTexts";
import { createNavigationMenu } from "@/presentation/layout/navigationMenu";
import { toProfileState, type ProfileState } from "@/presentation/layout/profileState";
import { AppHeader } from "@/presentation/layout/AppHeader";
import { AppDrawer } from "@/presentation/layout/AppDrawer";
import { useLocation, useNavigate } from "react-router";

interface AppLayoutProps {
  readonly loadUser: () => Promise<AuthenticatedUser | null>;
  readonly onLogout: () => Promise<void>;
  readonly children: ReactNode;
}

export function AppLayout({ loadUser, onLogout, children }: AppLayoutProps) {
  const { layout: texts } = useTexts();
  const navigationEntries = createNavigationMenu(texts.navigation);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [hasLogoutError, setHasLogoutError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function navigateTo(path: string) {
    setIsMenuOpen(false);
    await navigate(path);
  }

  useEffect(() => {
    let isCurrent = true;

    loadUser()
      .then((user) => {
        if (isCurrent) setProfile(toProfileState(user));
      })
      .catch(() => {
        if (isCurrent) setProfile({ status: "unavailable" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadUser]);

  async function handleLogout() {
    setHasLogoutError(false);

    try {
      await onLogout();
    } catch {
      setHasLogoutError(true);
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader onOpenMenu={() => setIsMenuOpen(true)} onLogout={handleLogout} />
        <main className="flex flex-1 flex-col items-center p-2 md:p-8">
          {hasLogoutError ? (
            <p role="alert" className="mb-4 text-sm text-danger">
              {texts.logoutError}
            </p>
          ) : null}
          {children}
        </main>
      </div>

      <AppDrawer
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        profile={profile}
        navigationEntries={navigationEntries}
        pathname={location.pathname}
        onNavigate={navigateTo}
      />
    </>
  );
}
