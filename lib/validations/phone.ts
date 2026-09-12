import { z } from 'zod';

export const dutchPhoneSchema = z
  .string()
  .regex(/^\+31 \d{9}$/, 'Gebruik het formaat +31 gevolgd door 9 cijfers (bijv. +31 635219711).');
export const optionalDutchPhoneSchema = dutchPhoneSchema.optional().or(z.literal(''));
