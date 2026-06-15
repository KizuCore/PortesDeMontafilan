import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { LOGO_IMAGE } from "@/lib/home/images";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container-x grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <img
              src={LOGO_IMAGE}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-display text-lg">
              Les Portes de Montafilan
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("home.footer.body")}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("home.footer.navigation")}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="#gite" className="hover:text-terra">
                {t("nav.gite")}
              </a>
            </li>
            <li>
              <a href="#equipements" className="hover:text-terra">
                {t("nav.equipements")}
              </a>
            </li>
            <li>
              <a href="#galerie" className="hover:text-terra">
                {t("nav.galerie")}
              </a>
            </li>
            <li>
              <a href="#region" className="hover:text-terra">
                {t("nav.region")}
              </a>
            </li>
            <li>
              <a href="#reservation" className="hover:text-terra">
                {t("nav.reserve")}
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-terra">
                {t("nav.contact")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("nav.contact")}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="tel:+33780710159" className="hover:text-terra">
                +33 7 80 71 01 59
              </a>
            </li>
            <li>
              <a
                href="mailto:lesportesdemontafilan@gmail.com"
                className="hover:text-terra break-all"
              >
                lesportesdemontafilan@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/LesPortesDeMontafilan"
                target="_blank"
                rel="noreferrer"
                className="hover:text-terra"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://maps.google.com/?q=G%C3%AEte%20-%20Les%20Portes%20de%20Montafilan"
                target="_blank"
                rel="noreferrer"
                className="hover:text-terra"
              >
                Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {t("home.footer.copyright")}
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/mentions-legales" className="hover:text-terra">
            {t("footer.legal")}
          </Link>
          <Link to="/confidentialite" className="hover:text-terra">
            {t("footer.privacy")}
          </Link>
          <Link to="/cookies" className="hover:text-terra">
            {t("footer.cookies")}
          </Link>
          <LangSwitch />
        </div>
      </div>
    </footer>
  );
}
