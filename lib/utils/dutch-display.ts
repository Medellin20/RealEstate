const DUTCH_LABELS: Record<string, string> = {
  "Période indéterminée": "Onbepaalde duur",
  "Durée déterminée": "Bepaalde duur",
  "Location temporaire": "Tijdelijke verhuur",
  "Non meublé": "Ongemeubileerd",
  "Semi-meublé": "Gedeeltelijk gemeubileerd",
  "Meublé": "Gemeubileerd",
  "Excellent": "Uitstekend",
  "Bien": "Goed",
  "À rafraîchir": "Op te frissen",
  "À rénover": "Te renoveren",
  "Bâtiment existant": "Bestaand gebouw",
  "Construction neuve": "Nieuwbouw",
  "Chauffage": "Verwarming",
  "Cuisine équipée": "Ingerichte keuken",
  "Machine à laver": "Wasmachine",
  "Lave-vaisselle": "Vaatwasser",
  "Parking": "Parkeergelegenheid",
  "Balcon": "Balkon",
  "Ascenseur": "Lift",
  "Jardin": "Tuin",
  "Cave": "Kelder",
  "Local à vélos": "Fietsenberging",
  "Climatisation": "Airconditioning",
  "maison": "Woning",
  "chambre": "Kamer",
  "CDI": "Vast contract",
  "CDD": "Contract voor bepaalde tijd",
  "Indépendant": "Zelfstandig",
  "Intérim": "Tijdelijk contract",
  "Étudiant": "Student",
  "Autre": "Anders",
  "RIB de démonstration — ne pas effectuer de virement avant son remplacement dans l’espace administrateur.": "Demo-bankgegevens: voer geen overschrijving uit voordat deze in de beheeromgeving zijn vervangen."
};

/** Translate known display labels without changing persisted or submitted values. */
export function dutchLabel(value: string): string {
  return DUTCH_LABELS[value] ?? value;
}
