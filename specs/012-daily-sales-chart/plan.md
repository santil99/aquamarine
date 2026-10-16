# Plan — Gráfico de ventas diarias

1. **Dominio:** `getDateInTimeZone` y `buildDailySalesSeries` (serie diaria con días sin ventas en 0).
2. **Datos:** `listDailyAmountsForMonth` en el puerto y en Supabase (`amount::text, created_at`), con un helper de rango mensual compartido.
3. **Servicio:** `SalesService.getDailyTotalsForMonth` valida sesión y arma la serie.
4. **Dependencias:** `chart.js` y `react-chartjs-2`.
5. **Presentación:** `DailySalesChart` y `dailySalesChartOptions` en `features/dashboard/components/`.
6. **Integración:** `SummaryView` (tercer loader), `router/index.tsx` y textos `summary.dailySales` en `es.ts` y `en.ts`.

Decisiones:
- La serie se calcula en el SERVICE/dominio, no en el REPOSITORY.
- Chart.js se registra solo con los módulos de línea necesarios.
- Las opciones del gráfico son una función pura separada del componente.
