# Tareas del MVP: listado de ventas

- [x] **T-01. Modelo simple y caso de uso**. RF: RF-1, RF-2. **Hecho cuando:** el SERVICE obtiene del puerto las ventas de hoy del usuario autenticado y devuelve los datos para el listado.
- [x] **T-02. Adaptador Supabase**. RF: RF-1. **Hecho cuando:** el REPOSITORY consulta el rango de la zona horaria activa y resuelve categoría y medio de pago mediante sus relaciones; RLS aplica el aislamiento por usuario.
- [x] **T-03. Vista mobile-first en la ruta principal**. RF: RF-1, RF-2, RF-3. **Hecho cuando:** la ruta `/` (declarada en `src/router/index.tsx`) muestra una vista bajo `src/presentation/views/`; la tabla de la libreria UI (Hero) muestra ventas, estados, acción de detalle y total del día, y se adapta a móvil.
- [x] **T-04. Comprobación de código**. RF: RF-1 a RF-3. **Hecho cuando:** pasan los tests de presentación, typecheck y lint.
- [ ] **T-05. Verificación de integración Supabase**. RF: RF-1. **Hecho cuando:** se confirma que las políticas RLS del entorno conectado aíslan las ventas por usuario.
