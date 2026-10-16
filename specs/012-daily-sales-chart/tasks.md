# Tareas — Gráfico de ventas diarias

- [x] **T-01. Serie diaria en dominio.** RF: RF-1, RF-2. **Hecho cuando** `buildDailySalesSeries` devuelve un punto por día hasta hoy (o fin de mes) con 0 en días sin ventas.
- [x] **T-02. Consulta de montos con fecha.** RF: RF-2. **Hecho cuando** el REPOSITORY devuelve monto y `created_at` para el mes.
- [x] **T-03. Servicio.** RF: RF-1, RF-5. **Hecho cuando** `getDailyTotalsForMonth` valida sesión y devuelve la serie del mes.
- [x] **T-04. Componente de gráfico.** RF: RF-4. **Hecho cuando** se renderiza una línea con puntos y tooltip con monto exacto.
- [x] **T-05. Integración en Resumen.** RF: RF-3, RF-5. **Hecho cuando** el gráfico aparece antes de "Balance neto" y se actualiza al cambiar de mes.
