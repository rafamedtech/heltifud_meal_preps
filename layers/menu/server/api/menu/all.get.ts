// import { menus } from '../utils/menu';

export default defineEventHandler(() => {
  const allMenus = menus.filter((menu) => menu.isActive);

  if (!allMenus.length) {
    return {
      error: 'No hay ningun menú creado.',
    };
  }

  return allMenus;
});
