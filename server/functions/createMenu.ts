import { PrismaClient } from '@prisma/client';

interface Menu {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

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
