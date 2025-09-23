export default function useMenu() {
  async function createMenuOnDB(menu: Menu) {
    console.log('Creating menu:', menu)
    // try {
    //   await $fetch('/api/menu/create', {
    //     method: 'POST',
    //     body: {
    //       menu,
    //     },
    //   });
    // } catch (error) {
    //   console.error('Error creating menu:', error);
    //   throw new Error('Failed to create menu');
    // }
  }

  return { createMenuOnDB }
}
