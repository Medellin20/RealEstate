'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  reservationSchema,
  type ReservationInput,
} from '@/lib/validations/reservation';
import { sendAdminAlert } from '@/lib/notifications/email';
import { getPropertyEmailDetails } from '@/lib/notifications/property-details';
import type { ActionResult } from '@/types';

/**
 * Transmet le formulaire de réservation à l'agence.
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
    .select('*')
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
    `Nouvelle demande de réservation — ${property.title}`,
    {
      ...getPropertyEmailDetails(
        property,
        await getAmenityLabels(property.id)
      ),
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

async function getAmenityLabels(propertyId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('property_amenities')
    .select('amenities(label_fr)')
    .eq('property_id', propertyId);

  return (data ?? [])
    .map((item) => item.amenities?.label_fr)
    .filter((label): label is string => Boolean(label));
}
