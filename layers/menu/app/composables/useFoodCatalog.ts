import type { FoodCatalogItem, FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

type FetchLikeError = {
  message?: string
  statusCode?: number
  statusMessage?: string
  data?: unknown
  response?: {
    _data?: unknown
    status?: number
    statusText?: string
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractErrorData(error: FetchLikeError): Record<string, unknown> | undefined {
  if (isRecord(error.data)) {
    return error.data
  }

  if (isRecord(error.response?._data)) {
    return error.response._data
  }

  return undefined
}

function extractFriendlyMessage(error: FetchLikeError, fallback: string): string {
  const data = extractErrorData(error)

  if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    return data.message
  }

  if (typeof error.statusMessage === 'string' && error.statusMessage.trim().length > 0) {
    return error.statusMessage
  }

  return fallback
}

function normalizeFetchError(error: unknown, fallback: string): never {
  const fetchError = (isRecord(error) ? error : {}) as FetchLikeError
  const normalizedError = new Error(extractFriendlyMessage(fetchError, fallback)) as Error & {
    statusCode?: number
    statusMessage?: string
    data?: Record<string, unknown>
  }

  normalizedError.statusCode = fetchError.statusCode ?? fetchError.response?.status
  normalizedError.statusMessage = fetchError.statusMessage ?? fetchError.response?.statusText
  normalizedError.data = extractErrorData(fetchError)

  throw normalizedError
}

export default function useFoodCatalog() {
  async function getFoodCatalog() {
    try {
      return await $fetch<FoodCatalogItem[]>('/api/food-components');
    } catch (error) {
      normalizeFetchError(error, 'No se pudo cargar la lista de platillos.')
    }
  }

  async function createFoodCatalogItem(item: FoodCatalogItemInput) {
    try {
      return await $fetch<FoodCatalogItem>('/api/food-components', {
        method: 'POST',
        body: item,
      });
    } catch (error) {
      normalizeFetchError(error, 'No se pudo guardar el platillo.')
    }
  }

  async function updateFoodCatalogItem(id: string, item: FoodCatalogItemInput) {
    try {
      return await $fetch<FoodCatalogItem>(`/api/food-components/${id}`, {
        method: 'PUT',
        body: item,
      });
    } catch (error) {
      normalizeFetchError(error, 'No se pudo guardar el platillo.')
    }
  }

  async function deleteFoodCatalogItem(id: string) {
    try {
      return await $fetch<{ id: string }>(`/api/food-components/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      normalizeFetchError(error, 'No se pudo eliminar el platillo.')
    }
  }

  return {
    getFoodCatalog,
    createFoodCatalogItem,
    updateFoodCatalogItem,
    deleteFoodCatalogItem,
  };
}
