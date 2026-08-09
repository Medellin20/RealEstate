'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertClient } from '@/lib/data/clients';
import { recordStatusChange } from '@/lib/data/history';
import { reservationSchema, type ReservationInput } from '@/lib/validations/reservation';
import { generateReference } from '@/lib/utils/reference';
import type { ActionResult } from '@/types';
import { sendAdminAlert } from '@/lib/notifications/email';
import { getReservationPaymentAmount } from '@/lib/payments/bank-transfer';

/**
 * Crée une demande de réservation de logement (dossier locataire). Le
 * paiement de la garantie est un parcours distinct (voir actions/guarantees.ts)
 * accessible depuis la page de suivi une fois la demande examinée.
 */
export async function createReservation(input: ReservationInput, propertySlug: string): Promise<ActionResult> {
  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { success: true, message: 'Votre réservation a été enregistrée.' };
  }

  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, monthly_price, is_published, status')
    .eq('id', parsed.data.propertyId)
    .maybeSingle();

  if (propertyError || !property || !property.is_published) {
    return { success: false, message: 'Ce logement n’est plus disponible.' };
  }

  const client = await upsertClient({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    profession: parsed.data.profession,
    monthlyIncome: parsed.data.monthlyIncome,
  });

  const reference = generateReference('REN');

  const { data: reservation, error: insertError } = await supabase
    .from('reservations')
    .insert({
      reference,
      property_id: property.id,
      client_id: client.id,
      desired_move_in_date: parsed.data.desiredMoveInDate,
      duration_months: parsed.data.durationMonths,
      occupants_count: parsed.data.occupantsCount,
      profession: parsed.data.profession,
      monthly_income: parsed.data.monthlyIncome,
      message: parsed.data.message || null,
      status: 'submitted',
    })
    .select('*')
    .single();

  if (insertError || !reservation) {
    return { success: false, message: 'Une erreur est survenue, merci de réessayer.' };
  }

  await recordStatusChange({
    entityType: 'reservation',
    entityId: reservation.id,
    fromStatus: null,
    toStatus: 'submitted',
    changedBy: 'client',
  });

  await sendAdminAlert(`Nouvelle réservation — ${reference}`, {
    Référence: reference,
    Client: `${parsed.data.firstName} ${parsed.data.lastName}`,
    Email: parsed.data.email,
    Téléphone: parsed.data.phone,
    'Date d’entrée': parsed.data.desiredMoveInDate,
    Durée: `${parsed.data.durationMonths} mois`,
    'Montant à verser': `${getReservationPaymentAmount(property.monthly_price)} €`,
  });

  revalidatePath('/admin/reservations');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  redirect(
    `${siteUrl}/appartements/${propertySlug}/reserver/confirmation?ref=${reference}&email=${encodeURIComponent(
      parsed.data.email
    )}`
  );
}
