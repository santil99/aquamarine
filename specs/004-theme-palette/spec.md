# Paleta y tema claro/oscuro

## Objetivo

Definir los colores primario y secundario de la aplicación mediante el sistema de tema de HeroUI, y permitir alternar entre tema claro y oscuro.

## Requisitos

- **RF-1. Paleta:** configurar índigo como color primario violeta azulado y teal como secundario, reutilizando las escalas estándar de HeroUI. Los colores semánticos y neutros conservan los valores predeterminados de HeroUI; la nueva paleta también se aplica a la pantalla de login.
- **RF-2. Tema inicial:** al abrir la aplicación, usar el tema claro u oscuro indicado por la preferencia del sistema.
- **RF-3. Cambio de tema:** ofrecer en el menú lateral un control accesible para cambiar entre claro y oscuro. El cambio se aplica a toda la aplicación, incluida la pantalla de login, y se mantiene al navegar entre sus pantallas.
- **RF-4. Preferencia temporal:** no guardar la selección manual entre visitas; en una visita posterior se vuelve a usar la preferencia del sistema.

## Criterios de aceptación

- **CA-1 (RF-1):** índigo y teal están configurados en HeroUI y disponibles mediante sus tokens, también en login; los colores restantes conservan los defaults de HeroUI.
- **CA-2 (RF-2, RF-3):** el tema inicial corresponde a la preferencia del sistema y el control del menú permite alternar entre claro y oscuro.
- **CA-3 (RF-3, RF-4):** tras cambiar el tema, todas las pantallas lo reflejan; al navegar se conserva durante la visita y una visita posterior vuelve a la preferencia del sistema.
- **CA-4 (RF-3):** el control tiene una etiqueta accesible y puede operarse con teclado.

## Fuera de alcance

Persistir la elección manual, añadir otros tokens visuales o reemplazar los colores semánticos y neutros predeterminados de HeroUI.