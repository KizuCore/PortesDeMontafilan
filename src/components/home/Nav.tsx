import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { LOGO_IMAGE } from "@/lib/home/images";

export function Nav() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const links = [
    { href: "#gite", label: t("nav.gite") },
    { href: "#equipements", label: t("nav.equipements") },
    { href: "#galerie", label: t("nav.galerie") },
    { href: "#region", label: t("nav.region") },
    { href: "#pratique", label: t("nav.pratique") },
    { href: "#contact", label: t("nav.contact") },
  ];
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <a href="#top" className="flex min-w-max shrink-0 items-center gap-2">
            <img
              src={LOGO_IMAGE}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <span className="font-display text-lg leading-tight">
              Les Portes de Montafilan
            </span>
          </a>
          <nav className="hidden flex-1 items-center justify-center gap-5 xl:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-3">
            <div className="hidden sm:block">
              <LangSwitch />
            </div>
            <a
              href="#reservation"
              className="btn-primary hidden min-w-36 xl:inline-flex !py-2.5 !text-sm"
            >
              {t("nav.reserve")}
            </a>
            <button
              type="button"
              aria-label={t("nav.menu")}
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-secondary xl:hidden"
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-foreground" />
                <span className="block h-px w-4 bg-foreground" />
              </span>
              {t("nav.menu")}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-forest text-primary-foreground">
            <div className="container-x flex h-16 items-center justify-between">
              <span className="font-display text-lg text-background">
                Les Portes de Montafilan
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-background/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-background hover:bg-background/10"
              >
                {t("nav.close")}
              </button>
            </div>
            <div className="container-x flex h-[calc(100vh-4rem)] flex-col justify-between pb-10 pt-8">
              <nav className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 border-b border-background/15 py-5"
                  >
                    <span className="label-tiny !text-background/50 w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-3xl text-background transition-colors group-hover:text-terra sm:text-4xl">
                      {l.label}
                    </span>
                  </a>
                ))}
              </nav>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <LangSwitch tone="light" />
                <a
                  href="#reservation"
                  onClick={() => setOpen(false)}
                  className="btn-accent"
                >
                  {t("nav.reserveLong")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
