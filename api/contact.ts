import { sendMail } from './_lib/email.js';

interface Req {
  method?: string;
  body?: {
    language?: 'fr' | 'en';
    form?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };
  };
}

interface Res {
  status: (code: number) => Res;
  json: (payload: unknown) => void;
}

// Verifie qu'une chaine existe et contient du texte utile.
function required(value: string | undefined): boolean {
  return !!value && value.trim().length > 0;
}

// Endpoint serverless d'envoi mail proprietaire + accuse de reception voyageur.
export default async function handler(req: Req, res: Res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const form = req.body?.form;
    if (
      !form ||
      !required(form.firstName) ||
      !required(form.lastName) ||
      !required(form.email) ||
      !required(form.subject) ||
      !required(form.message)
    ) {
      res.status(400).json({ error: 'Missing required fields.' });
      return;
    }

    const guestEmail = (form.email ?? '').trim();
    if (!required(guestEmail)) {
      res.status(400).json({ error: 'Missing guest email.' });
      return;
    }

    const ownerMail = process.env.OWNER_EMAIL;
    const language = req.body?.language === 'en' ? 'en' : 'fr';

    const ownerSummary = [
      'Nouveau message de contact',
      `Nom: ${form.firstName} ${form.lastName}`,
      `Email: ${form.email}`,
      `Téléphone: ${form.phone || 'Non renseigné'}`,
      `Sujet: ${form.subject}`,
      `Message: ${form.message}`,
    ].join('\n');

    if (ownerMail) {
      await sendMail({
        to: ownerMail,
        subject: `[Contact] ${form.subject}`,
        text: ownerSummary,
      });
    }

    const guestTextFr = [
      `Bonjour ${form.firstName},`,
      '',
      'Nous avons bien reçu votre message et nous vous répondrons rapidement.',
      '',
      'À bientôt,',
      'Les Portes de Montafilan',
    ].join('\n');

    const guestTextEn = [
      `Hello ${form.firstName},`,
      '',
      'We have received your message and will get back to you shortly.',
      '',
      'Best regards,',
      'Les Portes de Montafilan',
    ].join('\n');

    await sendMail({
      to: guestEmail,
      subject:
        language === 'fr'
          ? 'Votre message - Les Portes de Montafilan'
          : 'Your message - Les Portes de Montafilan',
      text: language === 'fr' ? guestTextFr : guestTextEn,
    });

    res.status(200).json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'CONTACT_HANDLER_FAILED';
    res.status(502).json({ error: `Contact email delivery failed. (${message})` });
  }
}
