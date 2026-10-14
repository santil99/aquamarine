# Detalle, edición y eliminación de venta — SPEC

## Objetivo

Permitir consultar la información detallada de una venta individual desde el listado, así como editar sus campos o eliminar el registro.

## Requisitos funcionales

- **RF-1. Navegación:** al presionar el icono del ojo en la tabla de ventas, redirigir a la pantalla de detalle (`/sales/:id`).
- **RF-2. Visualización y edición:** mostrar los datos de la venta:
  - Fecha y hora del registro (con icono de calendario, solo informativo y no editable).
  - Monto (numérico, obligatorio).
  - Categoría (selector, obligatorio).
  - Medio de pago (selector, opcional).
  - Detalle / Notas (texto opcional, máx. 500 caracteres).
- **RF-3. Guardar cambios:** validar las modificaciones y actualizar la venta en la base de datos al presionar "Guardar". Mostrar feedback y volver al listado actualizado tras el éxito.
- **RF-4. Cancelar:** presionar "Cancelar" descarta cualquier modificación sin guardar y regresa al listado de ventas (`/`).
- **RF-5. Eliminar venta:** presionar "Eliminar Venta" solicita una confirmación previa. Al confirmar, elimina el registro en la base de datos y redirige al listado mostrando un mensaje de confirmación.

## Requisitos de interfaz

- Diseño mobile-first adaptado al estilo del sistema.
- Botón destructivo "Eliminar Venta" destacado con color de alerta (rojo).
- Gestión de estados de carga al obtener el detalle, guardar cambios o eliminar.

## Criterios de aceptación

- **CA-1:** al hacer clic en el ojo de una fila en `/`, navega a `/sales/:id` cargando los datos correspondientes.
- **CA-2:** fecha y hora se muestran sin posibilidad de edición; los demás campos editables se persisten al tocar "Guardar", que redirige al listado actualizado con un mensaje de éxito.
- **CA-3:** al tocar "Cancelar", se vuelve al listado del día consultado sin aplicar ningún cambio.
- **CA-4:** al presionar "Eliminar Venta" y confirmar, el registro se borra permanentemente y se redirige al listado actualizado con un mensaje de confirmación.

## Fuera de alcance

Historial de auditoría de cambios en la venta.

