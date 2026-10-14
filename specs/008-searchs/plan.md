# Plan pragmático

1. **Estructura y Estado del Formulario:** crear la vista de consultas (`/search` o `/consultas`) e inicializar los estados del selector de tipo (Ventas/Gastos), rango de fechas y rango de montos.
2. **Servicio y Consulta Filtrada (Supabase):** extender el repositorio de ventas para soportar consultas con filtros opcionales de fecha desde/hasta, monto min/max, texto en descripción, ID de categoría e ID de medio de pago.
3. **Componentes de UI (Filtros y Tarjetas):** maquetar el panel de filtros con Hero UI y crear el componente `TransactionCard` para mostrar la descripción, categoría, fecha, medio de pago, monto y el acceso directo al detalle (`/sales/:id`)[cite: 3].
4. **Preparación de Arquitectura Extensible:** desacoplar los tipos y hooks de carga de categorías de modo que la conmutación a "Gastos" cambie el catálogo consultado y oculte campos no aplicables.
5. **Validación:** probar combinaciones de filtros, flujo de limpieza, navegación al detalle y pasar typecheck y lint.

---

# Tareas: Pantalla de consulta de ventas

- [ ] **T-01. Vista base y selector Ventas/Gastos**. RF: RF-1. **Hecho cuando:** la pantalla `/consultas` renderice el selector superior (Ventas/Gastos) y oculte o muestre dinámicamente los campos según la opción activa.
- [ ] **T-02. Formulario de filtros (Fechas, Montos, Texto, Categoría, Medio de pago)**. RF: RF-2. **Hecho cuando:** el formulario inicialice las fechas al mes actual, disponga de los campos de rango de monto min/max, texto, selectores y botones de "Buscar" y "Limpiar".
- [ ] **T-03. Extensión del repositorio para búsqueda avanzada con rangos**. RF: RF-2, RF-4. **Hecho cuando:** el método de búsqueda en Supabase aplique los filtros de rango de fechas (`gte`/`lte`), rango de montos (`gte`/`lte`), búsqueda parcial de texto (`ilike`) y filtros de catálogo.
- [ ] **T-04. Tarjetas de resultados (`TransactionCard`) y contador**. RF: RF-3, RF-4. **Hecho cuando:** se desplieguen las ventas encontradas en tarjetas con la descripción en lugar destacado, contador de registros y acceso al detalle (`/sales/:id`)[cite: 3].
- [ ] **T-05. Validación e integración**. CA: CA-1 a CA-6. **Hecho cuando:** se compruebe el funcionamiento en mobile y desktop, la correcta respuesta ante filtros combinados y se superen las pruebas de código, typecheck y lint.