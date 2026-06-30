import process from "node:process";

// Configuration reservee au serveur. Le suffixe .server.ts evite que Vite
// embarque ce fichier cote client: ces valeurs ne partent jamais au navigateur.
//
// Sur Cloudflare Workers, les variables d'environnement sont liees au moment
// de la requete. Les lectures au niveau module (ex: `const x = process.env.X`)
// peuvent donc valoir undefined: lire process.env dans une fonction ou un handler.
//
// Choisir le bon acces aux variables:
//   - module .server.ts: helpers serveur reutilises par plusieurs handlers.
//     Envelopper les lectures dans une fonction pour les executer par requete.
//   - process.env directement dans un handler API: lectures ponctuelles.
//   - import.meta.env.VITE_FOO: config PUBLIQUE lisible cote client et serveur.
//     Ne jamais y mettre de secret: le contenu est envoye au navigateur.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    // Ajouter ici les valeurs reservees au serveur, par exemple:
    //   databaseUrl: process.env.DATABASE_URL,
    //   stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  };
}
