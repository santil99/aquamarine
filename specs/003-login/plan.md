# Plan pragmático

Aplicación React + Vite con renderizado en cliente (sin SSR, sin middleware de servidor).

1. **Integración de autenticación:** usar `@supabase/supabase-js` con un cliente de navegador creado a partir de `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`, sin secretos en el repositorio. Definir un REPOSITORY pequeño (`AuthRepository`) y un SERVICE (`AuthService`) para iniciar sesión, cerrar sesión y consultar la sesión, manteniendo Supabase reemplazable. RF: RF-2, RF-4; RNF: RNF-2.
2. **Pantalla de login:** crear la ruta `/login` como adaptador delgado y la vista bajo `src/presentation/views/`. Implementar email (campo «Usuario o email»), contraseña, validación, carga, errores y reintento con HeroUI y textos localizados. RF: RF-1, RF-2; RNF: RNF-1, RNF-3, RNF-4.
3. **Sesión y rutas protegidas:** `src/router/index.tsx` declara las rutas y un guard en cliente consulta la sesión al montar sin renderizar contenido protegido mientras valida. `/login` redirige a `/` si hay sesión activa; tras login exitoso se navega a `/`. Cualquier ruta protegida sin sesión redirige a `/login`. Logout cierra sesión y navega a `/login`. RF: RF-3 a RF-5; RNF: RNF-2.
4. **Validación:** probar en presentación los estados de validación, carga, error y el fallo de logout; verificar typecheck, lint y build. No agregar tests aislados para SERVICES ni REPOSITORIES. Las redirecciones y el login real contra Supabase se verifican manualmente con credenciales del proyecto.
