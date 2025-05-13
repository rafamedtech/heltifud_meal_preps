// import { menus } from '../utils/menu';

export default defineEventHandler(() => {
  const activeMenus = menus.filter((menu) => menu.isActive);

  if (!activeMenus.length) {
    return {
      error: 'No hay ningun menú activo.',
    };
  }

  return activeMenus;
});
