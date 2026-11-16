# Auditoría: flujo menú semanal → pedido → compras → cocina → entregas

Fecha de revisión: 15 de noviembre de 2026.

## Flujo objetivo

1. Enviar a los clientes el menú de la semana.
2. El cliente hace su pedido; se le asigna el menú activo.
3. El cliente personaliza: cambia platillos que no quiere por otro de otro día de la
   misma semana o de otro tiempo de comida (desayuno por comida o cena).
4. Con los pedidos ingresados, ver la lista de súper.
5. Ver qué se cocina para cada entrega.
6. Llevar el control de las entregas en cada día de entrega.

## Alcance y método

Lectura de código de las páginas de planes, pedidos, clientes, menú y platillos, sus
composables, API, validaciones Zod y modelos Prisma. No se ejecutaron pruebas ni
navegador, y no se consultó la base de datos.

Complementa a [plan-pedidos-clientes.md](plan-pedidos-clientes.md) (29 de septiembre
de 2026, hallazgos H01–H24). H01–H03 están corregidos. Se verificó en el código actual
que H05, H06, H09, H10, H14, H15, H16 y H17 siguen abiertos. Ese plan casi no cubre la
lista de súper ni el intercambio de platillos entre días.

## Veredicto

La base administrativa es sólida: planes, clientes, platillos con receta, menú semanal
y pedido administrativo que copia el menú activo. Falta todo lo que va del cliente
hacia adelante y toda la operación (súper, cocina, entregas).

## Estado por paso del flujo

| Paso | Hoy | Falta |
| --- | --- | --- |
| Mandar menú de la semana | `/menu` público muestra el menú activo; el botón lleva al catálogo de WhatsApp | Enlace por cliente, mensaje prellenado, fecha de corte, menú de la semana siguiente separado del vigente |
| Cliente hace pedido | No existe. `/api/orders` es solo admin | Página pública de pedido, acceso por token o cuenta, endpoint de envío |
| Asignar menú activo | Sí, en el alta admin (`createOrder`) | Copia los primeros N días sin elegir días; copia tiempos vacíos; ignora el tipo de cliente (vegetariano) |
| Cambiar platillo por otro de la semana | Admin sustituye contra el catálogo completo | Limitar a platillos del menú origen (otro día u otro tiempo), guardar original vs. cambio, reglas de precio |
| Lista de súper | No existe | Agregación de ingredientes por pedidos confirmados; la receta no tiene rendimiento ni conversión de unidades |
| Qué cocinar por entrega | No existe | El pedido no dice qué días/comidas van en cada entrega |
| Control de entregas | Dos fechas y un estado global | Entrega como registro propio con estado, hora, incidencia y evidencia |

## Brechas por página

### Planes

`layers/admin/app/pages/admin/planes/index.vue`, `layers/menu/server/utils/plans.ts`

- El plan define tiempos (`slotTypes`) y días. Cambiar desayuno por comida rompe esa
  regla: falta decidir si el plan vende «N comidas» o tiempos fijos.
- Sin número de entregas por variante, sin cantidad (pedido para 2 personas), sin liga
  al tipo de menú.
- Sin extras con precio.

### Pedidos

`layers/menu/server/utils/orders.ts`, `layers/admin/app/pages/admin/pedidos/`

- Guardar reescribe la dirección con la actual del cliente (H09) y borra/recrea todos
  los tiempos.
- Cualquier estado puede pasar a cualquier otro, sin historial (H10).
- Sin cobros ni saldo (H12).
- Listado con tope de 150, selector de clientes con tope de 100, filtro de fecha solo
  por primera entrega (H14, H15).
- Sin folio, sin semana/ciclo asociado, sin protección contra doble envío.
- Fechas por defecto mañana/+4 días; no usa los días de entrega del cliente.
- `buildMenuSlots` toma los primeros N días del menú y no valida tiempos sin
  componentes (H05, H06).

### Clientes

`layers/admin/app/pages/admin/clientes/`, `layers/menu/server/utils/customers.ts`

- Sin alergias, platillos que no le gustan ni notas permanentes.
- Sin liga a usuario o token para entrar a su pedido.
- Direcciones en texto libre: sin coordenadas, zona ni ventana horaria.
- Borrar un cliente con pedidos da un error crudo de base de datos (H16).
- `firstDeliveryDay` y `secondDeliveryDay` existen pero ningún flujo los usa.

### Menú

`layers/menu/server/utils/menu.ts`, `layers/admin/app/pages/admin/menu/`

- Un solo menú activo global; `menuType` (estándar/vegetariano/personalizado) existe,
  pero activar uno desactiva todos los demás.
- `isActive` es booleano, sin ciclo: borrador → publicado → pedidos cerrados →
  producción → entregado.
