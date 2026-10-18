# Spec & Plan de Implementación: Fecha de Transacción Personalizada (Frontend)

## 1. Contexto y Objetivos

- **Objetivo:** Permitir registrar ventas y gastos en fechas pasadas o específicas desde el cliente React sin alterar la fecha real de creación (`created_at`).
- **Enfoque de Negocio:**
  - Separar la **auditoría** (`created_at`, manejada por la DB) de la **lógica de negocio** (`fecha_venta` y `fecha_gasto`, enviadas desde el frontend).
- **Principios de UX/UI:**
  - Mantener la estructura e impacto visual actual para no marear al usuario habitual.
  - La fecha predeterminada siempre será el día actual ("Hoy").
  - La opción de cambiar la fecha debe ser **sutil, opcional y no invasiva**.

---

## 2. Asunciones de Base de Datos (Manejado por el Usuario)

> *Nota: La migración SQL en Supabase ya fue realizada manualmente en las tablas `ventas` y `gastos` agregando las columnas `sale_date` y `expense_date` de tipo `DATE` (o `TIMESTAMPTZ`) con default de la fecha actual.*

---

## 3. Especificación de UI/UX (HeroUI / React)

### Comportamiento Visual
1. **Flujo principal (90% de los casos):** El usuario abre el formulario de venta o gasto, carga los ítems/montos como siempre y guarda. La fecha asignada por defecto es la de hoy sin requerir ningún clic extra.
2. **Acceso al cambio de fecha (Sutil):**
   - En lugar de colocar un `DatePicker` grande predeterminado que recargue visualmente el formulario, usar un elemento secundario colapsado o minimalista (por ejemplo: un link o chip secundario *"Fecha: Hoy (editar)"* o un botón discreto con ícono de calendario).
   - Al hacer clic, se despliega o habilita el selector de fecha (`DatePicker` / `Input date` de HeroUI).
   - Debe percibirse visualmente como un ajuste opcional y secundario. Tienes libertad de ser creativo y hacerlo de la forma que prefieras.

---

