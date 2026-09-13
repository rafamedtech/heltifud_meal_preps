import { z } from 'zod';

import {
  CUSTOMER_SOURCE_VALUES,
  CUSTOMER_STATUS_VALUES,
  CUSTOMER_TYPE_VALUES,
  COMPONENT_ROLE_VALUES,
  DAY_OF_WEEK_VALUES,
  EXPENSE_CATEGORY_VALUES,
  EXPENSE_PAYMENT_METHOD_VALUES,
  EXPENSE_TYPE_VALUES,
  ORDER_STATUS_VALUES,
  SLOT_TYPE_VALUES,
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
  firstDeliveryDay: z.enum(DAY_OF_WEEK_VALUES).nullable().optional(),
  secondDeliveryDay: z.enum(DAY_OF_WEEK_VALUES).nullable().optional(),
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

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Selecciona una fecha válida');

export const expenseInputSchema = z.object({
  description: z.string().trim().min(2, 'La descripción debe tener al menos 2 caracteres').max(160),
  amount: z.number().positive('El monto debe ser mayor que cero').max(9999999999.99),
  category: z.enum(EXPENSE_CATEGORY_VALUES),
  paymentMethod: z.enum(EXPENSE_PAYMENT_METHOD_VALUES),
  expenseDate: isoDateSchema,
  vendor: optionalTrimmedString(120),
  billingReference1: optionalTrimmedString(160),
  billingReference2: optionalTrimmedString(160),
  expenseType: z.enum(EXPENSE_TYPE_VALUES),
  isInvoiced: z.boolean(),
  notes: optionalTrimmedString(500),
});

export const expenseListQuerySchema = z.object({
  q: optionalTrimmedString(100),
  category: z.enum(EXPENSE_CATEGORY_VALUES).optional(),
  paymentMethod: z.enum(EXPENSE_PAYMENT_METHOD_VALUES).optional(),
  expenseType: z.enum(EXPENSE_TYPE_VALUES).optional(),
  invoiced: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  cursor: z.string().trim().max(1000).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
}).refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: 'La fecha inicial no puede ser posterior a la fecha final',
  path: ['from'],
});

export const planVariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, 'El nombre de la variante es obligatorio').max(80),
  daysCount: z.number().int().min(1).max(7),
  price: z.number().positive('El precio debe ser mayor que cero').max(99999999.99),
  isActive: z.boolean(),
});

export const planInputSchema = z.object({
  title: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  description: z.string().trim().min(2, 'La descripción es obligatoria').max(500),
  image: z.string().trim().min(1, 'La imagen es obligatoria').max(500),
  slotTypes: z.array(z.enum(SLOT_TYPE_VALUES)).min(1, 'Selecciona al menos un tiempo').max(5),
  isActive: z.boolean(),
  variants: z.array(planVariantInputSchema).min(1, 'Agrega al menos una variante').max(7),
}).superRefine((value, ctx) => {
  const days = new Set<number>();
  value.variants.forEach((variant, index) => {
    if (days.has(variant.daysCount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['variants', index, 'daysCount'],
        message: 'No puedes repetir la cantidad de días',
      });
    }
    days.add(variant.daysCount);
  });
});

export const orderCreateInputSchema = z.object({
  customerId: z.string().uuid('Selecciona un cliente'),
  planVariantId: z.string().uuid('Selecciona una variante de plan'),
  firstDeliveryDate: isoDateSchema,
  firstDeliveryLocation: z.union([z.literal(1), z.literal(2)]),
  secondDeliveryDate: isoDateSchema,
  secondDeliveryLocation: z.union([z.literal(1), z.literal(2)]),
  notes: optionalTrimmedString(1000),
}).refine((value) => value.secondDeliveryDate >= value.firstDeliveryDate, {
  path: ['secondDeliveryDate'],
  message: 'La segunda entrega no puede ser anterior a la primera',
});

export const orderMenuComponentInputSchema = z.object({
  catalogItemId: z.string().uuid().nullable(),
  componentRole: z.enum(COMPONENT_ROLE_VALUES),
  position: z.number().int().min(0),
  nombre: z.string().trim().min(1, 'El nombre del platillo es obligatorio').max(160),
  descripcion: z.string().trim().max(1000),
  calorias: z.number().int().min(0).max(10000),
  imagen: z.string().trim().max(500),
  tipo: z.string().trim().min(1, 'El tipo es obligatorio').max(80),
});

export const orderMenuSlotInputSchema = z.object({
  dayOfWeek: z.enum(DAY_OF_WEEK_VALUES),
  dayOrder: z.number().int().min(1).max(7),
  slotType: z.enum(SLOT_TYPE_VALUES),
  contenedor: optionalTrimmedString(160),
  components: z.array(orderMenuComponentInputSchema).min(1, 'Cada tiempo debe conservar al menos un platillo').max(12),
});

export const orderUpdateInputSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
  firstDeliveryDate: isoDateSchema,
  firstDeliveryLocation: z.union([z.literal(1), z.literal(2)]),
  secondDeliveryDate: isoDateSchema,
  secondDeliveryLocation: z.union([z.literal(1), z.literal(2)]),
  notes: optionalTrimmedString(1000),
  menuSlots: z.array(orderMenuSlotInputSchema).min(1).max(35),
}).superRefine((value, ctx) => {
  if (value.secondDeliveryDate < value.firstDeliveryDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['secondDeliveryDate'],
      message: 'La segunda entrega no puede ser anterior a la primera',
    });
  }

  const slots = new Set<string>();
  value.menuSlots.forEach((slot, index) => {
    const key = `${slot.dayOfWeek}:${slot.slotType}`;
    if (slots.has(key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['menuSlots', index], message: 'El tiempo está repetido' });
    }
    slots.add(key);

    const components = new Set<string>();
    slot.components.forEach((component, componentIndex) => {
      const componentKey = `${component.componentRole}:${component.position}`;
      if (components.has(componentKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['menuSlots', index, 'components', componentIndex],
          message: 'El componente está repetido',
        });
      }
      components.add(componentKey);
    });
  });
});

export const orderListQuerySchema = z.object({
  customerId: z.string().trim().min(1).optional(),
  offset: z.coerce.number().int().min(0).default(0),
  q: optionalTrimmedString(100),
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
}).refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: 'La fecha inicial no puede ser posterior a la fecha final',
  path: ['from'],
});
