import { z } from 'zod';

export const reservationSchema = z.object({
  propertyId: z.string().uuid(),
  firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z.string().trim().min(8, 'Numéro de téléphone invalide.').max(20),
  desiredMoveInDate: z.string().min(1, 'Merci d’indiquer une date d’entrée souhaitée.'),
  durationMonths: z.coerce
    .number()
    .int()
    .min(1, 'La durée minimale est de 1 mois.')
    .max(60, 'Merci de contacter l’agence pour une durée supérieure à 5 ans.'),
  occupantsCount: z.coerce.number().int().min(1).max(10),
  profession: z.string().trim().min(2, 'Merci d’indiquer votre profession.'),
  monthlyIncome: z.coerce.number().min(0, 'Le revenu doit être un nombre positif.'),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  website: z.string().max(0).optional().or(z.literal('')),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
