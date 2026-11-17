export const DUTCH_CITIES = [
  'Amsterdam',
  'Rotterdam',
  'Utrecht',
  'The Hague',
  'Den Haag',
  'Eindhoven',
  'Groningen',
  'Almere',
  'Tilburg',
  'Breda',
  'Nijmegen',
  'Apeldoorn',
  'Haarlem',
  'Arnhem',
  'Amersfoort',
  'Enschede',
  'Leiden',
  'Dordrecht',
  'Maastricht',
] as const;

export type DutchCity = (typeof DUTCH_CITIES)[number];

export const PROPERTY_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'studio', label: 'Studio' },
  { value: 'maison', label: 'Woning' },
  { value: 'chambre', label: 'Kamer' },
  { value: 'loft', label: 'Loft' },
  { value: 'duplex', label: 'Duplex' },
] as const;

export const PROPERTY_STATUS_LABELS: Record<string, { label: string; colorClass: string }> = {
  draft: { label: 'Concept', colorClass: 'bg-status-draft' },
  available: { label: 'Beschikbaar', colorClass: 'bg-status-available' },
  reserved: { label: 'Gereserveerd', colorClass: 'bg-status-reserved' },
  rented: { label: 'Verhuurd', colorClass: 'bg-status-rented' },
  unavailable: { label: 'Niet beschikbaar', colorClass: 'bg-status-draft' },
};

export const VIEWING_STATUS_LABELS: Record<string, string> = {
  pending: 'In afwachting',
  payment_pending: 'Wacht op betaling',
  paid: 'Betaald',
  confirmed: 'Bevestigd',
  cancelled: 'Geannuleerd',
  completed: 'Afgerond',
};

export const VIEWING_FEE = 50;
export const PAYMENT_LINK = 'https://bunq.me/EtelaHorvathova';
export const PAYMENT_CONFIRMATION_WHATSAPP = '+31684130011';

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  submitted: 'Verstuurd',
  under_review: 'In behandeling',
  accepted: 'Geaccepteerd',
  rejected: 'Afgewezen',
  awaiting_guarantee: 'Wacht op waarborgsom',
  guarantee_paid: 'Waarborgsom betaald',
  confirmed: 'Bevestigd',
  cancelled: 'Geannuleerd',
};

export const GUARANTEE_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: 'Wacht op overschrijving',
  payment_declared: 'Overschrijving gemeld',
  payment_received: 'Overschrijving ontvangen',
  reservation_confirmed: 'Reservering bevestigd',
  refund_requested: 'Terugbetaling aangevraagd',
  refund_processing: 'Terugbetaling in behandeling',
  refunded: 'Terugbetaald',
  cancelled: 'Geannuleerd',
};

export const REFUND_STATUS_LABELS: Record<string, string> = {
  requested: 'Aangevraagd',
  approved: 'Goedgekeurd',
  processing: 'In behandeling',
  refunded: 'Terugbetaald',
  rejected: 'Afgewezen',
};

export const TIME_SLOTS = [
  '09:00 - 09:30',
  '10:00 - 10:30',
  '11:00 - 11:30',
  '13:00 - 13:30',
  '14:00 - 14:30',
  '15:00 - 15:30',
  '16:00 - 16:30',
  '17:00 - 17:30',
];

export const AMENITY_ICON_MAP: Record<string, string> = {
  wifi: 'Wifi',
  heating: 'Flame',
  equipped_kitchen: 'CookingPot',
  washing_machine: 'WashingMachine',
  dishwasher: 'Utensils',
  parking: 'SquareParking',
  balcony: 'DoorOpen',
  elevator: 'ArrowUpDown',
  garden: 'Trees',
  cellar: 'Warehouse',
  bike_storage: 'Bike',
  air_conditioning: 'Wind',
};

export const ADMIN_SESSION_COOKIE = 'renl_admin_session';
export const FAVORITES_COOKIE = 'renl_favorites';
