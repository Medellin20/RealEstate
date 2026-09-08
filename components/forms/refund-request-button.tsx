'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { requestGuaranteeRefund } from '@/actions/refunds';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function RefundRequestButton({ guaranteePaymentId }: { guaranteePaymentId: string }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [confirmed, setConfirmed] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const result = await requestGuaranteeRefund({
        guaranteePaymentId,
        reason,
        confirm: confirmed as true,
      });
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <RotateCcw className="h-3.5 w-3.5" />
        Terugbetaling aanvragen
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Terugbetaling van uw waarborg aanvragen">
        <p className="text-sm text-ink-500">
          Als u uiteindelijk afziet van deze woning, kunt u de terugbetaling van uw waarborg
          aanvragen. Ons team verwerkt uw aanvraag en houdt u op de hoogte van de voortgang.
        </p>

        <div className="mt-4">
          <Label htmlFor="reason">Reden (optioneel)</Label>
          <Textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Licht uw beslissing kort toe..."
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-ink-600">
          <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
          Ik bevestig dat ik mijn reservering wil annuleren en de terugbetaling van mijn waarborg wil aanvragen.
        </label>

        <div className="mt-6 flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!confirmed}
            isLoading={isPending}
            onClick={handleSubmit}
          >
            Aanvraag bevestigen
          </Button>
        </div>
      </Modal>
    </>
  );
}
