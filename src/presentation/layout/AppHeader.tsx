import { Button } from "@heroui/react";
import { LogOut, Menu } from "lucide-react";
import { useTexts } from "@/presentation/texts/useTexts";

interface AppHeaderProps {
  readonly title: string;
  readonly onOpenMenu: () => void;
  readonly onLogout: () => void;
}

export function AppHeader({ title, onOpenMenu, onLogout }: AppHeaderProps) {
  const { layout: texts } = useTexts();

  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b p-4">
      <Button
        variant="ghost"
        aria-label={texts.openMenu}
        className="rounded-md p-2"
        onPress={onOpenMenu}
      >
        <Menu size={24} />
      </Button>
      <h1 className="truncate text-center text-lg font-bold">{title}</h1>
      <Button
        variant="secondary"
        aria-label={texts.logout}
        className="justify-self-end"
        onPress={onLogout}
      >
        <LogOut size={20} />
      </Button>
    </header>
  );
}
