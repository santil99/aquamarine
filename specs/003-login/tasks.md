# Tareas de login

- [x] **T-01. Configuración del cliente Supabase Auth en navegador**. RF: RF-2, RF-4; RNF: RNF-2. **Hecho cuando:** existe el cliente de navegador configurado con variables de entorno `VITE_*`, sin credenciales secretas versionadas.
- [x] **T-02. SERVICE y REPOSITORY de autenticación**. RF: RF-2, RF-4. **Hecho cuando:** el SERVICE permite ingresar con email y contraseña y consultar la sesión a través del contrato; el adaptador usa Supabase Auth.
- [x] **T-03. Formulario y ruta `/login`**. RF: RF-1, RF-2; RNF: RNF-1, RNF-3, RNF-4. **Hecho cuando:** la vista presenta «Usuario o email» (email de cuenta), contraseña y acción de ingreso; valida campos, muestra carga y errores localizados, y permite reintentar.
- [x] **T-04. Redirecciones y protección de rutas**. RF: RF-3 a RF-5. **Hecho cuando:** login exitoso y sesión ya activa llevan a `/`; toda ruta de aplicación distinta de `/login` redirige a `/login` sin sesión y no muestra contenido protegido.
- [ ] **T-05. Pruebas y checks**. RF: RF-1 a RF-5; RNF: RNF-1 a RNF-4. **Hecho cuando:** los tests de presentación cubren validación, carga, credenciales rechazadas y fallo de red; se verifica el flujo con Supabase, las redirecciones con/sin sesión y pasan typecheck, lint y build. Tambien cuando al tocar el botón logout en el header, efectivamente desloguea como corresponde navegando de nuevo a login.
