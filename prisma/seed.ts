import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { ComponentRole, DayOfWeek, PrismaClient, SlotType } from '../layers/menu/generated/prisma/client';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DIRECT_URL o DATABASE_URL son requeridos para ejecutar el seed.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const slotOrder = [
  { key: 'desayuno', slotType: SlotType.DESAYUNO, contenedor: 'Contenedor desayuno' },
  { key: 'comida', slotType: SlotType.COMIDA, contenedor: 'Contenedor comida' },
  { key: 'cena', slotType: SlotType.CENA, contenedor: 'Contenedor cena' },
  { key: 'snack1', slotType: SlotType.SNACK1, contenedor: 'Contenedor colacion 1' },
  { key: 'snack2', slotType: SlotType.SNACK2, contenedor: 'Contenedor colacion 2' },
] as const;

function food(nombre: string, calorias: number, tipo: string, descripcion = '', imagen = '/images/placeholder-menu.jpg') {
  return { nombre, descripcion, calorias, imagen, tipo };
}

function slot(
  platilloPrincipal: ReturnType<typeof food>,
  guarnicion1: ReturnType<typeof food> | null,
  guarnicion2: ReturnType<typeof food> | null,
  adicionales: ReturnType<typeof food>[] = [],
  contenedor?: string
) {
  return {
    platilloPrincipal,
    guarnicion1,
    guarnicion2,
    adicionales,
    contenedor,
  };
}

function componentsForSlot(slotData: ReturnType<typeof slot>) {
  const components = [
    {
      componentRole: ComponentRole.PLATILLO_PRINCIPAL,
      ...slotData.platilloPrincipal,
    },
  ];

  if (slotData.guarnicion1) {
    components.push({
      componentRole: ComponentRole.GUARNICION_1,
      ...slotData.guarnicion1,
    });
  }

  if (slotData.guarnicion2) {
    components.push({
      componentRole: ComponentRole.GUARNICION_2,
      ...slotData.guarnicion2,
    });
  }

  for (const adicional of slotData.adicionales) {
    components.push({
      componentRole: ComponentRole.ADICIONAL,
      ...adicional,
    });
  }

  return components;
}

function buildMenuDays(days: ReturnType<typeof createImageWeekTemplate>) {
  return days.map((day, index) => ({
    dayOfWeek: day.dayOfWeek,
    order: index + 1,
    slots: {
      create: slotOrder.map(({ key, slotType, contenedor }) => ({
        slotType,
        contenedor: day[key].contenedor ?? contenedor,
        components: {
          create: componentsForSlot(day[key]),
        },
      })),
    },
  }));
}

function createEmptyDay(dayOfWeek: DayOfWeek) {
  return {
    dayOfWeek,
    desayuno: slot(food('Sin menu asignado', 0, 'desayuno'), null, null, [], 'Contenedor desayuno'),
    comida: slot(food('Sin menu asignado', 0, 'comida'), null, null, [], 'Contenedor comida'),
    cena: slot(food('Sin menu asignado', 0, 'cena'), null, null, [], 'Contenedor cena'),
    snack1: slot(food('Sin colacion asignada', 0, 'snack'), null, null, [], 'Contenedor colacion 1'),
    snack2: slot(food('Sin colacion asignada', 0, 'snack'), null, null, [], 'Contenedor colacion 2'),
  };
}

