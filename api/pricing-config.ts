import { resolvePricingConfig } from './_pricingConfig.js';

interface Req {
  method?: string;
}

interface Res {
  status: (code: number) => Res;
  json: (payload: unknown) => void;
}

// Route de lecture des tarifs resolves (Google Sheets ou fallback local).
// Utilisee par le front pour afficher la section "Tarifs" avec la meme source que /api/estimate.
export default async function handler(req: Req, res: Res) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { pricingConfig, warning, source } = await resolvePricingConfig();
    res.status(200).json({ pricingConfig, warning, source });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'PRICING_CONFIG_HANDLER_FAILED';
    res.status(500).json({ error: message });
  }
}
