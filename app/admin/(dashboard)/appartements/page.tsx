import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import { getAllPropertiesAdmin } from '@/lib/data/admin-properties';
import { PropertySearch } from '@/components/admin/property-search';
import { PropertyRowActions } from '@/components/admin/property-row-actions';
import { Pagination } from '@/components/properties/pagination';
import { Button } from '@/components/ui/button';
import { Badge, StatusDot } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PROPERTY_STATUS_LABELS } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Appartementen' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const requestedPage = Number(searchParams.page);
  const { properties, total, page, pageSize } = await getAllPropertiesAdmin({
    search: searchParams.search,
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

      <PropertySearch search={searchParams.search ?? ''} />

      <div aria-live="polite" aria-atomic="true" className="sr-only">{total} appartement(s) trouvé(s)</div>
      {properties.length === 0 ? (
        <EmptyState title="Aucun appartement trouvé" />
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
                            <Link href={`/admin/appartements/${property.id}`} className="block truncate font-semibold text-ink-900 hover:underline focus-visible:underline">{property.title}</Link>
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
                      <Link href={`/admin/appartements/${property.id}`} className="block truncate font-semibold text-ink-900 hover:underline focus-visible:underline">{property.title}</Link>
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
            searchParams={{ search: searchParams.search?.trim() || undefined }}
          />
        </>
      )}
    </div>
  );
}
