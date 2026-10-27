# Plan — Resumen con evolución

1. **Dominio:** `domain/business/monthlyTrend.ts` (totales mensuales, series por métrica, variación), con aritmética exacta de `domain/shared/amount`.
2. **Datos:** `listAmountsForRange` en los puertos de ventas y gastos y en sus adaptadores Supabase. Se pagina de a 1000 filas (`fetchAllPages`) porque 12 meses superan el límite por defecto; no requiere migración ni RPC.
3. **Servicios:** `getMonthlyTotals` en `SalesService` y `ExpensesService`, con `requireAuthenticatedUser`.
4. **Presentación** (`features/dashboard/`): `SummaryView` queda como contenedor (mes y segmento). `MonthSegment` y `TrendSegment` cargan sus datos con `useLoadedData` y `LoadedContent`; se remontan por mes (`key`).
5. **Gráficos:** `TrendChart` (chart.js, solo módulos de barras).
6. **Router y textos:** loaders agrupados en `SummaryLoaders`; textos `summary.*` en es/en.
7. **Tests:** `features/dashboard/tests/SummaryView.test.tsx` (segmento inicial y variación).

Decisiones:
- La evolución carga 12 meses una sola vez y el rango se recorta en cliente.
- Los segmentos inactivos no se montan; al volver a un segmento se vuelve a consultar.
