'use server';

import { revalidateStatusViews } from '@/lib/data/revalidate-status';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';
import type { ActionResult } from '@/types';
import type { ReservationStatus } from '@/types/database';

/** Met à jour le statut d'une demande traitée manuellement par l'agence. */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  adminNotes?: string
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!reservation) return { success: false, message: 'Reservering niet gevonden.' };

  const { error } = await supabase
    .from('reservations')
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq('id', id);

  if (error) return { success: false, message: 'De status kon niet worden bijgewerkt.' };

  await recordStatusChange({
    entityType: 'reservation',
    entityId: id,
    fromStatus: reservation.status,
    toStatus: status,
    changedBy: 'admin',
  });
  await logAdminAction({ action: 'reservation.status_change', entityType: 'reservation', entityId: id, details: { status } });

  revalidateStatusViews();

  return { success: true, message: 'Reserveringsstatus bijgewerkt.' };
}
