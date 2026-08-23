import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { PropertyGrid } from '@/components/properties/property-grid';
import { PropertyFilters } from '@/components/properties/property-filters';
import { Pagination } from '@/components/properties/pagination';
import { getAvailableCities, getAvailableCityCounts, getPublishedProperties } from '@/lib/data/properties';
import type { PropertyFilters as Filters } from '@/types';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Appartements à louer aux Pays-Bas',
  description:
    'Parcourez nos appartements à louer, organisés par ville aux Pays-Bas. Filtrez par ville, budget et nombre de chambres.',
};

interface PageProps {
  searchParams: {
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    type?: string;
    furnished?: string;
    sort?: string;
    page?: string;
  };
}

export default async function AppartementsPage({ searchParams }: PageProps) {
  if (!searchParams.city) {
    const cities = await getAvailableCityCounts();
    return (
      <div className="container-app py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="text-display-sm font-extrabold text-ink-900 sm:text-display-md">Choisissez une ville aux Pays-Bas</h1>
          <p className="mt-2 max-w-2xl text-ink-500">Cliquez sur une ville pour afficher tous les appartements qui s’y trouvent.</p>
        </div>
        {cities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map(({ city, count }) => (
              <Link key={city} href={`/appartements?city=${encodeURIComponent(city)}`} className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-canal-300 hover:shadow-card">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canal-50 text-canal-600"><MapPin className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1"><span className="block text-lg font-bold text-ink-900">{city}</span><span className="text-sm text-ink-400">{count} appartement{count > 1 ? 's' : ''}</span></span>
                <ArrowRight className="h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-canal-600" />
              </Link>
            ))}
          </div>
        ) : <p className="rounded-2xl bg-sand-100 p-6 text-ink-500">Aucune ville ne contient encore d’appartement publié.</p>}
      </div>
    );
  }

  const filters: Filters = {
    city: searchParams.city,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    bedrooms: searchParams.bedrooms ? Number(searchParams.bedrooms) : undefined,
    propertyType: searchParams.type,
    furnished: (searchParams.furnished as Filters['furnished']) || undefined,
    sort: (searchParams.sort as Filters['sort']) || 'recent',
    page: searchParams.page ? Number(searchParams.page) : 1,
  };

  const [{ properties, total, page, pageSize }, cities] = await Promise.all([
    getPublishedProperties(filters),
    getAvailableCities(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Appartements à {filters.city}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Découvrez tous nos logements disponibles à {filters.city}, aux Pays-Bas.
        </p>
      </div>

      <Link href="/appartements" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-canal-700 hover:underline">← Changer de ville</Link>
      <PropertyFilters resultCount={total} cities={cities} />
      <PropertyGrid properties={properties} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/appartements"
        searchParams={searchParams}
      />
    </div>
  );
}
