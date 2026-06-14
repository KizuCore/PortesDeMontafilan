import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { addDays, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { AnimatedSection } from "@/components/AnimatedSection";
import type { BusyRange } from "../../shared/availability";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Les Portes de Montafilan - Gîte à Corseul, entre Dinan & Saint-Malo" },
      {
        name: "description",
        content:
          "Gîte chaleureux de 85 m² à Corseul, en Bretagne. Jardin clos, 4 voyageurs + bébé, à 15 min des plages, entre Dinan, Saint-Malo et Cap Fréhel.",
      },
      { property: "og:title", content: "Les Portes de Montafilan" },
      { property: "og:description", content: "Une parenthèse bretonne entre Dinan, Saint-Malo et le Cap Fréhel." },
      {
        property: "og:image",
        content: OG_IMAGE,
      },
    ],
  }),
  component: Home,
});

const imageAssets = import.meta.glob("../assets/img/**/*.{avif,jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const IMG = (path: string) => imageAssets[`../assets/img/${path}`] ?? path;
const OG_IMAGE = IMG("house/ArriereCours1.avif");

const highlights = [
  { k: "85 m²", v: "Maison rénovée en 2018" },
  { k: "350 m²", v: "Jardin clos privatif" },
  { k: "4 + bébé", v: "Jusqu'à 4 voyageurs" },
  { k: "15 min", v: "Des plages bretonnes" },
];

const amenities = [
  { title: "Cuisine & repas", items: ["Cuisine équipée", "Four BEKO inox", "Lave-vaisselle", "Réfrigérateur / congélateur", "Micro-ondes", "Bouilloire & cafetière filtre", "Grille-pain, plaque de cuisson", "Verres à vin, vaisselle complète", "Table à manger"] },
  { title: "Extérieur", items: ["Jardin clos 350 m²", "Mobilier de jardin", "Coin repas extérieur", "Barbecue électrique privatif", "Bains de soleil"] },
  { title: "Famille", items: ["Lit parapluie (sur demande)", "Draps fournis & volets occultants", "Livres & jouets (5+ ans)", "Chaise haute pliante (sur demande)", "Baignoire bébé, table à langer", "Barrières de sécurité, protections fenêtres", "Jeux de société"] },
  { title: "Confort & services", items: ["Wifi & connexion Ethernet", "Espace de travail dédié", "Télévision", "Chauffage central", "Lave-linge gratuit", "Sèche-cheveux, fer à repasser", "Service de ménage en option", "Animaux acceptés"] },
  { title: "Stationnement", items: ["Garage privatif sur place (2 places)", "Stationnement gratuit dans la rue"] },
  { title: "Sécurité & arrivée", items: ["Détecteur de fumée", "Arrivée autonome avec boîte à clés", "Entrée privée"] },
];

const gallerySections = [
  { key: "salon", label: "Salon", images: [{ src: "house/Salon1.avif", alt: "Salon lumineux" }, { src: "house/Salon2.avif", alt: "Coin salon" }] },
  { key: "cuisine", label: "Cuisine", images: [{ src: "house/Cuisine.avif", alt: "Cuisine équipée" }, { src: "house/Cuisine2.avif", alt: "Cuisine - vue 2" }] },
  { key: "repas", label: "Espace repas", images: [{ src: "house/EspaceRepas1.avif", alt: "Espace repas" }, { src: "house/EspaceRepas2.avif", alt: "Espace repas - vue 2" }, { src: "house/EspaceRepas3.avif", alt: "Espace repas - vue 3" }] },
  { key: "chambres", label: "Chambres", images: [{ src: "house/Chambre1.avif", alt: "Chambre 1" }, { src: "house/Chambre2.avif", alt: "Chambre 2" }, { src: "house/ChambreDL1.avif", alt: "Chambre lit double" }, { src: "house/ChambreDL2.avif", alt: "Chambre lit double - vue 2" }] },
  { key: "sdb", label: "Salle de bain & WC", images: [{ src: "house/SalleDeBain1.avif", alt: "Salle de bain" }, { src: "house/SalleDeBain2.avif", alt: "Salle de bain - vue 2" }, { src: "house/Toilettes1.avif", alt: "Toilettes" }] },
  { key: "travail", label: "Espace de travail", images: [{ src: "house/EspaceTravail1.avif", alt: "Bureau" }, { src: "house/EspaceTravail2.avif", alt: "Bureau - vue 2" }] },
  { key: "exterieur", label: "Extérieur & jardin", images: [{ src: "house/Exterieur1.avif", alt: "Extérieur" }, { src: "house/ArriereCours1.avif", alt: "Jardin" }, { src: "house/ArriereCours2.avif", alt: "Arrière-cour" }] },
];

const places = [
  { name: "Dinan", km: "19 km", img: "lieux/dinan-vue-remparts.jpg", notes: ["Ruelles pavées & maisons à colombages", "Port de Dinan sur la Rance"] },
  { name: "Saint-Malo", km: "30 km", img: "lieux/saint-malo-remparts.jpg", notes: ["Remparts & Intra-Muros", "Plage du Sillon", "Cité corsaire"] },
  { name: "Cap Fréhel & Fort La Latte", km: "18 km", img: "lieux/cap-frehel_emmanuel-berthier.jpg", notes: ["Falaises panoramiques", "Fort historique en bord de mer"] },
  { name: "Saint-Cast-Le-Guildo", km: "10 km", img: "lieux/saint-cast-grande-plage.jpg", notes: ["Grande plage de sable", "Pointe de la Garde"] },
  { name: "Dinard - Plage de l'Écluse", km: "23 km", img: "lieux/dinard-ecluse.jpg", notes: ["Promenade du Clair de Lune", "Villas Belle Époque"] },
  { name: "Archipel des Ébihens", km: "13 km", img: "lieux/ebihens.jpg", notes: ["Balades à marée basse", "Côte préservée"] },
  { name: "Château de la Hunaudaye", km: "8,5 km", img: "lieux/hunaudaye.jpg", notes: ["Forteresse médiévale emblématique", "Visite immersive en famille"] },
];

const activities = [
  "Zoo de la Bourbansais - Pleugueneuc (29 km)",
  "Golf - Saint-Cast, Lancieux, Dinard, Saint-Michel-de-Plélan",
  "Parcs aventure dans les arbres - Morieux, Saint-Cast",
  "Karting - Lamballe",
  "Randonnées côtières et de campagne",
  "Canoë / kayak - Plancoët",
  "Escape Games - Erquy, Dinan, Lamballe, Dinard, Saint-Malo",
];

const gallery = [
  { src: "ArriereCours1-DthDVoyy.avif", alt: "Arrière-cour et jardin", span: "lg:col-span-2 lg:row-span-2" },
  { src: "Cuisine-CPQmG56z.avif", alt: "Cuisine ouverte équipée" },
  { src: "Chambre1-BkwhqxBc.avif", alt: "Chambre principale" },
  { src: "Exterieur1-Md0P8o-N.avif", alt: "Extérieur du gîte" },
  { src: "ArriereCours2-CdX0OFE-.avif", alt: "Espace extérieur" },
  { src: "SalleDeBain1-1iN7dSWs.avif", alt: "Salle de bain" },
];

const faqs = [
  { q: "Le gîte est-il proche de la mer ?", a: "Oui. Plusieurs plages des Côtes-d'Armor sont accessibles en 15 à 25 minutes en voiture." },
  { q: "Est-ce une bonne base entre Dinan et Saint-Malo ?", a: "Oui. Corseul est idéalement placé pour rayonner vers Dinan, Saint-Malo, Dinard et le Cap Fréhel." },
  { q: "Pour quel type de séjour ce gîte est-il le mieux adapté ?", a: "Idéal pour des vacances familiales calmes et qualitatives en Bretagne, entre visites, plages et découvertes locales." },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
          <a href="#top" className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-primary-foreground font-display text-lg">M</span>
            <span className="truncate font-display text-lg leading-tight">Les Portes de Montafilan</span>
          </a>
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block"><LangSwitch /></div>
            <a href="#reservation" className="btn-primary hidden sm:inline-flex !py-2.5 !text-sm">{t("nav.reserve")}</a>
            <button
              type="button"
              aria-label={t("nav.menu")}
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground hover:bg-secondary transition-colors"
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
              <span className="font-display text-lg text-background">Les Portes de Montafilan</span>
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
                    <span className="label-tiny !text-background/50 w-6">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-3xl text-background transition-colors group-hover:text-terra sm:text-4xl">
                      {l.label}
                    </span>
                  </a>
                ))}
              </nav>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <LangSwitch tone="light" />
                <a href="#reservation" onClick={() => setOpen(false)} className="btn-accent">{t("nav.reserveLong")}</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMG("house/ArriereCours1.avif")} alt="Jardin clos du gîte Les Portes de Montafilan" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/30 via-forest/40 to-forest/70" />
      </div>
      <div className="container-x relative flex min-h-[88vh] flex-col justify-end py-16 text-primary-foreground sm:py-24">
        <span className="eyebrow !text-background/80 animate-fade-in">Corseul · Côtes-d'Armor · Bretagne</span>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl lg:text-7xl animate-fade-in-up delay-100">
          Une parenthèse bretonne, entre <em className="not-italic text-background/90 underline decoration-terra decoration-2 underline-offset-8">terre et mer</em>.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-background/85 sm:text-lg animate-fade-in-up delay-200">
          Jocelyne et Christian vous accueillent dans leur gîte à Corseul, entre Saint-Malo et le Cap Fréhel. 85 m² rénovés, jardin clos, à 15 minutes des plages.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up delay-300">
          <a href="#reservation" className="btn-primary">Vérifier les disponibilités</a>
          <a href="#contact" className="btn-ghost !border-background/40 !text-background hover:!bg-background/10">Poser une question</a>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-background/20 pt-6 sm:grid-cols-4 sm:gap-8">
          {highlights.map((h, i) => (
            <div key={h.k} className={`animate-fade-in-up delay-${(i + 4) * 100}`}>
              <div className="font-display text-2xl sm:text-3xl">{h.k}</div>
              <div className="text-xs uppercase tracking-wider text-background/70 sm:text-sm">{h.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section id="gite" className="py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <AnimatedSection>
            <span className="eyebrow">Le gîte</span>
            <h2 className="mt-3 text-3xl sm:text-5xl">Un cocon lumineux, simple et chaleureux.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Une maison de 85 m² entièrement rénovée en 2018, avec un séjour clair ouvert sur une cuisine équipée. Deux chambres (un lit double, deux lits simples), une salle de bain, deux WC séparés et un espace de travail.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              À l'extérieur, un grand jardin clos de 350 m² avec parking privatif, pour profiter du calme breton, en toute tranquillité.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Wifi", "Lave-linge", "Lave-vaisselle", "TV", "Équipement bébé", "Jeux de société", "BBQ", "Garage"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">{t}</span>
              ))}
            </div>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <AnimatedSection delay={100} className="col-span-2">
              <img src={IMG("house/Cuisine.avif")} alt="Cuisine ouverte équipée" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card img-reveal" />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <img src={IMG("house/Chambre1.avif")} alt="Chambre" className="aspect-[4/5] w-full rounded-2xl object-cover shadow-card img-reveal" />
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <img src={IMG("house/ArriereCours2.avif")} alt="Jardin" className="aspect-[4/5] w-full rounded-2xl object-cover shadow-card img-reveal" />
            </AnimatedSection>
            <AnimatedSection delay={400}>
              <img src={IMG("house/SalleDeBain1.avif")} alt="Salle de bain" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card img-reveal" />
            </AnimatedSection>
            <AnimatedSection delay={500}>
              <img src={IMG("house/Exterieur1.avif")} alt="Extérieur" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card img-reveal" />
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}

