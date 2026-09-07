'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@/lib/supabase/admin';
import { upsertClient } from '@/lib/data/clients';
import { recordStatusChange } from '@/lib/data/history';
import {
  reservationSchema,
  type ReservationInput,
} from '@/lib/validations/reservation';
import { generateReference } from '@/lib/utils/reference';
import type { ActionResult } from '@/types';
import { notifyAdminOfReservation } from '@/lib/notifications/reservation';

/**
 * Crée une demande de réservation de logement.
 *
 * La demande est enregistrée dans Supabase puis une alerte
 * est envoyée à l'administrateur par e-mail.
 *
 * L'e-mail est une notification : un échec de livraison ne doit pas
 * empêcher la confirmation d'une réservation déjà enregistrée.
 */
export async function createReservation(
  input: ReservationInput,
  propertySlug: string
): Promise<ActionResult> {
  // ---------------------------------------------------------
  // 1. Validation des données
  // ---------------------------------------------------------

  const parsed = reservationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // ---------------------------------------------------------
  // 2. Connexion Supabase administrateur
  // ---------------------------------------------------------

  const supabase = createAdminClient();

  // ---------------------------------------------------------
  // 3. Vérification du logement
  // ---------------------------------------------------------

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, title, is_published, status')
    .eq('id', parsed.data.propertyId)
    .maybeSingle();

  if (propertyError) {
    console.error('RESERVATION PROPERTY ERROR:', propertyError);

    return {
      success: false,
      message:
        'Impossible de vérifier la disponibilité du logement. Merci de réessayer.',
    };
  }

  if (!property || !property.is_published) {
    return {
      success: false,
      message: 'Ce logement n’est plus disponible.',
    };
  }

  // ---------------------------------------------------------
  // 4. Création / récupération du client
  // ---------------------------------------------------------

  let client;

  try {
    client = await upsertClient({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      profession: parsed.data.employmentContract,
      monthlyIncome: parsed.data.monthlyIncome,
    });
  } catch (error) {
    console.error('RESERVATION CLIENT ERROR:', error);

    return {
      success: false,
      message:
        'Impossible d’enregistrer vos informations. Merci de réessayer.',
    };
  }

  // ---------------------------------------------------------
  // 5. Génération de la référence
  // ---------------------------------------------------------

  const reference = generateReference('REN');

  // ---------------------------------------------------------
  // 6. Enregistrement de la réservation
  // ---------------------------------------------------------

  const { data: reservation, error: insertError } = await supabase
    .from('reservations')
    .insert({
      reference,
      property_id: property.id,
      client_id: client.id,

      desired_move_in_date: parsed.data.desiredMoveInDate,
      duration_months: parsed.data.durationMonths,
      occupants_count: parsed.data.occupantsCount,

      has_pets: parsed.data.hasPets,

      profession: parsed.data.employmentContract,
      monthly_income: parsed.data.monthlyIncome,
      employment_contract: parsed.data.employmentContract,

      origin_city: parsed.data.originCity,
      message: parsed.data.message || null,

      status: 'submitted',
    })
    .select('*')
    .single();

  if (insertError || !reservation) {
    console.error('RESERVATION INSERT ERROR:', insertError);

    return {
      success: false,
      message:
        'Une erreur est survenue lors de l’enregistrement de votre demande. Merci de réessayer.',
    };
  }

  // ---------------------------------------------------------
  // 7. Historique
  // ---------------------------------------------------------

  try {
    await recordStatusChange({
      entityType: 'reservation',
      entityId: reservation.id,
      fromStatus: null,
      toStatus: 'submitted',
      changedBy: 'client',
    });
  } catch (error) {
    // L'historique ne doit pas empêcher la suite.
    console.error('RESERVATION HISTORY ERROR:', {
      reference,
      error,
    });
  }

  // ---------------------------------------------------------
  // 8. Envoi de l'e-mail à l'administrateur
  // ---------------------------------------------------------

  const emailResult = await notifyAdminOfReservation(reservation.id);

  // ---------------------------------------------------------
  // 9. Vérification de l'envoi de l'e-mail
  // ---------------------------------------------------------

  if (!emailResult.sent) {
    console.error('RESERVATION ADMIN EMAIL FAILED:', {
      reference,
    });
  } else {
    console.log(
      `RESERVATION ADMIN EMAIL SENT FOR ${reference}`
    );
  }

  // ---------------------------------------------------------
  // 10. Actualisation des pages administrateur
  // ---------------------------------------------------------

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');

  // ---------------------------------------------------------
  // 11. Redirection vers la confirmation
  // ---------------------------------------------------------

  redirect(
    `/appartements/${propertySlug}/reserver/confirmation?ref=${encodeURIComponent(
      reference
    )}&email=${encodeURIComponent(parsed.data.email)}`
  );
}
