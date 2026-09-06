import 'server-only';
import nodemailer from 'nodemailer';

type AlertDetails = Record<string, string | number | null | undefined>;

type EmailAlertResult =
  | { sent: true }
  | { sent: false; reason: 'not_configured' | 'invalid_recipient' | 'delivery_failed' };

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] as string);
}

/** Envoie une alerte sans jamais bloquer la création d'un dossier client. */
export async function sendAdminAlert(subject: string, details: AlertDetails): Promise<EmailAlertResult> {
  const user = process.env.GMAIL_USER?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  const recipient = process.env.ALERT_EMAIL?.trim();

  if (!user || !appPassword || !recipient) {
    console.warn("Alerte e-mail non envoyée : la configuration Gmail est incomplète.");
    return { sent: false, reason: 'not_configured' };
  }

  // Nodemailer accepte une liste séparée par des virgules. La validation
  // préalable évite de considérer une alerte comme envoyée avec une adresse
  // invalide ou une valeur accidentellement laissée dans l'environnement.
  const recipients = recipient
    .split(/[;,]/)
    .map((address) => address.trim())
    .filter(Boolean);
  const isEmail = (address: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);

  if (recipients.length === 0 || !recipients.every(isEmail)) {
    console.error('Alerte e-mail non envoyée : ALERT_EMAIL contient une adresse invalide.');
    return { sent: false, reason: 'invalid_recipient' };
  }

  const rows = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#607078">${escapeHtml(label)}</td><td style="padding:6px 12px;font-weight:600">${escapeHtml(String(value))}</td></tr>`)
    .join('');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 5000,
    });

    await transporter.sendMail({
      from: `Real Estate NL <${user}>`,
      to: recipients.join(', '),
      subject,
      text: Object.entries(details).map(([label, value]) => `${label}: ${value ?? '—'}`).join('\n'),
      html: `<div style="font-family:Arial,sans-serif;color:#263238"><h2>${escapeHtml(subject)}</h2><table>${rows}</table><p style="margin-top:20px">Connectez-vous à l’espace administrateur pour traiter cette demande.</p></div>`,
    });

    return { sent: true };
  } catch (error) {
    console.error('Échec de l’envoi de l’alerte Gmail :', error);
    return { sent: false, reason: 'delivery_failed' };
  }
}
