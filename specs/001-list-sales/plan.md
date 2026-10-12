# Plan pragmático

1. **Modelo y SERVICE:** definido en T1; tipo plano de venta y SERVICE que consulta las ventas de hoy del negocio activo mediante REPOSITORY. RF: RF-1, RF-2.
2. **REPOSITORY Supabase:** consultar `sales` por usuario autenticado y día en la zona horaria del contexto activo, resolviendo categoría y medio de pago mediante sus relaciones. RF: RF-1.
3. **Vista mobile-first en la ruta principal:** mantener la UI en `src/presentation/views/SalesListView.tsx`; `src/router/index.tsx` solo compone el SERVICE y declara la ruta `/` con esa vista. Usar tabla de la libreria UI sin sorting ni filtros, mostrar estados, acción de detalle y suma diaria. RF: RF-1, RF-2, RF-3.
4. **Comprobación:** ejecutar tests de presentación, typecheck y lint. Confirmar las políticas RLS al conectar el entorno Supabase. RF: RF-1 a RF-3.

Mantener la solución en las capas existentes solo donde aporte separación real. No crear servicios, value objects ni tests para formato o interacción básica de la tabla.
