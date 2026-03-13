import { z } from 'zod';

import { DAY_OF_WEEK_VALUES } from './types';

export const foodItemSchema = z.object({
  catalogItemId: z.string().uuid().nullable().optional(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().default(''),
  calorias: z.number().int().min(0),
  imagen: z.string().default(''),
  tipo: z.string().min(1, 'El tipo es obligatorio'),
});

const optionalFoodItemSchema = z.object({
  catalogItemId: z.string().uuid().nullable().optional(),
  nombre: z.string().default(''),
  descripcion: z.string().default(''),
  calorias: z.number().int().min(0).default(0),
  imagen: z.string().default(''),
  tipo: z.string().default(''),
});

const menuSlotSchema = z.object({
  platilloPrincipal: foodItemSchema,
  guarnicion1: optionalFoodItemSchema.nullable().optional(),
  guarnicion2: optionalFoodItemSchema.nullable().optional(),
  contenedor: z.string().nullable().optional(),
  adicionales: z.array(foodItemSchema),
});

const dayMenuSchema = z.object({
  dayOfWeek: z.enum(DAY_OF_WEEK_VALUES),
  desayuno: menuSlotSchema,
  comida: menuSlotSchema,
  cena: menuSlotSchema,
  snack1: menuSlotSchema,
  snack2: menuSlotSchema,
});

export const weeklyMenuInputSchema = z
  .object({
    name: z.string().min(2, 'Nombre de menú muy corto'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    days: z.array(dayMenuSchema).length(7, 'El menú debe tener exactamente 7 días'),
  })
  .superRefine((value, ctx) => {
    if (value.startDate > value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'La fecha de inicio debe ser menor o igual a la fecha final',
      });
    }

    const unique = new Set(value.days.map((day) => day.dayOfWeek));
    if (unique.size !== 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['days'],
        message: 'No se deben repetir días de la semana',
      });
    }
  });

export type WeeklyMenuInputParsed = z.infer<typeof weeklyMenuInputSchema>;
export const foodCatalogItemInputSchema = foodItemSchema;
export type FoodCatalogItemInputParsed = z.infer<typeof foodCatalogItemInputSchema>;
