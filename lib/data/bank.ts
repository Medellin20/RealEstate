import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BankSettings } from '@/types/database';

/**
 * Les coordonnées bancaires sont stockées dans bank_settings (RLS activée,
 * aucune policy anon — voir supabase/rls_policies.sql) et modifiables
 * uniquement depuis /admin/configuration-bancaire. Cette fonction est la
 * SEULE porte d'accès en lecture, utilisée côté serveur pour afficher les
 * instructions de virement au client lors du parcours de garantie.
 * L'IBAN n'est jamais codé en dur dans un composant.
 */
export async function getBankSettings(): Promise<BankSettings | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('bank_settings').select('*').eq('id', 1).maybeSingle();
  if (error) return null;
  return data;
}
