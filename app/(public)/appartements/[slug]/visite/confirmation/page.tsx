import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Home, Mail } from 'lucide-react';
import { getViewingByReference } from '@/lib/data/dossier';
import { DEMO_BANK_SETTINGS, getBankSettings, isDemoBankSettings } from '@/lib/data/bank';
import { Button } from '@/components/ui/button';
import { BankTransferInstructions } from '@/components/shared/bank-transfer-instructions';
import { VIEWING_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { PROFESSIONAL_EMAIL } from '@/lib/payments/bank-transfer';

export const metadata = { title: 'Demande de visite confirmée' };

export default async function ViewingConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  if (!searchParams.ref) notFound();
  const viewing = await getViewingByReference(searchParams.ref);
  if (!viewing) notFound();
  const bankSettings = await getBankSettings();
  const displayedBankSettings = bankSettings ?? DEMO_BANK_SETTINGS;

  const property = (viewing as any).properties;
  const isAwaitingPayment = viewing.status === 'payment_pending';

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-2xl rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          {isAwaitingPayment ? <Clock className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900">
          {isAwaitingPayment ? 'Votre demande de visite a été enregistrée' : 'Votre demande de visite a été envoyée'}
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Référence : <span className="font-semibold text-ink-700">{viewing.reference}</span>
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-sand-100/60 p-4 text-left text-sm">
          <Row label="Logement" value={property?.title ?? '—'} />
          <Row label="Date" value={formatDate(viewing.requested_date)} />
          <Row label="Créneau" value={viewing.requested_time_slot} />
          <Row label="Statut" value={VIEWING_STATUS_LABELS[viewing.status] ?? viewing.status} />
          {viewing.fee_amount > 0 && <Row label="Frais de visite" value={formatPrice(viewing.fee_amount)} />}
        </div>

        {isAwaitingPayment && (
          <div className="mt-5 text-left">
            <BankTransferInstructions
              bankSettings={displayedBankSettings}
              reference={viewing.reference}
              amount={100}
              isExample={isDemoBankSettings(displayedBankSettings)}
            />
          </div>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-canal-100 bg-canal-50/60 p-4 text-left">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-canal-600" />
          <p className="text-sm leading-relaxed text-canal-800">
            Après le virement, envoyez la capture ou le justificatif à{' '}
            <a className="font-bold underline" href={`mailto:${PROFESSIONAL_EMAIL}?subject=Justificatif visite ${viewing.reference}`}>
              {PROFESSIONAL_EMAIL}
            </a>{' '}
            en indiquant la référence <strong>{viewing.reference}</strong>.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <Link href="/mon-compte" className="flex-1">
            <Button variant="outline" className="w-full">Suivre mon dossier</Button>
          </Link>
          <Link href="/appartements" className="flex-1">
            <Button className="w-full">
              <Home className="h-4 w-4" />
              Voir d’autres logements
            </Button>
          </Link>
        </div>
      </div>
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
