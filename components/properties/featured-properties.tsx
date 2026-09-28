import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
  Ruler,
  Sparkles,
} from 'lucide-react';
import type { PropertyType, PropertyWithRelations } from '@/types/database';
import { SectionHeading } from '@/components/ui/section-heading';

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  appartement: 'Appartement',
  studio: 'Studio',
  maison: 'Woning',
  chambre: 'Kamer',
  loft: 'Loft',
  duplex: 'Duplex',
};

const priceFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('nl-NL', {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Amsterdam',
});

function getAvailability(property: PropertyWithRelations) {
  if (property.status === 'reserved') return 'Gereserveerd';
  if (property.status === 'rented') return 'Verhuurd';
  if (property.status !== 'available') return 'Beschikbaarheid op aanvraag';

  if (property.available_from) {
    const today = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Amsterdam',
    }).format(new Date());
    if (property.available_from > today) {
      return `Beschikbaar vanaf ${dateFormatter.format(new Date(`${property.available_from}T12:00:00`))}`;
    }
  }

  return 'Direct beschikbaar';
}

export function FeaturedProperties({
  properties,
}: {
  properties: PropertyWithRelations[];
}) {
  const repeatedProperties = properties.length > 0 ? [...properties, ...properties] : [];

  return (
    <section className="border-y border-ink-100 bg-white py-16 sm:py-20">
      <div className="container-app">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading
            eyebrow="Uitgelicht"
            title="Appartements à la une"
            description="Ontdek onze uitgelichte woningen, zorgvuldig geselecteerd op toplocaties in Nederland."
          />
          <Link
            href="/appartements"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-700 transition-colors hover:bg-sand-100"
          >
            Alle appartementen
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="mt-9 overflow-hidden">
            <div className="flex w-max min-w-full animate-marquee gap-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:animate-none">
              {repeatedProperties.map((property, index) => {
                const primaryImage =
                  property.property_images.find((image) => image.is_primary) ??
                  property.property_images[0];

                return (
                  <article
                    key={`${property.id}-${index}`}
                    className="group w-[calc(100vw-2.5rem)] max-w-[360px] shrink-0 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted sm:w-[320px]"
                  >
                    <Link
                      href={`/appartements/${property.slug}`}
                      className="relative block aspect-[4/3] overflow-hidden bg-sand-200"
                      aria-label={`Bekijk ${property.title}`}
                    >
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.alt_text || property.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-300">
                          <Building2 className="h-10 w-10" aria-hidden="true" />
                        </div>
                      )}
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink-800 shadow-soft">
                        <Sparkles className="h-3.5 w-3.5 text-brick-500" aria-hidden="true" />
                        Uitgelicht
                      </span>
                      <span className="absolute bottom-4 left-4 rounded-full bg-ink-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                        {getAvailability(property)}
                      </span>
                    </Link>

                    <div className="p-5">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-canal-700">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {property.neighborhood ? `${property.neighborhood}, ` : ''}
                          {property.city}
                        </span>
                      </p>
                      <Link href={`/appartements/${property.slug}`} className="mt-2 block">
                        <h3 className="truncate text-lg font-bold text-ink-900 transition-colors group-hover:text-canal-700">
                          {property.title}
                        </h3>
                      </Link>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
                        <span>{PROPERTY_TYPE_LABELS[property.property_type]}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Ruler className="h-4 w-4 text-ink-400" aria-hidden="true" />
                          {numberFormatter.format(property.surface_m2)} m²
                        </span>
                      </div>

                      <p className="mt-4 border-t border-ink-100 pt-4">
                        <span className="text-xl font-extrabold text-ink-900">
                          {priceFormatter.format(property.monthly_price)}
                        </span>
                        <span className="ml-1 text-sm text-ink-400">/ maand</span>
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Link
                          href={`/appartements/${property.slug}`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink-700 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-ink-800"
                        >
                          Bekijk appartement
                          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                        </Link>
                        <Link
                          href={`/appartements/${property.slug}/visite`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-canal-200 bg-canal-50 px-3 py-2 text-center text-sm font-semibold text-canal-800 transition-colors hover:bg-canal-100"
                        >
                          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                          Bezichtiging aanvragen
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-9 rounded-2xl border border-dashed border-ink-200 bg-sand-50 p-6 text-center text-ink-500">
            Er zijn momenteel geen uitgelichte appartementen beschikbaar.
          </p>
        )}
      </div>
    </section>
  );
}
