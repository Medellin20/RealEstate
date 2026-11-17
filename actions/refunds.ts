'use server';

import { revalidateStatusViews } from '@/lib/data/revalidate-status';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange } from '@/lib/data/history';
import { refundRequestSchema, type RefundRequestInput } from '@/lib/validations/refund';
import { generateRefundReference } from '@/lib/utils/reference';
import type { ActionResult } from '@/types';

/**
 * Le client demande le remboursement de sa garantie. Ceci crée une DEMANDE
 * dans `refund_requests`, suivie ensuite manuellement par l'administrateur
 * (voir /admin/remboursements). Conformément au cahier des charges, aucun
 * remboursement bancaire automatique n'est effectué : aucune API bancaire
 * n'est intégrée, donc l'application gère la demande et son suivi
 * administratif uniquement.
 */
export async function requestGuaranteeRefund(input: RefundRequestInput): Promise<ActionResult> {
  const parsed = refundRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Bevestig uw verzoek om terugbetaling.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: guarantee, error: fetchError } = await supabase
    .from('guarantee_payments')
    .select('*, reservations(reference)')
    .eq('id', parsed.data.guaranteePaymentId)
    .maybeSingle();

  if (fetchError || !guarantee) {
    return { success: false, message: 'Waarborgdossier niet gevonden.' };
  }

  if (!['payment_received', 'payment_declared', 'reservation_confirmed'].includes(guarantee.status)) {
    return {
      success: false,
      message: 'Een terugbetaling kan alleen worden aangevraagd voor een betaalde waarborgsom.',
    };
  }

  const reservationReference = (guarantee as any).reservations?.reference ?? guarantee.reference;
  const reference = generateRefundReference(reservationReference);

  const { data: refund, error: insertError } = await supabase
    .from('refund_requests')
    .insert({
      reference,
      guarantee_payment_id: guarantee.id,
      reservation_id: guarantee.reservation_id,
      client_id: guarantee.client_id,
      amount: guarantee.amount,
      reason: parsed.data.reason || null,
      status: 'requested',
    })
    .select('*')
    .single();

  if (insertError || !refund) {
    return { success: false, message: 'Er is een fout opgetreden. Probeer het opnieuw.' };
  }

  await supabase
    .from('guarantee_payments')
    .update({ status: 'refund_requested' })
    .eq('id', guarantee.id);

  await recordStatusChange({
    entityType: 'refund_request',
    entityId: refund.id,
    fromStatus: null,
    toStatus: 'requested',
    changedBy: 'client',
  });

  revalidateStatusViews();

  return {
    success: true,
    message: `Uw verzoek om terugbetaling (${reference}) is doorgestuurd naar ons team.`,
  };
}
