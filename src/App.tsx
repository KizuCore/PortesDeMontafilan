import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import { CookieBanner } from "@/components/CookieBanner";
import { LanguageProvider } from "@/lib/i18n";
import { ConfidentialitePage } from "@/routes/confidentialite";
import { CookiesPage } from "@/routes/cookies";
import { Home } from "@/routes/index";
import { MentionsLegalesPage } from "@/routes/mentions-legales";

const SITE_ORIGIN = "https://www.lesportesdemontafilan.com";

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let meta = document.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

function PageTitle({
  title,
  description,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
}: {
  title: string;
  description?: string;
  robots?: string;
}) {
  const location = useLocation();

  useEffect(() => {
    const canonicalHref = `${SITE_ORIGIN}${location.pathname === "/" ? "/" : location.pathname}`;

    document.title = title;
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:url", canonicalHref);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "robots", robots);
    upsertCanonical(canonicalHref);
  }, [description, location.pathname, robots, title]);

  return null;
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <a href="/" className="btn-primary mt-6 inline-flex !py-3">
          Retour à l'accueil
        </a>
      </div>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <PageTitle
                  title="Les Portes de Montafilan - Gîte familial avec jardin clos à Corseul"
                  description="Les Portes de Montafilan, gîte familial avec jardin clos à Corseul, entre Dinan, Saint-Malo et Cap Fréhel. Galerie, disponibilités et demande de réservation."
                />
                <Home />
              </>
            }
          />
          <Route
            path="/mentions-legales"
            element={
              <>
                <PageTitle
                  title="Mentions légales - Les Portes de Montafilan"
                  description="Mentions légales du site Les Portes de Montafilan, gîte à Corseul en Bretagne."
                />
                <MentionsLegalesPage />
              </>
            }
          />
          <Route
            path="/confidentialite"
            element={
              <>
                <PageTitle
                  title="Politique de confidentialité - Les Portes de Montafilan"
                  description="Politique de confidentialité du gîte Les Portes de Montafilan à Corseul."
                />
                <ConfidentialitePage />
              </>
            }
          />
          <Route
            path="/cookies"
            element={
              <>
                <PageTitle
                  title="Cookies - Les Portes de Montafilan"
                  description="Gestion des cookies sur le site Les Portes de Montafilan."
                />
                <CookiesPage />
              </>
            }
          />
          <Route
            path="*"
            element={
              <>
                <PageTitle
                  title="Page introuvable - Les Portes de Montafilan"
                  description="Cette page n'existe pas ou a été déplacée."
                  robots="noindex, follow"
                />
                <NotFoundPage />
              </>
            }
          />
        </Routes>
        <CookieBanner />
      </LanguageProvider>
    </BrowserRouter>
  );
}
