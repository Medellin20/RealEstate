'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertClient } from '@/lib/data/clients';
import { recordStatusChange } from '@/lib/data/history';
import { viewingRequestSchema, type ViewingRequestInput } from '@/lib/validations/viewing';
import { generateReference } from '@/lib/utils/reference';
import { isStripeConfigured, stripeProvider } from '@/lib/payments/stripe';
import type { ActionResult } from '@/types';

/**
 * Crée une demande de visite : upsert du client, insertion de la demande,
 * puis redirection vers Stripe Checkout (carte / iDEAL) pour le règlement
 * des frais de visite. Si Stripe n'est pas encore configuré (clé API
 * absente), la demande est tout de même enregistrée avec le statut
 * "pending" et le client est redirigé vers une page de confirmation qui
 * explique que le paiement lui sera communiqué séparément — aucune
 * fonctionnalité n'est simulée silencieusement.
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
    .select('id, title, viewing_fee, status, is_published')
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
  const feeAmount = Number(property.viewing_fee) || 0;
  const initialStatus = feeAmount > 0 ? 'payment_pending' : 'confirmed';

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

  revalidatePath('/admin/visites');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const confirmationUrl = `${siteUrl}/appartements/${propertySlug}/visite/confirmation?ref=${reference}`;

  if (feeAmount > 0 && isStripeConfigured()) {
    const checkout = await stripeProvider.createCheckoutSession({
      amount: feeAmount,
      description: `Frais de visite — ${property.title}`,
      reference,
      customerEmail: parsed.data.email,
      successUrl: confirmationUrl,
      cancelUrl: `${siteUrl}/appartements/${propertySlug}/visite`,
      metadata: { type: 'viewing_fee', viewingRequestId: viewing.id, propertyId: property.id },
    });

    await supabase
      .from('viewing_requests')
      .update({ stripe_checkout_session_id: checkout.sessionId })
      .eq('id', viewing.id);

    redirect(checkout.url);
  }

  // Pas de frais, ou Stripe non configuré : direction la page de confirmation.
  redirect(confirmationUrl);
}
