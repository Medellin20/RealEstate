import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Home, ShieldCheck } from 'lucide-react';
import { getReservationByReference } from '@/lib/data/dossier';
import { Button } from '@/components/ui/button';
import { RESERVATION_STATUS_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';

export const metadata = { title: 'Réservation envoyée' };

export default async function ReservationConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  if (!searchParams.ref) notFound();
  const reservation = await getReservationByReference(searchParams.ref);
  if (!reservation) notFound();

  const property = (reservation as any).properties;

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900">Votre réservation a été enregistrée</h1>

        <p className="mt-2 text-sm text-ink-500">
          Numéro de réservation : <span className="font-semibold text-ink-700">{reservation.reference}</span>
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-sand-100/60 p-4 text-left text-sm">
          <Row label="Logement" value={property?.title ?? '—'} />
          <Row label="Entrée souhaitée" value={formatDate(reservation.desired_move_in_date)} />
          <Row label="Durée" value={`${reservation.duration_months} mois`} />
          <Row label="Statut" value={RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-canal-100 bg-canal-50/60 p-4 text-left">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-canal-600" />
          <p className="text-xs leading-relaxed text-canal-800">
            Notre équipe va examiner votre dossier. Une fois accepté, vous recevrez les instructions
            pour verser la garantie de réservation et sécuriser définitivement le logement. Vous
            pouvez suivre l’avancement de votre dossier à tout moment depuis votre espace client.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <Link href="/mon-compte" className="flex-1">
            <Button className="w-full">Suivre mon dossier</Button>
          </Link>
          <Link href="/appartements" className="flex-1">
            <Button variant="outline" className="w-full">
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
