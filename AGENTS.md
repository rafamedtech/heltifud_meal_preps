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
