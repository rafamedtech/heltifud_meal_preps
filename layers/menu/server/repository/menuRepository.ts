import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createMenu(menu: Menu) {
  return prisma.menu.create({
    data: {
      name: menu.name,
      startDate: menu.startDate,
      endDate: menu.endDate,
      isActive: menu.isActive,
    },
  });
}

export function editMenu(id: number, menu: Menu) {
  return prisma.menu.update({
    where: { id },
    data: {
      name: menu.name,
      startDate: menu.startDate,
      endDate: menu.endDate,
      isActive: menu.isActive,
    },
  });
}
