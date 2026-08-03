import { z } from 'zod';

import {
  CUSTOMER_SOURCE_VALUES,
  CUSTOMER_STATUS_VALUES,
  CUSTOMER_TYPE_VALUES,
  DAY_OF_WEEK_VALUES,
} from './types';

const REQUIRED_DAY_VALUES = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const;
const SLOT_KEYS = ['desayuno', 'comida', 'cena', 'snack1', 'snack2'] as const;

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
  platilloPrincipal: optionalFoodItemSchema,
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

function hasFoodItemContent(item: z.infer<typeof optionalFoodItemSchema> | null | undefined) {
  if (!item) {
    return false;
  }

  return Boolean(
    item.nombre?.trim()
    || item.descripcion?.trim()
    || item.imagen?.trim()
    || item.tipo?.trim()
    || (item.calorias ?? 0) > 0,
  );
}

function slotHasContent(slot: z.infer<typeof menuSlotSchema>) {
  return hasFoodItemContent(slot.platilloPrincipal)
    || hasFoodItemContent(slot.guarnicion1)
    || hasFoodItemContent(slot.guarnicion2)
    || Boolean(slot.contenedor?.trim())
    || slot.adicionales.length > 0;
}

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

    value.days.forEach((day, dayIndex) => {
      const isRequiredDay = REQUIRED_DAY_VALUES.includes(day.dayOfWeek as (typeof REQUIRED_DAY_VALUES)[number]);

      SLOT_KEYS.forEach((slotKey) => {
        const slot = day[slotKey];
        const mainDish = slot.platilloPrincipal;
        const mainDishHasContent = hasFoodItemContent(mainDish);

        if (isRequiredDay) {
          if (!mainDish?.nombre?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['days', dayIndex, slotKey, 'platilloPrincipal', 'nombre'],
              message: 'El nombre es obligatorio',
            });
          }

          if (!mainDish?.tipo?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['days', dayIndex, slotKey, 'platilloPrincipal', 'tipo'],
              message: 'El tipo es obligatorio',
            });
          }

          return;
        }

        if (slotHasContent(slot) && !mainDishHasContent) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['days', dayIndex, slotKey, 'platilloPrincipal', 'nombre'],
            message: 'Agrega un platillo principal o limpia el contenido de este tiempo.',
          });
        }

        if (mainDishHasContent) {
          if (!mainDish?.nombre?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['days', dayIndex, slotKey, 'platilloPrincipal', 'nombre'],
              message: 'El nombre es obligatorio',
            });
          }

          if (!mainDish?.tipo?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['days', dayIndex, slotKey, 'platilloPrincipal', 'tipo'],
              message: 'El tipo es obligatorio',
            });
          }
        }
      });
    });
  });

export type WeeklyMenuInputParsed = z.infer<typeof weeklyMenuInputSchema>;

export const ingredientInputSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del ingrediente es obligatorio').max(120),
  categoria: z.string().trim().min(1, 'La categoría es obligatoria').max(80),
});

export const recipeIngredientInputSchema = z.object({
  ingredientId: z.string().uuid('Selecciona un ingrediente'),
  cantidad: z.number().positive('La cantidad debe ser mayor que cero').max(999999),
  unidad: z.string().trim().min(1, 'La unidad de medida es obligatoria').max(50),
});

export const foodCatalogItemInputSchema = foodItemSchema.extend({
  preparacion: z.string().default(''),
  ingredientes: z.array(recipeIngredientInputSchema).default([]),
}).superRefine((value, ctx) => {
  const ingredientIds = new Set<string>();

  value.ingredientes.forEach((item, index) => {
    if (ingredientIds.has(item.ingredientId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ingredientes', index, 'ingredientId'],
        message: 'No puedes repetir el mismo ingrediente en una receta',
      });
    }

    ingredientIds.add(item.ingredientId);
  });
});
export type FoodCatalogItemInputParsed = z.infer<typeof foodCatalogItemInputSchema>;

const optionalTrimmedString = (max: number) => z.string().trim().max(max).default('');

export const customerInputSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(160),
  telefono: z.string().trim().min(7, 'Ingresa un teléfono válido').max(30),
  ubicacion1: z.string().trim().min(3, 'La ubicación principal es obligatoria').max(300),
  ubicacion2: optionalTrimmedString(300),
  correoElectronico: z.union([
    z.literal(''),
    z.string().trim().email('Ingresa un correo electrónico válido').max(254),
  ]).default(''),
  source: z.enum(CUSTOMER_SOURCE_VALUES),
  status: z.enum(CUSTOMER_STATUS_VALUES),
  tipoCliente: z.enum(CUSTOMER_TYPE_VALUES),
});

export const customerListQuerySchema = z.object({
  q: optionalTrimmedString(100),
  source: z.enum(CUSTOMER_SOURCE_VALUES).optional(),
  status: z.enum(CUSTOMER_STATUS_VALUES).optional(),
  tipoCliente: z.enum(CUSTOMER_TYPE_VALUES).optional(),
  cursor: z.string().trim().max(1000).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
