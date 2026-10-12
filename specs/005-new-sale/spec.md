# Nueva venta y navegación lateral — MVP

## Objetivo

Permitir registrar ventas en la base de datos y acceder desde el menú lateral a Nueva venta y Ventas del día.

## Requisitos funcionales

- **RF-1. Navegación:** el drawer muestra “Nueva venta” y “Ventas del día”, sin opciones ficticias. Cada opción tiene un icono a la izquierda (HeroUI deberia ofrecer algo asi). Nueva venta abre `/sales/new`; Ventas del día abre `/`. Al navegar, el drawer se cierra. Se conservan el perfil y el control de tema existentes.
- **RF-2. Formulario:** incluir Monto numérico, Categoría, Medio de pago y Descripción/Detalle. Solo Monto y Categoría son obligatorios. Categoría y Medio de pago cargan opciones de sus tablas existentes y guardan los identificadores seleccionados.
- **RF-3. Monto:** ingresar en pesos argentinos (ARS), exigir un valor mayor que cero, aceptar montos enteros como caso habitual y permitir hasta dos decimales para excepciones. No imponer un máximo funcional ni redondear o descartar decimales ingresados.
- **RF-4. Descripción:** es opcional; si se proporciona, limitar a 500 caracteres y persistirla en `sales.detail` junto con la venta.
- **RF-5. Registro:** “Registrar venta” valida los campos obligatorios y guarda la venta inmediatamente. Mientras se procesa, indicar carga e impedir envíos duplicados. Asociar la venta al usuario autenticado y mantener el aislamiento por RLS.
- **RF-6. Resultado:** ante éxito, mostrar un snackbar de confirmación en la zona inferior, después del formulario; limpiar los campos y permanecer en Nueva venta. Ante error, mostrar un mensaje comprensible, conservar los datos y permitir reintentar.
- **RF-7. Persistencia opcional:** permitir registrar sin medio de pago y guardar la relación como ausente. El esquema debe admitir un medio de pago nulo y almacenar el detalle opcional en `sales.detail`.
- **RF-8. Exclusiones:** adjuntar imágenes no forma parte de esta etapa.

## Requisitos de interfaz

- Mobile-first; controles etiquetados y operables con teclado y tecnologías de asistencia.
- Textos y formatos numéricos respetan la localización argentina configurada. Presentar los montos priorizando pesos enteros y conservar las fracciones excepcionales.

## Criterios de aceptación

- **CA-1:** monto vacío, cero, negativo o con más de dos decimales no permite registrar; un monto entero positivo y uno positivo con hasta dos decimales se guardan sin alterar su valor.
- **CA-2:** Categoría es obligatoria; Medio de pago y Descripción/Detalle pueden omitirse. Si se completa Detalle, se aceptan hasta 500 caracteres y no se permite exceder ese límite.
- **CA-3:** los Select muestran opciones de sus catálogos existentes y se persisten los identificadores seleccionados.
- **CA-4:** un envío válido registra inmediatamente una sola venta; durante la espera se previenen duplicados. Al completarse con éxito aparece confirmación debajo del formulario, se limpian los campos y se permanece en `/sales/new`.
- **CA-5:** ante fallo de guardado aparece un error, se conservan los datos y es posible reintentar sin duplicar una venta exitosa.
- **CA-6:** desde el drawer, Nueva venta abre `/sales/new` y Ventas del día abre `/`; el drawer se cierra al navegar y no muestra opciones ficticias.
- **CA-7:** una venta registrada aparece en Ventas del día cuando corresponda según la fecha y zona horaria del negocio.

## Fuera de alcance

Adjuntar imágenes, editar o eliminar ventas, detalle de venta, filtros, ordenamiento, historial y selector de negocio.