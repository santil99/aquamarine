
# Plan pragmático

1. **Repositorio y Servicios:** extender los métodos de datos para permitir insertar (`create`), actualizar (`update`) y eliminar (`delete`) registros en la tabla `expenses`.
2. **Vista de Nuevo Gasto (`/expenses/new`):** maquetar el formulario mobile-first consumiendo las categorías de gastos y medios de pago, implementando la lógica de validación y envío.
3. **Vista de Detalle y Edición (`/expenses/:id`):** crear la ruta dinámica y el formulario correspondiente cargado con los datos del gasto específico, conectando las acciones de Guardar, Cancelar y Eliminar.
4. **Navegación:** vincular las rutas desde el listado de gastos (tanto la opción de nuevo gasto en el menú/drawer como el botón de ojo en la tabla).
5. **Validación:** probar flujos completos de creación, edición y eliminación superando las pruebas de código, typecheck y lint.

---

# Tareas: Inserción y modificación de gastos

- [x] **T-01. Métodos de repositorio para gestión de gastos**. RF: RF-1, RF-2. **Hecho cuando:** el servicio de Supabase soporte insertar, actualizar por ID y eliminar registros en `expenses`.
- [x] **T-02. Pantalla y formulario de Nuevo Gasto (`/expenses/new`)**. RF: RF-1. **Hecho cuando:** la vista valide monto y categoría obligatorios, cargue los selectores de categorías y medios de pago, y persista exitosamente el nuevo gasto.
- [x] **T-03. Pantalla de Detalle y Edición (`/expenses/:id`)**. RF: RF-2. **Hecho cuando:** al hacer clic en el ojo del listado se navegue a la vista cargando los datos del gasto en campos editables.
- [x] **T-04. Acciones de Guardar, Cancelar y Eliminar**. RF: RF-2. **Hecho cuando:** los botones ejecuten correctamente la actualización de cambios, el retorno sin guardar y la eliminación con confirmación del gasto.
- [x] **T-05. Validación y pruebas**. CA: CA-1 a CA-5. **Hecho cuando:** se compruebe el comportamiento en mobile/desktop y se superen las pruebas de tipo, lint y presentación.