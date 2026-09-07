'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  reservationSchema,
  type ReservationInput,
} from '@/lib/validations/reservation';
import { sendAdminAlert } from '@/lib/notifications/email';
import type { ActionResult } from '@/types';

/**
 * Transmet le formulaire de paiement de réservation à l'agence.
 * Cette action n'enregistre ni client ni réservation : son seul effet est
 * l'envoi de l'e-mail à l'adresse définie dans ALERT_EMAIL.
 */
export async function createReservation(
  input: ReservationInput
): Promise<ActionResult> {
  const parsed = reservationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('title, monthly_price, is_published')
    .eq('id', parsed.data.propertyId)
    .maybeSingle();

  if (propertyError || !property || !property.is_published) {
    console.error('RESERVATION PAYMENT PROPERTY ERROR:', propertyError);
    return {
      success: false,
      message: 'Ce logement n’est plus disponible.',
    };
  }

  const emailResult = await sendAdminAlert(
    `Dossier de paiement de réservation — ${property.title}`,
    {
      Logement: property.title,
      'Frais de réservation (1 mois de loyer)': `${property.monthly_price} €`,
      Client: `${parsed.data.firstName} ${parsed.data.lastName}`,
      Email: parsed.data.email,
      Téléphone: parsed.data.phone,
      'Date souhaitée': parsed.data.desiredMoveInDate,
      Durée: `${parsed.data.durationMonths} mois`,
      Occupants: parsed.data.occupantsCount,
      'Animaux de compagnie': parsed.data.hasPets ? 'Oui' : 'Non',
      'Contrat de travail': parsed.data.employmentContract,
      'Revenu mensuel': `${parsed.data.monthlyIncome} €`,
      'Ville d’origine': parsed.data.originCity,
      Message: parsed.data.message || undefined,
    }
  );

  if (!emailResult.sent) {
    console.error('RESERVATION PAYMENT EMAIL FAILED:', emailResult.reason);
    return {
      success: false,
      message: 'L’e-mail n’a pas pu être envoyé. Merci de réessayer.',
    };
  }

  return {
    success: true,
    message: 'Vous recevrez une notification par e-mail.',
  };
}
