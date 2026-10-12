# Login de usuario

## Propósito y alcance

Permitir que un usuario inicie sesión mediante Supabase Auth y, tras autenticarse, acceda al listado de ventas del día en `/`. Si ya tiene una sesión activa, dirigirlo directamente a ese listado. Esta funcionalidad se especifica por separado del MVP de ventas, cuyo alcance excluye autenticación real.

## Requisitos funcionales

- **RF-1. Formulario:** presentar un campo «Usuario o email» que recibe el email de la cuenta, un campo de contraseña, acción para ingresar y errores comprensibles y visibles. Los mensajes de validación deben indicar cómo corregir campos incompletos o inválidos.
- **RF-2. Autenticación:** validar email y contraseña mediante Supabase Auth. Ante rechazo o fallo de conexión, informar el error y permitir reintentar sin abandonar el formulario.
- **RF-3. Redirección:** tras autenticación exitosa, navegar al listado de ventas del día (`/`).
- **RF-4. Sesión activa:** al entrar a la pantalla de login, comprobar si existe una sesión autenticada; si existe, redirigir a `/`.
- **RF-5. Rutas protegidas:** `/login` es la única ruta pública. Si se accede a cualquier otra ruta sin sesión activa, redirigir a `/login` sin mostrar su contenido protegido.

## Requisitos no funcionales

- **RNF-1. Usabilidad:** diseñar mobile-first, usar etiquetas claras y permitir completar y enviar el formulario con teclado y tecnologías de asistencia.
- **RNF-2. Seguridad:** no exponer ni registrar credenciales en mensajes, URLs o logs; delegar la validación y gestión segura de autenticación a Supabase Auth.
- **RNF-3. Estados:** al enviar, mostrar carga y evitar envíos duplicados; ante errores de validación, autenticación o red, mostrar feedback visible y conservar la posibilidad de corregir o reintentar.
- **RNF-4. Localización:** los textos visibles deben respetar la localización configurada por la aplicación.

## Criterios de aceptación y casos de prueba

- **CA-1 (RF-1, RF-2, RF-3):** con credenciales válidas, el formulario muestra carga mientras se valida y, al completarse el inicio de sesión, navega a `/`.
- **CA-2 (RF-1, RF-2, RNF-3):** con credenciales rechazadas por Supabase, se muestra un mensaje visible, se habilita un nuevo intento y no se navega al listado.
- **CA-3 (RF-2, RNF-3):** ante un fallo de red, se muestra un error comprensible y se permite reintentar; no se presenta como autenticación exitosa.
- **CA-4 (RF-4):** al abrir la pantalla de login con sesión activa, se navega directamente a `/` sin solicitar credenciales.
- **CA-5 (RF-5):** al abrir `/` o cualquier ruta distinta de `/login` sin sesión activa, se redirige a `/login` y no se muestra el contenido protegido.
- **CA-6 (RF-1, RNF-1):** enviar campos requeridos vacíos o con formato inválido muestra validación junto a los campos y no inicia la autenticación.

## Contrato de interacción de pantalla

- **Elementos visibles (RF-1, RNF-1):** campo «Usuario o email» (para el email de la cuenta), campo de contraseña, botón de ingreso y espacio para errores generales y de validación.
- **Carga (RF-2, RNF-3):** durante el envío, indicar que se está ingresando e impedir envíos duplicados; al terminar con error, devolver el formulario a un estado utilizable.
- **Validación y errores (RF-1, RF-2, RNF-3, RNF-4):** mensajes localizados, visibles y asociados al campo o al error general correspondiente; permitir corregir y volver a intentar.
- **Navegación (RF-3, RF-4, RF-5):** login exitoso o sesión ya activa lleva a `/`; cualquier visita sin sesión a una ruta distinta de `/login` lleva a `/login`.
