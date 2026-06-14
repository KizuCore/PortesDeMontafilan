import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import enText from "@/i18n/locales/en.json";
import frText from "@/i18n/locales/fr.json";

export type Lang = "fr" | "en";

type Messages = typeof frText;
type StringKey = {
  [K in keyof Messages]: Messages[K] extends string ? K : never;
}[keyof Messages];

const resources: Record<Lang, Messages> = {
  fr: frText,
  en: enText,
};

const Ctx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StringKey) => string;
  tm: <K extends keyof Messages>(k: K) => Messages[K];
}>({
  lang: "fr",
  setLang: () => {},
  t: (k) => resources.fr[k] as string,
  tm: (k) => resources.fr[k],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "fr" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  const t = (k: StringKey) => (resources[lang][k] ?? resources.fr[k] ?? String(k)) as string;
  const tm = <K extends keyof Messages,>(k: K) => resources[lang][k] ?? resources.fr[k];

  return <Ctx.Provider value={{ lang, setLang, t, tm }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
