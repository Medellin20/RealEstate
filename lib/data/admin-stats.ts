import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DashboardStats } from '@/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    { count: totalProperties },
    { count: availableProperties },
    { count: reservedProperties },
    { count: rentedProperties },
    { count: viewingRequestsTotal },
    { count: viewingsToday },
    { count: reservationsPending },
    { count: paymentsPending },
    { count: guaranteesReceived },
    { count: refundRequestsPending },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'reserved'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'rented'),
    supabase.from('viewing_requests').select('*', { count: 'exact', head: true }),
    supabase
      .from('viewing_requests')
      .select('*', { count: 'exact', head: true })
      .gte('requested_date', todayStart.toISOString().split('T')[0])
      .lte('requested_date', todayEnd.toISOString().split('T')[0]),
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'under_review']),
    supabase
      .from('viewing_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'payment_pending'),
    supabase
      .from('guarantee_payments')
      .select('*', { count: 'exact', head: true })
      .in('status', ['payment_received', 'reservation_confirmed']),
    supabase.from('refund_requests').select('*', { count: 'exact', head: true }).eq('status', 'requested'),
  ]);

  return {
    totalProperties: totalProperties ?? 0,
    availableProperties: availableProperties ?? 0,
    reservedProperties: reservedProperties ?? 0,
    rentedProperties: rentedProperties ?? 0,
    viewingRequestsTotal: viewingRequestsTotal ?? 0,
    viewingsToday: viewingsToday ?? 0,
    reservationsPending: reservationsPending ?? 0,
    paymentsPending: paymentsPending ?? 0,
    guaranteesReceived: guaranteesReceived ?? 0,
    refundRequestsPending: refundRequestsPending ?? 0,
  };
}

export async function getRecentAdminLogs(limit = 8) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAdminAlerts() {
  const supabase = createAdminClient();
  const [{ data: reservations }, { data: viewings }, { data: refunds }] = await Promise.all([
    supabase.from('reservations').select('id, reference, created_at').in('status', ['submitted', 'under_review']).order('created_at', { ascending: false }).limit(5),
    supabase.from('viewing_requests').select('id, reference, created_at').eq('status', 'payment_pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('refund_requests').select('id, reference, created_at').eq('status', 'requested').order('created_at', { ascending: false }).limit(5),
  ]);

  return [
    ...(reservations ?? []).map((item) => ({ ...item, label: `Réservation ${item.reference} à examiner`, href: '/admin/reservations', tone: 'warning' as const })),
    ...(viewings ?? []).map((item) => ({ ...item, label: `Paiement de visite ${item.reference} à vérifier`, href: '/admin/visites', tone: 'info' as const })),
    ...(refunds ?? []).map((item) => ({ ...item, label: `Remboursement ${item.reference} demandé`, href: '/admin/remboursements', tone: 'danger' as const })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
}
