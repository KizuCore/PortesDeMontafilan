import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Les Portes de Montafilan" },
      { name: "description", content: "Politique de confidentialité du gîte Les Portes de Montafilan à Corseul." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <main className="bg-background text-foreground">
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Link to="/" className="label-tiny hover:text-foreground">← {fr ? "Retour à l'accueil" : "Back to home"}</Link>
          <h1 className="mt-6 text-4xl sm:text-5xl">{fr ? "Confidentialité" : "Privacy"}</h1>
          <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <p>{fr ? "Nous attachons une grande importance au respect de votre vie privée. Cette page décrit comment vos données sont traitées lorsque vous nous contactez via ce site." : "We take your privacy seriously. This page describes how your data is handled when you contact us via this site."}</p>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Données collectées" : "Data collected"}</h2>
              <p className="mt-2">{fr ? "Lorsque vous utilisez le formulaire de contact, votre prénom, nom, email, téléphone et message nous sont transmis par email. Aucune donnée n'est enregistrée sur ce site." : "When using the contact form, your first name, last name, email, phone and message are sent to us by email. No data is stored on this site."}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Finalité" : "Purpose"}</h2>
              <p className="mt-2">{fr ? "Ces informations sont utilisées uniquement pour répondre à votre demande de réservation ou de renseignement. Elles ne sont jamais partagées ni revendues." : "This information is used solely to respond to your booking or information request. It is never shared or sold."}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Conservation" : "Retention"}</h2>
              <p className="mt-2">{fr ? "Les échanges sont conservés le temps nécessaire au suivi de votre séjour, puis archivés selon les obligations légales applicables aux locations saisonnières." : "Communications are kept for the time needed to follow up on your stay, then archived in accordance with legal obligations applicable to seasonal rentals."}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Vos droits" : "Your rights"}</h2>
              <p className="mt-2">{fr ? "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, écrivez-nous à " : "Under GDPR, you have a right of access, rectification and deletion of your data. To exercise these rights, write to us at "}<a href="mailto:lesportesdemontafilan@gmail.com" className="text-terra hover:underline">lesportesdemontafilan@gmail.com</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
