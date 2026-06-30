import { sendMail } from "./_lib/email.js";

interface Req {
  method?: string;
  body?: {
    language?: "fr" | "en";
    form?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };
    captchaToken?: string;
  };
}

interface Res {
  status: (code: number) => Res;
  json: (payload: unknown) => void;
}

// Verifie qu'une chaine existe et contient du texte utile.
function required(value: string | undefined): value is string {
  return !!value && value.trim().length > 0;
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function verifyRecaptchaToken(
  token: string | undefined,
): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

  if (!secret) {
    throw new Error("RECAPTCHA_SECRET_KEY_MISSING");
  }

  if (!Number.isFinite(minScore) || minScore < 0 || minScore > 1) {
    throw new Error("RECAPTCHA_MIN_SCORE_INVALID");
  }

  if (!required(token)) {
    return false;
  }

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `RECAPTCHA_VERIFY_FAILED (${response.status} ${response.statusText})`,
    );
  }

  const result = (await response.json()) as {
    success?: boolean;
    score?: number;
    action?: string;
  };

  // On verifie l'action attendue pour eviter de reutiliser un token genere ailleurs sur le site.
  return (
    result.success === true &&
    result.action === "contact" &&
    typeof result.score === "number" &&
    result.score >= minScore
  );
}

// Endpoint serverless d'envoi mail proprietaire + accuse de reception voyageur.
export default async function handler(req: Req, res: Res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
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
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    const captchaValid = await verifyRecaptchaToken(req.body?.captchaToken);
    if (!captchaValid) {
      res.status(400).json({ error: "Captcha validation failed." });
      return;
    }

    const guestEmail = (form.email ?? "").trim();
    if (!required(guestEmail)) {
      res.status(400).json({ error: "Missing guest email." });
      return;
    }

    if (!validEmail(guestEmail)) {
      res.status(400).json({ error: "Invalid guest email." });
      return;
    }

    const ownerMail = process.env.OWNER_EMAIL;
    const ownerTemplateId = process.env.BREVO_OWNER_TEMPLATE_ID;
    const clientTemplateId = process.env.BREVO_CLIENT_TEMPLATE_ID;
    const language = req.body?.language === "en" ? "en" : "fr";

    if (!ownerMail) {
      throw new Error("OWNER_EMAIL_MISSING");
    }

    if (!ownerTemplateId) {
      throw new Error("BREVO_OWNER_TEMPLATE_ID_MISSING");
    }

    if (!clientTemplateId) {
      throw new Error("BREVO_CLIENT_TEMPLATE_ID_MISSING");
    }

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();
    const now = new Date();
    // Les templates Brevo recoivent une date deja formatee pour eviter toute logique de fuseau cote email.
    const sentDate = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeZone: "Europe/Paris",
    }).format(now);
    const sentTime = new Intl.DateTimeFormat("fr-FR", {
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(now);
    const sentAt = `${sentDate} à ${sentTime}`;

    const templateParams = {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email: guestEmail,
      phone: form.phone?.trim() || "Non renseigné",
      subject,
      message,
      language,
      siteName: "Les Portes de Montafilan",
      sentAt,
      sentDate,
      sentTime,
      date: sentAt,
    };

    await sendMail({
      to: ownerMail,
      templateId: ownerTemplateId,
      params: templateParams,
      replyTo: guestEmail,
    });

    await sendMail({
      to: guestEmail,
      templateId: clientTemplateId,
      params: templateParams,
    });

    res.status(200).json({ ok: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "CONTACT_HANDLER_FAILED";
    res
      .status(502)
      .json({ error: `Contact email delivery failed. (${message})` });
  }
}
