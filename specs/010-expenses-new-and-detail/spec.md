# Inserción y edición de gastos — SPEC

## Objetivo

Permitir registrar un nuevo gasto y consultar, editar o eliminar un gasto existente a través de dos pantallas dedicadas (`/expenses/new` y `/expenses/:id`), manteniendo paridad visual y funcional con el módulo de ventas.

## Requisitos funcionales

- **RF-1. Pantalla de Nuevo Gasto (`/expenses/new`):**
  - **Monto:** numérico, obligatorio, expresado en pesos argentinos (ARS), mayor a cero, con soporte para enteros y hasta dos decimales.
  - **Categoría:** selector obligatorio cargado desde la tabla de categorías de gastos (`expense_categories`).
  - **Medio de pago:** selector opcional cargado desde la tabla de medios de pago.
  - **Detalle:** campo de texto libre opcional (máx. 500 caracteres).
  - **Acción:** botón "Registrar gasto" que valida los campos, muestra estado de carga, previene envíos duplicados, guarda el registro asociado al usuario autenticado y muestra feedback (limpiando campos en caso de éxito).
- **RF-2. Pantalla de Detalle y Edición de Gasto (`/expenses/:id`):**
  - Se accede mediante el botón del "ojo" desde el listado de gastos.
  - Muestra la fecha y hora del registro (no editable o informativa) y campos editables para **Monto**, **Categoría**, **Medio de pago** y **Detalle**.
  - **Guardar cambios:** valida y actualiza la información en la base de datos, regresando al listado tras el éxito.
  - **Cancelar:** descarta los cambios y regresa al listado de gastos sin modificar el registro.
  - **Eliminar gasto:** solicita confirmación previa y, al aceptar, borra permanentemente el registro en la base de datos y redirige al listado principal.

## Requisitos de interfaz

- Diseño mobile-first adaptado al sistema visual (campos redondeados y claros).
- Botones de acción principales alineados con la estética de ventas (Guardar / Cancelar) y botón destructivo destacado en rojo para "Eliminar".

## Criterios de aceptación

- **CA-1:** el formulario de nuevo gasto exige monto y categoría; permite omitir medio de pago y detalle, guardando correctamente los datos en Supabase.
- **CA-2:** al hacer clic en el "ojo" de cualquier fila del listado de gastos, navega a `/expenses/:id` cargando los datos correspondientes en los inputs.
- **CA-3:** modificar los campos y presionar "Guardar" persiste los cambios en la base de datos y redirige al listado.
- **CA-4:** presionar "Cancelar" descarta cualquier cambio sin afectar el registro.
- **CA-5:** presionar "Eliminar gasto" con confirmación borra el registro de la tabla `expenses` y redirige a la vista principal.

## Fuera de alcance

Adjuntar imágenes de comprobantes o tickets (reservado para etapas futuras).

---
