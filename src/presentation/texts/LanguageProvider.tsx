import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LanguageContext } from "./LanguageContext";
import { DEFAULT_LANGUAGE, type Language } from "./languages";

interface LanguageProviderProps {
  readonly children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
