import type { Metadata } from 'next';
import { PropertyGrid } from '@/components/properties/property-grid';
import { PropertyFilters } from '@/components/properties/property-filters';
import { Pagination } from '@/components/properties/pagination';
import { getPublishedProperties } from '@/lib/data/properties';
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

  const { properties, total, page, pageSize } = await getPublishedProperties(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Appartements à louer aux Pays-Bas
        </h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          {filters.city
            ? `Découvrez nos logements disponibles à ${filters.city}.`
            : 'Découvrez nos logements disponibles, regroupés par ville aux Pays-Bas.'}
        </p>
      </div>

      <PropertyFilters resultCount={total} />
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
