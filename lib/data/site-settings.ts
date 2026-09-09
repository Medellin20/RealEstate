import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types/database';

const DEFAULT_FOOTER_PHONE = '+31649496257';

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();

  if (error) {
    throw new Error(`Impossible de charger les paramètres du site : ${error.message}`);
  }

  return data ?? { id: 1, footer_phone: DEFAULT_FOOTER_PHONE, updated_at: new Date(0).toISOString() };
}
