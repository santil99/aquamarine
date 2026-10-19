# Plan de implementación: Imágenes en Ventas (014)

## Decisiones clave
- **Se reutiliza la columna existente `public.sales.images` (`jsonb`, array) y el bucket `sales-images`, sin cambios en base de datos ni migraciones.** Las imágenes ya guardadas se conservan. Las nuevas se agregan al mismo array. Las URLs firmadas se generan al cargar la venta y nunca se persisten.
- **Convención de rutas existente:** nuevas imágenes como `sales/{timestamp}_{uuid}.{ext}` (igual que las ya guardadas, sin carpeta por venta). Como la ruta no depende del `sale_id`, las subidas pueden hacerse antes del insert: si el insert falla, se borran los objetos subidos. Evita huérfanos en el alta.
- **Edición en orden seguro:** subir nuevas → actualizar fila con `images` final → borrar objetos quitados. Si el update falla, se borran las nuevas subidas; los originales no se tocan hasta confirmar.
- **Borrado de venta:** borrar fila y luego sus objetos. Si falla el borrado de objetos, se registra el error (queda huérfano recuperable, no pierde datos).
- **Compresión simple en cliente** antes de subir: escalar a 1600 px de lado mayor y recodificar a `image/webp` (fallback `image/jpeg`) con `canvas.toBlob`. El `contentType` y la extensión salen del formato real del blob. Se valida tipo de entrada (`jpeg`, `png`, `webp`) y tamaño máximo de **5 MB** antes de comprimir.
- **Sin dependencias nuevas.** Dibujo con `<canvas>` nativo; cámara con `<input type="file" accept="image/*" capture="environment">`; galería con el mismo input sin `capture`.

## Fases

### 1. Base de datos y Storage
- Sin cambios en base de datos ni en Storage: se usan `sales.images` y el bucket `sales-images` tal como están.
- Bucket privado `sales-images` con políticas de Storage alineadas al RLS existente (sin asumir acceso público).

### 2. Dominio y puertos (`domain/sales`, `application/ports`)
- Extender `SaleDetail`, `NewSaleInput` y `SaleChanges` con `imagePaths: string[]`.
- Nuevo puerto `SalesImageStorage`: `upload(path, file, contentType)`, `createSignedUrls(paths)`, `remove(paths)`.
- Constante `MAX_SALE_IMAGES = 3` en dominio, validada también en servicio (no solo en UI).

### 3. Aplicación (`SalesService`)
- `registerSale`: subir → insertar → compensar (borrar subidas) si falla el insert.
- `updateSale`: subir nuevas → update → borrar quitadas → compensar subidas si falla el update.
- `deleteSale`: borrar fila → borrar objetos (log si falla).
- `getSale`: devolver rutas + URLs firmadas recién generadas (`createSignedUrls`).
- Validar límite de 3, tipos permitidos y tamaño máximo (5 MB) antes de subir.

### 4. Infraestructura
- `SupabaseSalesImageStorage` (adaptador de Storage con `contentType` explícito).
- `supabaseSalesRepository`: mapear `images` en create/update/getById.

### 5. Presentación (`features/shared/`, por ser común a Nueva y Detalle)
- `SaleImagesField`: botón `Adjuntar imagen (X/3)` con `Dropdown` de HeroUI (galería, cámara, dibujar); deshabilitado en 3/3; tira de miniaturas con `(x)` y vista previa en `Modal`. Iconos de `lucide-react`.
- `DrawingCanvasModal`: barra superior (volver, título, limpiar, confirmar) y lienzo; al confirmar genera `File` PNG.
- Hook `useSaleImages`: estado de la lista (nuevas en memoria con `URL.createObjectURL`, existentes con su ruta, quitadas) y validación de límite. Solo si se comparte entre las dos vistas.
- Integrar en `NewSaleView` y `SaleDetailView`, justo antes del botón principal.
- Utilidad `compressImage(file)` en `presentation/` fuera del componente (escala y recodifica, como se describe arriba). Lienzo: el PNG del dibujo pasa por la misma compresión.
- Revocar `ObjectURL` al quitar una imagen o desmontar.
- Errores de subida: toast/alerta sin perder los datos del formulario.
- Textos en `texts/es.ts` y `texts/en.ts`, vía `useTexts()`.

### 6. Tests (moderados, solo presentación, en `features/shared/tests/` y `features/sales/tests/`)
- Límite 3/3 deshabilita el botón y el contador.
- Quitar una miniatura actualiza la lista; la vista previa abre el modal.
- Confirmar dibujo agrega una imagen PNG.
- Sin tests para servicios ni repositorios.

### 7. Validación
- `pnpm typecheck`, `pnpm lint` (sin warnings), `pnpm test`, `pnpm build`.
- No levantar dev server; no afirmar verificación visual.

## Riesgos
- Subidas parciales en red inestable → compensación en servicio y mensaje de error al usuario.
- Objetos huérfanos si falla el borrado de Storage → registrados en log; limpieza manual o job futuro (fuera de alcance).
- Firmas expiradas en pantallas abiertas por mucho tiempo → regenerar al volver a consultar `getSale`.

## Preguntas abiertas
Ninguna. Formato confirmado: `sales.images` guarda rutas de Storage (`sales/{timestamp}_{uuid}.jpg`) y el bucket `sales-images` es privado.
