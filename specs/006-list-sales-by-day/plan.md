
# Plan pragmático

1. **Estado de fecha y formato:** mantener una fecha civil ISO (`YYYY-MM-DD`) en la vista, inicializada según la zona horaria del negocio; formatear la etiqueta como `Hoy`, `Ayer` o `DD/MM/AAAA`.
2. **Componente de navegación:** usar `DateNavigator` con controles accesibles para avanzar o retroceder un día y una etiqueta central seleccionable.
3. **Selector de fecha:** mostrar el datePicker que ofrezca HeroUI en un Popover con locale `es` y semana iniciada el lunes.
4. **Consulta por fecha:** pasar la fecha seleccionada por SERVICE y REPOSITORY; calcular los límites de jornada en la zona horaria del negocio y recargar al cambiar la selección.