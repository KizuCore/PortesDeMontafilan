import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CookieBanner } from "@/components/CookieBanner";
import { LanguageProvider } from "@/lib/i18n";
import { ConfidentialitePage } from "@/routes/confidentialite";
import { CookiesPage } from "@/routes/cookies";
import { Home } from "@/routes/index";
import { MentionsLegalesPage } from "@/routes/mentions-legales";

function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (meta) meta.content = description;
    }
  }, [description, title]);

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
                <PageTitle title="Les Portes de Montafilan - Gîte à Corseul, entre Dinan & Saint-Malo" />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <CookieBanner />
      </LanguageProvider>
    </BrowserRouter>
  );
}
