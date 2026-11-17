'use server';

import { revalidateStatusViews } from '@/lib/data/revalidate-status';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange } from '@/lib/data/history';
import { declareTransferSchema } from '@/lib/validations/refund';
import type { ActionResult } from '@/types';

/**
 * Le client déclare avoir effectué le virement de garantie et peut joindre
 * un justificatif (stocké dans le bucket privé `payment-proofs`). Le statut
 * passe à "payment_declared" ; la validation finale ("payment_received")
 * reste une action manuelle de l'administrateur (voir actions/admin-guarantees.ts).
 */
export async function declareGuaranteeTransfer(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    guaranteePaymentId: String(formData.get('guaranteePaymentId') || ''),
    transferDate: String(formData.get('transferDate') || ''),
    bankName: String(formData.get('bankName') || ''),
    reference: String(formData.get('reference') || ''),
  };

  const parsed = declareTransferSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Corrigeer de aangegeven velden.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { data: guarantee, error: fetchError } = await supabase
    .from('guarantee_payments')
    .select('*')
    .eq('id', parsed.data.guaranteePaymentId)
    .maybeSingle();

  if (fetchError || !guarantee) {
    return { success: false, message: 'Waarborgdossier niet gevonden.' };
  }

  let proofStoragePath: string | null = guarantee.proof_storage_path;
  const proofFile = formData.get('proof') as File | null;

  if (proofFile && proofFile.size > 0) {
    if (proofFile.size > 8 * 1024 * 1024) {
      return { success: false, message: 'Het betaalbewijs mag niet groter zijn dan 8 MB.' };
    }
    const extension = proofFile.name.split('.').pop() || 'pdf';
    const path = `guarantees/${guarantee.reference}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(path, proofFile, { upsert: true, contentType: proofFile.type });

    if (uploadError) {
      return { success: false, message: 'Het uploaden van het betaalbewijs is mislukt. Probeer het opnieuw.' };
    }
    proofStoragePath = path;
  }

  const { error: updateError } = await supabase
    .from('guarantee_payments')
    .update({
      status: 'payment_declared',
      declared_transfer_date: parsed.data.transferDate,
      declared_bank_name: parsed.data.bankName,
      declared_reference: parsed.data.reference,
      proof_storage_path: proofStoragePath,
    })
    .eq('id', guarantee.id);

  if (updateError) {
    return { success: false, message: 'Er is een fout opgetreden. Probeer het opnieuw.' };
  }

  await recordStatusChange({
    entityType: 'guarantee_payment',
    entityId: guarantee.id,
    fromStatus: guarantee.status,
    toStatus: 'payment_declared',
    changedBy: 'client',
  });

  revalidateStatusViews();

  return { success: true, message: 'Uw overschrijving is gemeld. Ons team zal deze controleren.' };
}
