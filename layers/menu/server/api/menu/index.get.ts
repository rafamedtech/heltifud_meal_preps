export default defineEventHandler(() => {
  const activeMenu = menus.find((menu) => menu.isActive);

  if (!activeMenu) {
    return {
      error: 'No hay ningun menú activo.',
    };
  }

  return activeMenu;
});
