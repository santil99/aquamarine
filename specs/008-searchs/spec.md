# Consulta de transacciones (Ventas / Gastos) — SPEC

## Objetivo

Permitir buscar y consultar transacciones pasadas en una pantalla dedicada (`/search` o `/consultas`), filtrando por rango de fechas, rango de montos, texto en descripción, categoría y medio de pago. La vista debe renderizar los resultados en tarjetas verticales enfocadas en la visibilidad de la descripción y estar preparada arquitectónicamente para conmutar entre Ventas y Gastos mediante un selector superior.

## Requisitos funcionales

- **RF-1. Selector de Tipo de Transacción (Ventas / Gastos):**
  - Selector superior para conmutar entre "Ventas" y "Gastos".
  - En esta primera etapa, "Ventas" estará activo por defecto. Al cambiar a "Gastos" se ajustarán los campos disponibles (ej. ocultar medio de pago y cargar categorías de gastos) para mantener la arquitectura lista para la futura implementación de la entidad de gastos.
- **RF-2. Formulario de filtros de búsqueda:**
  - **Rango de Fechas:** Fecha desde y Fecha hasta. Por defecto, Fecha desde inicia el 1° del mes actual y Fecha hasta en la fecha de hoy.
  - **Rango de Monto:** filtro de monto mínimo y monto máximo para acotar búsquedas cuando no se conoce el valor exacto.
  - **Descripción / Detalle:** texto libre para búsqueda por coincidencia parcial (ej. "arito azul").
  - **Categoría:** selector desplegable dinámico según el tipo de transacción activo.
  - **Medio de pago:** selector desplegable (solo visible cuando el selector esté en "Ventas").
  - **Botones de acción:** botón "Buscar" para ejecutar la consulta y botón "Limpiar" para restablecer los filtros a sus valores predeterminados.
- **RF-3. Listado de resultados en Tarjetas (Cards):**
  - Renderizar los resultados como tarjetas individuales compactas (estilo filas altas) para facilitar la lectura en mobile.
  - **Información visible por tarjeta:** Categoría (destacada), Descripción/Detalle completo o truncado accesible, Fecha, Medio de pago, Monto en pesos ($) y un botón o enlace ("Ver detalle" o icono de ojo) que navegue a `/sales/:id`[cite: 3].
- **RF-4. Contador y estados de UI:**
  - Mostrar la cantidad total de registros encontrados (ej. "Ventas Encontradas (116)")[cite: 3].
  - Gestionar estados de carga (*skeleton/spinner*) durante la consulta y mensaje descriptivo en caso de no hallar resultados.

## Requisitos de interfaz

- Diseño mobile-first adaptable a desktop.
- Tarjetas con bordes redondeados y jerarquía visual clara: la descripción debe ser legible de un vistazo[cite: 3].
- Formatos de moneda en pesos argentinos (ARS) y fechas en formato localizado (`DD/MM/AAAA`).

## Criterios de aceptación

- **CA-1:** al ingresar a la pantalla, la pestaña "Ventas" está seleccionada por defecto y el rango de fechas abarca desde el primer día del mes corriente hasta el día actual.
- **CA-2:** el filtro de monto permite ingresar un valor mínimo y/o máximo, filtrando correctamente las transacciones que estén dentro del rango.
- **CA-3:** la búsqueda por coincidencia parcial en la descripción funciona en conjunto con el resto de los filtros (fechas, monto, categoría, medio de pago).
- **CA-4:** los resultados se presentan en formato de tarjetas individuales mostrando claramente la descripción y permitiendo navegar al detalle mediante "Ver detalle" o el ojo[cite: 3].
- **CA-5:** presionar "Limpiar" restablece todos los campos a su estado por defecto.
- **CA-6:** cambiar el selector superior a "Gastos" oculta el filtro de medio de pago y actualiza dinámicamente la configuración del formulario sin romper la aplicación.

## Fuera de alcance

Persistencia y registro de nuevas transacciones de gastos en base de datos (esta etapa solo prepara el selector de UI y los adaptadores de datos).

---

