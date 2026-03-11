import type { WeeklyMenu, WeeklyMenuInput } from '~~/layers/menu/shared/types/types';

export default function useMenu() {
  async function getMenuById(id: string) {
    return $fetch<WeeklyMenu>(`/api/menu/${id}`);
  }

  async function createMenuOnDB(menu: WeeklyMenuInput) {
    return $fetch<WeeklyMenu>('/api/menu', {
      method: 'POST',
      body: menu,
    });
  }

  async function updateMenuOnDB(id: string, menu: WeeklyMenuInput) {
    return $fetch<WeeklyMenu>(`/api/menu/${id}`, {
      method: 'PUT',
      body: menu,
    });
  }

  async function deleteMenuOnDB(id: string) {
    return $fetch<{ id: string }>(`/api/menu/${id}`, {
      method: 'DELETE',
    });
  }

  async function setActiveMenuOnDB(id: string) {
    return $fetch<WeeklyMenu>(`/api/menu/${id}/activate`, {
      method: 'POST',
    });
  }

  return {
    getMenuById,
    createMenuOnDB,
    updateMenuOnDB,
    deleteMenuOnDB,
    setActiveMenuOnDB,
  };
}