function Spaces() {
  return (
    <section className="bg-secondary/60 py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="max-w-2xl">
          <span className="eyebrow">Espaces & agencement</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">Tout ce qu'il faut pour se sentir chez soi.</h2>
        </AnimatedSection>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Séjour & cuisine", d: "Salon lumineux ouvert sur une cuisine entièrement équipée." },
            { t: "2 chambres", d: "Un lit double, deux lits simples, et un lit bébé sur demande." },
            { t: "Salle de bain", d: "Une salle de bain complète et deux WC séparés." },
            { t: "Espace de travail", d: "Un coin bureau dédié, dans une pièce séparée." },
            { t: "Jardin & terrasse", d: "350 m² clos, mobilier de jardin et coin repas extérieur." },
            { t: "Garage & parking", d: "Garage privatif (2 places) et stationnement libre dans la rue." },
          ].map((s, i) => (
            <AnimatedSection key={s.t} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card card-hover h-full">
                <h3 className="text-xl">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Amenities() {
  return (
    <section id="equipements" className="py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow">Équipements</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Tout est prévu pour votre séjour.</h2>
            <p className="mt-3 text-muted-foreground">Les équipements sont regroupés par catégorie pour vous repérer en un coup d'œil.</p>
          </div>
        </AnimatedSection>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((cat, i) => (
            <AnimatedSection key={cat.title} delay={i * 60}>
              <div className="rounded-2xl border border-border bg-card p-6 card-hover h-full">
                <h3 className="text-lg">{cat.title}</h3>
                <ul className="mt-4 space-y-2">
                  {cat.items.map((i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terra" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
        <AnimatedSection delay={200}>
          <p className="mt-8 text-xs text-muted-foreground">
            Non inclus : pas de détecteur de monoxyde de carbone.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Gallery() {
  const [active, setActive] = useState(gallerySections[0].key);
  const current = gallerySections.find((s) => s.key === active) ?? gallerySections[0];
  return (
    <section id="galerie" className="bg-secondary/60 py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow">Galerie</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Le gîte, pièce par pièce.</h2>
            <p className="mt-3 text-muted-foreground">Choisissez une section pour parcourir uniquement ses photos.</p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <div className="mt-8 flex flex-wrap gap-2">
            {gallerySections.map((s) => {
              const isActive = s.key === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
                    isActive
                      ? "border-forest bg-forest text-primary-foreground shadow-soft"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {s.label}
                  <span className={`ml-2 text-xs ${isActive ? "text-background/70" : "text-muted-foreground"}`}>{s.images.length}</span>
                </button>
              );
            })}
          </div>
        </AnimatedSection>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {current.images.map((g, i) => (
            <AnimatedSection key={g.src} delay={i * 80}>
              <figure className="overflow-hidden rounded-2xl shadow-card">
                <img
                  src={IMG(g.src)}
                  alt={g.alt}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </figure>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Region() {
  return (
    <section id="region" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <AnimatedSection>
              <span className="eyebrow">La région</span>
              <h2 className="mt-3 text-3xl sm:text-5xl">S'échapper, à deux pas.</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Les Portes de Montafilan, c'est un gîte des Côtes-d'Armor, idéalement placé entre campagne et mer. Une base pratique pour partir à la découverte de Dinan, Saint-Malo et du Cap Fréhel.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                La région mêle patrimoine breton, marchés locaux et sentiers côtiers - parfait pour un week-end comme pour des vacances plus longues.
              </p>
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 card-hover">
                <h3 className="text-lg">À faire autour</h3>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {activities.map((a) => (
                    <li key={a} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terra" />{a}</li>
                  ))}
                </ul>
                <a href="https://www.dinan-capfrehel.com/" target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-forest underline underline-offset-4">
                  Office de tourisme Dinan – Cap Fréhel ↗
                </a>
              </div>
            </AnimatedSection>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {places.map((p, i) => (
                <AnimatedSection key={p.name} delay={i * 70} className={i === 0 ? "col-span-2" : ""}>
                  <article className={`overflow-hidden rounded-2xl border border-border bg-card card-hover h-full ${i === 0 ? "col-span-2" : ""}`}>
                    <div className={`relative ${i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                      <img src={IMG(p.img)} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-lg sm:text-xl">{p.name}</h3>
                        <span className="text-xs text-terra">{p.km}</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground sm:text-sm">
                        {p.notes.map((n) => <li key={n}>· {n}</li>)}
                      </ul>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyHere() {
  const blocks = [
    { t: "Entre terre et mer", d: "Depuis Corseul, rejoignez facilement la vieille ville de Dinan, les plages de Saint-Malo et le littoral du Cap Fréhel." },
    { t: "Plages, patrimoine, art de vivre", d: "Alternez plages, balades dans la vallée de la Rance et sites médiévaux comme Dinan ou le château de la Hunaudaye." },
    { t: "Confort & flexibilité", d: "Un cadre calme, un extérieur clos, un accès routier facile aux grandes destinations du nord de la Bretagne." },
  ];
  return (
    <section className="bg-forest text-primary-foreground py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="max-w-2xl">
          <span className="eyebrow !text-background/80">Pourquoi ici</span>
          <h2 className="mt-3 text-3xl sm:text-5xl">Découvrir le nord de la Bretagne, depuis Corseul.</h2>
        </AnimatedSection>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {blocks.map((b, i) => (
            <AnimatedSection key={b.t} delay={i * 100}>
              <div className="rounded-2xl border border-background/15 bg-background/5 p-6 backdrop-blur card-hover h-full">
                <h3 className="text-xl text-background">{b.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/80">{b.d}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-x max-w-3xl text-center">
        <AnimatedSection>
          <span className="eyebrow">Avis voyageurs</span>
          <div className="mt-4 text-terra" aria-label="5 étoiles">★★★★★</div>
          <blockquote className="mt-6 font-display text-2xl leading-snug sm:text-4xl">
            « Très bel hébergement : spacieux, lumineux et propre, avec deux belles chambres et un grand salon avec baies vitrées. Nous avons profité du grand jardin clos et des équipements de qualité. »
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">
            Jocelyne était accueillante, disponible et nous a donné de très bons conseils de visites. Une base idéale pour explorer la région, la côte et les villes voisines.
          </p>
          <p className="mt-4 text-sm font-medium">- Mimouna</p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function AirbnbCalendar() {
  const [range, setRange] = useState<DateRange | undefined>();
  const [busyRanges, setBusyRanges] = useState<BusyRange[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const rates = [
    { label: "Octobre à avril", price: "61 €", unit: "/ nuit" },
    { label: "Mai à septembre", price: "68 €", unit: "/ nuit" },
    { label: "Vacances + juillet/août", price: "100 €", unit: "/ nuit" },
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/availability");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as { busyRanges?: BusyRange[] };

        if (!cancelled) {
          setBusyRanges(Array.isArray(data.busyRanges) ? data.busyRanges : []);
          setAvailabilityError(null);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setBusyRanges([]);
          setAvailabilityError(error instanceof Error ? error.message : "AVAILABILITY_FAILED");
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  const disabledRanges = useMemo(
    () => busyRanges.map((rangeItem) => ({
      from: new Date(`${rangeItem.start}T00:00:00`),
      to: addDays(new Date(`${rangeItem.end}T00:00:00`), -1),
    })),
    [busyRanges],
  );

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(0, differenceInCalendarDays(range.to, range.from));
  }, [range]);

  const selectedLabel = range?.from && range?.to
    ? `${range.from.toLocaleDateString("fr-FR")} → ${range.to.toLocaleDateString("fr-FR")}`
    : "Aucune date sélectionnée";

  return (
    <section id="reservation" className="bg-secondary/60 py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <AnimatedSection>
            <span className="eyebrow">Tarifs & réservation</span>
            <h2 className="mt-3 text-3xl sm:text-5xl">Prêts à planifier votre séjour ?</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Sélectionnez vos dates pour une estimation instantanée. Le prix final sera confirmé sur Airbnb avant réservation.
            </p>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-border bg-card shadow-card">
              {rates.map((rate, index) => (
                <div
                  key={rate.label}
                  className={`flex items-center justify-between gap-4 px-5 py-5 ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="text-sm text-muted-foreground">{rate.label}</div>
                  <div className="whitespace-nowrap text-right">
                    <span className="font-display text-2xl text-foreground">{rate.price}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{rate.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Des conditions préférentielles peuvent être proposées pour les longs séjours.
            </p>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-7">
          <AnimatedSection delay={150}>
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg sm:text-xl">Disponibilités</h3>
                <span className="label-tiny">Airbnb</span>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  locale={fr}
                  disabled={[{ before: new Date() }, ...disabledRanges]}
                  className="pointer-events-auto"
                />
              </div>
              <div className="mt-5 rounded-xl bg-secondary/70 p-4 sm:p-5">
                {range?.from && range?.to ? (
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {selectedLabel} · {nights} nuit{nights > 1 ? "s" : ""}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sélectionnez une arrivée puis un départ pour préparer votre séjour Airbnb.</p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                  <i className="legend-dot legend-available" /> Libre
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                  <i className="legend-dot legend-unavailable" /> Réservé
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                  <i className="legend-dot legend-selected" /> Sélection
                </span>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg">Infos pratiques</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li>· Arrivée à partir de 16h00</li>
                <li>· Départ à 10h00</li>
                <li>· Arrivée autonome avec boîte à clés</li>
                <li>· Réservation finale sur Airbnb</li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="pratique" className="py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AnimatedSection>
            <span className="eyebrow">Questions fréquentes</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">Avant de réserver.</h2>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-8 divide-y divide-border">
          {faqs.map((f, i) => (
            <AnimatedSection key={f.q} delay={i * 80}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-display text-lg sm:text-xl">{f.q}</span>
                  <span className="text-terra text-2xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  return (
    <section id="contact" className="bg-forest text-primary-foreground py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <AnimatedSection>
            <span className="eyebrow !text-background/70">Contact</span>
            <h2 className="mt-3 text-3xl sm:text-5xl text-background">Une question ? Écrivez-nous.</h2>
            <p className="mt-5 max-w-md text-background/75 leading-relaxed">
              Jocelyne et Christian vous répondent rapidement, par téléphone ou par email.
            </p>
            <ul className="mt-8 space-y-4 text-background/90">
              <li><span className="text-background/60 text-xs uppercase tracking-wider">Hôtes</span><div>Jocelyne & Christian</div></li>
              <li><span className="text-background/60 text-xs uppercase tracking-wider">Adresse</span><div>Corseul, Bretagne</div></li>
              <li><span className="text-background/60 text-xs uppercase tracking-wider">Téléphone</span><div><a href="tel:+33780710159" className="hover:text-terra">+33 7 80 71 01 59</a></div></li>
              <li><span className="text-background/60 text-xs uppercase tracking-wider">Email</span><div><a href="mailto:lesportesdemontafilan@gmail.com" className="hover:text-terra break-all">lesportesdemontafilan@gmail.com</a></div></li>
              <li><span className="text-background/60 text-xs uppercase tracking-wider">Facebook</span><div><a href="https://www.facebook.com/LesPortesDeMontafilan" target="_blank" rel="noreferrer" className="hover:text-terra">Les Portes De Montafilan</a></div></li>
            </ul>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-6">
          <AnimatedSection delay={150}>
            <form
              className="rounded-2xl border border-background/15 bg-background/5 p-6 sm:p-8 backdrop-blur"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = e.currentTarget as HTMLFormElement;
                const data = new FormData(f);

                setIsSubmitting(true);
                setSubmitState("idle");
                setSubmitMessage(null);

                try {
                  const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      language: "fr",
                      form: {
                        firstName: String(data.get("firstname") || "").trim(),
                        lastName: String(data.get("lastname") || "").trim(),
                        email: String(data.get("email") || "").trim(),
                        phone: String(data.get("phone") || "").trim(),
                        subject: String(data.get("subject") || "Demande d'information").trim(),
                        message: String(data.get("message") || "").trim(),
                      },
                    }),
                  });

                  const result = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;

                  if (!response.ok) {
                    throw new Error(result?.error || `HTTP ${response.status}`);
                  }

                  f.reset();
                  setSubmitState("success");
                  setSubmitMessage("Message envoyé. Nous vous répondrons rapidement par email.");
                } catch (error: unknown) {
                  setSubmitState("error");
                  setSubmitMessage(error instanceof Error ? error.message : "Erreur lors de l'envoi du message.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <h3 className="text-background text-xl">Envoyer un message</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field name="firstname" label="Prénom *" required />
                <Field name="lastname" label="Nom *" required />
                <Field name="email" type="email" label="Email *" required />
                <Field name="phone" label="Téléphone" />
                <Field name="subject" label="Sujet *" required className="sm:col-span-2" />
                <Field name="message" label="Message *" required textarea className="sm:col-span-2" />
              </div>
              {submitMessage ? (
                <div
                  className={`mt-6 rounded-xl border p-4 text-sm ${
                    submitState === "success"
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-50"
                      : "border-destructive/40 bg-destructive/10 text-destructive-foreground"
                  }`}
                >
                  {submitMessage}
                </div>
              ) : null}
              <button type="submit" className="btn-primary mt-6 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Field({
  name, label, type = "text", required, textarea, className = "",
}: { name: string; label: string; type?: string; required?: boolean; textarea?: boolean; className?: string }) {
  const base =
    "w-full rounded-lg border border-background/20 bg-background/5 px-4 py-3 text-background placeholder:text-background/40 focus:border-terra focus:outline-none focus:ring-2 focus:ring-clay/30 transition-colors";
  return (
    <label className={`block text-sm ${className}`}>
      <span className="block text-background/70 text-xs uppercase tracking-wider">{label}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={5} className={`${base} mt-2 resize-none`} />
      ) : (
        <input name={name} type={type} required={required} className={`${base} mt-2`} />
      )}
    </label>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container-x grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-primary-foreground font-display">M</span>
            <span className="font-display text-lg">Les Portes de Montafilan</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Gîte chaleureux à Corseul, entre Dinan, Saint-Malo et Cap Fréhel.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Navigation</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#gite" className="hover:text-terra">Le gîte</a></li>
            <li><a href="#equipements" className="hover:text-terra">Équipements</a></li>
            <li><a href="#galerie" className="hover:text-terra">Galerie</a></li>
            <li><a href="#region" className="hover:text-terra">La région</a></li>
            <li><a href="#reservation" className="hover:text-terra">Réservation</a></li>
            <li><a href="#contact" className="hover:text-terra">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Contact</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="tel:+33780710159" className="hover:text-terra">+33 7 80 71 01 59</a></li>
            <li><a href="mailto:lesportesdemontafilan@gmail.com" className="hover:text-terra break-all">lesportesdemontafilan@gmail.com</a></li>
            <li><a href="https://www.facebook.com/LesPortesDeMontafilan" target="_blank" rel="noreferrer" className="hover:text-terra">Facebook</a></li>
            <li><a href="https://maps.google.com/?q=G%C3%AEte%20-%20Les%20Portes%20de%20Montafilan" target="_blank" rel="noreferrer" className="hover:text-terra">Google Maps</a></li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Les Portes de Montafilan - Corseul, Bretagne</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/mentions-legales" className="hover:text-terra">Mentions légales</Link>
          <Link to="/confidentialite" className="hover:text-terra">Confidentialité</Link>
          <Link to="/cookies" className="hover:text-terra">Cookies</Link>
          <LangSwitch />
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <main className="bg-background text-foreground">
      <Nav />
      <Hero />
      <Intro />
      <Spaces />
      <Amenities />
      <Gallery />
      <Region />
      <WhyHere />
      <Reviews />
      <AirbnbCalendar />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
