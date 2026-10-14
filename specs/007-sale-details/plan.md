# Plan pragmático

1. **Persistencia y Repositorio:** extender el servicio/repositorio de ventas con los métodos para obtener por ID (`getById`), actualizar (`update`) y eliminar (`delete`).
2. **Vista de detalle y ruta:** crear la pantalla mobile-first en `/sales/:id` con fecha y hora informativas y los campos editables cargados con los datos de la venta.
3. **Acciones del formulario:** implementar los controladores para las acciones de Guardar (validación y submit), Cancelar (navegación de regreso) y Eliminar (diálogo de confirmación y eliminación).
4. **Conexión desde el listado:** vincular la acción del botón de ojo en la tabla para que navegue hacia `/sales/:id`.
5. **Validación:** probar los estados y acciones de presentación (visualizar, editar, cancelar y eliminar) con tests, typecheck y lint. Guardar/eliminar regresan al listado con los datos recargados y feedback localizado.

---