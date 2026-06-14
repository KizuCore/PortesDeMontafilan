export interface MailPayload {
  to: string;
  subject: string;
  text: string;
}

// Envoi d'email via Resend.
export async function sendMail(payload: MailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  // On ne bloque pas la réservation si l'email n'est pas configuré.
  if (!apiKey || !from) {
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `RESEND_SEND_FAILED (${response.status} ${response.statusText})${errorBody ? `: ${errorBody}` : ''}`,
    );
  }
}
