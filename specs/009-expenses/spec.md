# Listado de gastos y navegación mensual — SPEC

## Objetivo

Permitir visualizar el listado de gastos en una tabla con sus datos principales y navegar entre diferentes períodos mediante un selector mensual con flechas laterales y selector de mes/año, reutilizando o adaptando la lógica del navegador por fechas.

## Requisitos funcionales

- **RF-1. Listado de gastos:** presentar los gastos registrados en una tabla que incluya las siguientes columnas:
  - Fecha
  - Monto
  - Categoría
  - Medio de pago
  - Acción / "Ver" (icono de ojo para acceder al detalle `/expenses/:id`)
- **RF-2. Navegador de período mensual:** ubicar una barra superior inmediatamente arriba de la tabla con la misma estructura visual que `DateNavigator`:
  - Botón con flecha izquierda (`<`): retrocede al mes anterior.
  - Botón con flecha derecha (`>`): avanza al mes siguiente.
  - Etiqueta central dinámica: muestra el mes y año seleccionados (ej. `"Octubre 2026"`, `"Septiembre 2026"`).
- **RF-3. Selector de mes (Month/Date Picker):** al hacer clic o tocar en la etiqueta central del navegador, se abre un selector que permite elegir directamente un mes y año específicos.
- **RF-4. Carga de datos por período:** al cambiar de mes (mediante flechas o selector), actualizar la consulta en la tabla `expenses` filtrando los registros desde el primer día hasta el último día del mes seleccionado.
- **RF-5. Reutilización de componentes:** evaluar la abstracción de `DateNavigator` (o extenderlo con una propiedad de modo, ej. `mode="day" | "month"`) para reutilizar el componente visual y la interacción de navegación entre las pantallas de Ventas y Gastos.

## Requisitos de interfaz

- Diseñado mobile-first y adaptable a desktop.
- Consistencia estética y de UX con el listado y navegador de ventas.
- Formatos de moneda y fechas adaptados a la localización local (`es-AR`).

## Criterios de aceptación

- **CA-1:** al ingresar a la pantalla de gastos, el navegador muestra el mes en curso (ej. `"Octubre 2026"`) y carga los gastos correspondientes a dicho mes.
- **CA-2:** presionar la flecha izquierda cambia la consulta al mes anterior y actualiza la lista.
- **CA-3:** presionar la flecha derecha cambia la consulta al mes siguiente y actualiza la lista.
- **CA-4:** hacer clic en la etiqueta central abre el selector de mes; al seleccionar un período, la vista se actualiza con los gastos correspondientes.
- **CA-5:** presionar el ojo en cualquier fila redirige a la vista del detalle del gasto (`/expenses/:id`).

## Fuera de alcance

Filtros avanzados dentro del listado (estos corresponden a la pantalla de consultas), creación o edición de gastos directamente sobre la tabla.

---