function createImageWeekTemplate() {
  return [
    {
      dayOfWeek: DayOfWeek.LUNES,
      desayuno: slot(
        food('Omelette de pechuga de pavo', 552, 'desayuno', 'Menu basado en la imagen de referencia.'),
        food('Chilaquiles verdes', 0, 'guarnicion'),
        null
      ),
      comida: slot(
        food('Pechuga en crema de chipotle', 521, 'comida', 'Menu basado en la imagen de referencia.'),
        food('Arroz blanco', 0, 'guarnicion'),
        food('Verduras al vapor', 0, 'guarnicion')
      ),
      cena: slot(
        food('Ensalada de pollo', 416, 'cena', 'Menu basado en la imagen de referencia.'),
        null,
        null
      ),
      snack1: slot(food('Colacion 1 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 1'),
      snack2: slot(food('Colacion 2 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 2'),
    },
    {
      dayOfWeek: DayOfWeek.MARTES,
      desayuno: slot(
        food('Huevo en salsa roja', 633, 'desayuno', 'Menu basado en la imagen de referencia.'),
        food('Frijol', 0, 'guarnicion'),
        null
      ),
      comida: slot(
        food('Fajitas de res', 558, 'comida', 'Menu basado en la imagen de referencia.'),
        food('Arroz con cilantro', 0, 'guarnicion'),
        null
      ),
      cena: slot(
        food('Pescado teriyaki', 516, 'cena', 'Menu basado en la imagen de referencia.'),
        food('Arroz blanco', 0, 'guarnicion'),
        null
      ),
      snack1: slot(food('Colacion 1 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 1'),
      snack2: slot(food('Colacion 2 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 2'),
    },
    {
      dayOfWeek: DayOfWeek.MIERCOLES,
      desayuno: slot(
        food('Papa con salchicha y huevo', 479, 'desayuno', 'Menu basado en la imagen de referencia.'),
        null,
        null
      ),
      comida: slot(
        food('Pechuga a la plancha', 476, 'comida', 'Menu basado en la imagen de referencia.'),
        food('Pure de camote y papa', 0, 'guarnicion'),
        food('Verduras salteadas', 0, 'guarnicion')
      ),
      cena: slot(
        food('Pita con pollo pesto', 410, 'cena', 'Menu basado en la imagen de referencia.'),
        null,
        null
      ),
      snack1: slot(food('Colacion 1 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 1'),
      snack2: slot(food('Colacion 2 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 2'),
    },
    {
      dayOfWeek: DayOfWeek.JUEVES,
      desayuno: slot(
        food('Burritos de huevo con chorizo', 532, 'desayuno', 'Menu basado en la imagen de referencia.'),
        null,
        null
      ),
      comida: slot(
        food('Bistec en salsa roja', 528, 'comida', 'Menu basado en la imagen de referencia.'),
        food('Arroz blanco', 0, 'guarnicion'),
        null
      ),
      cena: slot(
        food('Chiles rellenos de panela', 662, 'cena', 'Menu basado en la imagen de referencia.'),
        food('Arroz blanco', 0, 'guarnicion'),
        null
      ),
      snack1: slot(food('Colacion 1 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 1'),
      snack2: slot(food('Colacion 2 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 2'),
    },
    {
      dayOfWeek: DayOfWeek.VIERNES,
      desayuno: slot(
        food('Huevos a la mexicana', 645, 'desayuno', 'Menu basado en la imagen de referencia.'),
        food('Frijol', 0, 'guarnicion'),
        null
      ),
      comida: slot(
        food('Milanesa de pollo', 583, 'comida', 'Menu basado en la imagen de referencia.'),
        food('Mac n cheese', 0, 'guarnicion'),
        food('Verduras salteadas', 0, 'guarnicion')
      ),
      cena: slot(
        food('Pescado al vapor', 464, 'cena', 'Menu basado en la imagen de referencia.'),
        food('Arroz rojo', 0, 'guarnicion'),
        null
      ),
      snack1: slot(food('Colacion 1 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 1'),
      snack2: slot(food('Colacion 2 pendiente', 0, 'snack'), null, null, [], 'Contenedor colacion 2'),
    },
    createEmptyDay(DayOfWeek.SABADO),
    createEmptyDay(DayOfWeek.DOMINGO),
  ];
}

const weeklyMenus = [
  {
    name: 'Menu semanal basado en imagen',
    isActive: true,
    startDate: new Date('2026-03-09T00:00:00.000Z'),
    endDate: new Date('2026-03-15T23:59:59.999Z'),
    days: createImageWeekTemplate(),
  },
];

function collectCatalogItems() {
  const uniqueItems = new Map<string, ReturnType<typeof food>>();

  for (const menu of weeklyMenus) {
    for (const day of menu.days) {
      for (const { key } of slotOrder) {
        const slotData = day[key];
        const items = [
          slotData.platilloPrincipal,
          slotData.guarnicion1,
          slotData.guarnicion2,
          ...slotData.adicionales,
        ].filter(Boolean) as ReturnType<typeof food>[];

        for (const item of items) {
          const mapKey = `${item.nombre}-${item.tipo}`;
          if (!uniqueItems.has(mapKey)) {
            uniqueItems.set(mapKey, item);
          }
        }
      }
    }
  }

  return Array.from(uniqueItems.values());
}

async function main() {
  await prisma.weeklyMenu.deleteMany();
  await prisma.foodCatalogItem.deleteMany();

  for (const menu of weeklyMenus) {
    await prisma.weeklyMenu.create({
      data: {
        name: menu.name,
        isActive: menu.isActive,
        startDate: menu.startDate,
        endDate: menu.endDate,
        days: {
          create: buildMenuDays(menu.days),
        },
      },
    });
  }

  const catalogItems = collectCatalogItems();

  if (catalogItems.length) {
    await prisma.foodCatalogItem.createMany({
      data: catalogItems,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
