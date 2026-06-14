import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

type Dict = Record<string, { fr: string; en: string }>;

const dict: Dict = {
  "nav.gite": { fr: "Le gîte", en: "The cottage" },
  "nav.equipements": { fr: "Équipements", en: "Amenities" },
  "nav.galerie": { fr: "Galerie", en: "Gallery" },
  "nav.region": { fr: "La région", en: "The region" },
  "nav.pratique": { fr: "Pratique", en: "Info" },
  "nav.contact": { fr: "Contact", en: "Contact" },
  "nav.reserve": { fr: "Réserver", en: "Book" },
  "nav.reserveLong": { fr: "Réserver le gîte", en: "Book the cottage" },
  "nav.menu": { fr: "Menu", en: "Menu" },
  "nav.close": { fr: "Fermer", en: "Close" },
  "footer.legal": { fr: "Mentions légales", en: "Legal notice" },
  "footer.privacy": { fr: "Confidentialité", en: "Privacy" },
  "footer.cookies": { fr: "Cookies", en: "Cookies" },
  "footer.back": { fr: "Retour à l'accueil", en: "Back to home" },
  "cookies.text": {
    fr: "Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement. Aucun traceur publicitaire.",
    en: "This site only uses cookies strictly necessary for its operation. No advertising trackers.",
  },
  "cookies.ok": { fr: "J'ai compris", en: "Got it" },
  "cookies.more": { fr: "En savoir plus", en: "Learn more" },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict) => string }>({
  lang: "fr",
  setLang: () => {},
  t: (k) => dict[k]?.fr ?? String(k),
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
  const t = (k: keyof typeof dict) => dict[k]?.[lang] ?? dict[k]?.fr ?? String(k);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
