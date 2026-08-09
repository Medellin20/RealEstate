'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, ClipboardList, FileCheck2, User } from 'lucide-react';
import { reservationSchema, type ReservationInput } from '@/lib/validations/reservation';
import { createReservation } from '@/actions/reservations';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label, FieldError } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { formatPrice } from '@/lib/utils/format';
import { getReservationPaymentAmount } from '@/lib/payments/bank-transfer';

const STEPS = ['Vos coordonnées', 'Votre projet de location', 'Récapitulatif'] as const;

export function ReservationForm({
  propertyId,
  propertySlug,
  propertyTitle,
  monthlyPrice,
}: {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  monthlyPrice: number;
}) {
  const [step, setStep] = React.useState(0);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      propertyId,
      durationMonths: 12,
      occupantsCount: 1,
      website: '',
    },
  });

  const values = watch();
  const minDate = new Date().toISOString().split('T')[0];
  const paymentAmount = getReservationPaymentAmount(monthlyPrice);

  async function goNext() {
    const fieldsByStep: (keyof ReservationInput)[][] = [
      ['firstName', 'lastName', 'email', 'phone'],
      ['desiredMoveInDate', 'durationMonths', 'occupantsCount', 'profession', 'monthlyIncome'],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function onSubmit(data: ReservationInput) {
    startTransition(async () => {
      const result = await createReservation(data, propertySlug);
      if (result && !result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i < step ? 'bg-canal-600 text-white' : i === step ? 'bg-ink-700 text-white' : 'bg-ink-100 text-ink-400'
                )}
              >
                {i + 1}
              </span>
              <span className={cn('hidden text-sm font-medium sm:block', i === step ? 'text-ink-900' : 'text-ink-400')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-ink-100" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register('website')} className="hidden" tabIndex={-1} autoComplete="off" />

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-ink-700">
                <User className="h-5 w-5 text-canal-600" />
                <h3 className="font-bold">Vos coordonnées</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" {...register('firstName')} />
                  <FieldError message={errors.firstName?.message} />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" {...register('lastName')} />
                  <FieldError message={errors.lastName?.message} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register('email')} />
                <FieldError message={errors.email?.message} />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" {...register('phone')} />
                <FieldError message={errors.phone?.message} />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-ink-700">
                <ClipboardList className="h-5 w-5 text-canal-600" />
                <h3 className="font-bold">Votre projet de location</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="desiredMoveInDate">Date d’entrée souhaitée</Label>
                  <Input id="desiredMoveInDate" type="date" min={minDate} {...register('desiredMoveInDate')} />
                  <FieldError message={errors.desiredMoveInDate?.message} />
                </div>
                <div>
                  <Label htmlFor="durationMonths">Durée de location (mois)</Label>
                  <Input id="durationMonths" type="number" min={1} max={60} {...register('durationMonths')} />
                  <FieldError message={errors.durationMonths?.message} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="occupantsCount">Nombre d’occupants</Label>
                  <Select id="occupantsCount" {...register('occupantsCount')}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                  <FieldError message={errors.occupantsCount?.message} />
                </div>
                <div>
                  <Label htmlFor="monthlyIncome">Revenu mensuel approximatif (€)</Label>
                  <Input id="monthlyIncome" type="number" min={0} step="50" {...register('monthlyIncome')} />
                  <FieldError message={errors.monthlyIncome?.message} />
                </div>
              </div>
              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input id="profession" {...register('profession')} />
                <FieldError message={errors.profession?.message} />
              </div>
              <div>
                <Label htmlFor="message">Message complémentaire (facultatif)</Label>
                <Textarea id="message" rows={4} {...register('message')} />
                <FieldError message={errors.message?.message} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-ink-700">
                <FileCheck2 className="h-5 w-5 text-canal-600" />
                <h3 className="font-bold">Récapitulatif de votre demande</h3>
              </div>
              <div className="space-y-2 rounded-xl border border-ink-100 bg-sand-100/60 p-4 text-sm">
                <Row label="Logement" value={propertyTitle} />
                <Row label="Nom" value={`${values.firstName || ''} ${values.lastName || ''}`.trim() || '—'} />
                <Row label="E-mail" value={values.email || '—'} />
                <Row label="Entrée souhaitée" value={values.desiredMoveInDate || '—'} />
                <Row label="Durée" value={values.durationMonths ? `${values.durationMonths} mois` : '—'} />
                <Row label="Occupants" value={String(values.occupantsCount || '—')} />
                <Row label="Profession" value={values.profession || '—'} />
                <Row label="50 % du loyer" value={formatPrice(monthlyPrice / 2)} />
                <Row label="Caution (1 mois)" value={formatPrice(monthlyPrice)} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ink-700 px-4 py-3.5 text-white">
                <span className="text-sm font-medium">Total à verser</span>
                <span className="text-lg font-extrabold">{formatPrice(paymentAmount)}</span>
              </div>
              <p className="text-xs leading-relaxed text-ink-400">
                Après confirmation, le RIB de l’entreprise s’affichera. Effectuez le virement puis
                envoyez la capture du paiement à contacts@realestatenl.agency.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(step === 0 && 'invisible')}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" isLoading={isPending}>
              Confirmer et afficher le RIB
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-400">{label}</span>
      <span className="font-medium text-ink-700">{value}</span>
    </div>
  );
}
