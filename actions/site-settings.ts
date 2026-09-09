'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/validations/admin';
import type { ActionResult } from '@/types';

export async function updateSiteSettings(input: SiteSettingsInput): Promise<ActionResult> {
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger le numéro indiqué.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await createAdminClient()
    .from('site_settings')
    .update({ footer_phone: parsed.data.footerPhone, updated_at: new Date().toISOString() })
    .eq('id', 1);

  if (error) {
    return { success: false, message: 'Impossible de mettre à jour le numéro du footer.' };
  }

  await logAdminAction({ action: 'site_settings.update' });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/parametres');
  return { success: true, message: 'Numéro du footer mis à jour avec succès.' };
}
