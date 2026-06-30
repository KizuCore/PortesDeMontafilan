# Les Portes de Montafilan

Site vitrine et outil de pré-réservation pour le gîte **Les Portes de Montafilan**.

Le site permet de présenter le logement, consulter les disponibilités Airbnb, estimer un séjour, envoyer une demande de contact et rediriger le visiteur vers Airbnb pour finaliser la réservation.

## Stack

- **React 19** avec **Vite**
- **TypeScript**
- **Tailwind CSS 4**
- **React Router**
- **Radix UI** et composants UI locaux
- **Vercel Serverless Functions** dans `api/`
- **Vitest** pour les tests unitaires
- **Playwright** pour les tests end-to-end

## Services externes

- **Airbnb** : source des disponibilités via flux iCal et destination de réservation.
- **Brevo** : envoi des emails du formulaire de contact.
- **Google reCAPTCHA v3** : protection anti-spam du formulaire de contact.
- **Google Sheets** : source optionnelle des tarifs via CSV public.
- **Vercel** : hébergement, déploiement et fonctions serverless.

## Installation

```bash
npm install
```

Créer ensuite un fichier `.env.local` à partir de `.env.template` :

```bash
cp .env.template .env.local
```

Sous PowerShell :

```powershell
Copy-Item .env.template .env.local
```

Puis remplir les variables nécessaires.

## Variables d'environnement

### Emails Brevo

```env
BREVO_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=
OWNER_EMAIL=
BREVO_OWNER_TEMPLATE_ID=
BREVO_CLIENT_TEMPLATE_ID=
```

Ces variables sont utilisées par `/api/contact` pour envoyer l'email à la propriétaire et l'accusé de réception au visiteur.

### Airbnb

```env
AIRBNB_ICAL_URL=
AIRBNB_LISTING_URL=
AIRBNB_LISTING_ID=
```

- `AIRBNB_ICAL_URL` sert à récupérer les dates indisponibles.
- `AIRBNB_LISTING_URL` ou `AIRBNB_LISTING_ID` sert à construire le lien Airbnb avec les dates pré-remplies.

### Google Sheets

```env
GOOGLE_SHEETS_PRICING_CSV_URL=
```

URL publique d'une feuille Google Sheets publiée au format CSV. Si elle n'est pas renseignée ou indisponible, le site utilise les tarifs par défaut dans `shared/pricing.ts`.

Format attendu :

```csv
key,value
lowSeasonNight,61
midSeasonNight,68
highSeasonNight,100
cleaningFee,60
touristTaxPerAdultPerNight,1.32
towelPackPerPerson,6.5
minNightsLowMid,2
minNightsHigh,4
```

### reCAPTCHA

```env
VITE_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
RECAPTCHA_MIN_SCORE=0.5
```

`VITE_RECAPTCHA_SITE_KEY` est public et chargé côté navigateur. `RECAPTCHA_SECRET_KEY` reste côté serveur.

## Développement local

Pour lancer uniquement le front Vite :

```bash
npm run dev
```

URL par défaut :

```txt
http://localhost:8080
```

Pour lancer le projet avec les fonctions Vercel locales :

```bash
npm run dev:full
```

Utiliser `dev:full` pour tester les routes `/api/*` dans des conditions proches de la production.

## Scripts

```bash
npm run dev           # serveur Vite
npm run dev:full      # serveur local Vercel avec fonctions serverless
npm run build         # build production
npm run preview       # prévisualisation du build
npm run lint          # lint ESLint
npm run format        # formatage Prettier
npm run test          # tests unitaires Vitest
npm run test:watch    # tests unitaires en watch
npm run test:coverage # couverture Vitest
npm run test:e2e      # tests Playwright
npm run test:e2e:ui   # interface Playwright
```

## Structure du projet

```txt
api/                 Fonctions serverless Vercel
public/              Fichiers publics, favicon, PDF, sitemap, robots.txt
shared/              Logique partagée entre front et API
src/assets/          Images importées par le front
src/components/      Composants React
src/components/home/ Sections de la page d'accueil
src/components/ui/   Composants UI réutilisables
src/i18n/            Traductions FR/EN
src/lib/             Helpers front, API clients, dates, prix, reCAPTCHA
src/routes/          Pages et routes React
tests/e2e/           Tests Playwright
```

## Routes API

### `GET /api/availability`

Récupère le calendrier Airbnb iCal, le parse et renvoie les périodes indisponibles.

### `POST /api/estimate`

Calcule une estimation de prix selon :

- les dates de séjour ;
- le nombre d'adultes et d'enfants ;
- les options linge ;
- les règles de saison ;
- les tarifs locaux ou Google Sheets ;
- les indisponibilités Airbnb.

### `GET /api/pricing-config`

Renvoie la configuration tarifaire utilisée par le front. La source peut être Google Sheets ou le fallback local.

### `POST /api/contact`

Vérifie le token reCAPTCHA puis envoie les emails via Brevo.

### `POST /api/airbnb-link`

Construit une URL Airbnb avec les dates et voyageurs pré-remplis.

## Tarifs

La logique de prix principale est dans `shared/pricing.ts`.

Les tarifs peuvent venir de deux sources :

1. Google Sheets via `GOOGLE_SHEETS_PRICING_CSV_URL`.
2. Valeurs par défaut dans `defaultPricingConfig`.

La récupération Google Sheets est mise en cache environ 5 minutes et timeout après environ 6 secondes.

## Disponibilités

Les disponibilités viennent du flux iCal Airbnb configuré avec `AIRBNB_ICAL_URL`.

La logique de parsing et de détection de conflit est dans `shared/availability.ts`.

## Tests

Tests unitaires :

```bash
npm run test
```

Tests end-to-end :

```bash
npm run test:e2e
```

Les tests e2e mockent les appels externes pour éviter de dépendre de Brevo, Airbnb, Google Sheets ou reCAPTCHA pendant l'exécution.

## Build et déploiement

Build local :

```bash
npm run build
```

Le projet est prévu pour Vercel :

- framework : Vite ;
- commande de build : `npm run build` ;
- dossier de sortie : `dist` ;
- fonctions serverless : dossier `api/`.

Les rewrites dans `vercel.json` permettent aux routes React suivantes de fonctionner en accès direct :

- `/mentions-legales`
- `/confidentialite`
- `/cookies`

## Documents utiles

- `READ-ME-CLIENTE.md` : guide non technique pour la cliente.
- `.env.template` : modèle des variables d'environnement.

