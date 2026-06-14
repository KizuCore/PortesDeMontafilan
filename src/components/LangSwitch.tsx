import { useI18n, type Lang } from "@/lib/i18n";

export function LangSwitch({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang } = useI18n();
  const base =
    tone === "light"
      ? "border-background/30 text-background/80"
      : "border-border text-muted-foreground";
  const active =
    tone === "light"
      ? "bg-background text-forest"
      : "bg-forest text-primary-foreground";
  const opts: Lang[] = ["fr", "en"];
  return (
    <div className={`inline-flex items-center rounded-full border ${base} p-0.5 text-[11px] font-semibold tracking-[0.18em] uppercase`}>
      {opts.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 rounded-full transition-colors ${lang === l ? active : ""}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
