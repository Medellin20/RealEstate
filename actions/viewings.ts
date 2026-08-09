'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertClient } from '@/lib/data/clients';
import { recordStatusChange } from '@/lib/data/history';
import { viewingRequestSchema, type ViewingRequestInput } from '@/lib/validations/viewing';
import { generateReference } from '@/lib/utils/reference';
import { VIEWING_FEE } from '@/lib/payments/bank-transfer';
import { sendAdminAlert } from '@/lib/notifications/email';
import type { ActionResult } from '@/types';

/**
 * Crée une demande de visite : upsert du client, insertion de la demande,
 * puis redirection vers la page affichant le RIB pour régler les 100 €.
 */
export async function createViewingRequest(
  input: ViewingRequestInput,
  propertySlug: string
): Promise<ActionResult> {
  const parsed = viewingRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Honeypot anti-spam : si rempli, on prétend réussir sans rien enregistrer.
  if (parsed.data.website) {
    return { success: true, message: 'Votre demande a été envoyée.' };
  }

  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, title, status, is_published')
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
  });

  const reference = generateReference('VIS');
  const feeAmount = VIEWING_FEE;
  const initialStatus = 'payment_pending';

  const { data: viewing, error: insertError } = await supabase
    .from('viewing_requests')
    .insert({
      reference,
      property_id: property.id,
      client_id: client.id,
      requested_date: parsed.data.requestedDate,
      requested_time_slot: parsed.data.requestedTimeSlot,
      status: initialStatus,
      fee_amount: feeAmount,
    })
    .select('*')
    .single();

  if (insertError || !viewing) {
    return { success: false, message: 'Une erreur est survenue, merci de réessayer.' };
  }

  await recordStatusChange({
    entityType: 'viewing_request',
    entityId: viewing.id,
    fromStatus: null,
    toStatus: initialStatus,
    changedBy: 'client',
  });

  await sendAdminAlert(`Nouvelle demande de visite — ${reference}`, {
    Référence: reference,
    Logement: property.title,
    Client: `${parsed.data.firstName} ${parsed.data.lastName}`,
    Email: parsed.data.email,
    Téléphone: parsed.data.phone,
    Date: parsed.data.requestedDate,
    Créneau: parsed.data.requestedTimeSlot,
    Montant: `${feeAmount} €`,
  });

  revalidatePath('/admin/visites');

  redirect(`/appartements/${propertySlug}/visite/confirmation?ref=${reference}`);
}
