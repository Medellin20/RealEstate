import type { Property } from '@/types/database';
import { getSiteUrl } from '@/lib/utils/site-url';

type EmailDetails = Record<string, string | number | null | undefined>;

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/**
 * Transforme les caractéristiques d'un logement en lignes lisibles dans les
 * alertes e-mail administrateur.
 */
export function getPropertyEmailDetails(
  property: Property,
  amenityLabels: string[]
): EmailDetails {
  const address = [
    property.address,
    [property.postal_code, property.city].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  return {
    Logement: property.title,
    'Lien vers l’annonce': `${getSiteUrl()}/appartements/${property.slug}`,
    Type: property.property_type,
    Adresse: address || property.city,
    Quartier: property.neighborhood,
    Description: property.description || undefined,
    'Loyer mensuel': formatPrice(property.monthly_price),
    'Charges mensuelles': formatPrice(property.service_charges),
    'Dépôt de garantie': formatPrice(property.deposit_amount),
    'Frais de visite': formatPrice(property.viewing_fee),
    Surface: `${property.surface_m2} m²`,
    Chambres: property.bedrooms,
    'Salles de bain': property.bathrooms,
    Pièces: property.rooms,
    Étage: property.floor === null ? undefined : property.floor === 0 ? 'Rez-de-chaussée' : `${property.floor}e étage`,
    'Nombre d’étages': property.floors_count,
    Volume: property.volume_m3 === null ? undefined : `${property.volume_m3} m³`,
    Contrat: property.contract_type,
    Intérieur: property.interior_type,
    Meublé: property.is_furnished ? 'Oui' : 'Non',
    'État d’entretien': property.maintenance_condition,
    Construction: property.construction_type,
    'Année de construction': property.construction_year,
    'Label énergétique': property.energy_label,
    Ascenseur: property.has_elevator ? 'Oui' : 'Non',
    Balcon: property.has_balcony ? 'Oui' : 'Non',
    Terrasse: property.has_terrace ? 'Oui' : 'Non',
    Parking: property.has_parking ? 'Oui' : 'Non',
    Garage: property.has_garage ? 'Oui' : 'Non',
    Jardin: property.has_garden ? 'Oui' : 'Non',
    Équipements: amenityLabels.length > 0 ? amenityLabels.join(', ') : 'Aucun renseigné',
    'Disponible à partir du': property.available_from
      ? formatDate(property.available_from)
      : 'Immédiatement',
    'Durée minimale de location': property.minimum_stay_months
      ? `${property.minimum_stay_months} mois`
      : undefined,
  };
}
