# Pantalla de Resumen Financiero Mensual — SPEC

## Objetivo

Proveer una pantalla de resumen (`/resumen` o pantalla principal del balance) que consolide las finanzas del mes seleccionado, mostrando las métricas principales (recaudado, gastos y balance neto) en una tarjeta superior junto con un navegador mensual, y detallando el desglose agrupado por categoría (tanto para ventas como para gastos) ordenado de mayor a menor importe.

## Requisitos funcionales

- **RF-1. Navegador de período mensual:** 
  - Barra superior con flechas laterales (`<` y `>`) para retroceder o avanzar de mes.
  - Visualización del mes actual seleccionado y meses adyacentes (estilo carrusel/pestañas compactas tal como se observa en la referencia visual[cite: 4]).
  - Al cambiar de mes, se recalculan y actualizan automáticamente todas las métricas y listados de la pantalla.
- **RF-2. Tarjeta de Balance y Métricas Superiores:**
  - **Balance Neto:** cálculo y visualización destacada del saldo resultante (Ingresos - Egresos) del mes seleccionado.
  - **Recaudado:** total de ingresos por ventas del mes, acompañado de la cantidad total de transacciones (ej. `151 ventas`)[cite: 4].
  - **Gastos:** total de egresos del mes, acompañado de la cantidad total de registros de gastos (ej. `11 egresos`)[cite: 4].
- **RF-3. Desglose de Ventas por Categoría:**
  - Sección *"Ventas por Categoría"*[cite: 4] que agrupa las ventas del mes por cada categoría.
  - Cada ítem muestra: nombre de la categoría, cantidad de ventas asociadas (ej. `30 ventas`)[cite: 4] e importe total recaudado en pesos ($)[cite: 4].
  - **Ordenamiento:** de mayor a menor importe total acumulado.
- **RF-4. Desglose de Gastos por Categoría:**
  - Sección *"Gastos por Categoría"* que agrupa los egresos del mes por cada categoría de gasto.
  - Cada ítem muestra: nombre de la categoría, cantidad de registros y monto total gastado.
  - **Ordenamiento:** de mayor a menor importe total acumulado.
- **RF-5. Uso de componentes UI:**
  - Priorizar el uso de componentes de la librería de UI configurada en el proyecto (Material UI / Hero UI) para tarjetas, contenedores, tipografías y separadores, manteniendo la consistencia visual.

## Requisitos de interfaz

- Diseño mobile-first con tarjetas limpias, tipografía de gran tamaño para los montos y colores diferenciados para ingresos (verde) y balance/egresos según corresponda.
- Estructura vertical fluida que permita deslizar y ver primero el resumen ejecutivo y luego los listados detallados por categoría.

## Criterios de aceptación

- **CA-1:** al ingresar a la pantalla, se muestra por defecto el resumen del mes en curso con su respectivo balance neto, total recaudado y total de gastos.
- **CA-2:** el uso del navegador mensual actualiza instantáneamente los datos mostrados en la tarjeta superior y en las listas de categorías.
- **CA-3:** las ventas y los gastos se agrupan de forma correcta por categoría y se ordenan descendentemente según su importe total en el mes.
- **CA-4:** se muestran las cantidades de transacciones asociadas a cada categoría de forma clara.

## Fuera de alcance

Gráficos estadísticos complejos (tortas, barras de evolución temporal) y filtros por medio de pago en esta vista de resumen.

---