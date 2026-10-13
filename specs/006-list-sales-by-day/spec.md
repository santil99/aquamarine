# Navegación por fechas en listado de ventas — SPEC

## Objetivo

Permitir consultar el listado de ventas de distintas fechas mediante un navegador superior con botones de desplazamiento diario y selector de fecha tipo calendario.

## Requisitos funcionales

- **RF-1. Selector/Navegador de fecha:** ubicar una barra superior inmediatamente arriba de la tabla o listado de ventas.
- **RF-2. Botones de dirección:** incluir un botón con flecha izquierda (`<`) para restar un día a la fecha actual seleccionada y un botón con flecha derecha (`>`) para sumar un día.
- **RF-3. Etiqueta central dinámica:** el texto central debe mostrar:
  - `"Hoy"` si la fecha seleccionada coincide con la fecha actual en la zona horaria del negocio.
  - `"Ayer"` si la fecha seleccionada corresponde al día previo en la zona horaria del negocio.
  - La fecha con formato localizado (ej. `DD/MM/AAAA` o `DD MMM`) para cualquier otro día.
- **RF-4. Calendario (DatePicker):** al hacer clic o tocar en la etiqueta central del navegador, se abre un selector de fecha (*date picker*) en modal o desplegable. Al confirmar o seleccionar una fecha, se actualiza el listado de ventas para ese día.
- **RF-5. Carga de datos:** al cambiar la fecha (por flechas o selector), actualizar la consulta de ventas aplicando el filtro correspondiente a la jornada seleccionada.
- **RF-6. Estados de interfaz:** mostrar indicador de carga durante el refresco de datos y mantener la fecha seleccionada visible y activa.

## Requisitos de interfaz

- Diseño centrado y responsive en mobile y desktop (mobile-first).
- Botones de flecha accesibles mediante teclado y lectores de pantalla.
- Formato de fecha y textos adaptados a la localización local (es-AR).

## Criterios de aceptación

- **CA-1:** al abrir la pantalla por primera vez, el navegador muestra `"Hoy"` y se listan las ventas de la fecha actual.
- **CA-2:** presionar la flecha izquierda resta un día a la fecha visualizada y actualiza el listado.
- **CA-3:** presionar la flecha derecha suma un día a la fecha visualizada y actualiza el listado.
- **CA-4:** si la fecha resultante corresponde al día anterior al actual, la etiqueta central cambia a `"Ayer"`. Para otras fechas, muestra el formato de fecha legible.
- **CA-5:** hacer clic en el texto central abre el calendario; al elegir una fecha en él, la vista se actualiza automáticamente con las ventas de ese día.

## Fuera de alcance

Vistas por rango de fechas (semanal o mensual), filtros por categoría o medio de pago, edición o eliminación de ventas desde el listado.

---
