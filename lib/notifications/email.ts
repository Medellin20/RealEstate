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

  // ---------------------------------------------------------
  // 6. Préparation des lignes HTML
  // ---------------------------------------------------------

  const rows = Object.entries(details)
    .filter(
      ([, value]) =>
        value !== undefined &&
        value !== null
    )
    .map(
      ([label, value]) => `
        <tr>
          <td
            style="
              padding: 10px 12px;
              color: #607078;
              border-bottom: 1px solid #eeeeee;
              vertical-align: top;
            "
          >
            ${escapeHtml(label)}
          </td>

          <td
            style="
              padding: 10px 12px;
              font-weight: 600;
              border-bottom: 1px solid #eeeeee;
              vertical-align: top;
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

          <body
            style="
              margin: 0;
              padding: 30px 15px;
              background: #f5f7f8;
              font-family: Arial, Helvetica, sans-serif;
              color: #263238;
            "
          >

            <div
              style="
                max-width: 700px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid #eeeeee;
                border-radius: 12px;
                overflow: hidden;
              "
            >

              <!-- En-tête -->

              <div
                style="
                  padding: 24px;
                  background: #f5f7f8;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                <h2
                  style="
                    margin: 0;
                    font-size: 22px;
                    color: #263238;
                  "
                >
                  ${escapeHtml(subject)}
                </h2>
              </div>

              <!-- Contenu -->

              <div style="padding: 24px;">

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
                    margin: 24px 0 0;
                    color: #607078;
                    font-size: 14px;
                    line-height: 1.6;
                  "
                >
                  Une nouvelle demande vient d'être
                  enregistrée sur le site Real Estate NL.
                  Connectez-vous à l'espace administrateur
                  pour traiter cette demande.
                </p>

              </div>

            </div>

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