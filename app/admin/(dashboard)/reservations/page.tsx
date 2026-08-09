import type { Metadata } from 'next';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { getAllReservationsAdmin } from '@/lib/data/admin-lists';
import { updateReservationStatus } from '@/actions/admin-reservations';
import { StatusSelect } from '@/components/admin/status-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils/format';
import { RESERVATION_STATUS_LABELS } from '@/lib/utils/constants';
import type { ReservationStatus } from '@/types/database';

export const metadata: Metadata = { title: 'Réservations' };
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = Object.entries(RESERVATION_STATUS_LABELS).map(([value, label]) => ({
  value: value as ReservationStatus,
  label,
}));

export default async function AdminReservationsPage({ searchParams }: { searchParams: { status?: string } }) {
  const reservations = await getAllReservationsAdmin({ status: searchParams.status });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Réservations</h1>
          <p className="mt-1 text-sm text-ink-500">{reservations.length} réservation(s).</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin/export/reservations" download>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </a>
          <form action="/admin/reservations" method="get">
            <Select name="status" defaultValue={searchParams.status} className="sm:w-56">
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </form>
        </div>
      </div>

      {reservations.length === 0 ? (
        <EmptyState title="Aucune réservation" />
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation: any) => (
            <div key={reservation.id} className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{reservation.reference}</p>
                  <Link href={`/admin/appartements/${reservation.property_id}`} className="font-bold text-ink-900 hover:text-canal-600">
                    {reservation.properties?.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-ink-500">{reservation.properties?.city}</p>
                </div>
                <Badge variant="outline">{RESERVATION_STATUS_LABELS[reservation.status as ReservationStatus]}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-600 sm:grid-cols-2 lg:grid-cols-4">
                <p><span className="text-ink-400">Client : </span>{reservation.clients?.first_name} {reservation.clients?.last_name}</p>
                <p><span className="text-ink-400">E-mail : </span>{reservation.clients?.email}</p>
                <p><span className="text-ink-400">Entrée : </span>{formatDate(reservation.desired_move_in_date)}</p>
                <p><span className="text-ink-400">Durée : </span>{reservation.duration_months} mois · {reservation.occupants_count} occupant(s)</p>
              </div>

              {reservation.message && (
                <p className="mt-2 rounded-lg bg-sand-100/60 px-3 py-2 text-xs text-ink-500">{reservation.message}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
                <span className="text-xs text-ink-400">Reçue le {formatDateTime(reservation.created_at)}</span>
                <StatusSelect
                  value={reservation.status as ReservationStatus}
                  options={STATUS_OPTIONS}
                  onUpdate={(status) => updateReservationStatus(reservation.id, status)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
