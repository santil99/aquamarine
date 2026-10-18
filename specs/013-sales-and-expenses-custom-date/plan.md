
## 4. Plan de Trabajo Paso a Paso (Solo Código Frontend)

### Paso 1: Actualización de Tipos TypeScript
- Actualizar las interfaces/tipos en el código frontend (ej. `Venta`, `Gasto`, payloads de `InsertVenta`, `InsertGasto`) para incluir los campos opcionales/requeridos `sale_date` y `expense_date`.

### Paso 2: Componente Reutilizable de Selección de Fecha
- Crear un componente React enfocado en UX minimalista usando HeroUI.
- Manejar el estado local para alternar entre el modo "Hoy" y el modo "Fecha personalizada".
- Asegurar que por defecto la prop entregue la fecha actual formateada correctamente para Supabase (ej. `YYYY-MM-DD` o formato ISO).

### Paso 3: Integración en Formulario de Ventas y Formulario de Gastos
- Importar e integrar el componente en el formulario de ventas y de gastos.
- Ubicarlo en un área secundaria (ej: en el footer junto a los botones de acción o en la cabecera en un costado discreto) para preservar el layout actual.
- Incluir los campos `sale_date` y `expense_date` en las payloads de `INSERT` que se envían a Supabase.

### Paso 4: Actualización de Consultas / Dashboard (Si corresponde en el cliente)
- Asegurar que las llamadas a la API/Supabase que leen ventas o gastos para listados, reportes o balances filtren/ordenen por `fecha_venta` / `fecha_gasto` en lugar de la fecha de creación (`created_at`).

---

## 5. Requerimiento de Documentación Final

Al finalizar el trabajo en el código, deberás entregar una **explicación técnica clara y estructurada** que detalle:
1. **Estructura de Componentes:** Qué componentes se modificaron o crearon.
2. **Props y Estado:** Flujo de datos, props recibidas/emitidas y manejo del estado.
3. **Comunicación con Supabase:** Cómo se estructuran los objetos enviados en los `INSERT` / `SELECT`.
4. **Resumen de Código:** Explicación de por qué la solución es limpia, extensible, escalable y sólida.

---