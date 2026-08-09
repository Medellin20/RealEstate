import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  Home,
  CalendarClock,
  FileText,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { getDashboardStats, getRecentAdminLogs } from '@/lib/data/admin-stats';
import { StatCard } from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Dashboard admin' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [stats, logs] = await Promise.all([getDashboardStats(), getRecentAdminLogs()]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ink-500">Vue d’ensemble de l’activité de l’agence.</p>
        </div>
        <Link href="/admin/appartements/nouveau">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Ajouter un appartement
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Building2} label="Total appartements" value={stats.totalProperties} />
        <StatCard icon={Home} label="Disponibles" value={stats.availableProperties} tone="positive" />
        <StatCard icon={Clock} label="Réservés" value={stats.reservedProperties} tone="warning" />
        <StatCard icon={CheckCircle2} label="Loués" value={stats.rentedProperties} />
        <StatCard icon={CalendarClock} label="Demandes de visite" value={stats.viewingRequestsTotal} tone="info" />
        <StatCard icon={CalendarClock} label="Visites aujourd’hui" value={stats.viewingsToday} tone="positive" />
        <StatCard icon={FileText} label="Réservations en attente" value={stats.reservationsPending} tone="warning" />
        <StatCard icon={CreditCard} label="Paiements en attente" value={stats.paymentsPending} tone="warning" />
        <StatCard icon={ShieldCheck} label="Garanties reçues" value={stats.guaranteesReceived} tone="positive" />
        <StatCard icon={RotateCcw} label="Demandes de remboursement" value={stats.refundRequestsPending} tone="info" />
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-ink-900">Activité récente</h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">Aucune action enregistrée pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-ink-700">{log.action}</span>
                <span className="shrink-0 text-xs text-ink-400">{formatDateTime(log.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
