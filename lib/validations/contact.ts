import { z } from 'zod';
import { optionalDutchPhoneSchema } from './phone';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Vul uw naam in.'),
  email: z.string().trim().email('Ongeldig e-mailadres.'),
  phone: optionalDutchPhoneSchema,
  subject: z.string().trim().min(3, 'Vul een onderwerp in.'),
  message: z.string().trim().min(10, 'Uw bericht moet minimaal 10 tekens bevatten.').max(3000),
  website: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
