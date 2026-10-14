import { useEffect, useState, type ReactNode } from "react";
import { Accordion, Button, Drawer, Spinner, Switch } from "@heroui/react";
import { LogOut, Menu, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import type { AuthenticatedUser } from "@/application/ports/authRepository";
import { applyThemeMode, getCurrentThemeMode, type ThemeMode } from "@/presentation/theme/themeMode";
import { useLanguage, useTexts } from "@/presentation/texts/useTexts";
import type { Language } from "@/presentation/texts/languages";
import {
  createNavigationMenu,
  type NavigationEntry,
  type NavigationItem,
} from "@/presentation/layout/navigationMenu";

const languageOptions: { language: Language; label: string }[] = [
  { language: "es", label: "Español" },
  { language: "en", label: "English" },
];

type ProfileState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "success"; name: string; email: string | null; initials: string };

interface AppLayoutProps {
  readonly loadUser: () => Promise<AuthenticatedUser | null>;
  readonly onLogout: () => Promise<void>;
  readonly children: ReactNode;
}

export function AppLayout({ loadUser, onLogout, children }: AppLayoutProps) {
  const texts = useTexts().layout;
  const { language, setLanguage } = useLanguage();
  const navigationEntries = createNavigationMenu(texts.navigation);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [hasLogoutError, setHasLogoutError] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getCurrentThemeMode);
  const navigate = useNavigate();
  const location = useLocation();

  async function navigateTo(path: string) {
    setIsMenuOpen(false);
    await navigate(path);
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
            <Menu size={24} />
          </Button>
          <h1 className="text-center text-lg font-bold">{texts.title}</h1>
          <Button
            variant="secondary"
            aria-label={texts.logout}
            className="justify-self-end"
            onPress={handleLogout}
          >
            <LogOut size={20} />
          </Button>
        </header>
        <main className="flex flex-1 flex-col items-center p-2 md:p-8">
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
            <Drawer.Dialog aria-label={texts.menuLabel} className="flex h-full flex-col">
              {/* Cabecera con Avatar, datos y botón de cierre */}
              <Drawer.Header className="flex flex-col gap-4 border-b pb-4">
                <div className="flex items-start justify-between">
                  <ProfileAvatar profile={profile} />
                  <Drawer.CloseTrigger aria-label={texts.closeMenu} />
                </div>
                <ProfileSummary profile={profile} />
              </Drawer.Header>

              {/* Cuerpo del menú con navegación flexible y controles abajo */}
              <Drawer.Body className="flex flex-1 flex-col justify-between gap-6 py-4">
                <NavigationMenu
                  entries={navigationEntries}
                  pathname={location.pathname}
                  onNavigate={navigateTo}
                />

                {/* Controles inferiores: Tema, Idioma y Marca */}
                <div className="flex flex-col gap-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun size={16} />
                      <span className="text-sm font-medium">
                        {themeMode === "dark" ? texts.darkMode : texts.lightMode}
                      </span>
                    </div>
                    <Switch
                      aria-label={texts.darkMode}
                      isSelected={themeMode === "dark"}
                      onChange={handleDarkModeChange}
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-default-500">{texts.language}</span>
                    <div className="flex gap-2">
                      {languageOptions.map((option) => {
                        const isActive = option.language === language;

                        return (
                          <Button
                            key={option.language}
                            size="sm"
                            variant={isActive ? "secondary" : "outline"}
                            aria-pressed={isActive}
                            className="flex-1 text-xs px-2 py-1 h-8"
                            onPress={() => setLanguage(option.language)}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] text-default-400 font-medium tracking-wide">
                      aquamarine
                    </span>
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

function NavigationMenu({
  entries,
  pathname,
  onNavigate,
}: {
  readonly entries: NavigationEntry[];
  readonly pathname: string;
  readonly onNavigate: (path: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {entries.map((entry) => {
        if (entry.kind === "item") {
          return (
            <NavigationLink
              key={entry.path}
              item={entry}
              isActive={pathname === entry.path}
              onPress={() => onNavigate(entry.path)}
            />
          );
        }

        const hasActiveItem = entry.items.some((item) => item.path === pathname);

        return (
          <Accordion
            key={entry.id}
            defaultExpandedKeys={hasActiveItem ? [entry.id] : []}
          >
            <Accordion.Item id={entry.id}>
              <Accordion.Heading>
                <Accordion.Trigger className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm font-medium">
                  <entry.Icon size={20} />
                  {entry.label}
                  <Accordion.Indicator className="ml-auto" />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="flex flex-col gap-2 pt-2">
                  {entry.items.map((item) => (
                    <NavigationLink
                      key={item.path}
                      item={item}
                      isActive={pathname === item.path}
                      isNested
                      onPress={() => onNavigate(item.path)}
                    />
                  ))}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </nav>
  );
}

function NavigationLink({
  item,
  isActive,
  isNested = false,
  onPress,
}: {
  readonly item: NavigationItem;
  readonly isActive: boolean;
  readonly isNested?: boolean;
  readonly onPress: () => void;
}) {
  const { Icon, label } = item;

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      aria-current={isActive ? "page" : undefined}
      className={`w-full justify-start gap-3 ${isNested ? "pl-6" : ""}`}
      onPress={onPress}
    >
      <Icon size={20} />
      {label}
    </Button>
  );
}

function toProfileState(user: AuthenticatedUser | null): ProfileState {
  const name = user?.displayName ?? user?.email;

  if (!name) {
    return { status: "unavailable" };
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return { status: "success", name, email: user?.email ?? null, initials };
}

function ProfileAvatar({ profile }: { profile: ProfileState }) {
  const { common } = useTexts();

  if (profile.status === "loading") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
        <Spinner size="sm" aria-label={common.loading} />
      </div>
    );
  }

  if (profile.status === "unavailable") {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100 text-default-500 font-bold text-base leading-none">
        ?
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white dark:text-zinc-950 font-bold text-base leading-none tracking-wider shadow-sm transition-colors duration-200">
      <span className="select-none">{profile.initials}</span>
    </div>
  );
}

function ProfileSummary({ profile }: { profile: ProfileState }) {
  const { layout: texts } = useTexts();

  if (profile.status === "loading") {
    return null;
  }

  if (profile.status === "unavailable") {
    return <p className="text-sm text-default-500">{texts.profileUnavailable}</p>;
  }

  return (
    <div className="min-w-0">
      <p className="break-all font-bold text-base">{profile.name}</p>
      {profile.email && profile.email !== profile.name ? (
        <p className="break-all text-xs text-default-500">{profile.email}</p>
      ) : null}
    </div>
  );
}