# Guide cliente - Les Portes de Montafilan

Ce document explique comment utiliser le site au quotidien, sans entrer dans la partie technique.

## 1. À quoi sert le site

Le site permet aux visiteurs de :

- découvrir le gîte, les équipements, les photos et la région ;
- consulter les dates déjà réservées ou indisponibles ;
- sélectionner des dates pour obtenir une estimation de prix ;
- choisir le nombre de voyageurs ;
- être redirigés vers Airbnb pour finaliser la réservation ;
- envoyer un message via le formulaire de contact.

Important : le site ne remplace pas Airbnb. Il aide les visiteurs à préparer leur séjour, mais la réservation finale se fait sur Airbnb.

## 2. Où voir les réservations

Les réservations sont à consulter dans Airbnb.

Le site lit le calendrier Airbnb pour afficher les dates indisponibles. Les dates réservées apparaissent donc automatiquement comme bloquées sur le calendrier du site, à condition que le calendrier Airbnb soit bien configuré.

À retenir :

- les réservations confirmées sont dans votre compte Airbnb ;
- le site ne stocke pas de réservation lui-même ;
- les demandes de contact arrivent par email ;
- le bouton "Demander ces dates" envoie le visiteur vers Airbnb avec les dates pré-remplies.

## 3. Comment fonctionne le calendrier

Dans la section "Tarifs & réservation", le visiteur choisit :

- une date d'arrivée ;
- une date de départ ;
- le nombre d'adultes ;
- le nombre d'enfants ;
- éventuellement un bébé.

Le site vérifie ensuite :

- si les dates sont disponibles selon le calendrier Airbnb ;
- si la durée minimum est respectée ;
- si le nombre de voyageurs est accepté ;
- puis il affiche une estimation.

Règles actuelles :

- 4 voyageurs maximum, plus 1 bébé ;
- au moins 1 adulte ;
- minimum de nuits configurable dans le fichier de tarifs ;
- haute saison = vacances scolaires + juillet/août ;
- le prix final reste confirmé sur Airbnb avant paiement.

## 4. Comment modifier les tarifs avec le fichier type Excel

Les tarifs sont pilotés par une feuille Google Sheets publiée au format CSV. Vous pouvez la voir comme un fichier Excel en ligne.

Pour modifier un tarif :

1. Ouvrir la feuille Google Sheets des tarifs.
2. Modifier uniquement la colonne `value`.
3. Ne pas renommer les valeurs de la colonne `key`.
4. Attendre quelques minutes.
5. Recharger la page du site et refaire une estimation.

Le site garde les tarifs en mémoire pendant environ 5 minutes. Une modification dans la feuille peut donc mettre jusqu'à 5 minutes à apparaître sur le site.

## 5. Les lignes de tarifs à connaître

La feuille doit contenir des lignes de ce type :

| Clé à ne pas renommer | Signification |
| --- | --- |
| `lowSeasonNight` | Prix par nuit en basse saison |
| `lowSeasonWeek` | Prix semaine basse saison, présent dans la feuille mais non utilisé dans le calcul actuel |
| `midSeasonNight` | Prix par nuit en moyenne saison |
| `midSeasonWeek` | Prix semaine moyenne saison, présent dans la feuille mais non utilisé dans le calcul actuel |
| `highSeasonNight` | Prix par nuit en haute saison |
| `highSeasonWeek` | Prix semaine haute saison, présent dans la feuille mais non utilisé dans le calcul actuel |
| `cleaningFee` | Forfait ménage ajouté à la réservation |
| `touristTaxPerAdultPerNight` | Taxe de séjour par adulte et par nuit |
| `towelPackPerPerson` | Prix de l'option linge de toilette par personne |
| `minNightsLowMid` | Nombre minimum de nuits hors haute saison |
| `minNightsHigh` | Nombre minimum de nuits en haute saison |

Exemple :

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

Vous pouvez utiliser un point ou une virgule pour les centimes, par exemple `6.5` ou `6,5`.

## 6. Ce qu'il ne faut pas modifier dans la feuille

À éviter :