- Un menú vencido sigue vendible (H17). Sin fecha de corte.
- Los componentes pueden no tener `catalogItemId`: un platillo sin receta no entra a
  la lista de súper.

### Platillos

`layers/menu/server/utils/foodCatalog.ts`,
`layers/base/app/components/admin/FoodRecipeFields.vue`

- La receta no tiene rendimiento (porciones que produce): imposible escalar
  cantidades.
- Unidades en texto libre (g, kg, ml, l, pieza, porción, cucharadita, cucharada,
  taza): sin conversión ni unidad de compra.
- Ingredientes solo se crean y listan: sin editar, fusionar, proveedor ni costo.
- Editar un platillo cambia los menús existentes (H19); borrarlo deja los pedidos sin
  liga a la receta.
- Sin alérgenos, sin archivar.

## Modelo de datos que falta

- **Ciclo semanal**: menú + fecha de corte + estado. Pedidos, compras y producción
  cuelgan de él.
- **Entrega del pedido (`OrderDelivery`)**: fecha, dirección congelada, estado,
  comidas asignadas, incidencia.
- **Origen del componente**: día/tiempo original y si fue cambio del cliente.
- **Token de acceso del cliente** (o cuenta) por pedido.
- **Pagos** por pedido.
- **Historial de estados**.
- **Rendimiento de receta, unidad base y factor de conversión** por ingrediente.
- **Lista de compras** guardada por ciclo, con comprado/pendiente y liga a gastos.

## Decisiones de negocio previas

1. Cambio desayuno ↔ comida: ¿mismo precio o ajuste?
2. ¿El cliente puede repetir un platillo varias veces en la semana?
3. Acceso del cliente: enlace privado por WhatsApp (recomendado, menos fricción) o
   cuenta con contraseña.
4. Día y hora de corte de pedidos y de cambios.
5. Qué días de comida van en cada entrega.
6. Cobro: registro manual primero o pago en línea desde el inicio.
7. Vegetariano: ¿menú aparte activo en paralelo?

### Decisiones tomadas (15 de noviembre de 2026)

| # | Decisión |
| --- | --- |
| 1 | Mismo precio: el plan vende N comidas por semana; cambiar entre tiempos dentro del menú de la semana no altera el total. |
| 2 | Repetición libre: el cliente puede poner el mismo platillo en todos sus lugares (16 nov 2026). Preferencias = exclusiones y alergias que el sistema aplica solo. |
| 4 | Corte fijo semanal: mismo día y hora cada semana; después solo admin edita. Corte del cliente el viernes (hora por definir); admin acepta confirmaciones tardías, p. ej. sábado antes de mediodía. |
| 5 | Reparto fijo: una regla por ciclo define qué días de comida lleva cada entrega. Entrega 1 domingo o lunes con lunes a miércoles; entrega 2 miércoles o jueves con jueves y viernes. El cliente elige el día y puede cambiarlo por pedido. |
| 7 | Vegetariano en paralelo: un menú activo por tipo en la misma semana; el pedido toma el menú según el tipo de cliente. Cliente `dieta` usa menú personalizado propio. |


Pendientes: 3 (acceso del cliente) y 6 (cobro). Etapa 2 implementada; ver
[verificacion-etapa-2-personalizacion.md](verificacion-etapa-2-personalizacion.md).

## Etapas propuestas

| Etapa | Contenido | Resultado |
| --- | --- | --- |
| 0. Reglas | Decisiones de negocio previas | Contrato de negocio |
| 1. Cimientos | Ciclo semanal, entregas como registro, estados con historial, direcciones congeladas, días elegibles, tiempos vacíos, paginación | Pedido admin confiable |
| 2. Intercambio | Sustitución limitada al menú de la semana, registro de cambios, preferencias del cliente | Personalización correcta desde admin |
| 3. Pedido del cliente | Enlace privado, página móvil de pedido y personalización, envío atómico, confirmación, mensaje de WhatsApp | El cliente ordena solo |
| 4. Lista de súper | Rendimiento y unidades en recetas, agregación por ciclo, agrupado por categoría, marcar comprado | Se sabe qué comprar |
| 5. Cocina | Producción por fecha de entrega: platillos, porciones, contenedores, etiquetas imprimibles | Se sabe qué cocinar |
| 6. Entregas | Tablero por día: ruta, estado, incidencia, cobro pendiente | Control de reparto |
| 7. Cierre | Pagos, tablero de inicio, pruebas con base de datos real, e2e, verificación de despliegue | Lanzamiento |

Las etapas 4 y 5 dependen de la 1, no de la 3: la lista de súper y la producción
pueden funcionar con pedidos capturados desde admin antes de abrir el autoservicio.
