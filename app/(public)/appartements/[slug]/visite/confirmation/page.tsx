import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Download, Home } from 'lucide-react';
import { getViewingByReference } from '@/lib/data/dossier';
import { Button } from '@/components/ui/button';
import { VIEWING_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';
import { getSiteSettings } from '@/lib/data/site-settings';
import { getBankSettings } from '@/lib/data/bank';
import { BankTransferInstructions } from '@/components/shared/bank-transfer-instructions';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Bezichtigingsaanvraag verzonden' };

export default async function ViewingConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  if (!searchParams.ref) notFound();
  const viewing = await getViewingByReference(searchParams.ref);
  if (!viewing) notFound();

  const property = (viewing as any).properties;
  const {
    payment_link: paymentLink,
    show_payment_link: showPaymentLink,
    footer_phone: confirmationPhone,
  } = await getSiteSettings();
  const bankSettings = await getBankSettings();
  const showBankDetails = Boolean(bankSettings?.show_on_confirmations && bankSettings);

  return (
    <div className="container-app flex min-h-[70vh] items-start justify-center py-6 sm:py-10">
      <div className="w-full max-w-5xl rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-7 lg:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-8 ring-emerald-50/60">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Uw aanvraag is ontvangen</h1>
          <p className="mt-2 text-sm text-ink-500">Referentie: <span className="font-bold text-canal-800">{viewing.reference}</span></p>
        </div>

        <div className="mt-6 grid gap-2 rounded-2xl border border-ink-100 bg-sand-100/50 p-4 text-left text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3 sm:p-5">
          <Row label="Woning" value={property?.title ?? '—'} />
          <Row label="Datum" value={formatDate(viewing.requested_date)} />
          <Row label="Tijdstip" value={viewing.requested_time_slot} />
          <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-2 sm:border-0 sm:pt-0">
            <span className="text-ink-500">Status</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{VIEWING_STATUS_LABELS[viewing.status] ?? viewing.status}</span>
          </div>
        </div>

        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)] lg:gap-5">
          {showPaymentLink && (
            <section className="rounded-2xl border border-canal-100 bg-canal-50/60 p-4 text-left sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-canal-700">Te betalen bezoekkosten</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink-900">{formatPrice(viewing.fee_amount)}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">Betaal veilig via de betaallink. Uw aanvraag blijft zichtbaar in uw dossier.</p>
              <a href={paymentLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-canal-800 px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-canal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canal-700 focus-visible:ring-offset-2">
                Bezoekkosten betalen
              </a>
            </section>
          )}
          {showBankDetails && bankSettings && (
            <div className="min-w-0">
              <BankTransferInstructions bankSettings={bankSettings} reference={viewing.reference} amount={viewing.fee_amount} />
            </div>
          )}
        </div>

        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-center text-sm leading-relaxed text-amber-950 sm:p-4">
          Na de betaling kunt u het betalingsbewijs per e-mail sturen naar{' '}
          <a href="mailto:contacts@realestatenl.agency" className="underline">
            contacts@realestatenl.agency
          </a>{' '}
          of via WhatsApp naar{' '}
          <a
            href={`https://wa.me/${confirmationPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {confirmationPhone}
          </a>.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href={`/appartements/${property.slug}/visite/recu?ref=${encodeURIComponent(viewing.reference)}`} className="min-w-0">
            <Button variant="outline" className="w-full whitespace-normal text-center leading-tight">
              <Download className="h-4 w-4" />
              Reçu PDF downloaden
            </Button>
          </Link>
          <Link href="/mon-compte" className="min-w-0">
            <Button variant="outline" className="w-full whitespace-normal text-center leading-tight">Uw dossier volgen</Button>
          </Link>
          <Link href="/appartements" className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Button className="w-full whitespace-normal text-center leading-tight">
              <Home className="h-4 w-4" />
              Andere woningen bekijken
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b border-ink-100 py-2 last:border-0 sm:py-0">
      <span className="shrink-0 text-ink-500">{label}</span>
      <span className="min-w-0 break-words text-right font-semibold text-ink-800">{value}</span>
    </div>
  );
}
