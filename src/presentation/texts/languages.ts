import { en } from "./en";
import { es } from "./es";
import type { Texts } from "./types";

export type Language = "es" | "en";

export const DEFAULT_LANGUAGE: Language = "es";

export const textsByLanguage: Record<Language, Texts> = { es, en };
