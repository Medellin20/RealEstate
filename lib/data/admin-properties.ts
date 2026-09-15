import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

type AdminPropertiesParams = {
  page?: number;
  search?: string;
  status?: string;
};

export function buildPropertySearchFilter(search: string) {
  // Quote PostgREST values and escape LIKE wildcards so input stays literal.
  const pattern = `%${search.replace(/[\\%_*]/g, '\\$&')}%`;
  const value = JSON.stringify(pattern);
  const filters = ['title', 'city', 'neighborhood', 'address', 'postal_code', 'slug']
    .map((column) => `${column}.ilike.${value}`);
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search)) {
    filters.push(`id.eq.${search}`);
  }
  const price = search.replace(/€/g, '').replace(/\s/g, '').replace(',', '.');
  if (/^\d+(?:\.\d{1,2})?$/.test(price) && Number.isFinite(Number(price))) {
    filters.push(`monthly_price.eq.${Number(price)}`);
  }
  return filters.join(',');
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

  const search = params.search?.trim();
  if (search) query = query.or(buildPropertySearchFilter(search));
  if (params.status && ['draft', 'available', 'reserved', 'rented', 'unavailable'].includes(params.status)) {
    query = query.eq('status', params.status);
  }

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
