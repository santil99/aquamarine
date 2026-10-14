# Tareas: Detalle de venta

- [x] **T-01. Métodos de servicio/repositorio para venta individual**. RF: RF-1, RF-3, RF-5. **Hecho cuando:** el repositorio admita consultar por ID, actualizar y eliminar una venta en Supabase.
- [x] **T-02. Vista `/sales/:id` y formulario de detalle**. RF: RF-1, RF-2. **Hecho cuando:** al tocar el ojo del listado se navegue a la vista `/sales/:id`, con fecha y hora de solo lectura y los campos editables de monto, categoría, medio de pago y detalle.
- [x] **T-03. Flujo de edición y guardado**. RF: RF-3, RF-4. **Hecho cuando:** "Guardar" valide e informe el éxito/error, y al tener éxito vuelva al listado actualizado del mismo día; "Cancelar" vuelve al listado sin persistir cambios.
- [x] **T-04. Flujo de eliminación de venta**. RF: RF-5. **Hecho cuando:** el botón "Eliminar Venta" pida confirmación, borre el registro en la BD y redirija al listado actualizado con feedback.
- [x] **T-05. Pruebas y validación de interfaz**. CA: CA-1 a CA-4. **Hecho cuando:** se cubran estados y acciones de la presentación, y se superen las pruebas de presentación, typecheck y lint.