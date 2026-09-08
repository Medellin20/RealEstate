import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, PlusCircle, Search } from 'lucide-react';
import { getAllPropertiesAdmin } from '@/lib/data/admin-properties';
import { PropertyRowActions } from '@/components/admin/property-row-actions';
import { Pagination } from '@/components/properties/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AutoSubmitSelect } from '@/components/admin/auto-submit-select';
import { Badge, StatusDot } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DUTCH_CITIES, PROPERTY_STATUS_LABELS } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Appartementen' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; city?: string; postalCode?: string; minPrice?: string; maxPrice?: string; page?: string };
}) {
  const requestedPage = Number(searchParams.page);
  const status = Object.hasOwn(PROPERTY_STATUS_LABELS, searchParams.status ?? '') ? searchParams.status : undefined;
  const city = DUTCH_CITIES.includes(searchParams.city as (typeof DUTCH_CITIES)[number]) ? searchParams.city : undefined;
  const postalCode = searchParams.postalCode?.replace(/[^a-zA-Z0-9 ]/g, '').trim() || undefined;
  const minPrice = Number(searchParams.minPrice);
  const maxPrice = Number(searchParams.maxPrice);
  const validMinPrice = Number.isFinite(minPrice) && minPrice >= 0 ? minPrice : undefined;
  const validMaxPrice = Number.isFinite(maxPrice) && maxPrice >= 0 ? maxPrice : undefined;
  const hasActiveFilters = Boolean(searchParams.search?.trim() || status || city || postalCode || validMinPrice !== undefined || validMaxPrice !== undefined);
  const { properties, total, page, pageSize } = await getAllPropertiesAdmin({
    search: searchParams.search,
    status,
    city,
    postalCode,
    minPrice: validMinPrice,
    maxPrice: validMaxPrice,
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Appartementen</h1>
          <p className="mt-1 text-sm text-ink-500">{total} woning(en) in totaal.</p>
        </div>
        <Link href="/admin/appartements/nouveau" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Appartement toevoegen
          </Button>
        </Link>
      </div>

      <form role="search" className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap" action="/admin/appartements" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input name="search" placeholder="Zoeken par titre of ville..." defaultValue={searchParams.search} className="pl-10" />
        </div>
        <div className="relative sm:w-48">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input name="postalCode" placeholder="Postcode" defaultValue={postalCode} className="pl-10" />
        </div>
        <Input name="minPrice" type="number" min="0" step="0.01" placeholder="prijs min." defaultValue={searchParams.minPrice} className="sm:w-36" />
        <Input name="maxPrice" type="number" min="0" step="0.01" placeholder="prijs max." defaultValue={searchParams.maxPrice} className="sm:w-36" />
        <AutoSubmitSelect name="status" defaultValue={status} className="sm:w-52">
          <option value="">alle de statuts</option>
          <option value="draft">Concept</option>
          <option value="available">Beschikbaar</option>
          <option value="reserved">Gereserveerd</option>
          <option value="rented">Verhuurd</option>
          <option value="unavailable">Niet beschikbaar</option>
        </AutoSubmitSelect>
        <AutoSubmitSelect name="city" defaultValue={city} className="sm:w-52">
          <option value="">Alle steden</option>
          {DUTCH_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </AutoSubmitSelect>
        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4" />
          Zoeken
        </Button>
        {hasActiveFilters && (
          <Link href="/admin/appartements" className="inline-flex h-11 items-center justify-center rounded-xl px-3.5 text-sm font-medium text-ink-500 hover:bg-sand-100 hover:text-ink-900">
            Resetten
          </Link>
        )}
      </form>

      {properties.length === 0 ? (
        <EmptyState title="Geen appartementen gevonden" description="Ajoutez uw premier woning voor commencer." />
      ) : (
        <>
          {/* Vue tableau — desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-ink-100 bg-white lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-sand-100/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-3">woning</th>
                  <th className="px-4 py-3">Stad</th>
                  <th className="px-4 py-3">Prijs</th>
                  <th className="px-4 py-3">Gepubliceerd</th>
                  <th className="px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {properties.map((property: any) => {
                  const primaryImage =
                    property.property_images?.find((i: any) => i.is_primary) ?? property.property_images?.[0];
                  const statusMeta = PROPERTY_STATUS_LABELS[property.status];
                  return (
                    <tr key={property.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                            {primaryImage && (
                              <Image src={primaryImage.url} alt="" fill sizes="64px" className="object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink-900">{property.title}</p>
                            <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-400">
                              <StatusDot colorClass={statusMeta.colorClass} />
                              {statusMeta.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-600">{property.city}</td>
                      <td className="px-4 py-3 font-medium text-ink-800">{formatPrice(property.monthly_price)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={property.is_published ? 'available' : 'default'}>
                          {property.is_published ? 'Gepubliceerd' : 'Concept'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <PropertyRowActions id={property.id} isPublished={property.is_published} status={property.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vue cartes — mobile / tablette */}
          <div className="space-y-4 lg:hidden">
            {properties.map((property: any) => {
              const primaryImage =
                property.property_images?.find((i: any) => i.is_primary) ?? property.property_images?.[0];
              const statusMeta = PROPERTY_STATUS_LABELS[property.status];
              return (
                <div key={property.id} className="rounded-2xl border border-ink-100 bg-white p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      {primaryImage && <Image src={primaryImage.url} alt="" fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-900">{property.title}</p>
                      <p className="text-xs text-ink-400">{property.city}</p>
                      <p className="mt-0.5 text-sm font-medium text-ink-700">{formatPrice(property.monthly_price)}</p>
                    </div>
                    <Badge className="shrink-0" variant={property.is_published ? 'available' : 'default'}>
                      {property.is_published ? 'Gepubliceerd' : 'Concept'}
                    </Badge>
                  </div>
                  <div className="mt-3 border-t border-ink-100 pt-3">
                    <PropertyRowActions id={property.id} isPublished={property.is_published} status={property.status} />
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/appartements"
            searchParams={{
              search: searchParams.search?.trim() || undefined,
              status,
              city,
              postalCode,
              minPrice: validMinPrice?.toString(),
              maxPrice: validMaxPrice?.toString(),
            }}
          />
        </>
      )}
    </div>
  );
}
