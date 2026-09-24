'use client';

import { useAdminAction } from '@/lib/hooks/use-admin-action';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { updateSiteSettings } from '@/actions/site-settings';
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/validations/admin';
import type { BankSettings, SiteSettings } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { updateBankSettings } from '@/actions/admin-bank';

export function SiteSettingsForm({
  settings,
  bankSettings,
}: {
  settings: SiteSettings;
  bankSettings: BankSettings;
}) {
  const [isPending, startTransition] = useAdminAction();
  const { register, handleSubmit, formState: { errors } } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      footerPhone: settings.footer_phone,
      paymentLink: settings.payment_link,
      showPaymentLink: settings.show_payment_link,
      viewingFee: settings.viewing_fee,
      showOnConfirmations: bankSettings.show_on_confirmations,
    },
  });

  function onSubmit(data: SiteSettingsInput) {
    startTransition(async () => {
      const result = await updateSiteSettings(data);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const bankResult = await updateBankSettings({
        beneficiaryName: bankSettings.beneficiary_name,
        iban: bankSettings.iban,
        bic: bankSettings.bic,
        bankName: bankSettings.bank_name,
        paymentInstructions: bankSettings.payment_instructions,
        defaultDepositAmount: bankSettings.default_deposit_amount,
        showOnConfirmations: data.showOnConfirmations,
      });
      if (bankResult.success) toast.success(result.message);
      else toast.error(bankResult.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="footerPhone">Numéro de contact et de confirmation de paiement</Label>
        <Input id="footerPhone" type="tel" placeholder="+31649496257" {...register('footerPhone')} />
        <FieldError message={errors.footerPhone?.message} />
        <p className="mt-1 text-xs text-ink-400">Ce numéro est utilisé dans le footer, les contacts et les confirmations de paiement WhatsApp.</p>
      </div>
      <div>
        <Label htmlFor="viewingFee">Frais de visite (€)</Label>
        <Input id="viewingFee" type="number" min="0" step="0.01" {...register('viewingFee')} />
        <FieldError message={errors.viewingFee?.message} />
        <p className="mt-1 text-xs text-ink-400">Ce montant est indépendant des appartements et s’applique à toutes les visites.</p>
      </div>
      <div>
        <Label htmlFor="paymentLink">Lien de paiement</Label>
        <Input id="paymentLink" type="url" {...register('paymentLink')} />
        <FieldError message={errors.paymentLink?.message} />
        <p className="mt-1 text-xs text-ink-400">Ce lien sera utilisé pour les visites et les réservations.</p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-100 bg-sand-50 p-3.5">
        <Checkbox id="showPaymentLink" {...register('showPaymentLink')} />
        <span>
          <span className="block text-sm font-semibold text-ink-800">
            Afficher le lien de paiement
          </span>
          <span className="mt-0.5 block text-xs text-ink-500">
            Affiche le lien de paiement sur les pages de confirmation.
          </span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-100 bg-sand-50 p-3.5">
        <Checkbox id="showOnConfirmations" {...register('showOnConfirmations')} />
        <span>
          <span className="block text-sm font-semibold text-ink-800">
            RIB tonen op de bevestigingspagina&apos;s
          </span>
          <span className="mt-0.5 block text-xs text-ink-500">
            Toon deze bankgegevens naast de betaallink na een bezoek- of reserveringsaanvraag.
          </span>
        </span>
      </label>
      <Button type="submit" isLoading={isPending}>
        <Save className="h-4 w-4" />
        Enregistrer
      </Button>
    </form>
  );
}
