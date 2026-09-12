import { z } from 'zod';
import { dutchPhoneSchema } from './phone';

export const viewingRequestSchema = z.object({
  propertyId: z
    .string()
    .uuid('Ongeldige woning-ID.'),

  requestedDate: z
    .string()
    .min(1, 'Kies een datum.')
    .refine(
      (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(`${value}T00:00:00`);
        selectedDate.setHours(0, 0, 0, 0);

        return selectedDate >= today;
      },
      {
        message: 'De datum moet vandaag of in de toekomst liggen.',
      }
    ),

  requestedTimeSlot: z
    .string()
    .min(1, 'Kies een tijdstip.'),

  firstName: z
    .string()
    .trim()
    .min(2, 'De voornaam moet minimaal 2 tekens bevatten.'),

  lastName: z
    .string()
    .trim()
    .min(2, 'De achternaam moet minimaal 2 tekens bevatten.'),

  email: z
    .string()
    .trim()
    .email('Ongeldig e-mailadres.'),

  phone: dutchPhoneSchema,
});

export type ViewingRequestInput = z.infer<typeof viewingRequestSchema>;