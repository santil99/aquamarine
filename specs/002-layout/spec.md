# Layout principal — MVP

## Objetivo

Dar al usuario que ya inició sesión y seleccionó un negocio un header común y un menú lateral con opciones preparadas para futuras pantallas.

## Requisitos

- **RF-1. Header:** mostrar “Mi negocio” centrado, el botón hamburguesa a la izquierda y un botón de cerrar sesión a la derecha. El botón de cerrar sesión no realiza ninguna acción en este MVP. En la selección de negocio solo se muestra el título; el login no usa este layout.
- **RF-2. Menú:** al activar el botón hamburguesa, abrir un panel lateral que muestre arriba el nombre disponible en los metadatos del usuario autenticado y su correo de Supabase Auth, seguido de “Pantalla 1”, “Pantalla 2” y “Pantalla 3”, en ese orden. Si no hay nombre configurado, usar el correo como nombre; mientras se carga o si los datos no están disponibles, mostrar un texto localizado en lugar de datos ficticios. No mostrar un título de navegación. El panel puede cerrarse con el botón, Escape, al pulsar fuera o al seleccionar una opción.
- **RF-3. Opciones mock:** seleccionar una opción cierra el panel, pero no navega a otra pantalla.

## Requisito de interfaz

- **Mobile-first y accesible:** el header y el panel deben adaptarse al ancho disponible y sus controles deben ser accesibles mediante teclado y tecnologías de asistencia.
- **iOS y viewport móvil:** la aplicación ocupa el viewport hasta las áreas seguras, mantiene el fondo de la app detrás de la barra de estado y evita el rebote del documento; el contenido puede seguir desplazándose dentro de la aplicación.
- **Drawer móvil:** el panel y su fondo cubren todo el viewport, incluidas las áreas seguras superior e inferior; el contenido del panel respeta el área segura superior.

## Fuera de alcance

Implementar login, autenticación, cierre de sesión real, selección de negocio, destinos reales para las opciones mock o permisos por rol.

## Dudas abiertas

- [NECESITA ACLARACIÓN] Los nombres y destinos reales de las tres opciones se definirán cuando se especifiquen esas pantallas.