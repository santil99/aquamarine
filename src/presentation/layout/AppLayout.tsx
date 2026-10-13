import { useEffect, useState, type ReactNode } from "react";
import { Button, Drawer, Spinner, Switch } from "@heroui/react";
import { useLocation, useNavigate } from "react-router";
import type { AuthenticatedUser } from "@/application/ports/authRepository";
import { applyThemeMode, getCurrentThemeMode, type ThemeMode } from "@/presentation/theme/themeMode";
import { useLanguage, useTexts } from "@/presentation/texts/useTexts";
import type { Language } from "@/presentation/texts/languages";

const languageOptions: { language: Language; label: string }[] = [
  { language: "es", label: "Español" },
  { language: "en", label: "English" },
];

type ProfileState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "success"; name: string; email: string | null };

interface AppLayoutProps {
  loadUser: () => Promise<AuthenticatedUser | null>;
  onLogout: () => Promise<void>;
  children: ReactNode;
}

export function AppLayout({ loadUser, onLogout, children }: AppLayoutProps) {
  const texts = useTexts().layout;
  const { language, setLanguage } = useLanguage();
  const navigationItems = [
    { path: "/sales/new", label: texts.navigation.newSale, Icon: PlusIcon },
    { path: "/", label: texts.navigation.salesToday, Icon: ListIcon },
  ];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [hasLogoutError, setHasLogoutError] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getCurrentThemeMode);
  const navigate = useNavigate();
  const location = useLocation();

  function navigateTo(path: string) {
    setIsMenuOpen(false);
    navigate(path);
  }

  function handleDarkModeChange(isDark: boolean) {
    const nextMode: ThemeMode = isDark ? "dark" : "light";
    applyThemeMode(nextMode);
    setThemeMode(nextMode);
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
        <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b p-4">
          <Button
            variant="ghost"
            aria-label={texts.openMenu}
            className="rounded-md p-2"
            onPress={() => setIsMenuOpen(true)}
          >
            <MenuIcon />
          </Button>
          <h1 className="text-center text-lg font-bold">{texts.title}</h1>
          <Button
            variant="ghost"
            aria-label={texts.logout}
            className="justify-self-end"
            onPress={handleLogout}
          >
            <LogoutIcon />
          </Button>
        </header>
        <main className="flex flex-1 flex-col items-center p-4 md:p-8">
          {hasLogoutError ? (
            <p role="alert" className="mb-4 text-sm text-danger">
              {texts.logoutError}
            </p>
          ) : null}
          {children}
        </main>
      </div>

      <Drawer isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog aria-label={texts.menuLabel}>
              <Drawer.Header className="flex items-start justify-between gap-2">
                <ProfileSummary profile={profile} />
                <Drawer.CloseTrigger aria-label={texts.closeMenu} />
              </Drawer.Header>
              <Drawer.Body className="flex flex-col gap-2">
                {navigationItems.map(({ path, label, Icon }) => {
                  const isActive = location.pathname === path;

                  return (
                    <Button
                      key={path}
                      variant={isActive ? "secondary" : "ghost"}
                      aria-current={isActive ? "page" : undefined}
                      className="w-full justify-start gap-3"
                      onPress={() => navigateTo(path)}
                    >
                      <Icon />
                      {label}
                    </Button>
                  );
                })}
                <Switch
                  isSelected={themeMode === "dark"}
                  onChange={handleDarkModeChange}
                  className="mt-4"
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    {texts.darkMode}
                  </Switch.Content>
                </Switch>
                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-sm font-semibold">{texts.language}</span>
                  <div className="flex gap-2">
                    {languageOptions.map((option) => {
                      const isActive = option.language === language;

                      return (
                        <Button
                          key={option.language}
                          variant={isActive ? "secondary" : "outline"}
                          aria-pressed={isActive}
                          onPress={() => setLanguage(option.language)}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}

function toProfileState(user: AuthenticatedUser | null): ProfileState {
  const name = user?.displayName ?? user?.email;

  if (!name) {
    return { status: "unavailable" };
  }

  return { status: "success", name, email: user?.email ?? null };
}

function ProfileSummary({ profile }: { profile: ProfileState }) {
  const { common, layout: texts } = useTexts();

  if (profile.status === "loading") {
    return <Spinner size="sm" aria-label={common.loading} />;
  }

  if (profile.status === "unavailable") {
    return <p>{texts.profileUnavailable}</p>;
  }

  return (
    <div className="min-w-0">
      <p className="break-all font-semibold">{profile.name}</p>
      {profile.email && profile.email !== profile.name ? (
        <p className="break-all text-sm">{profile.email}</p>
      ) : null}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
