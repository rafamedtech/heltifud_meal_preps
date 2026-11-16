# Verificación de 1.3: alta de pedido

Fecha: 16 de noviembre de 2026. Resultado: **1.3 terminado**, validado contra
PostgreSQL y en la sesión administrativa del usuario en `http://localhost:3000`.
No se desplegó la aplicación en esta sesión.

## Alcance comprobado

| Requisito | Evidencia |
| --- | --- |
| Menú por tipo | Estándar, vegetariano y personalizado copian exclusivamente su menú del ciclo abierto. Un cliente de dieta sin menú propio recibe 409, aunque otro cliente tenga uno. |
| Días elegidos | Solo se copian los días recibidos, con cantidad igual a `daysCount`; se rechazan faltantes y duplicados. |
| Tiempos completos | Cada día debe tener principal en todos los tiempos del plan. Un sábado con comida completa y cena sin principal queda fuera de las opciones y se rechaza al enviar. Si no hay suficientes días completos, las opciones devuelven 409. |
| Entregas automáticas | Las comidas se asignan según el reparto del ciclo. Se verificó una sola entrega tanto para lunes a miércoles como para jueves y viernes. |
| Preferencias y cambios | Se proponen los días del cliente, con alternativa permitida si su preferencia no aplica; el cambio por pedido no cambia el perfil. Se rechaza un día no permitido. |
| Fechas | Se calculan desde el ciclo, incluida la entrega dominical anterior al lunes de servicio. |
| Identidad e historial del contenido | Persisten `cycleId`, menú origen, folio único creciente y día/tiempo de origen en cada componente; `isSubstitution` inicia en falso. La búsqueda encuentra el folio. Editar el menú fuente no altera la copia del pedido. |
| Corte | Antes del corte no se marca; después, el admin puede crear y se guarda `capturedAfterCutoff`. El formulario muestra el aviso. Un ciclo cerrado no acepta pedidos. |
| Plan disponible | Un plan inactivo se rechaza. Plan, variante y precio quedan copiados en el pedido. |

## Prueba de integración repetible

Archivo: [scripts/verify-order-create.ts](../scripts/verify-order-create.ts).

Desde la raíz del proyecto, con `.env` configurado:

```sh
node --import tsx --env-file=.env scripts/verify-order-create.ts
```

Ejecuta los servicios reales `getOrderOptions`, `createOrder`, `getOrderById` y
`getOrders` con Prisma contra PostgreSQL. Crea ciclo, clientes, plan y menús
temporales dentro de una transacción; todos los cambios se revierten, incluso
si una aserción falla. Los menús de prueba no son visibles fuera de esa
transacción. No requiere editar los menús ni clientes existentes.

La secuencia PostgreSQL del folio puede avanzar aunque se revierta la
transacción: puede haber saltos; los números no se reutilizan ni se reinicia la
secuencia. La prueba comprueba unicidad y orden creciente, sin exigir números
contiguos.

## Navegador con la sesión activa

Se completaron tres altas desde el formulario y se contrastaron sus resultados
con la API autenticada:

| Caso | Días | Resultado |
| --- | --- | --- |
| Estándar | Lunes a viernes, variante de 5 días | Los cinco días se seleccionaron automáticamente al ser todos los disponibles. Menú `Semana 8`, dos entregas del 16 y 19 de noviembre, precio $700. |
| Vegetariano | Lunes, martes y jueves, variante de 3 días | Copia exclusiva del menú vegetariano temporal. Cambio de la primera entrega a domingo 15 y ubicación secundaria; segunda entrega el jueves 19. Precio $500. |
| Dieta | Lunes, martes y miércoles, variante de 3 días | Copia exclusiva del menú personalizado de ese cliente; una entrega el lunes 16. Precio $500. |

En los tres casos se mostró folio en el detalle y aviso de fuera de corte.
Se comprobaron los componentes copiados y sus días de origen. Las preferencias
de los clientes temporales siguieron siendo lunes y jueves después del cambio
del pedido vegetariano.

La semana abierta no tenía menú vegetariano ni personalizado. Para esas pruebas
se añadieron dos clientes y dos menús claramente identificados como `PRUEBA 1.3`;
no se modificó ningún menú existente ni se añadieron platillos al catálogo.
Después se retiraron los tres pedidos de navegador, ambos menús temporales y
ambos clientes temporales.

## Conservación de datos y validación final

Registro local, excluido de Git:
`backups/verificacion-1.3-2026-11-16T21-32-45-366Z/`.
Contiene la instantánea previa, huellas SHA-256 por tabla, identificadores de
fixtures y `verification.json` con el resultado final.

La comparación final de todas las filas ordenadas por ID dio contenido idéntico
en todas las tablas de `public`: 8 menús, 56 días, 280 tiempos, 305 componentes,
183 platillos del catálogo, 68 ingredientes, 133 relaciones de recetas,
13 clientes, 4 planes, 11 variantes, 47 gastos, 8 ciclos y sus ajustes. Las tablas
de pedidos volvieron a quedar vacías. La lista del navegador confirmó 0 pedidos.
La secuencia del folio conserva su avance; no forma parte de esa comparación
de filas.

La migración `20261116150000_add_order_cycle_folio` ya estaba aplicada desde el
cierre de 1.2; no se necesitaron nuevas migraciones. Se comprobó que los roles
`anon` y `authenticated` no tienen privilegios sobre la secuencia de folios.

Validación: prueba de integración pasada; `pnpm lint` sin errores;
`pnpm test:unit`, 24 archivos y 176 pruebas pasadas. No se requirieron cambios
adicionales al código de producción para cerrar 1.3.

## Fuera de este cierre

Las validaciones al editar, control de versión, transiciones e historial de
estados corresponden a 1.4. La búsqueda remota de clientes y los listados,
a 1.5. El autoservicio del cliente sigue en la etapa 3.
