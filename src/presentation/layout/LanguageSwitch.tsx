import { Button } from "@heroui/react";
import { useLanguage, useTexts } from "@/presentation/texts/useTexts";
import type { Language } from "@/presentation/texts/languages";

const languageOptions: { language: Language; label: string }[] = [
  { language: "es", label: "Español" },
  { language: "en", label: "English" },
];

export function LanguageSwitch() {
  const { layout: texts } = useTexts();
  const { language, setLanguage } = useLanguage();

  return (
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
  );
}
