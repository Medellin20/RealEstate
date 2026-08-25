import { z } from 'zod';
export const propertySchema = z.object({
  title: z.string().trim().min(5, 'Le titre doit contenir au moins 5 caractères.'),
  slug: z
    .string()
    .trim()
    .min(5, 'Le slug doit contenir au moins 5 caractères.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug ne doit contenir que des minuscules, chiffres et tirets.'),
  propertyType: z.enum(['appartement', 'studio', 'maison', 'chambre', 'loft', 'duplex']),

  address: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Merci d’indiquer la ville de l’appartement.'),
  postalCode: z.string().trim().optional().or(z.literal('')),
  neighborhood: z.string().trim().optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),

  monthlyPrice: z.coerce.number().positive('Le prix mensuel doit être positif.'),
  serviceCharges: z.coerce.number().min(0).default(0),
  depositAmount: z.coerce.number().min(0).default(0),
  viewingFee: z.coerce.number().min(0).default(0),

  surfaceM2: z.coerce.number().positive('La surface doit être positive.'),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  rooms: z.coerce.number().int().min(0).optional(),
  floor: z.coerce.number().int().optional(),
  floorsCount: z.coerce.number().int().min(1).optional(),
  volumeM3: z.coerce.number().positive().optional(),
  contractType: z.string().trim().min(2),
  interiorType: z.string().trim().min(2),
  maintenanceCondition: z.string().trim().min(2),
  constructionType: z.string().trim().min(2),
  constructionYear: z.coerce.number().int().min(1000).max(2200).optional(),
  energyLabel: z.string().trim().optional().or(z.literal('')),

  hasElevator: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasGarage: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  isFurnished: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),

  availableFrom: z.string().optional().or(z.literal('')),
  minimumStayMonths: z.coerce.number().int().min(1).default(12),

  status: z.enum(['draft', 'available', 'reserved', 'rented', 'unavailable']),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),

  amenityIds: z.array(z.string().uuid()).default([]),
});

export type PropertyInput = z.infer<typeof propertySchema>;
