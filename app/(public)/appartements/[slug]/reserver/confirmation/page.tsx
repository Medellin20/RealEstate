import Link from 'next/link';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Dossier envoyé' };

export default function ReservationConfirmationPage() {
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-6 sm:py-14">
      <div className="w-full max-w-2xl rounded-3xl border border-ink-100 bg-white p-5 text-center shadow-card sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900 sm:text-2xl">
          Votre dossier a bien été envoyé
        </h1>

        <p className="mt-5 rounded-2xl border border-canal-200 bg-canal-50 px-4 py-3 text-base font-bold text-canal-800">
          Vous recevrez une notification par e-mail sous 10 minutes.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          Vos informations ont été transmises à notre équipe. Nous vous contacterons par e-mail
          pour la suite de votre demande de réservation.
        </p>

        <Link href="/appartements" className="mt-8 inline-block w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Home className="h-4 w-4" />
            Voir les appartements
          </Button>
        </Link>
      </div>
    </div>
  );
}
