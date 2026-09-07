import 'server-only';

import nodemailer from 'nodemailer';

type AlertDetails = Record<string, string | number | null | undefined>;

type EmailAlertResult =
  | { sent: true }
  | {
      sent: false;
      reason:
        | 'not_configured'
        | 'invalid_recipient'
        | 'delivery_failed';
    };

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] as string
  );
}

/**
 * Envoie une alerte e-mail à l'administrateur
 * sans bloquer la création du dossier client.
 */
export async function sendAdminAlert(
  subject: string,
  details: AlertDetails
): Promise<EmailAlertResult> {
  const user = process.env.GMAIL_USER?.trim();

  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');

  const recipient = process.env.ALERT_EMAIL?.trim();

  if (!user || !appPassword || !recipient) {
    console.warn(
      "Alerte e-mail non envoyée : la configuration Gmail est incomplète."
    );

    return {
      sent: false,
      reason: 'not_configured',
    };
  }

  const recipients = recipient
    .split(/[;,]/)
    .map((address) => address.trim())
    .filter(Boolean);

  // Correction de la regex
  const isEmail = (address: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);

  if (
    recipients.length === 0 ||
    !recipients.every(isEmail)
  ) {
    console.error(
      'Alerte e-mail non envoyée : ALERT_EMAIL contient une adresse invalide.'
    );

    return {
      sent: false,
      reason: 'invalid_recipient',
    };
  }

  const rows = Object.entries(details)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null
    )
    .map(
      ([label, value]) => `
        <tr>
          <td style="
            padding: 8px 12px;
            color: #607078;
            border-bottom: 1px solid #eeeeee;
          ">
            ${escapeHtml(label)}
          </td>

          <td style="
            padding: 8px 12px;
            font-weight: 600;
            border-bottom: 1px solid #eeeeee;
          ">
            ${escapeHtml(String(value))}
          </td>
        </tr>
      `
    )
    .join('');

  const text = Object.entries(details)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null
    )
    .map(
      ([label, value]) =>
        `${label}: ${value ?? '—'}`
    )
    .join('\n');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user,
        pass: appPassword,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: `Real Estate NL <${user}>`,
      to: recipients.join(', '),
      subject,

      text,

      html: `
        <div
          style="
            font-family: Arial, Helvetica, sans-serif;
            color: #263238;
            max-width: 700px;
            margin: 0 auto;
          "
        >
          <div
            style="
              background: #f5f7f8;
              padding: 20px;
              border-radius: 10px 10px 0 0;
            "
          >
            <h2 style="margin: 0; color: #263238;">
              ${escapeHtml(subject)}
            </h2>
          </div>

          <div
            style="
              padding: 20px;
              border: 1px solid #eeeeee;
              border-top: none;
            "
          >
            <table
              style="
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
              "
            >
              ${rows}
            </table>

            <p
              style="
                margin-top: 24px;
                color: #607078;
                font-size: 14px;
              "
            >
              Connectez-vous à l’espace administrateur
              pour traiter cette demande.
            </p>
          </div>
        </div>
      `,
    });

    console.log(
      `Alerte e-mail envoyée avec succès à : ${recipients.join(', ')}`
    );

    return {
      sent: true,
    };
  } catch (error) {
    console.error(
      "Échec de l'envoi de l'alerte Gmail :",
      error
    );

    return {
      sent: false,
      reason: 'delivery_failed',
    };
  }
}