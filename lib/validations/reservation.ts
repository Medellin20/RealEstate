import { z } from 'zod';
import { dutchPhoneSchema } from './phone';

export const reservationSchema = z.object({
  propertyId: z.string().uuid(),
  firstName: z.string().trim().min(2, 'De voornaam moet minimaal 2 tekens bevatten.'),
  lastName: z.string().trim().min(2, 'De achternaam moet minimaal 2 tekens bevatten.'),
  email: z.string().trim().email('Ongeldig e-mailadres.'),
  phone: dutchPhoneSchema,
  desiredMoveInDate: z.string().min(1, 'Geef een gewenste verhuisdatum op.'),
  durationMonths: z.coerce
    .number()
    .int()
    .min(1, 'De minimale huurperiode is 1 maand.')
    .max(60, 'Neem contact op met het agentschap voor een huurperiode langer dan 5 jaar.'),
  occupantsCount: z.coerce.number().int().min(1, 'Geef minimaal één bewoner op.').max(10),
  hasPets: z.boolean().default(false),
  employmentContract: z.string().trim().min(1, 'Geef uw arbeidscontract op.'),
  monthlyIncome: z.coerce.number().min(0, 'Het inkomen moet een positief getal zijn.'),
  originCity: z.string().trim().min(2, 'Geef uw plaats van herkomst op.'),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
