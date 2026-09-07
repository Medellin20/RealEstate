import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendAdminAlert } from '@/lib/notifications/email';

/**
 * Relit la réservation et son client dans la base avant d'envoyer l'alerte.
 * L'e-mail contient donc uniquement les données qui ont été effectivement
 * enregistrées, à destination de l'adresse configurée dans ALERT_EMAIL.
 */
export async function notifyAdminOfReservation(
  reservationId: string
): Promise<{ sent: boolean }> {
  const supabase = createAdminClient();

  const { data: reservation, error: reservationError } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .maybeSingle();

  if (reservationError || !reservation) {
    console.error('RESERVATION EMAIL DATA ERROR:', reservationError);
    return { sent: false };
  }

  const [{ data: client, error: clientError }, { data: property, error: propertyError }] =
    await Promise.all([
      supabase.from('clients').select('*').eq('id', reservation.client_id).maybeSingle(),
      supabase.from('properties').select('title').eq('id', reservation.property_id).maybeSingle(),
    ]);

  if (clientError || propertyError || !client || !property) {
    console.error('RESERVATION EMAIL RELATED DATA ERROR:', {
      clientError,
      propertyError,
      reservationId,
    });
    return { sent: false };
  }

  const result = await sendAdminAlert(
    `Nouvelle réservation — ${reservation.reference}`,
    {
      Référence: reservation.reference,
      Logement: property.title,
      Client: `${client.first_name} ${client.last_name}`,
      Email: client.email,
      Téléphone: client.phone,
      'Date souhaitée': reservation.desired_move_in_date,
      Durée: `${reservation.duration_months} mois`,
      Occupants: reservation.occupants_count,
      'Animaux de compagnie': reservation.has_pets ? 'Oui' : 'Non',
      'Contrat de travail': reservation.employment_contract,
      'Revenu mensuel': reservation.monthly_income === null ? undefined : `${reservation.monthly_income} €`,
      'Ville d’origine': reservation.origin_city,
      Message: reservation.message,
    }
  );

  return { sent: result.sent };
}
