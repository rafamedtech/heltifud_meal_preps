---
name: design-system
description: Design system de Heltifud, basado en Nuxt UI y en el template Nuxt UI Dashboard. Usar SIEMPRE antes de crear o modificar cualquier interfaz del proyecto — componentes, páginas, layouts, formularios, tablas, modales, estilos, temas o iconos — y antes de usar cualquier otra skill de diseño o de Nuxt UI.
---

# Design system de Heltifud

Esta skill no contiene las reglas: apunta a ellas. La fuente única de verdad es
[DESIGN.md](../../../DESIGN.md), en la raíz del repositorio.

## Qué hacer

1. Leer completo [DESIGN.md](../../../DESIGN.md) antes de escribir o editar
   código de interfaz.
2. Cargar solo los documentos que la tarea necesite:
   - [componentes.md](../../../docs/design-system/componentes.md): qué
     componente usar e inventario de componentes propios.
   - [patrones.md](../../../docs/design-system/patrones.md): recetas de
     página, toolbar, tabla, formulario, modal, estados y notificaciones.
   - [template-dashboard.md](../../../docs/design-system/template-dashboard.md):
     mapa del template Nuxt UI Dashboard y sus adaptaciones.
3. Resolver la necesidad en este orden: design system → componentes de Nuxt UI
   ([skill nuxt-ui](../nuxt-ui/SKILL.md)) → template Dashboard → componente
   propio.
4. Crear un componente propio solo si no existe en ninguno de los anteriores ni
   en el proyecto. Construirlo componiendo componentes de Nuxt UI y registrarlo
   en el design system en el mismo cambio.
5. Recorrer el checklist de `DESIGN.md` antes de entregar.

Las reglas del design system prevalecen sobre los ejemplos genéricos de otras
skills, incluida `frontend-design`.
