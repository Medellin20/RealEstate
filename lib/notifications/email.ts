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
 * Envoie une alerte e-mail à l'administrateur.
 *
 * L'échec de l'e-mail ne bloque pas la création
 * de la demande de visite.
 */
export async function sendAdminAlert(
  subject: string,
  details: AlertDetails
): Promise<EmailAlertResult> {
  const user = process.env.GMAIL_USER?.trim();

  const appPassword = process.env.GMAIL_APP_PASSWORD
    ?.trim()
    .replace(/\s/g, '');

  const recipient = process.env.ALERT_EMAIL?.trim();

  /*
   * Vérification de la configuration.
   */
  if (!user || !appPassword || !recipient) {
    console.error(
      'EMAIL CONFIG ERROR: GMAIL_USER, GMAIL_APP_PASSWORD ou ALERT_EMAIL est manquant.'
    );

    return {
      sent: false,
      reason: 'not_configured',
    };
  }

  /*
   * Support de plusieurs destinataires :
   *
   * email1@gmail.com,email2@gmail.com
   *
   * ou
   *
   * email1@gmail.com;email2@gmail.com
   */
  const recipients = recipient
    .split(/[;,]/)
    .map((address) => address.trim())
    .filter(Boolean);

  /*
   * Validation correcte des adresses e-mail.
   */
  const isEmail = (address: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);

  if (
    recipients.length === 0 ||
    !recipients.every(isEmail)
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

  /*
   * Construction du contenu texte.
   */
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

  /*
   * Construction du tableau HTML.
   */
  const rows = Object.entries(details)
    .filter(
      ([, value]) =>
        value !== undefined &&
        value !== null
    )
    .map(
      ([label, value]) => `
        <tr>
          <td style="
            padding: 10px 12px;
            color: #607078;
            border-bottom: 1px solid #eeeeee;
            vertical-align: top;
          ">
            ${escapeHtml(label)}
          </td>

          <td style="
            padding: 10px 12px;
            font-weight: 600;
            border-bottom: 1px solid #eeeeee;
            vertical-align: top;
          ">
            ${escapeHtml(String(value))}
          </td>
        </tr>
      `
    )
    .join('');

  try {
    /*
     * Configuration SMTP Gmail.
     *
     * Port 465 = connexion SSL directe.
     */
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

    /*
     * Vérification de la connexion SMTP.
     */
    await transporter.verify();

    /*
     * Envoi du message.
     */
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
            <title>${escapeHtml(subject)}</title>
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
                  Connectez-vous à l’espace administrateur
                  pour traiter cette demande.
                </p>

              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(
      'EMAIL SENT:',
      info.messageId
    );

    return {
      sent: true,
    };
  } catch (error) {
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