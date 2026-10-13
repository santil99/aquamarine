# Tareas: Navegación por fechas en listado de ventas

- [x] **T-01. Estado dinámico y formateador de fecha**. RF: RF-3. **Hecho cuando:** una utilidad formatea la fecha seleccionada como `Hoy`, `Ayer` o `DD/MM/AAAA` respecto del día actual en la zona horaria del negocio.
- [x] **T-02. Componente de navegación por fechas (`DateNavigator`)**. RF: RF-1, RF-2, RF-3. **Hecho cuando:** la barra muestra controles accesibles para cambiar la fecha en pasos diarios y una etiqueta central localizada.
- [x] **T-03. Integración de DatePicker en la etiqueta central**. RF: RF-4. **Hecho cuando:** la etiqueta abre el selector de fecha de HeroUi y seleccionar un día actualiza la fecha seleccionada.
- [x] **T-04. Conexión del filtro de fecha con la consulta de ventas**. RF: RF-5, RF-6. **Hecho cuando:** cambiar la fecha recarga las ventas de la jornada y muestra el estado de carga.
- [x] **T-05. Validación de interfaz y pruebas**. CA: CA-1 a CA-5. **Hecho cuando:** los tests de presentación cubren el estado inicial, navegación, selector y recarga; pasan typecheck y lint. La vista usa layout responsive mobile-first.