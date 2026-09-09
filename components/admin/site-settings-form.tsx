'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { updateSiteSettings } from '@/actions/site-settings';
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/validations/admin';
import type { SiteSettings } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = React.useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: { footerPhone: settings.footer_phone },
  });

  function onSubmit(data: SiteSettingsInput) {
    startTransition(async () => {
      const result = await updateSiteSettings(data);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="footerPhone">Numéro de téléphone du footer</Label>
        <Input id="footerPhone" type="tel" placeholder="+31649496257" {...register('footerPhone')} />
        <FieldError message={errors.footerPhone?.message} />
        <p className="mt-1 text-xs text-ink-400">Ce numéro sera affiché sur toutes les pages publiques.</p>
      </div>
      <Button type="submit" isLoading={isPending}>
        <Save className="h-4 w-4" />
        Enregistrer
      </Button>
    </form>
  );
}
