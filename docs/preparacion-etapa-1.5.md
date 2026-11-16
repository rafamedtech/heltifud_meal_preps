# Etapa 1.5: preparación y resultado

Escrito el 16 de noviembre de 2026, al cerrar el remanente de 1.1 (editar el
corte desde la interfaz). Describe el estado real del código para empezar 1.5
sin volver a explorarlo. Alcance según el
[plan de etapa 1](plan-etapa-1-cimientos.md).

## Estado antes de 1.5

| Tema | Hoy | Archivo |
| --- | --- | --- |
| Listado de pedidos | La página pide `limit: 150` sin `offset`; no hay control de página. | `layers/admin/app/pages/admin/pedidos/index.vue` (`loadOrders`) |
| API de pedidos | `getOrders` ya acepta `offset` y `limit` (máx. 200) y devuelve `summary.total` del filtro. No hay filtro por semana. | `layers/menu/server/utils/orders.ts`, `orderListQuerySchema` en `menuSchema.ts` |
| Filtro por fecha | `from`/`to` ya coinciden con cualquiera de las entregas (`deliveries.some`). Verificado en 1.2; no rehacer. | `orders.ts` |
| Clientes al crear pedido | `useFetch("/api/customers", { limit: 100 })` y `USelectMenu` con filtro local. | `layers/admin/app/pages/admin/pedidos/crear-nuevo.vue` |
| API de clientes | `getCustomers` ya tiene búsqueda `q` y cursor. | `layers/menu/server/utils/customers.ts` |
| Borrado de cliente | `prisma.customer.delete` directo; con pedidos falla por la llave foránea y llega como error genérico. La página muestra `error.message`. | `customers.ts` (`deleteCustomer`), `clientes/index.vue` (`confirmDelete`) |
| Ciclos | `GET /api/cycles` lista las semanas (para el selector de semana). `Order.cycleId` existe. | `layers/menu/server/utils/cycles.ts` |

## Resultado

La tabla anterior describe el punto de partida. Implementado el 16 de noviembre
de 2026:

1. **Paginación.** `UPagination` con `offset` y `summary.total`, 50 por página.
   Cambiar un filtro regresa a la página 1.
2. **Filtro por semana.** `cycleId` en `orderListQuerySchema` y `getOrders`;
   `USelect` con las semanas de `/api/cycles`.
3. **Búsqueda remota de clientes.** `USelectMenu` con `v-model:search-term` e
   `ignore-filter`; consulta `/api/customers?q=` con espera de 300 ms. El
   cliente elegido se conserva aunque cambien los resultados.
4. **Borrado de cliente.** `deleteCustomer` responde 409 con código
   `CUSTOMER_HAS_HISTORY` si hay pedidos o menús personalizados. El modal
   muestra el motivo y ofrece «Marcar inactivo».

Pruebas: `customerDelete.test.ts`, `customerOrders.test.ts`,
`ordersListPagination.test.ts`, `customerDeleteConflict.test.ts` y
`orderCustomerSearch.test.ts`.

Verificación: [verificacion-etapa-1.5.md](verificacion-etapa-1.5.md).

## Después de 1.5: limpieza 1.6

`WeeklyMenu.isActive` sigue en `prisma/schema.prisma` (campo e índice),
`cycles.ts` (espejo al cambiar estado), `menu.ts` (lectura y alta),
`MenuForm.vue` («marcar como activo»), `types.ts` y las pruebas
`menuType.test.ts` y `menuSaveConfirmation.test.ts`. `isActive` de planes y
variantes es otro campo y no se toca.

Hecho en 1.6: ver el avance en el [plan de etapa 1](plan-etapa-1-cimientos.md).
