import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

type AdminPropertiesParams = {
  search?: string;
  status?: string;
  city?: string;
  postalCode?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
};

const SEARCHABLE_COLUMNS = ['title', 'city', 'slug', 'address', 'neighborhood', 'postal_code'];

function getSearchTerms(value: string) {
  return [...new Set(value
    .trim()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}-]/gu, ''))
    .filter((term) => term.length >= 2))];
}

export async function getAllPropertiesAdmin(params: AdminPropertiesParams = {}) {
  const supabase = createAdminClient();
  const pageSize = 12;
  const page = params.page && Number.isInteger(params.page) && params.page > 0 ? params.page : 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('properties')
    .select('*, property_images(id, url, is_primary)', { count: 'exact' })
    .order('created_at', { ascending: false });

  for (const term of getSearchTerms(params.search ?? '')) {
    query = query.or(SEARCHABLE_COLUMNS.map((column) => `${column}.ilike.*${term}*`).join(','));
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.city) {
    query = query.eq('city', params.city);
  }
  const postalCode = params.postalCode?.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  if (postalCode) {
    query = query.ilike('postal_code', `%${postalCode}%`);
  }
  if (params.minPrice !== undefined) query = query.gte('monthly_price', params.minPrice);
  if (params.maxPrice !== undefined) query = query.lte('monthly_price', params.maxPrice);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error('getAllPropertiesAdmin error:', error.message);
    return { properties: [], total: 0, page, pageSize };
  }
  return { properties: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getPropertyByIdAdmin(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(*), property_amenities(amenity_id)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getAllAmenities() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('amenities').select('*').order('label_fr');
  return data ?? [];
}
