import 'server-only';

import nodemailer from 'nodemailer';

type AlertDetails = Record<
  string,
  string | number | null | undefined
>;

type EmailAlertResult =
  | {
      sent: true;
    }
  | {
      sent: false;
      reason:
        | 'not_configured'
        | 'invalid_recipient'
        | 'delivery_failed';
    };

/**
 * Échappe les caractères HTML dangereux.
 */
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
      })[character] ?? character
  );
}

/**
 * Vérifie si une adresse e-mail est valide.
 */
function isValidEmail(address: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}

/**
 * Envoie une alerte e-mail à l'administrateur.
 *
 * Variables d'environnement nécessaires :
 *
 * GMAIL_USER
 * GMAIL_APP_PASSWORD
 * ALERT_EMAIL
 */
export async function sendAdminAlert(
  subject: string,
  details: AlertDetails
): Promise<EmailAlertResult> {
  // ---------------------------------------------------------
  // 1. Récupération des variables d'environnement
  // ---------------------------------------------------------

  const user = process.env.GMAIL_USER?.trim();

  const appPassword = process.env.GMAIL_APP_PASSWORD
    ?.trim()
    .replace(/\s/g, '');

  const recipient = process.env.ALERT_EMAIL?.trim();

  // ---------------------------------------------------------
  // 2. Vérification de la configuration
  // ---------------------------------------------------------

  if (!user || !appPassword || !recipient) {
    console.error(
      'EMAIL CONFIG ERROR: variables GMAIL_USER, GMAIL_APP_PASSWORD ou ALERT_EMAIL manquantes.'
    );

    return {
      sent: false,
      reason: 'not_configured',
    };
  }

  // ---------------------------------------------------------
  // 3. Gestion de plusieurs destinataires
  // ---------------------------------------------------------

  const recipients = recipient
    .split(/[;,]/)
    .map((address) => address.trim())
    .filter(Boolean);

  // ---------------------------------------------------------
  // 4. Validation des destinataires
  // ---------------------------------------------------------

  if (
    recipients.length === 0 ||
    !recipients.every(isValidEmail)
  ) {
    console.error(
      'EMAIL CONFIG ERROR: ALERT_EMAIL contient une adresse e-mail invalide.',
      recipients
    );

    return {
      sent: false,
      reason: 'invalid_recipient',
    };
  }

  // ---------------------------------------------------------
  // 5. Préparation du contenu texte
  // ---------------------------------------------------------

  const text = Object.entries(details)
    .filter(
      ([, value]) =>
        value !== undefined &&
        value !== null
    )
    .map(
      ([label, value]) =>
        `${label}: ${String(value)}`
    )
    .join('\n');

  const receivedAt = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Amsterdam',
  }).format(new Date());

  // ---------------------------------------------------------
  // 6. Préparation des lignes HTML
  // ---------------------------------------------------------

  const rows = Object.entries(details)
    .filter(
      ([, value]) =>
        value !== undefined &&
        value !== null
    )
    .map(([label, value], index) => `
        <tr>
          <td
            style="
              width: 42%;
              padding: 13px 16px;
              color: #64748b;
              background: ${index % 2 === 0 ? '#f8fafc' : '#ffffff'};
              border-bottom: 1px solid #e8edf1;
              vertical-align: top;
              font-size: 13px;
              font-weight: 600;
            "
          >
            ${escapeHtml(label)}
          </td>

          <td
            style="
              padding: 13px 16px;
              font-weight: 600;
              color: #172b36;
              background: ${index % 2 === 0 ? '#f8fafc' : '#ffffff'};
              border-bottom: 1px solid #e8edf1;
              vertical-align: top;
              font-size: 14px;
              line-height: 1.45;
              word-break: break-word;
            "
          >
            ${escapeHtml(String(value))}
          </td>
        </tr>
      `
    )
    .join('');

  // ---------------------------------------------------------
  // 7. Création du transporteur SMTP Gmail
  // ---------------------------------------------------------

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,

      auth: {
        user,
        pass: appPassword,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // -------------------------------------------------------
    // 8. Vérification de la connexion Gmail
    // -------------------------------------------------------

    await transporter.verify();

    console.log(
      'GMAIL SMTP CONNECTION OK'
    );

    // -------------------------------------------------------
    // 9. Envoi du message
    // -------------------------------------------------------

    const info = await transporter.sendMail({
      from: {
        name: 'Real Estate NL',
        address: user,
      },

      to: recipients,

      subject,

      text,

      html: `
        <!DOCTYPE html>

        <html lang="fr">
          <head>
            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <title>
              ${escapeHtml(subject)}
            </title>
          </head>

          <body style="margin:0;padding:0;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#172b36;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
              Nouvelle demande reçue sur Real Estate NL.
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:32px 12px;background:#eef3f5;">
              <tr><td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(23,43,54,.10);">
                  <tr><td style="padding:24px 28px;background:#0c4a52;">
                    <p style="margin:0 0 6px;color:#bce3df;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Real Estate NL · Administration</p>
                    <h1 style="margin:0;color:#ffffff;font-size:23px;line-height:1.3;">${escapeHtml(subject)}</h1>
                  </td></tr>
                  <tr><td style="padding:28px;">
                    <p style="margin:0 0 5px;color:#172b36;font-size:16px;font-weight:700;">Une nouvelle demande a été reçue.</p>
                    <p style="margin:0 0 22px;color:#64748b;font-size:13px;line-height:1.5;">Reçue le ${escapeHtml(receivedAt)} · Informations transmises depuis le site.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e8edf1;border-radius:10px;border-spacing:0;overflow:hidden;">
                      ${rows}
                    </table>
                    <div style="margin-top:24px;padding:14px 16px;border-left:4px solid #0c8b89;background:#edf8f7;color:#30545a;font-size:13px;line-height:1.55;">
                      Consultez l’espace administrateur pour assurer le suivi de cette demande.
                    </div>
                  </td></tr>
                  <tr><td style="padding:18px 28px;border-top:1px solid #e8edf1;background:#f8fafc;color:#80909b;font-size:12px;line-height:1.5;">
                    Cet e-mail est envoyé automatiquement par Real Estate NL. Merci de ne pas y répondre.
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
    });

    // -------------------------------------------------------
    // 10. Confirmation
    // -------------------------------------------------------

    console.log(
      'EMAIL SENT SUCCESSFULLY:',
      info.messageId
    );

    return {
      sent: true,
    };
  } catch (error) {
    // -------------------------------------------------------
    // 11. Gestion des erreurs SMTP
    // -------------------------------------------------------

    console.error(
      'EMAIL DELIVERY ERROR:',
      error
    );

    return {
      sent: false,
      reason: 'delivery_failed',
    };
  }
}
