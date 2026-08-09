import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, CalendarClock, ShieldCheck, Search } from 'lucide-react';
import { getClientDossierByEmail } from '@/lib/data/dossier';
import { getBankSettings } from '@/lib/data/bank';
import { StatusTimeline } from '@/components/shared/status-timeline';
import { BankTransferInstructions } from '@/components/shared/bank-transfer-instructions';
import { DeclareTransferForm } from '@/components/forms/declare-transfer-form';
import { RefundRequestButton } from '@/components/forms/refund-request-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { generateGuaranteeReference } from '@/lib/utils/reference';
import { getReservationTimelineSteps, getViewingTimelineSteps } from '@/lib/utils/timeline';
import { formatDate, formatPrice } from '@/lib/utils/format';
import {
  RESERVATION_STATUS_LABELS,
  VIEWING_STATUS_LABELS,
  GUARANTEE_STATUS_LABELS,
  REFUND_STATUS_LABELS,
} from '@/lib/utils/constants';

export const metadata: Metadata = { title: 'Mon compte' };

export default async function MonComptePage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email?.trim();

  if (!email) {
    return <EmailLookupScreen />;
  }

  const dossier = await getClientDossierByEmail(email);

  if (!dossier) {
    return <EmailLookupScreen notFoundEmail={email} />;
  }

  const bankSettings = await getBankSettings();

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-display-sm font-extrabold text-ink-900 sm:text-display-md">Mon compte</h1>
        <p className="mt-2 text-ink-500">
          Bonjour {dossier.client.first_name}, voici le suivi de vos démarches auprès de Real Estate NL.
        </p>
      </div>

      {/* RÉSERVATIONS */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900">
          <ShieldCheck className="h-5 w-5 text-canal-600" />
          Mes réservations
        </h2>

        {dossier.reservations.length === 0 ? (
          <EmptyState
            title="Aucune réservation pour le moment"
            description="Parcourez nos annonces et réservez le logement de vos rêves aux Pays-Bas."
            action={
              <Link href="/appartements">
                <Button>Voir les appartements</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {dossier.reservations.map((reservation: any) => {
              const guarantee = reservation.guarantee_payments?.[0];
              const refunds = reservation.refund_requests ?? [];
              const guaranteeReference = generateGuaranteeReference(reservation.reference);
              const canRequestRefund =
                guarantee &&
                ['payment_received', 'payment_declared', 'reservation_confirmed'].includes(guarantee.status);

              return (
                <div key={reservation.id} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {reservation.reference}
                      </p>
                      <Link
                        href={`/appartements/${reservation.properties?.slug}`}
                        className="text-base font-bold text-ink-900 hover:text-canal-600"
                      >
                        {reservation.properties?.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-ink-500">
                        Entrée souhaitée le {formatDate(reservation.desired_move_in_date)} ·{' '}
                        {reservation.duration_months} mois
                      </p>
                    </div>
                    <Badge variant="outline">{RESERVATION_STATUS_LABELS[reservation.status]}</Badge>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                      <StatusTimeline steps={getReservationTimelineSteps(reservation.status)} />
                    </div>

                    <div className="lg:col-span-3">
                      {['awaiting_guarantee', 'guarantee_paid', 'confirmed'].includes(reservation.status) &&
                        guarantee &&
                        bankSettings && (
                          <div className="space-y-4">
                            {guarantee.status === 'awaiting_payment' && (
                              <>
                                <BankTransferInstructions
                                  bankSettings={bankSettings}
                                  reference={guaranteeReference}
                                  amount={guarantee.amount}
                                />
                                <details className="group rounded-2xl border border-ink-100 bg-white">
                                  <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-semibold text-ink-700">
                                    J’ai effectué le virement →
                                  </summary>
                                  <div className="border-t border-ink-100 p-5">
                                    <DeclareTransferForm guaranteePaymentId={guarantee.id} />
                                  </div>
                                </details>
                              </>
                            )}

                            {guarantee.status !== 'awaiting_payment' && (
                              <div className="rounded-xl border border-ink-100 bg-sand-100/50 p-4 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-ink-500">Statut de la garantie</span>
                                  <span className="font-semibold text-ink-800">
                                    {GUARANTEE_STATUS_LABELS[guarantee.status]}
                                  </span>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className="text-ink-500">Montant</span>
                                  <span className="font-semibold text-ink-800">{formatPrice(guarantee.amount)}</span>
                                </div>
                              </div>
                            )}

                            {canRequestRefund && refunds.length === 0 && (
                              <RefundRequestButton guaranteePaymentId={guarantee.id} />
                            )}

                            {refunds.length > 0 && (
                              <div className="rounded-xl border border-brick-100 bg-brick-50/50 p-4 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-ink-600">Demande de remboursement</span>
                                  <span className="font-semibold text-brick-600">
                                    {REFUND_STATUS_LABELS[refunds[0].status]}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-ink-400">
                                  Référence : {refunds[0].reference}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                      {reservation.status === 'submitted' && (
                        <p className="text-sm text-ink-400">
                          Votre dossier est en attente d’examen par notre équipe. Vous recevrez les
                          instructions de garantie dès qu’il sera accepté.
                        </p>
                      )}

                      {reservation.status === 'rejected' && (
                        <p className="text-sm text-brick-500">
                          Votre demande n’a malheureusement pas pu être acceptée pour ce logement.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* VISITES */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900">
          <CalendarClock className="h-5 w-5 text-canal-600" />
          Mes demandes de visite
        </h2>

        {dossier.viewings.length === 0 ? (
          <EmptyState title="Aucune visite demandée" description="Réservez une visite depuis la fiche d’un logement." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {dossier.viewings.map((viewing: any) => (
              <div key={viewing.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {viewing.reference}
                    </p>
                    <Link
                      href={`/appartements/${viewing.properties?.slug}`}
                      className="font-bold text-ink-900 hover:text-canal-600"
                    >
                      {viewing.properties?.title}
                    </Link>
                  </div>
                  <Badge variant="outline">{VIEWING_STATUS_LABELS[viewing.status]}</Badge>
                </div>
                <p className="mt-1.5 text-sm text-ink-500">
                  {formatDate(viewing.requested_date)} · {viewing.requested_time_slot}
                </p>
                <div className="mt-4">
                  <StatusTimeline steps={getViewingTimelineSteps(viewing.status)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmailLookupScreen({ notFoundEmail }: { notFoundEmail?: string }) {
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canal-50 text-canal-600">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-center text-xl font-extrabold text-ink-900">Accéder à mon dossier</h1>
        <p className="mt-1.5 text-center text-sm text-ink-500">
          Saisissez l’adresse e-mail utilisée lors de votre demande de visite ou de réservation.
        </p>

        {notFoundEmail && (
          <p className="mt-4 rounded-lg bg-brick-50 px-3 py-2 text-center text-xs text-brick-600">
            Aucun dossier trouvé pour « {notFoundEmail} ». Vérifiez l’orthographe de votre e-mail.
          </p>
        )}

        <form action="/mon-compte" method="get" className="mt-6 space-y-3">
          <Input type="email" name="email" placeholder="vous@exemple.com" required defaultValue={notFoundEmail} />
          <Button type="submit" className="w-full">
            <Search className="h-4 w-4" />
            Accéder à mon dossier
          </Button>
        </form>
      </div>
    </div>
  );
}
