# Gráfico de ventas diarias — SPEC

## Objetivo

Mostrar en la pantalla de Resumen la evolución de las ventas (recaudado) día a día del mes seleccionado, para ver el ritmo de cobro dentro del mes. No incluye balance ni gastos.

## Requisitos funcionales

- **RF-1. Serie diaria:** un punto por día con ventas, desde el día 1 hasta hoy en el mes en curso, o hasta el último día en meses pasados. Los días con total 0 se omiten (se asume que el negocio no abrió). Meses futuros no tienen puntos.
- **RF-2. Agrupado por zona horaria del negocio:** cada venta se asigna al día local del negocio.
- **RF-3. Ubicación:** el gráfico es el primer bloque del contenido del Resumen, antes de la tarjeta "Balance neto".
- **RF-4. Tooltip:** muestra la fecha y el monto exacto de ese día con formato de moneda.
- **RF-5. Cambio de mes:** al cambiar de mes con el navegador, el gráfico se recalcula junto con el resto de la pantalla.

## Requisitos de interfaz

- Ocupa aproximadamente la mitad de la altura de la pantalla (`40svh`, mínimo 16rem), mobile-first.
- Línea con puntos circulares; el punto crece al pasar el cursor o tocarlo.
- Sin leyenda; el título "Ventas diarias" va sobre el gráfico.
- Mientras carga, se muestra solo el `Spinner` existente.

## Criterios de aceptación

- **CA-1:** al entrar a Resumen se ve la serie del mes en curso, con el día actual como último punto.
- **RF-6. Ticket promedio:** una card debajo de "Recaudado" y "Gastos" muestra el promedio de las ventas diarias, sin contar los días con total 0.
- **CA-2:** un día con total 0 no aparece en el gráfico, y no genera saltos ni huecos en la línea.
- **CA-3:** el tooltip muestra el monto de ventas de ese día, igual a la suma de las ventas registradas en esa fecha.
- **CA-4:** el gráfico queda entre el navegador de mes y "Balance neto".

## Fuera de alcance

Gráfico de gastos o balance diario, selector de tipo de gráfico, filtros por medio de pago y exportación.
