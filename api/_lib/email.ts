export type MailTemplateParams = Record<string, string | number | boolean | null | undefined>;

export interface MailPayload {
  to: string;
  templateId: string | number;
  params: MailTemplateParams;
  replyTo?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function cleanEmail(value: string, errorCode: string): string {
  const email = value.trim();

  if (!isValidEmail(email)) {
    throw new Error(errorCode);
  }

  return email;
}

function buildSender(): { email: string; name?: string } {
  const from = process.env.EMAIL_FROM;
  const name = process.env.EMAIL_FROM_NAME;

  if (!from) {
    throw new Error('EMAIL_FROM_MISSING');
  }

  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);

  if (!match) {
    return {
      email: cleanEmail(from, 'EMAIL_FROM_INVALID'),
      name: name?.trim() || undefined,
    };
  }

  return {
    name: name?.trim() || match[1].trim() || undefined,
    email: cleanEmail(match[2], 'EMAIL_FROM_INVALID'),
  };
}

function parseTemplateId(value: string | number): number {
  const templateId = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(templateId) || templateId <= 0) {
    throw new Error('BREVO_TEMPLATE_ID_INVALID');
  }

  return templateId;
}

export async function sendMail(payload: MailPayload): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error('BREVO_API_KEY_MISSING');
  }

  const body: {
    sender: { email: string; name?: string };
    to: Array<{ email: string }>;
    templateId: number;
    params: MailTemplateParams;
    replyTo?: { email: string };
  } = {
    sender: buildSender(),
    to: [{ email: cleanEmail(payload.to, 'EMAIL_TO_INVALID') }],
    templateId: parseTemplateId(payload.templateId),
    params: payload.params,
  };

  if (payload.replyTo) {
    body.replyTo = { email: cleanEmail(payload.replyTo, 'EMAIL_REPLY_TO_INVALID') };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `BREVO_SEND_FAILED (${response.status} ${response.statusText})${errorBody ? `: ${errorBody}` : ''}`,
    );
  }
}
