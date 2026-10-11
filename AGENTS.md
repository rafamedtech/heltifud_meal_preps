# Instrucciones para agentes

## Pruebas en navegador

Siempre que se deban realizar pruebas en navegador, reutilizar la sesión activa
del usuario en su navegador habitual, como en la verificación de H01. Inspeccionar
las pestañas abiertas y seleccionar la sesión correspondiente a Heltifud antes
de iniciar las pruebas. Usar las herramientas de navegador disponibles para
operar esa sesión.

No iniciar por defecto un navegador aislado, un perfil nuevo ni otra sesión de
autenticación. No cerrar la sesión activa, cambiar credenciales ni modificar
datos del usuario para preparar las pruebas.

Si no existe una sesión activa adecuada, pedir al usuario que inicie sesión en
el navegador y continuar con esa sesión. Usar un contexto aislado únicamente
cuando el usuario lo solicite expresamente o cuando la prueba requiera otro
estado de autenticación; en ese caso, conservar la sesión activa y explicar la
necesidad del contexto adicional.

Verificar el resultado visible después de cada acción relevante y conservar
las pestañas del usuario y cualquier edición pendiente.

## Diseño: radios de borde y Nuxt UI

Usar componentes Nuxt UI y conservar el radio de borde predeterminado de cada
componente en cualquier elemento nuevo o modificado. No sobrescribirlo con
clases `rounded-*`, estilos inline ni overrides de `ui` por motivos estéticos,
salvo indicación explícita del usuario.

Para controles de formulario (inputs, selects, selectores de fechas y botones),
la referencia son los `USelectMenu` de la sección de adicionales en
`layers/base/app/components/admin/MenuSlotEditor.vue`: usan `rounded-md`, el
valor predeterminado de Nuxt UI. `UInput` y `UButton` también lo usan por defecto;
no añadir una clase de radio cuando el componente ya proporciona ese valor.
Los controles personalizados y sus skeletons deben usar `rounded-md`.

El token del tema es `--radius-md: calc(var(--ui-radius) * 1.5)`; actualmente
`--ui-radius: 0.375rem` en `layers/base/app/assets/css/main.css`, por lo que el
radio de estos controles es `0.5625rem` (9 px con una raíz de 16 px). Usar el
token, no fijar píxeles ni cambiar `--ui-radius` para ajustar un solo elemento.
Para otros componentes (tarjetas, modales, avatares, etc.), conservar su propio
radio predeterminado de Nuxt UI en lugar de forzar `rounded-md` a todos.

## Diseño: tamaño de controles de formulario

Usar el mismo tamaño que los selectores de adicionales de `MenuSlotEditor.vue`:
heredar `size: "xl"` de `ui.input`, `ui.select`, `ui.selectMenu` y `ui.button`
en `layers/base/app/app.config.ts`. Este es el default configurado del proyecto,
no el default original de la librería. Omitir `size` en los controles de
formulario cuando ya lo heredan, incluidos los botones que abren fechas.

Conservar también la tipografía, padding y tamaño de iconos de esa variante;
no introducir alturas, padding, tamaños de texto o iconos que alteren sus
dimensiones. Los skeletons deben reflejar la altura resultante (actualmente
`h-10`, 40 px). Usar otro tamaño solo por indicación explícita del usuario.
Esta convención aplica a controles de formulario; las acciones compactas de
barras de herramientas y los botones de icono conservan su tamaño contextual.
