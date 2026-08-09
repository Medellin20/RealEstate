import { MapPin } from 'lucide-react';

export function PropertyLocation({
  city,
  neighborhood,
  latitude,
  longitude,
}: {
  city: string;
  neighborhood?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const delta = 0.01;
  const bbox = hasCoords
    ? `${longitude! - delta}%2C${latitude! - delta}%2C${longitude! + delta}%2C${latitude! + delta}`
    : undefined;
  const src = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : undefined;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm text-ink-500">
        <MapPin className="h-4 w-4 text-canal-600" />
        <span>
          {neighborhood ? `${neighborhood}, ${city}` : city} — l’adresse exacte est communiquée lors
          de la confirmation de votre visite.
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-ink-100">
        {src ? (
          <iframe
            title="Localisation approximative du logement"
            src={src}
            className="h-72 w-full sm:h-96"
            loading="lazy"
          />
        ) : (
          <div className="flex h-72 items-center justify-center bg-sand-200 text-sm text-ink-400 sm:h-96">
            Carte non disponible pour ce logement
          </div>
        )}
      </div>
    </div>
  );
}
