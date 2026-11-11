import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getViewingByReference } from '@/lib/data/dossier';
import { getBankSettings, isDemoBankSettings } from '@/lib/data/bank';
import { getSiteSettings } from '@/lib/data/site-settings';
import { PrintPdfButton } from '@/components/shared/print-pdf-button';
import { formatDate, formatPrice } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Reçu de visite' };

export default async function ViewingReceiptPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { ref?: string };
}) {
  if (!searchParams.ref || !/^[A-Z0-9-]{4,40}$/i.test(searchParams.ref)) notFound();

  const viewing = await getViewingByReference(searchParams.ref);
  if (!viewing || (viewing as any).properties?.slug !== params.slug) notFound();

  const [bank, siteSettings] = await Promise.all([getBankSettings(), getSiteSettings()]);
  const property = (viewing as any).properties;
  const client = (viewing as any).clients;
  const bankIsDemo = bank ? isDemoBankSettings(bank) : true;
  const receiptDate = viewing.created_at;
  const paymentConfirmed = Boolean(viewing.paid_at) || viewing.status === 'paid';
  const propertyAddress = [property?.address, property?.postal_code, property?.city]
    .filter(Boolean)
    .join(', ');

  return (
    <main className="receipt-page container-app py-8 sm:py-12">
      <div className="receipt-actions no-print mx-auto mb-5 flex max-w-4xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Link href={`/appartements/${params.slug}/visite/confirmation?ref=${encodeURIComponent(viewing.reference)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Terug naar de bevestiging
        </Link>
        <PrintPdfButton />
      </div>

      <article className="receipt-sheet mx-auto max-w-4xl border border-ink-100 bg-white p-5 shadow-card sm:p-10">
        <header className="flex flex-col justify-between gap-5 border-b-2 border-canal-800 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <svg aria-hidden="true" viewBox="0 0 64 52" className="h-14 w-16 shrink-0 text-canal-800" fill="none">
              <path d="M4 27 21 10l11 10L45 4l15 15v28H5V27Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <path d="M12 46V29l10-9 10 9v17M36 46V22l9-9 9 9v24M18 33h8m-8 7h8m16-11h7m-7 8h7" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-lg font-black tracking-wide text-canal-900 sm:text-xl">NL REAL ESTATE B.V.</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-canal-700">Real Estate · Nederland</p>
              <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-500">Verhuur &amp; verkoop van vastgoed</p>
            </div>
          </div>
          <div className="border-l-2 border-canal-800 pl-4 text-sm leading-6 text-ink-600 sm:text-right">
            <p>contacts@realestatenl.agency</p>
            <p>www.realestatenl.agency</p>
            <p className="mt-2">{siteSettings.footer_phone}</p>
          </div>
        </header>

        <div className="border-b border-canal-800 py-6 text-center sm:py-7">
          <h1 className="text-3xl font-black tracking-wide text-canal-900 sm:text-4xl">REÇU DE PAIEMENT AUX PAYS-BAS</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-canal-800">Aanvraag- en betalingsdetails</p>
          <p className="mx-auto mt-3 max-w-xl rounded-md bg-sky-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-canal-900 sm:text-sm">Bezichtigingskosten · betalingsstatus: {paymentConfirmed ? 'ontvangen' : 'in afwachting'}</p>
        </div>

        <section className="receipt-grid mt-5 grid max-w-xl grid-cols-1 gap-0 overflow-hidden border border-canal-100">
          <ReceiptRow label="Referentienummer" value={viewing.reference} />
          <ReceiptRow label="Datum aanvraag" value={formatDate(receiptDate)} />
          <ReceiptRow label="Status betaling" value={paymentConfirmed ? 'Betaling bevestigd' : 'In afwachting van betaling'} />
          <ReceiptRow label="Betaaldatum" value={viewing.paid_at ? formatDate(viewing.paid_at) : 'Nog niet bevestigd'} />
        </section>

        <ReceiptSection title="GEGEVENS KLANT">
          <ReceiptRow label="Naam" value={`${client?.first_name ?? ''} ${client?.last_name ?? ''}`.trim() || '—'} />
          <ReceiptRow label="E-mailadres" value={client?.email ?? '—'} />
          <ReceiptRow label="Telefoonnummer" value={(viewing as any).clients?.phone ?? '—'} />
        </ReceiptSection>

        <ReceiptSection title="GEGEVENS WONING">
          <ReceiptRow label="Woning" value={property?.title ?? '—'} />
          <ReceiptRow label="Adres" value={propertyAddress || property?.city || '—'} />
          <ReceiptRow label="Geplande bezichtiging" value={`${formatDate(viewing.requested_date)} · ${viewing.requested_time_slot}`} />
        </ReceiptSection>

        <ReceiptSection title="BETALINGSDETAILS">
          <ReceiptRow label="Omschrijving" value={`Bezichtigingskosten · ${viewing.reference}`} />
          <ReceiptRow label="Bedrag" value={formatPrice(viewing.fee_amount)} strong />
          <ReceiptRow label="Betaalmethode" value="Bankoverschrijving of betaalpagina" />
          <ReceiptRow label="Begunstigde" value={bank?.beneficiary_name || 'Niet geconfigureerd'} />
          <ReceiptRow label="IBAN" value={bank?.iban || 'Niet geconfigureerd'} mono />
          {bank?.bic && <ReceiptRow label="BIC / SWIFT" value={bank.bic} mono />}
          {bank?.bank_name && <ReceiptRow label="Bank" value={bank.bank_name} />}
        </ReceiptSection>

        <p className="mt-5 border-l-4 border-canal-700 bg-canal-50 p-4 text-sm leading-6 text-ink-700">
          {paymentConfirmed
            ? 'Dit document bevestigt de registratie van uw bezichtigingsaanvraag en de betaling volgens de status van uw dossier.'
            : 'Dit document bevestigt de registratie van uw bezichtigingsaanvraag. De betaling is nog niet door de beheerder bevestigd. Bewaar dit overzicht en vermeld het referentienummer bij uw overschrijving.'}
          {' '}De bezichtigingskosten zijn terugbetaalbaar.
          {bankIsDemo && <span className="mt-2 block font-semibold text-red-700">Let op: de op de website ingestelde bankgegevens zijn demo- of voorbeeldgegevens. Controleer de actuele betaalgegevens bij de beheerder voordat u geld overmaakt.</span>}
          {bank?.payment_instructions && <span className="mt-2 block">{bank.payment_instructions}</span>}
        </p>

        <footer className="mt-8 flex flex-col justify-between gap-5 border-t border-ink-200 pt-5 text-sm text-ink-600 sm:flex-row sm:items-end">
          <div>
            <p>Bedankt voor uw vertrouwen.</p>
            <p className="mt-3 font-bold text-canal-900">Real Estate NL B.V.</p>
            <p className="text-xs">Verhuur &amp; verkoop van vastgoed in Nederland</p>
          </div>
          <p className="text-xs text-ink-400">Document aangemaakt op {formatDate(new Date())}</p>
        </footer>
      </article>

      <p className="no-print mx-auto mt-4 max-w-4xl text-center text-xs text-ink-400">Kies in het afdrukvenster voor ‘Opslaan als PDF’ om het ontvangstbewijs te downloaden.</p>
    </main>
  );
}

function ReceiptSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 overflow-hidden rounded-lg border border-canal-100">
      <h2 className="bg-canal-800 px-4 py-2 text-sm font-bold tracking-wide text-white">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function ReceiptRow({ label, value, strong = false, mono = false }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="receipt-row grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.5fr)] border-b border-white bg-canal-50/80 last:border-b-0">
      <span className="px-3 py-2 text-sm text-ink-600 sm:px-4">{label}</span>
      <span className={`break-words px-3 py-2 text-sm text-canal-900 sm:px-4 ${strong ? 'text-lg font-extrabold' : 'font-medium'} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
