import Link from 'next/link';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PAYMENT_CONFIRMATION_WHATSAPP } from '@/lib/utils/constants';
import { getSiteSettings } from '@/lib/data/site-settings';

export const metadata = { title: 'Betaling reserveringskosten' };

export default async function ReservationConfirmationPage() {
  const { payment_link: paymentLink } = await getSiteSettings();
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-6 sm:py-14">
      <div className="w-full max-w-2xl rounded-3xl border border-ink-100 bg-white p-5 text-center shadow-card sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900 sm:text-2xl">
          Uw dossier is verzonden
        </h1>

        <a
          href={paymentLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-canal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-canal-800"
        >
          Klik hier om de reserveringskosten automatisch te betalen
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
          </a>
        </p>

        <Link href="/appartements" className="mt-8 inline-block w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Home className="h-4 w-4" />
            Andere woningen bekijken
          </Button>
        </Link>
      </div>
    </div>
  );
}
