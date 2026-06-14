import { useI18n, type Lang } from "@/lib/i18n";

function FlagIcon({ lang }: { lang: Lang }) {
  if (lang === "fr") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 18 12"
        className="h-3.5 w-5 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgb(0_0_0/0.12)]"
      >
        <rect width="6" height="12" fill="#002654" />
        <rect x="6" width="6" height="12" fill="#fff" />
        <rect x="12" width="6" height="12" fill="#ce1126" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 12"
      className="h-3.5 w-5 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgb(0_0_0/0.12)]"
    >
      <rect width="18" height="12" fill="#012169" />
      <path d="M0 0l18 12M18 0L0 12" stroke="#fff" strokeWidth="2.4" />
      <path d="M0 0l18 12M18 0L0 12" stroke="#c8102e" strokeWidth="1.2" />
      <path d="M9 0v12M0 6h18" stroke="#fff" strokeWidth="4" />
      <path d="M9 0v12M0 6h18" stroke="#c8102e" strokeWidth="2.4" />
    </svg>
  );
}

export function LangSwitch({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang } = useI18n();
  const base =
    tone === "light"
      ? "border-background/30 text-background/80"
      : "border-border text-muted-foreground";
  const indicator = tone === "light" ? "bg-background" : "bg-forest";
  const activeText =
    tone === "light" ? "text-forest" : "text-primary-foreground";
  const opts: Array<{ lang: Lang; label: string; aria: string }> = [
    { lang: "fr", label: "FR", aria: "Passer le site en francais" },
    { lang: "en", label: "EN", aria: "Switch site to English" },
  ];

  return (
    <div
      className={`relative inline-flex items-center overflow-hidden rounded-full border ${base} p-0.5 text-[11px] font-semibold uppercase`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full ${indicator} transition-transform duration-200 ease-out ${lang === "en" ? "translate-x-full" : "translate-x-0"}`}
      />
      {opts.map((option) => (
        <button
          key={option.lang}
          type="button"
          onClick={() => setLang(option.lang)}
          aria-label={option.aria}
          aria-pressed={lang === option.lang}
          className={`relative z-10 inline-flex min-w-14 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-center ${lang === option.lang ? activeText : ""}`}
        >
          <FlagIcon lang={option.lang} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
