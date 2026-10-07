// Types générés manuellement pour correspondre à supabase/schema.sql.
// Si vous utilisez la CLI Supabase, vous pouvez régénérer ce fichier avec :
//   npx supabase gen types typescript --project-id <votre-projet> > types/database.ts

export type PropertyStatus = 'draft' | 'available' | 'reserved' | 'rented' | 'unavailable';
export type PropertyType = 'appartement' | 'studio' | 'maison' | 'chambre' | 'loft' | 'duplex';

export type ViewingStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type ReservationStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'awaiting_guarantee'
  | 'guarantee_paid'
  | 'confirmed'
  | 'cancelled';

export type GuaranteeStatus =
  | 'awaiting_payment'
  | 'payment_declared'
  | 'payment_received'
  | 'reservation_confirmed'
  | 'refund_requested'
  | 'refund_processing'
  | 'refunded'
  | 'cancelled';

export type RefundStatus = 'requested' | 'approved' | 'processing' | 'refunded' | 'rejected';
export type ContactStatus = 'new' | 'in_progress' | 'closed';

export interface Client {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profession: string | null;
  monthly_income: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  property_type: PropertyType;
  address: string | null;
  city: string;
  postal_code: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  monthly_price: number;
  service_charges: number;
  deposit_amount: number;
  viewing_fee: number;
  surface_m2: number;
  bedrooms: number;
  bathrooms: number;
  rooms: number | null;
  floor: number | null;
  floors_count: number | null;
  volume_m3: number | null;
  contract_type: string;
  interior_type: string;
  maintenance_condition: string;
  construction_type: string;
  construction_year: number | null;
  energy_label: string | null;
  has_elevator: boolean;
  has_balcony: boolean;
  has_terrace: boolean;
  has_parking: boolean;
  has_garage: boolean;
  has_garden: boolean;
  is_furnished: boolean;
  available_from: string | null;
  minimum_stay_months: number | null;
  status: PropertyStatus;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Amenity {
  id: string;
  key: string;
  label_fr: string;
  icon: string | null;
}

export interface PropertyWithRelations extends Property {
  property_images: PropertyImage[];
  amenities: Amenity[];
}

export interface ViewingRequest {
  id: string;
  reference: string;
  property_id: string;
  client_id: string;
  requested_date: string;
  requested_time_slot: string;
  status: ViewingStatus;
  fee_amount: number;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  reference: string;
  property_id: string;
  client_id: string;
  desired_move_in_date: string;
  duration_months: number;
  occupants_count: number;
  has_pets: boolean;
  profession: string | null;
  monthly_income: number | null;
  employment_contract: string | null;
  origin_city: string | null;
  message: string | null;
  status: ReservationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestSubmission {
  id: string;
  request_type: 'viewing' | 'reservation_payment';
  source_id: string;
  reference: string;
  property_id: string;
  client_id: string;
  form_data: Record<string, unknown>;
  created_at: string;
}

export interface GuaranteePayment {
  id: string;
  reference: string;
  reservation_id: string;
  client_id: string;
  amount: number;
  status: GuaranteeStatus;
  declared_transfer_date: string | null;
  declared_bank_name: string | null;
  declared_reference: string | null;
  proof_storage_path: string | null;
  validated_at: string | null;
  validated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RefundRequest {
  id: string;
  reference: string;
  guarantee_payment_id: string;
  reservation_id: string;
  client_id: string;
  amount: number;
  reason: string | null;
  status: RefundStatus;
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankSettings {
  id: number;
  beneficiary_name: string;
  iban: string;
  bic: string;
  bank_name: string;
  payment_instructions: string;
  default_deposit_amount: number;
  show_on_confirmations: boolean;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
}

export interface AdminLog {
  id: string;
  actor: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  entity_type: string;
  entity_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string;
  note: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  session_id: string;
  property_id: string;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  footer_phone: string;
  payment_link: string;
  show_payment_link: boolean;
  viewing_fee: number;
  updated_at: string;
}

type Table<Row extends object, Relations extends Relationship[] = []> = {
  Row: { [Column in keyof Row]: Row[Column] };
  Insert: Partial<{ [Column in keyof Row]: Row[Column] }>;
  Update: Partial<{ [Column in keyof Row]: Row[Column] }>;
  Relationships: Relations;
};

type Relationship<
  Columns extends string = string,
  ReferencedRelation extends string = string,
  ReferencedColumns extends string = string,
> = {
  foreignKeyName: string;
  columns: [Columns];
  isOneToOne: false;
  referencedRelation: ReferencedRelation;
  referencedColumns: [ReferencedColumns];
};

// Table Database générique utilisée par le client Supabase typé.
export interface Database {
  public: {
    Tables: {
      clients: Table<Client>;
      properties: Table<Property>;
      property_images: Table<
        PropertyImage,
        [Relationship<'property_id', 'properties', 'id'>]
      >;
      amenities: Table<Amenity>;
      property_amenities: Table<
        { property_id: string; amenity_id: string },
        [
          Relationship<'property_id', 'properties', 'id'>,
          Relationship<'amenity_id', 'amenities', 'id'>,
        ]
      >;
      viewing_requests: Table<
        ViewingRequest,
        [
          Relationship<'property_id', 'properties', 'id'>,
          Relationship<'client_id', 'clients', 'id'>,
        ]
      >;
      reservations: Table<
        Reservation,
        [
          Relationship<'property_id', 'properties', 'id'>,
          Relationship<'client_id', 'clients', 'id'>,
        ]
      >;
      request_submissions: Table<
        RequestSubmission,
        [
          Relationship<'property_id', 'properties', 'id'>,
          Relationship<'client_id', 'clients', 'id'>,
        ]
      >;
      guarantee_payments: Table<
        GuaranteePayment,
        [
          Relationship<'reservation_id', 'reservations', 'id'>,
          Relationship<'client_id', 'clients', 'id'>,
        ]
      >;
      refund_requests: Table<
        RefundRequest,
        [
          Relationship<'guarantee_payment_id', 'guarantee_payments', 'id'>,
          Relationship<'reservation_id', 'reservations', 'id'>,
          Relationship<'client_id', 'clients', 'id'>,
        ]
      >;
      bank_settings: Table<BankSettings>;
      contact_messages: Table<ContactMessage>;
      admin_logs: Table<AdminLog>;
      status_history: Table<StatusHistory>;
      favorites: Table<Favorite>;
      site_settings: Table<SiteSettings>;
    };
    Views: {};
    Functions: {};
  };
}
