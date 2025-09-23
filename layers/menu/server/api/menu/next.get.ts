import type { WeeklyMenu } from '~~/layers/menu/shared/types/types'

export default defineEventHandler(() => {
  // find the menu after the active one
  const activeMenu = menus.find((menu) => menu.isActive) as WeeklyMenu
  const nextMenu = menus[menus.indexOf(activeMenu) + 1] as WeeklyMenu | undefined

  if (!nextMenu) {
    return {
      error: 'No hay ningun menú activo.',
    }
  }

  return nextMenu
})
