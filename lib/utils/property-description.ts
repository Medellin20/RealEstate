import type { Property } from '@/types/database';
import type { PropertyInput } from '@/lib/validations/property';

type DescriptionSource = Pick<
  PropertyInput,
  | 'propertyType'
  | 'city'
  | 'neighborhood'
  | 'monthlyPrice'
  | 'serviceCharges'
  | 'depositAmount'
  | 'surfaceM2'
  | 'bedrooms'
  | 'bathrooms'
  | 'floor'
  | 'interiorType'
  | 'hasElevator'
  | 'hasBalcony'
  | 'hasTerrace'
  | 'hasParking'
  | 'hasGarage'
  | 'hasGarden'
  | 'availableFrom'
>;

const PROPERTY_TYPES: Record<DescriptionSource['propertyType'], { label: string; article: string }> = {
  appartement: { label: 'appartement', article: 'cet' },
  studio: { label: 'studio', article: 'ce' },
  maison: { label: 'maison', article: 'cette' },
  chambre: { label: 'chambre', article: 'cette' },
  loft: { label: 'loft', article: 'ce' },
  duplex: { label: 'duplex', article: 'ce' },
};

function formatEuro(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function joinFrench(values: string[]) {
  if (values.length < 2) return values[0] ?? '';
  if (values.length === 2) return `${values[0]} et ${values[1]}`;
  return `${values.slice(0, -1).join(', ')} et ${values.at(-1)}`;
}

function formatFloor(floor: number | undefined) {
  if (floor === undefined) return null;
  if (floor === 0) return 'au rez-de-chaussée';
  return `au ${floor === 1 ? '1er' : `${floor}e`} étage`;
}

/** Génère une description factuelle à partir des données administratives du bien. */
export function generatePropertyDescription(source: DescriptionSource, amenityLabels: string[] = []) {
  const type = PROPERTY_TYPES[source.propertyType];
  const location = source.neighborhood?.trim()
    ? `dans le quartier de ${source.neighborhood.trim()}, à ${source.city}`
    : `à ${source.city}`;
  const interior = source.interiorType.trim().toLocaleLowerCase('fr-FR');
  const firstSentence = `Découvrez ${type.article} ${type.label} ${interior} de ${source.surfaceM2} m², situé ${location}.`;

  const rooms = [
    `${source.bedrooms} chambre${source.bedrooms > 1 ? 's' : ''}`,
    `${source.bathrooms} salle${source.bathrooms > 1 ? 's' : ''} de bain`,
    formatFloor(source.floor),
  ].filter((value): value is string => Boolean(value));
  const detailsSentence = `Il comprend ${joinFrench(rooms)}.`;

  const features = [
    source.hasElevator && 'un ascenseur',
    source.hasBalcony && 'un balcon',
    source.hasTerrace && 'une terrasse',
    source.hasParking && 'un parking',
    source.hasGarage && 'un garage',
    source.hasGarden && 'un jardin',
    ...amenityLabels.map((label) => label.trim()).filter(Boolean),
  ].filter((value): value is string => Boolean(value));
  const featureSentence = features.length > 0 ? `Il bénéficie également des équipements suivants : ${joinFrench(features)}.` : '';

  const availabilityDate = source.availableFrom ? formatDate(source.availableFrom) : null;
  const availabilitySentence = availabilityDate ? `Il est disponible à partir du ${availabilityDate}.` : '';
  const chargesSentence = source.serviceCharges > 0
    ? `Des charges mensuelles de ${formatEuro(source.serviceCharges)} s’ajoutent au loyer.`
    : '';
  const depositSentence = source.depositAmount > 0
    ? `Le dépôt de garantie est de ${formatEuro(source.depositAmount)}.`
    : '';

  return [
    firstSentence,
    detailsSentence,
    featureSentence,
    availabilitySentence,
    `Le loyer mensuel est de ${formatEuro(source.monthlyPrice)}.`,
    chargesSentence,
    depositSentence,
  ].filter(Boolean).join(' ');
}

export function generatePropertyDescriptionFromProperty(property: Property, amenityLabels: string[] = []) {
  return generatePropertyDescription({
    propertyType: property.property_type,
    city: property.city,
    neighborhood: property.neighborhood ?? '',
    monthlyPrice: property.monthly_price,
    serviceCharges: property.service_charges,
    depositAmount: property.deposit_amount,
    surfaceM2: property.surface_m2,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    floor: property.floor ?? undefined,
    interiorType: property.interior_type,
    hasElevator: property.has_elevator,
    hasBalcony: property.has_balcony,
    hasTerrace: property.has_terrace,
    hasParking: property.has_parking,
    hasGarage: property.has_garage,
    hasGarden: property.has_garden,
    availableFrom: property.available_from ?? '',
  }, amenityLabels);
}
