import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";
import { textsByLanguage } from "./languages";
import type { Texts } from "./types";

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTexts(): Texts {
  const { language } = useLanguage();
  return textsByLanguage[language];
}
