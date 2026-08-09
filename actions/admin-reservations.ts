'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';
import { generateGuaranteeReference } from '@/lib/utils/reference';
import { getBankSettings } from '@/lib/data/bank';
import type { ActionResult } from '@/types';
import type { ReservationStatus } from '@/types/database';

/**
 * Met à jour le statut d'une réservation. Lorsque le statut passe à
 * "awaiting_guarantee", un dossier `guarantee_payments` est automatiquement
 * créé (s'il n'existe pas déjà) afin que le client puisse consulter les
 * instructions de virement depuis son espace client.
 */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  adminNotes?: string
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, properties(deposit_amount)')
    .eq('id', id)
    .maybeSingle();

  if (!reservation) return { success: false, message: 'Réservation introuvable.' };

  const { error } = await supabase
    .from('reservations')
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq('id', id);

  if (error) return { success: false, message: 'Impossible de mettre à jour le statut.' };

  if (status === 'awaiting_guarantee') {
    const { data: existingGuarantee } = await supabase
      .from('guarantee_payments')
      .select('id')
      .eq('reservation_id', id)
      .maybeSingle();

    if (!existingGuarantee) {
      const bankSettings = await getBankSettings();
      const amount =
        (reservation as any).properties?.deposit_amount || bankSettings?.default_deposit_amount || 0;

      await supabase.from('guarantee_payments').insert({
        reference: generateGuaranteeReference(reservation.reference),
        reservation_id: id,
        client_id: reservation.client_id,
        amount,
        status: 'awaiting_payment',
      });
    }
  }

  await recordStatusChange({
    entityType: 'reservation',
    entityId: id,
    fromStatus: reservation.status,
    toStatus: status,
    changedBy: 'admin',
  });
  await logAdminAction({ action: 'reservation.status_change', entityType: 'reservation', entityId: id, details: { status } });

  revalidatePath('/admin/reservations');
  revalidatePath('/admin/garanties');
  revalidatePath('/mon-compte');

  return { success: true, message: 'Statut de la réservation mis à jour.' };
}
