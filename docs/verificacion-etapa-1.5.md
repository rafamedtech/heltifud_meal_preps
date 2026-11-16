# Verificación de 1.5: listado, filtros, clientes y borrado

Fecha: 16 de noviembre de 2026. **Terminado** en la base configurada en el
repositorio y en `http://localhost:3000`. No se desplegó la aplicación. Incluye
el remanente de 1.1 (editar el corte de una semana).

## PostgreSQL

```bash
node --import tsx --env-file=.env scripts/verify-order-list.ts
```

Ejecuta los servicios reales dentro de una transacción que siempre se revierte.
Crea 2 semanas de 2098, 25 clientes y 60 pedidos con folios desde 900001 (no
consume la secuencia de folios). Resultado: `passed`.

- Páginas de 50 devuelven una sola vez los 55 pedidos de una semana, con el
  total del filtro.
- El filtro por semana aísla los 5 pedidos de la otra semana y se combina con
  el rango de fechas de cualquiera de las entregas.
- La búsqueda de clientes por nombre o teléfono alcanza registros fuera de la
  primera página de 20.
- Borrar un cliente con pedidos responde 409 `CUSTOMER_HAS_HISTORY` con el
  conteo y conserva la fila; marcarlo inactivo conserva sus pedidos.
- Un cliente sin historial se elimina.
- PostgreSQL rechaza el borrado directo con error de llave foránea (`P2003`).
- Ningún fixture sobrevive a la reversión.

## Navegador

Sesión administrativa existente, sin iniciar ni cerrar sesión. La base tenía 0
pedidos, así que el recorrido usó los mismos fixtures confirmados temporalmente
(`--seed`) y retirados al terminar (`--clean`).

| Recorrido | Resultado |
| --- | --- |
| `/admin/pedidos`, 60 pedidos | «60 pedidos en el listado · 1–50 de 60», 50 filas; página 2 muestra «51–60 de 60» con 10 filas. |
| Filtro «Semana del 24 nov 2098» desde la página 2 | Regresa a la página 1, 5 filas, «5 pedidos coinciden con los filtros», sin paginador. «Limpiar» restaura los 60. |
| 390 px de ancho | Sin desbordamiento horizontal; paginador dentro del ancho. |
| `/admin/pedidos/crear-nuevo`, selector de cliente | Abre con los primeros 20; el cliente 25 no aparece. Al buscar «verificación 1.5 25» queda solo ese cliente; al elegirlo se muestran su contacto y perfil. |
| `/admin/clientes`, eliminar cliente con 4 pedidos | El modal cambia a «No se puede eliminar · El cliente tiene 4 pedidos…» y ofrece «Marcar inactivo»; al aceptar, la fila pasa a «Inactivo» con aviso de éxito. |
| `/admin/menu` → «Editar corte» | Muestra semana, 13 nov 2026 y 18:00 (hora de Tijuana); «Guardar cambios» deshabilitado sin cambios y habilitado al cambiar la hora. Se canceló sin guardar para no alterar la semana real. |
| `PUT /api/cycles/:id` sobre la semana temporal | 200 con corte del sábado previo y con el último minuto del domingo; 400 «El corte debe ser anterior al lunes en que inicia la semana» a partir del lunes 00:00. |

No se comprobó en navegador el guardado del corte desde el modal sobre una
semana real ni el borrado de un cliente sin historial; ambos quedan cubiertos
por la prueba de componente y por la verificación de PostgreSQL.

Ajuste hecho durante el recorrido: las opciones del filtro de semana ahora
incluyen el año.

## Limpieza y estado final

`--clean` retiró 60 pedidos, 25 clientes y 2 semanas. Conteos posteriores: 0
pedidos, 13 clientes, 8 semanas, ningún registro «ZZ Verificación».

## Calidad

- `pnpm lint`: sin errores.
- `pnpm test:unit`: 30 archivos, 199 pruebas.
- Typecheck con `vue-tsc@3` temporal: servidor sin errores; aplicación con 7
  errores previos en `FoodCatalogForm.vue` y `MenuForm.vue`, ninguno en
  archivos de 1.5. El proyecto aún no fija un verificador de tipos (T23).