- renommer les clés de la colonne `key` ;
- supprimer la ligne d'en-tête `key,value` ;
- écrire du texte à la place d'un nombre dans la colonne `value` ;
- utiliser une nouvelle ligne inventée en pensant qu'elle sera automatiquement comprise par le site.

Si une ligne est mal remplie, le site l'ignore. Si la feuille Google Sheets est indisponible, le site utilise des tarifs de secours intégrés.

## 7. Le délai d'actualisation

Il y a deux délais à connaître :

- Tarifs Google Sheets : le site garde les tarifs pendant environ 5 minutes avant de relire la feuille.
- Connexion aux services externes : si Google Sheets ou Airbnb met trop longtemps à répondre, le site arrête d'attendre au bout d'environ 6 secondes.

Cela évite que la page reste bloquée.

Si un prix ne change pas immédiatement après modification, c'est normal : attendre 5 minutes puis recharger la page.

## 8. Comment fonctionne l'estimation

L'estimation affichée comprend :

- le prix des nuits ;
- le forfait ménage ;
- la taxe de séjour ;
- les règles de minimum de nuits.

Le prix du linge de toilette est affiché comme option pratique, mais il n'est pas ajouté automatiquement à l'estimation actuelle.

Le site affiche une estimation pour aider le visiteur. Le prix final reste celui affiché et confirmé sur Airbnb.

Pour 7 nuits ou plus, le site indique qu'une réduction peut s'appliquer sur Airbnb. Dans ce cas, le prix Airbnb peut être plus avantageux que l'estimation du site.

## 9. Formulaire de contact

Le formulaire de contact permet au visiteur d'envoyer :

- prénom ;
- nom ;
- email ;
- téléphone, optionnel ;
- sujet ;
- message.

Les messages arrivent par email. Le formulaire est protégé par Google reCAPTCHA contre les spams.

Les emails sont envoyés avec Brevo :

- un email est envoyé à la propriétaire avec la demande du visiteur ;
- un accusé de réception peut être envoyé au visiteur ;
- les modèles d'emails sont des templates Brevo ;
- l'adresse d'envoi, l'adresse de réception et les templates utilisés sont configurés côté site.

Si le formulaire affiche une erreur, vérifier :

- que l'adresse email du visiteur est correcte ;
- que la protection anti-spam est bien configurée ;
- que le service Brevo fonctionne ;
- que les templates Brevo existent toujours.

## 10. Que faire en cas de problème

### Les tarifs ne changent pas

Attendre 5 minutes, puis recharger la page. Vérifier ensuite que la feuille Google Sheets contient bien les bonnes clés et des valeurs numériques.

### Des dates réservées n'apparaissent pas bloquées

Vérifier dans Airbnb que la réservation est bien confirmée. Le site lit le calendrier Airbnb : si Airbnb n'a pas encore mis à jour son calendrier, le site ne peut pas l'afficher immédiatement.

### Le bouton "Demander ces dates" ne fonctionne pas

Vérifier que les dates sont complètes, disponibles, et que la durée minimum est respectée. Si tout semble bon, il peut y avoir un souci de configuration du lien Airbnb.

### Le visiteur dit que le prix est différent sur Airbnb

C'est possible. Le site donne une estimation. Le prix final est toujours celui confirmé sur Airbnb avant réservation.

## 11. Ce qui se gère sur Airbnb

À gérer directement dans Airbnb :

- les réservations confirmées ;
- les annulations ;
- les échanges liés à une réservation Airbnb ;
- le paiement ;
- le prix final ;
- les promotions ou réductions Airbnb ;
- le calendrier officiel des disponibilités.

## 12. Ce qui se gère dans la feuille de tarifs

À gérer dans Google Sheets :

- prix par nuit ;
- forfait ménage ;
- taxe de séjour ;
- prix du linge de toilette ;
- minimum de nuits selon la saison.

## 13. Ce qui demande une intervention technique

Demander une intervention si vous voulez modifier :

- les textes du site ;
- les photos ;
- les pages légales ;
- l'adresse email de réception ;
- l'adresse email d'envoi ;
- les templates Brevo utilisés pour les emails ;
- le lien Airbnb configuré ;
- la structure de la feuille de tarifs ;
- les règles de calcul des saisons ;
- les fonctionnalités du formulaire ou du calendrier.
