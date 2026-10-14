
# Plan pragmático

1. **Abstracción del Navegador:** refactorizar o extender `DateNavigator` para soportar la navegación tanto diaria (`"day"`) como mensual (`"month"`), compartiendo la interfaz visual y la apertura del selector.
2. **Servicio y Repositorio de Gastos:** implementar la consulta en Supabase (`expenses`) para filtrar gastos dentro del rango del mes seleccionado (desde el primer hasta el último segundo del mes).
3. **Pantalla y Tabla de Gastos:** maquetar la vista `/expenses` (o pantalla principal de gastos) con la tabla que muestre Fecha, Monto, Categoría, Medio de pago y la columna de acción con el botón de ojo.
4. **Conexión de Navegación al Detalle:** vincular la acción del botón de ojo en la tabla para que redirija a `/expenses/:id`.
5. **Validación:** probar el funcionamiento del cambio de mes (flechas y selector), la consulta de datos y superar tests, typecheck y lint.

---

# Tareas: Listado de gastos

- [x] **T-01. Adaptación del navegador a modo mensual (`DateNavigator`)**. RF: RF-2, RF-3, RF-5. **Hecho cuando:** el componente de navegación soporte el modo mensual, mostrando `"Mes Año"` (ej. `"Octubre 2026"`) y permitiendo cambiar de mes con las flechas o abriendo un selector mensual.
- [x] **T-02. Método de repositorio para listar gastos por mes**. RF: RF-4. **Hecho cuando:** el servicio de `expenses` en Supabase devuelva las transacciones del período filtrado entre el primer y el último día del mes dado.
- [x] **T-03. Pantalla de listado y tabla de gastos**. RF: RF-1. **Hecho cuando:** la vista muestre la tabla con las columnas Fecha, Monto, Categoría, Medio de pago y la columna de acción con el icono de ojo.
- [x] **T-04. Enlace al detalle del gasto**. RF: RF-1. **Hecho cuando:** al tocar el botón de ojo en una fila se navegue a la vista `/expenses/:id`.
- [x] **T-05. Pruebas y validación de interfaz**. CA: CA-1 a CA-5. **Hecho cuando:** se compruebe la navegación por meses, la correcta renderización de datos en mobile y desktop, y se superen las pruebas de código, typecheck y lint.
- [x] **T-06. En el menu lateral debe verse el nuevo item de menu para ir a la nueva pantalla de Gastos.