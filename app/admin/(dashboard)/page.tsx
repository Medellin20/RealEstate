import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  Home,
  PlusCircle,
} from 'lucide-react';
import { getDashboardStats, getRecentAdminLogs } from '@/lib/data/admin-stats';
import { StatCard } from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils/format';
import { DashboardAutoRefresh } from '@/components/admin/dashboard-auto-refresh';
import type { DashboardStats } from '@/types';

export const metadata: Metadata = { title: 'Dashboard admin' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [statsResult, logsResult] = await Promise.allSettled([
    getDashboardStats(),
    getRecentAdminLogs(),
  ]);

  const stats: DashboardStats = statsResult.status === 'fulfilled'
    ? statsResult.value
    : {
        totalProperties: 0,
        availableProperties: 0,
        reservedProperties: 0,
        rentedProperties: 0,
        viewingRequestsTotal: 0,
        viewingsToday: 0,
        reservationsPending: 0,
  };
  const logs = logsResult.status === 'fulfilled' ? logsResult.value : [];
  const dataLoadFailed = [statsResult, logsResult].some((result) => result.status === 'rejected');

  return (
    <div>
      <DashboardAutoRefresh />
      {dataLoadFailed && (
        <div role="alert" className="mb-6 rounded-2xl border border-brick-200 bg-brick-50 p-4 text-sm text-brick-700">
          Sommige gegevens kunnen niet worden geladen. Controleer de Supabase-variabelen van de implementatie.
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Overzicht van de activiteiten van het agentschap.</p>
        </div>
        <Link href="/admin/appartements/nouveau" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Ajouter un appartement
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard href="/admin/appartements" icon={Building2} label="Total appartementen" value={stats.totalProperties} />
        <StatCard href="/admin/appartements?status=available" icon={Home} label="beschikbare" value={stats.availableProperties} tone="positive" />
        <StatCard href="/admin/appartements?status=reserved" icon={Clock} label="Gereserveerd" value={stats.reservedProperties} tone="warning" />
        <StatCard href="/admin/appartements?status=rented" icon={CheckCircle2} label="Verhuurd" value={stats.rentedProperties} />
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-ink-900">Recente activiteit</h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">Momenteel zijn er geen geregistreerde activiteiten.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="min-w-0 text-ink-700">{log.action}</span>
                <span className="shrink-0 text-xs text-ink-400">{formatDateTime(log.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
