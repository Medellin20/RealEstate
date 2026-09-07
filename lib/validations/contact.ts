import { z } from 'zod';
import { optionalDutchPhoneSchema } from './phone';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Merci d’indiquer votre nom.'),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: optionalDutchPhoneSchema,
  subject: z.string().trim().min(3, 'Merci d’indiquer un sujet.'),
  message: z.string().trim().min(10, 'Votre message doit contenir au moins 10 caractères.').max(3000),
  website: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
