import { createContext } from "react";
import { DEFAULT_LANGUAGE, type Language } from "./languages";

export interface LanguageContextValue {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});
