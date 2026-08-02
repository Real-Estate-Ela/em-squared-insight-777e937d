import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { tr, type Dictionary } from "./dictionaries/tr";
import { en } from "./dictionaries/en";

export type Locale = "tr" | "en";

const dictionaries: Record<Locale, Dictionary> = { tr, en };

interface I18nContext {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<I18nContext>({ locale: "tr", t: tr, setLocale: () => {} });

const STORAGE_KEY = "emlakmetric-locale";

function readStored(): Locale {
  if (typeof window === "undefined") return "tr";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "en" ? "en" : "tr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>(readStored);

  const setLocale = useCallback((l: Locale) => {
    setLocaleRaw(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  return (
    <Ctx.Provider value={{ locale, t: dictionaries[locale], setLocale }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n() {
  return useContext(Ctx);
}
