function useMenu() {
  async function getMenuById(id) {
    return $fetch(`/api/menu/${id}`);
  }
  async function createMenuOnDB(menu) {
    return $fetch("/api/menu", {
      method: "POST",
      body: menu
    });
  }
  async function updateMenuOnDB(id, menu) {
    return $fetch(`/api/menu/${id}`, {
      method: "PUT",
      body: menu
    });
  }
  async function deleteMenuOnDB(id) {
    return $fetch(`/api/menu/${id}`, {
      method: "DELETE"
    });
  }
  async function setActiveMenuOnDB(id) {
    return $fetch(`/api/menu/${id}/activate`, {
      method: "POST"
    });
  }
  return {
    getMenuById,
    createMenuOnDB,
    updateMenuOnDB,
    deleteMenuOnDB,
    setActiveMenuOnDB
  };
}

export { useMenu as u };
