# Plan técnico: Reportes y descarga de PDF de ventas (015)

Fuente: [spec.md](./spec.md)

## Enfoque

Pantalla `/reports` en el menú lateral. El usuario elige un período predefinido (esta semana, semana anterior, este mes, mes anterior, este año), ve el total y descarga un PDF con la tabla de ventas (fecha, hora, medio de pago, detalle y monto).

La generación del PDF es **en el cliente** con `jspdf` + `jspdf-autotable`. Los datos llegan por el flujo habitual: `SalesService` → `SalesRepository` (puerto) → adaptador Supabase. La lógica de períodos, orden y total vive en `domain/`. La presentación solo renderiza y dispara la descarga. El generador PDF se importa de forma diferida, así que no pesa en el bundle inicial.

## Capas

```
router (composition root + ruta lazy)
  └─ presentation/features/reports  (vista, selector de período, generador PDF)
        └─ application/services/salesService.getSalesReport
              ├─ domain/reports  (período, armado del reporte, total)
              └─ application/ports/salesRepository.listForPeriod
                    └─ infrastructure/supabase/supabaseSalesRepository
```

### Dominio (`src/domain/`)
- `reports/reportPeriod.ts`: `ReportPeriodId`, `ReportPeriod` y `getReportPeriod(id, today)`. Semana desde el lunes. Los períodos actuales terminan hoy; los anteriores son completos.
- `reports/salesReport.ts`: `SalesReportRow`, `SalesReport`, `SalesReportItem` y `buildSalesReport(rows, period, timeZone)`. Ordena ascendente, convierte la hora de carga a la zona del negocio y totaliza con `sumAmounts`.
- `business/businessDay.ts`: `getTimeInTimeZone(timeZone, instant)` (`HH:mm`).

### Aplicación (`src/application/`)
- `ports/salesRepository.ts`: `listForPeriod(business, dateFrom, dateTo): Promise<SalesReportRow[]>`. No reutiliza `search`, porque exige filtros completos y no devuelve la hora.
- `services/salesService.ts`: `getSalesReport(business, periodId)`. Llama `requireAuthenticatedUser` primero, luego `getReportPeriod`, `listForPeriod` y `buildSalesReport`. No hay `ReportsService` (KISS).

### Infraestructura (`src/infrastructure/supabase/`)
- `supabaseSalesRepository.ts`: `listForPeriod` con `amount::text`, filtro `sale_date` entre fechas, orden `sale_date` y `created_at` ascendente, y mapeo `toSalesReportRow`.

### Presentación (`src/presentation/features/reports/`)
- `views/SalesReportView.tsx`: período seleccionado (por defecto esta semana), total, botón de descarga. Carga, error y reintento siguen el patrón de `SummaryView`. Durante la descarga, el botón se deshabilita y muestra solo `Spinner` con `aria-label={common.loading}`. El error usa texto fijo; nunca `error.message`.
- `components/ReportPeriodSelect.tsx`: `Select` de HeroUI con las 5 opciones.
- `pdf/salesReportPdf.ts`: `downloadSalesReportPdf(report, texts, locale)`. Título, período, total con `formatArsAmount`, tabla con monto alineado a la derecha y nombre `reporte-ventas_{from}_{to}.pdf`. Textos desde `texts.reports.pdf`.
- Navegación: item `/reports` con `FileDown` de `lucide-react` después de "Resumen", y regla en `screenTitle.ts`.
- Textos: `layout.navigation.reports` y bloque `reports` en `es.ts` y `en.ts` (tipado contra `es`).

### Router (`src/router/`)
- `routes.tsx`: ruta lazy `/reports` dentro de `ProtectedLayout`, con el adaptador `ReportsRoute`.
- `index.tsx`: `loadSalesReport` como dependencia del composition root.

### Dependencias
- `jspdf` `^4.2.1` y `jspdf-autotable` `^5.0.9` (ambas MIT).
- `pnpm-workspace.yaml` (generado por pnpm): `core-js: true`. Lo pide pnpm 11 para el postinstall de `core-js`, dependencia transitiva de `canvg` → `jspdf`. El script solo muestra un aviso.

## Decisiones

1. Librería PDF: `jspdf` + `jspdf-autotable`.
2. Inicio de semana: lunes.
3. Períodos actuales (esta semana, este mes, este año) terminan hoy. Los anteriores son completos.
4. Orden de la tabla: ascendente, las ventas más nuevas quedan abajo. La indicación original pedía "igual que Consultas", pero Consultas ordena descendente. Se tomó la indicación concreta. **Pendiente de confirmar.**
5. Período sin ventas: descarga deshabilitada con aviso. No se generan PDF vacíos.
6. Control de período: `Select` de HeroUI.

## Tareas

1. Dominio: `reportPeriod.ts` y `getTimeInTimeZone`.
2. Dominio: `salesReport.ts` (`buildSalesReport`).
3. Puerto `listForPeriod` y adaptador Supabase.
4. `SalesService.getSalesReport`.
5. Textos `es`/`en` y label de navegación.
6. Instalar `jspdf` y `jspdf-autotable`.
7. Generador PDF `salesReportPdf.ts`.
8. Componente `ReportPeriodSelect`.
9. Vista `SalesReportView`.
10. Ruta lazy, composition root, menú y título.
11. Tests de la vista (`features/reports/tests/SalesReportView.test.tsx`).
12. Documentación de la spec (este archivo) y revisión de `MANUAL_LECTURA_CODIGO.md`.
13. Validación: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
