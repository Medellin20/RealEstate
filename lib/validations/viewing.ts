import { z } from 'zod';
import { dutchPhoneSchema } from './phone';

export const viewingRequestSchema = z.object({
  propertyId: z
    .string()
    .uuid('Identifiant du logement invalide.'),

  requestedDate: z
    .string()
    .min(1, 'Merci de choisir une date.')
    .refine(
      (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(`${value}T00:00:00`);
        selectedDate.setHours(0, 0, 0, 0);

        return selectedDate >= today;
      },
      {
        message: 'La date doit être aujourd’hui ou dans le futur.',
      }
    ),

  requestedTimeSlot: z
    .string()
    .min(1, 'Merci de choisir un créneau horaire.'),

  firstName: z
    .string()
    .trim()
    .min(2, 'Le prénom doit contenir au moins 2 caractères.'),

  lastName: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères.'),

  email: z
    .string()
    .trim()
    .email('Adresse e-mail invalide.'),

  phone: dutchPhoneSchema,
});

export type ViewingRequestInput = z.infer<typeof viewingRequestSchema>;