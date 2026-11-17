'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAdminAction } from '@/lib/data/history';
import { bankSettingsSchema, type BankSettingsInput } from '@/lib/validations/admin';
import type { ActionResult } from '@/types';

export async function updateBankSettings(input: BankSettingsInput): Promise<ActionResult> {
  const parsed = bankSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Corrigeer de aangegeven velden.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('bank_settings')
    .update({
      beneficiary_name: parsed.data.beneficiaryName,
      iban: parsed.data.iban,
      bic: parsed.data.bic ?? '',
      bank_name: parsed.data.bankName,
      payment_instructions: parsed.data.paymentInstructions,
      default_deposit_amount: parsed.data.defaultDepositAmount,
      show_on_confirmations: parsed.data.showOnConfirmations,
    })
    .eq('id', 1);

  if (error) {
    console.error('Failed to update bank settings:', error);
    return { success: false, message: 'De bankinstellingen konden niet worden bijgewerkt.' };
  }

  await logAdminAction({ action: 'bank_settings.update' });
  revalidatePath('/admin/configuration-bancaire');
  revalidatePath('/mon-compte');

  return { success: true, message: 'Bankinstellingen bijgewerkt.' };
}
