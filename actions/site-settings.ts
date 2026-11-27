'use server';

import { cookies } from 'next/headers';
import { isValidAdminSessionToken } from '@/lib/auth/admin-session';
import { ADMIN_SESSION_COOKIE } from '@/lib/utils/constants';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/validations/admin';
import type { ActionResult } from '@/types';

export async function updateSiteSettings(input: SiteSettingsInput): Promise<ActionResult> {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSessionToken(session))) {
    return { success: false, message: 'Meld u aan als beheerder om de instellingen te wijzigen.' };
  }

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Corrigeer de aangegeven instellingen.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await createAdminClient()
    .from('site_settings')
    .update({
      footer_phone: parsed.data.footerPhone.trim(),
      whatsapp_url: parsed.data.whatsappUrl,
      payment_link: parsed.data.paymentLink.trim(),
      show_payment_link: parsed.data.showPaymentLink,
      viewing_fee: parsed.data.viewingFee,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    console.error('SITE SETTINGS UPDATE ERROR:', error);
    return { success: false, message: 'De website-instellingen konden niet worden bijgewerkt.' };
  }

  await logAdminAction({ action: 'site_settings.update' });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/parametres');
  revalidatePath('/contact');
  revalidatePath('/appartements/[slug]/reserver/confirmation', 'page');
  revalidatePath('/appartements/[slug]/visite/confirmation', 'page');
  revalidatePath('/appartements/[slug]/visite', 'page');
  return { success: true, message: 'De website-instellingen zijn bijgewerkt.' };
}
