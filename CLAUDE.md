# Instrucciones del proyecto para Claude

Leer y aplicar las instrucciones compartidas del proyecto:

@AGENTS.md

## Interfaz: design system primero

Antes de crear o modificar cualquier interfaz, leer [DESIGN.md](DESIGN.md) y
los documentos de `docs/design-system/` que correspondan a la tarea. Es un paso
obligatorio y previo a escribir código de UI, también en cambios pequeños.

Orden para resolver una necesidad de UI: design system → componentes de Nuxt UI
y su API → template Nuxt UI Dashboard → componente propio. Un componente propio
solo se crea si no existe en ninguno de los anteriores, se construye componiendo
componentes de Nuxt UI y se registra en el design system en el mismo cambio.

Usar primero componentes de Nuxt UI y configurarlos mediante sus props y API
documentada. Si las props no bastan o complican innecesariamente la solución,
usar Tailwind mediante `class` y los slots de estilo de `ui`, conforme a la API
del componente. Consultar
[la skill de Nuxt UI](.agents/skills/nuxt-ui/SKILL.md) y los temas generados
antes de personalizar. Conservar los radios y tamaños definidos en `DESIGN.md`
y `AGENTS.md`.

`AGENTS.md` es la fuente compartida de estas reglas; aplicar también sus
instrucciones de pruebas en navegador y las demás convenciones del proyecto.
