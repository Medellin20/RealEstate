import type { TimelineStep } from '@/components/shared/status-timeline';
import type { ReservationStatus, ViewingStatus } from '@/types/database';

export function getReservationTimelineSteps(status: ReservationStatus): TimelineStep[] {
  const order: ReservationStatus[] = [
    'submitted',
    'under_review',
    'awaiting_guarantee',
    'guarantee_paid',
    'confirmed',
  ];
  const labels = [
    'Demande envoyée',
    'Dossier en cours d’examen',
    'Garantie demandée',
    'Garantie reçue',
    'Logement réservé',
  ];

  if (status === 'rejected' || status === 'cancelled') {
    const failedIndex = status === 'rejected' ? 1 : order.indexOf('submitted');
    return labels.map((label, i) => ({
      label,
      state: i < failedIndex ? 'done' : i === failedIndex ? 'failed' : 'upcoming',
    }));
  }

  // 'accepted' se comporte comme une étape intermédiaire entre under_review et awaiting_guarantee
  const effectiveStatus = status === 'accepted' ? 'under_review' : status;
  const currentIndex = order.indexOf(effectiveStatus);

  return labels.map((label, i) => ({
    label,
    state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
}

export function getViewingTimelineSteps(status: ViewingStatus): TimelineStep[] {
  const order: ViewingStatus[] = ['pending', 'payment_pending', 'paid', 'confirmed', 'completed'];
  const labels = ['Demande envoyée', 'Paiement des frais', 'Paiement confirmé', 'Visite confirmée', 'Visite effectuée'];

  if (status === 'cancelled') {
    return labels.map((label, i) => ({ label, state: i === 0 ? 'failed' : 'upcoming' }));
  }

  const currentIndex = order.indexOf(status);
  return labels.map((label, i) => ({
    label,
    state: i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming',
  }));
}
