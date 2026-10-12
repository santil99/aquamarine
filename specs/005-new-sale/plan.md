# Plan pragmático

1. **Persistencia:** extender el contrato SERVICE/REPOSITORY para listar categorías y medios de pago y registrar una venta asociada al usuario autenticado.
2. **Formulario:** crear la vista mobile-first de Nueva venta y su adaptador de ruta en `/sales/new`, con validación, carga, éxito y error.
3. **Navegación:** reemplazar las opciones ficticias del drawer por Nueva venta y Ventas del día con navegación real e iconos; representar ventas sin medio de pago.
4. **Validación:** cubrir las interacciones y estados visibles con tests de presentación y ejecutar tests, typecheck y lint.

## Nota de persistencia

El repositorio no contiene migraciones ni tipos generados de Supabase. La base debe admitir `sales.detail` y un `sales.payment_method_id` nulo antes de habilitar el registro con este contrato.