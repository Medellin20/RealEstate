'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidAdminSessionToken } from '@/lib/auth/admin-session';
import { recordStatusChange, logAdminAction } from '@/lib/data/history';
import { ADMIN_SESSION_COOKIE } from '@/lib/utils/constants';
import type { ActionResult } from '@/types';
import type { ViewingStatus } from '@/types/database';

export async function updateViewingStatus(
  id: string,
  status: ViewingStatus,
  adminNotes?: string
): Promise<ActionResult> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSessionToken(token))) {
    return { success: false, message: 'Votre session administrateur a expiré. Connectez-vous à nouveau.' };
  }

  if (!['pending', 'payment_pending', 'paid', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return { success: false, message: 'Statut de visite invalide.' };
  }

  const supabase = createAdminClient();

  const { data: current } = await supabase.from('viewing_requests').select('status').eq('id', id).maybeSingle();
  if (!current) return { success: false, message: 'Demande de visite introuvable.' };

  const { error } = await supabase
    .from('viewing_requests')
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq('id', id);

  if (error) return { success: false, message: 'Impossible de mettre à jour le statut.' };

  await recordStatusChange({
    entityType: 'viewing_request',
    entityId: id,
    fromStatus: current.status,
    toStatus: status,
    changedBy: 'admin',
  });
  await logAdminAction({ action: 'viewing.status_change', entityType: 'viewing_request', entityId: id, details: { status } });

  revalidatePath('/admin/visites');
  revalidatePath('/admin');
  revalidatePath('/mon-compte');

  return { success: true, message: 'Statut de la visite mis à jour.' };
}

export async function approveViewing(viewingId: string): Promise<ActionResult> {
  return updateViewingStatus(viewingId, 'confirmed');
}
