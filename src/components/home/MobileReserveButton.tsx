import { useI18n } from "@/lib/i18n";

export function MobileReserveButton() {
  const { t } = useI18n();

  return (
    <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 sm:hidden">
      <a
        href="#reservation"
        className="btn-primary flex w-full shadow-glow !py-4"
      >
        {t("nav.reserve")}
      </a>
    </div>
  );
}
