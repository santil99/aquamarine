import { Drawer } from "@heroui/react";
import { useTexts } from "@/presentation/texts/useTexts";
import type { NavigationEntry } from "@/presentation/layout/navigationMenu";
import type { ProfileState } from "@/presentation/layout/profileState";
import { ProfileAvatar, ProfileSummary } from "@/presentation/layout/ProfileHeader";
import { NavigationList } from "@/presentation/layout/NavigationList";
import { ThemeSwitch } from "@/presentation/layout/ThemeSwitch";
import { LanguageSwitch } from "@/presentation/layout/LanguageSwitch";

interface AppDrawerProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly profile: ProfileState;
  readonly navigationEntries: NavigationEntry[];
  readonly pathname: string;
  readonly onNavigate: (path: string) => void;
}

export function AppDrawer({
  isOpen,
  onOpenChange,
  profile,
  navigationEntries,
  pathname,
  onNavigate,
}: AppDrawerProps) {
  const { layout: texts } = useTexts();

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Backdrop className="app-drawer__backdrop">
        <Drawer.Content className="app-drawer__content" placement="left">
          <Drawer.Dialog aria-label={texts.menuLabel} className="app-drawer__dialog flex h-full flex-col">
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
              <NavigationList entries={navigationEntries} pathname={pathname} onNavigate={onNavigate} />

              <div className="flex flex-col gap-4 border-t pt-4">
                <ThemeSwitch />
                <LanguageSwitch />
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
  );
}
