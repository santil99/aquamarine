# Reportes y Descarga de PDF de Ventas — SPEC

## Objetivo

Proveer una sección de reportes (`/reports` o similar) accesible desde el menú lateral, que permita seleccionar un período predefinido (este mes, esta semana, semana anterior, mes anterior o todo el año) y generar/descargar un archivo PDF con el detalle y totales de las ventas correspondientes.

## Requisitos funcionales

- **RF-1. Acceso desde el menú lateral (Drawer):** 
  - Incluir una nueva opción en el menú lateral de navegación con su respectivo icono, que redirija a la pantalla de reportes.
- **RF-2. Selección de Período:**
  - Selector intuitivo para elegir el rango de tiempo del reporte entre las opciones predefinidas:
    - Esta semana
    - Semana anterior
    - Este mes
    - Mes anterior
    - Todo el año
- **RF-3. Generación y Descarga de PDF:**
  - Botón principal de acción para disparar la descarga del reporte.
  - Generación en el cliente o mediante utilidad frontend de un archivo PDF estéticamente limpio y profesional.
- **RF-4. Contenido del Reporte PDF:**
  - **Encabezado:** Título claro del reporte y período seleccionado.
  - **Métrica resumen:** Total recaudado en el período.
  - **Tabla de transacciones:** Listado ordenado con columnas de Fecha, Hora, Medio de pago, Detalle y Monto.

## Requisitos de interfaz

- Diseño mobile-first, limpio y ordenado, manteniendo la coherencia visual con el resto de la aplicación (Hero UI).
- Feedback visual (estado de carga o deshabilitado) mientras se procesa y descarga el archivo PDF.

## Criterios de aceptación

- **CA-1:** el menú lateral muestra la opción de reportes y al seleccionarla navega correctamente a la pantalla correspondiente.
- **CA-2:** el usuario puede alternar entre las opciones de período (esta semana, semana anterior, este mes, mes anterior, todo el año).
- **CA-3:** al presionar el botón de descarga, se genera y descarga un archivo PDF que incluye el total recaudado y la tabla con fecha, hora, medio de pago, detalle y monto del período elegido.

## Fuera de alcance

Generación de reportes en formato Excel/CSV, inclusión de gastos en el reporte por el momento y opciones de rangos de fechas personalizados manuales (queda acotado a los períodos predefinidos).