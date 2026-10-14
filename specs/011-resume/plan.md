# Plan pragmático y Tareas

1. **Servicio y Consultas Agregadas:** extender los repositorios o crear métodos específicos en Supabase que devuelvan las sumas agrupadas por categoría y las cantidades de transacciones para el rango mensual seleccionado (tanto para `sales` como para `expenses`).
2. **Componente de Cabecera y Métricas:** desarrollar el bloque superior con el navegador mensual y la tarjeta de resumen financiero (Balance Neto, Recaudado y Gastos con contadores).
3. **Listados Agrupados por Categoría:** maquetar las secciones de ventas y gastos por categoría ordenadas por importe con los componentes de la librería UI.
4. **Validación:** probar la navegación entre meses, verificar la correcta ejecución de los agrupamientos y superar las pruebas de tipo, lint y presentación.

### Tareas
- [x] **T-01. Consultas agregadas por mes y categoría (Supabase)**. RF: RF-3, RF-4. **Hecho cuando** los servicios devuelvan las sumas y cantidades agrupadas por categoría para ventas y gastos dentro de un mes determinado.
- [x] **T-02. Navegador mensual y tarjeta de balance superior**. RF: RF-1, RF-2. **Hecho cuando** la interfaz renderice el selector de mes y calcule correctamente el Balance Neto, Total Recaudado y Total de Gastos del período.
- [x] **T-03. Listados de Ventas y Gastos por Categoría**. RF: RF-3, RF-4. **Hecho cuando** se muestren las categorías ordenadas de mayor a menor monto con sus respectivas cantidades de transacciones.
- [ ] **T-04. Integración y validación visual**. CA: CA-1 a CA-4. **Hecho cuando** la pantalla funcione de manera fluida en mobile/desktop y se superen las pruebas de código, typecheck y lint.