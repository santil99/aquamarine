# Listado de ventas — MVP

## Objetivo

Permitir a un miembro consultar las ventas de hoy de su negocio en una tabla sencilla. La fecha de venta determina el día según la zona horaria del negocio; si no se indicó, se usa el momento actual.

## Requisitos

- **RF-1. Consulta:** al abrir la ruta principal (`/`), el SERVICE obtiene de Supabase las ventas de hoy visibles para el usuario autenticado y entrega el resultado a la vista. El límite del día respeta la zona horaria del contexto activo; RLS restringe el acceso por usuario.
- **RF-2. Tabla:** mostrar monto, categoría, medio de pago y una acción de detalle sin navegación implementada. No mostrar descripción, fecha ni identificadores internos. El monto no lleva moneda, admite hasta dos decimales, no tiene tope funcional para la parte entera, muestra dos dígitos si la fracción no es cero y omite decimales si es cero. Al final, mostrar la suma exacta de los montos del día.
- **RF-3. Estados:** distinguir carga, resultado vacío y error de consulta; permitir reintentar tras un error.

## Requisito de interfaz

- **Mobile-first:** la tabla debe adaptarse al ancho disponible en móviles; sus columnas deben permanecer legibles sin desbordamiento horizontal. En pantallas mayores puede ocupar un ancho más amplio.

## Fuera de alcance

Ordenar o filtrar el listado, crear o editar ventas, pantalla de detalle, historial y selector de negocio.

## Contrato de datos esperado

El adaptador consulta `sales(id, created_at, amount, category_id, payment_method_id, user_id)` y relaciona `category_id` con `categories(id, name)` y `payment_method_id` con `payment_methods(id, name)`. La consulta no valida la sesión ni filtra por identidad; las políticas RLS deben mantener el aislamiento por usuario. El contexto de negocio continúa siendo mock y se utiliza para la zona horaria.
