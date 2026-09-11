import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Home } from 'lucide-react';
import { getViewingByReference } from '@/lib/data/dossier';
import { Button } from '@/components/ui/button';
import { VIEWING_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';
import { PAYMENT_CONFIRMATION_WHATSAPP } from '@/lib/utils/constants';
import { getSiteSettings } from '@/lib/data/site-settings';

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
  const { payment_link: paymentLink } = await getSiteSettings();
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-6 sm:py-14">
      <div className="w-full max-w-2xl rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-card sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <p className="mt-2 text-sm text-ink-500">
          Referentie: <span className="font-semibold text-ink-700">{viewing.reference}</span>
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-sand-100/60 p-4 text-left text-sm">
          <Row label="woning" value={property?.title ?? '—'} />
          <Row label="Datum" value={formatDate(viewing.requested_date)} />
          <Row label="tijdslot" value={viewing.requested_time_slot} />
          <Row label="Statut" value={VIEWING_STATUS_LABELS[viewing.status] ?? viewing.status} />
        </div>

        <a
          href={paymentLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-canal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-canal-800"
        >
          Klik hier om de bezoekkosten automatisch te betalen
        </a>
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold leading-relaxed text-red-700">
          Stuur na de betaling de bevestiging per e-mail naar{' '}
          <a href="mailto:contacts@realestatenl.agency" className="underline">
            contacts@realestatenl.agency
          </a>{' '}
          of via WhatsApp naar{' '}
          <a
            href={`https://wa.me/${PAYMENT_CONFIRMATION_WHATSAPP.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {PAYMENT_CONFIRMATION_WHATSAPP}
          </a>.
        </p>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <Link href="/mon-compte" className="flex-1">
            <Button variant="outline" className="w-full">Suivre mon dossier</Button>
          </Link>
          <Link href="/appartements" className="flex-1">
            <Button className="w-full">
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
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-ink-400">{label}</span>
      <span className="break-words font-medium text-ink-700 sm:text-right">{value}</span>
    </div>
  );
}
