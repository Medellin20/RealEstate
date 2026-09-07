import { z } from 'zod';

export const dutchPhoneSchema = z
  .string()
  .regex(/^\+31 \d{9}$/, 'Format requis : +31 suivi de 9 chiffres (ex. +31 635219711).');
export const optionalDutchPhoneSchema = dutchPhoneSchema.optional().or(z.literal(''));
