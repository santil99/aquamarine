# Functional & Technical Spec: Asociación de Imágenes a Ventas (Max. 3)

## 1. Visión General
Permitir a los usuarios adjuntar hasta 3 imágenes o bocetos a una venta (tanto en el formulario de **Nueva Venta** como en la vista de **Detalle / Edición de Venta**). Las imágenes se almacenan en el bucket `sales-images` del Storage de Supabase y sus referencias/URLs se guardan asociadas a la transacción.

---

## 2. Requerimientos Funcionales y UX/UI

### 2.1. Botón de Acción (`Adjuntar imagen`)
- Ubicado justo al final del formulario de la venta, inmediatamente antes del botón principal (*"Registrar venta"* / *"Guardar cambios"*).
- Muestra dinámicamente la cantidad de imágenes cargadas respecto al límite máximo: `Adjuntar imagen (X/3)`.
- Si se alcanza el límite (3/3), el botón se inhabilita visualmente o deshabilita la apertura del menú de opciones.

### 2.2. Menú Desplegable de Fuentes (3 Opciones)
Al presionar `Adjuntar imagen (X/3)`, se despliega un menú con tres alternativas:
1. **Elegir de la galería:** Abre el selector nativo del sistema de archivos / galería del dispositivo.
2. **Tomar fotografía:** Activa la cámara del dispositivo (integración de cámara).
3. **Dibujar:** Abre un modal / pantalla de lienzo de dibujo interactivo.

### 2.3. Modal / Lienzo de Dibujo ("Dibujar Firma/Boceto")
- Pantalla o modal de dibujo tipo canvas.
- **Barra Superior:** 
  - Botón de volver/cancelar (flecha izquierda).
  - Título: *"Dibujar Firma/Boceto"*.
  - Botón de limpiar lienzo (ícono papelera).
  - Botón de confirmar/guardar dibujo (ícono check).
- **Lienzo:** Área blanca para trazado táctil o con cursor.
- Al confirmar, convierte el dibujo a formato de imagen (`image/png` en base64/blob) y lo agrega a la lista de imágenes seleccionadas.

### 2.4. Tira de Previsualización y Gestión de Imágenes
- Se muestra debajo del botón `Adjuntar imagen` y por encima del botón principal.
- Presenta las imágenes adjuntas en miniaturas cuadradas con bordes redondeados.
- **Eliminación:** Cada miniatura incluye un botón `(x)` flotante en la esquina superior derecha para quitar la imagen de la selección (y marcarla para eliminación en Supabase si ya estaba guardada).
- **Previsualización Ampliada:** Al hacer clic/tap sobre cualquiera de las miniaturas, se abre un modal de vista previa en tamaño completo.

---

## 3. Especificaciones Técnicas y Datos

### 3.1. Persistencia y Almacenamiento (Supabase Storage)
- **Bucket Target:** `sales-images` (público o con RLS configurado).
- **Estructura de Nombres / Path:** `sales/{sale_id}/{timestamp}_{index}.png` (o usando un UUID único por imagen para evitar colisiones).
- **Formatos Permitidos:** JPEG, PNG, WEBP.
- **Optimización:** Compresión opcional en cliente antes del upload para reducir tiempo de carga y uso de Storage.

### 3.2. Estructura de Datos (Tabla `sales`)
- Columna en la tabla `sales`: `image_urls` de tipo `TEXT[]` (array de strings) o `JSONB` para almacenar las URLs públicas o las rutas relativas dentro del bucket `sales-images`.

### 3.3. Ciclo de Vida del Adjunto (Nueva Venta vs. Modificación)

#### A. Nueva Venta
1. Las imágenes seleccionadas/dibujadas se mantienen temporalmente en memoria como `Blob` / `File` con URLs de objeto local (`URL.createObjectURL`).
2. Al presionar *"Registrar venta"*:
   - Se inserta el registro de la venta en la base de datos.
   - Se suben las imágenes a Supabase Storage bajo la carpeta asignada a esa venta.
   - Se actualizan las URLs finales en la columna `image_urls` de la venta.

#### B. Modificación / Edición de Venta
1. Se cargan las imágenes existentes guardadas en Supabase Storage.
2. Si el usuario elimina una imagen preexistente y guarda cambios, se remueve la URL de la base de datos y se elimina el archivo en Supabase Storage.
3. Si el usuario agrega nuevas imágenes, se suben al bucket y se actualiza la lista de URLs.

---

## 4. Validaciones y Manejo de Errores
- **Límite Estricto:** Máximo 3 imágenes por venta. Si la venta ya tiene 3 imágenes, no permite agregar más desde ninguna fuente.
- **Manejo de Errores de Red:** Si falla la subida de imágenes durante el registro/edición, se informa al usuario mediante una alerta o toast sin perder los datos ingresados en el formulario.