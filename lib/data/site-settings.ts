import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types/database';

const DEFAULT_FOOTER_PHONE = '+31684130011';
const DEFAULT_PAYMENT_LINK = 'https://bunq.me/EtelaHorvathova';
const DEFAULT_VIEWING_FEE = 50;

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();

  if (error) {
    throw new Error(`Impossible de charger les paramètres du site : ${error.message}`);
  }

  return {
    id: 1,
    footer_phone: data?.footer_phone?.trim() || DEFAULT_FOOTER_PHONE,
    payment_link: data?.payment_link?.trim() || DEFAULT_PAYMENT_LINK,
    viewing_fee: data?.viewing_fee ?? DEFAULT_VIEWING_FEE,
    updated_at: data?.updated_at || new Date(0).toISOString(),
  };
}
