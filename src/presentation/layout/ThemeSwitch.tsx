import { useState } from "react";
import { Switch } from "@heroui/react";
import { Sun } from "lucide-react";
import { applyThemeMode, getCurrentThemeMode, type ThemeMode } from "@/presentation/theme/themeMode";
import { useTexts } from "@/presentation/texts/useTexts";

export function ThemeSwitch() {
  const { layout: texts } = useTexts();
  const [themeMode, setThemeMode] = useState<ThemeMode>(getCurrentThemeMode);

  function handleDarkModeChange(isDark: boolean) {
    const nextMode: ThemeMode = isDark ? "dark" : "light";
    applyThemeMode(nextMode);
    setThemeMode(nextMode);
  }

  return (
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
  );
}
