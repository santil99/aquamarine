# Auditoría de calidad de código, SOLID y mantenibilidad - 18/10/2026

Autoevaluación técnica del código actual de la aplicación. Este documento no implementa cambios; solo diagnostica y propone refactorizaciones.

## Resumen ejecutivo

- **Valoración general: 6,5 / 10.** La base es sólida: capas claras, inyección de dependencias por constructor y props, adaptadores aislados en infraestructura y una suite de tests enfocada en presentación, tal como pide la constitución.
- **Aislamiento por negocio diferido.** La base de datos aún no tiene modelo de negocios: no hay tabla de negocios ni vínculo de ventas o gastos con un negocio o un usuario. Por eso el `businessId` que reciben los repositorios no se usa. Queda fuera de las prioridades actuales (sección 6.5).
- **Deuda relevante:** servicios con contratos de error y autenticación inconsistentes, duplicación de la máquina de estados de las vistas de detalle, archivos grandes (`AppLayout.tsx`, `router/index.tsx`) y acoplamiento de gastos al dominio de ventas.
- **Estado de calidad de las herramientas (medido en este árbol):** `pnpm typecheck` OK, `pnpm lint` sin warnings, `pnpm test` con 9 archivos y 51 tests en verde.

## 1. Principios SOLID

### 1.1 Single Responsibility (SRP)

| Archivo | Líneas | Diagnóstico |
|---|---|---|
| `src/presentation/layout/AppLayout.tsx` | 338 | Mezcla cabecera, drawer, avatar, resumen de perfil, menú de navegación, selector de tema, selector de idioma y logout. Varios subcomponentes viven inline. **Archivo "Dios".** |
| `src/router/index.tsx` | 273 | Compone la inyección de dependencias, mapea adaptadores a funciones, define 9 componentes de ruta, el hook de estado de sesión y los layouts de login y protegido. La constitución pide que las rutas sean adaptadores delgados. |
| `src/presentation/features/sales/views/SaleDetailView.tsx` | 257 | Máquina de estados completa (loading, error, notFound, retry, error de catálogos, Spinner) dentro de la vista. |
| `src/presentation/features/expenses/views/ExpenseDetailView.tsx` | 241 | Duplica casi línea por línea la máquina de estados de `SaleDetailView`. |
| `src/application/services/salesService.ts` | 244 | Agrupa consultas, comandos, orquestación de imágenes (subida, rollback, limpieza) y validación de autenticación. Aceptable para un agregado, pero está creciendo. |

**Bien resuelto:** los servicios de auth y gastos son delgados, y la lógica de catálogos está centralizada en `useSaleCatalogs`.

### 1.2 Open/Closed (OCP)

- **Positivo:** los servicios dependen de puertos (`SalesRepository`, `ExpensesRepository`, `AuthRepository`, `SalesImageStorage`). Cambiar Supabase por otro proveedor implica escribir un adaptador nuevo, sin tocar servicios ni vistas.
- **Negativo:**
  - El mapeo de adaptadores a funciones de datos vive en `router/index.tsx`. Agregar una operación obliga a editar el composition root y las vistas a la vez.
  - `SalesRepository` tiene 9 métodos que mezclan listado, búsqueda, catálogos y CRUD. Agregar una consulta nueva casi siempre significa modificar el puerto y todos sus implementadores.
  - `useSaleForm.validateAll` (`src/presentation/features/shared/useSaleForm.ts`) hardcodea `{ amount, categoryId, detail }` en lugar de derivar los campos de `NewSaleField`. Si cambia el formulario, hay que tocar el hook.

### 1.3 Liskov (LSP) e Interface Segregation (ISP)

- **Tipos bien acotados:** `NewSaleInput`, `ExpenseInput` y `NewExpenseRecord` (`ExpenseInput & {...}`) son contratos pequeños y claros.
- **Puerto amplio:** `SalesRepository` expone demasiadas responsabilidades. Un consumidor que solo necesita listar ventas depende también de CRUD, búsqueda y catálogos. Propuesta: separar en `SalesQueryRepository` (lectura por mes, día y búsqueda), `SalesCommandRepository` (crear, actualizar, eliminar) y `SalesCatalogRepository`.
- **Props sobrecargadas:** `SearchView` recibe 6 props y `SearchCatalogs` fusiona catálogos de ventas y gastos. Es un problema menor, pero indica que la vista conoce demasiado sobre los dos módulos.
- **Sustitución de implementaciones:** los adaptadores de Supabase cumplen los puertos. No se detectaron incumplimientos de contrato, pero sí **contratos semánticamente débiles**: `update` y `delete` de gastos devuelven `boolean` (`data.length > 0`), y ventas lanza `Error("Sale not found")`. Ambos módulos expresan "no encontrado" de forma distinta.

### 1.4 Dependency Inversion (DIP)

- **Positivo:**
  - Las vistas reciben funciones de acceso a datos por props (`loadSale`, `updateSale`, `registerExpense`, etc.), no importan Supabase.
  - La capa de presentación no importa adaptadores de infraestructura. La única unión concreta está en `router/index.tsx`.
- **Acoplamientos menores:**
  - La presentación importa tipos y clases de error desde `application/ports` (por ejemplo `AuthCredentialsError`, `SalesCatalogs`). Es una fuga leve, aceptable mientras los tipos sean contratos y no detalles de persistencia.
  - `SalesListView` calcula `sumSaleAmounts` en la vista. La función está en dominio, pero la agregación de negocio ocurre en presentación. Debería llegar ya calculada desde el servicio o un selector.
  - `router/index.tsx` expone `activeBusiness` como singleton a nivel de módulo. Cambiar de negocio o de implementación exige editar el router.

## 2. Diagnóstico general de calidad y mantenibilidad

### 2.1 Escalabilidad

**Valoración: moderada-buena, con deuda concreta que conviene pagar antes de crecer.**

Lo que facilita escalar:
- Capas separadas (dominio, aplicación, infraestructura, presentación) y puertos explícitos.
- Textos centralizados en `src/presentation/texts/` con tipado contra `es`.
- Quality gates limpios (typecheck, lint sin warnings, tests en verde).
- Estructura por features con reglas documentadas en AGENTS.md.

Lo que frena escalar:
- Un nuevo módulo tendría que replicar la máquina de estados de detalle, la validación de autenticación y el manejo de errores, con alto riesgo de divergencia.
- El router crece linealmente con cada ruta y concentra demasiada lógica.
- El modelo multi-negocio aún no existe en la base de datos (diferido). Cuando se implemente, habrá que modelar el vínculo negocio-usuario-datos antes de exponer más de un negocio.

### 2.2 Deuda técnica y puntos débiles

Aislamiento por negocio: diferido (ver sección 6.2). Los repositorios reciben `_business` sin usarlo porque el modelo de negocios no existe todavía.

**Prioridad alta**

1. **Auth inconsistente entre servicios.** La constitución (punto 9) pone la validación de autenticación en SERVICE.
   - `SalesService` llama a `requireAuthenticatedUser()` en la mayoría de los métodos.
   - `ExpensesService.listForMonth`, `listCategories` y `listPaymentMethods` **no** validan autenticación. `getById`, `searchExpenses` y `getCategoryTotalsForMonth` sí lo hacen.
   - `requireAuthenticatedUser` está duplicado en `SalesService` y `ExpensesService`.
   - **Recomendación:** extraer un helper compartido (`application/services/requireAuthenticatedUser.ts`) y aplicarlo de forma uniforme en todos los métodos de servicio.

2. **Contrato de errores inconsistente.**
   - `SalesService` lanza `NewSaleValidationError` con errores por campo.
   - `ExpensesService.create` y `update` lanzan `Error("Invalid expense")` y pierden los errores por campo.
   - **Recomendación:** un `ValidationError` común con mapa de campos, usado por ambos servicios, y un tipo `NotFoundError` en lugar de booleanos o strings.

**Prioridad media**

3. **Duplicación de la máquina de estados de detalle.** `SaleDetailView` y `ExpenseDetailView` repiten loading, error, notFound, retry, error de catálogos y Spinner.
   - **Recomendación:** extraer un hook `useDetailLoader` (carga, reintento, estados) y un componente `DetailStatus` para los estados de error y no encontrado. Justificado porque ya hay dos consumidores concretos.

4. **Archivos grandes con responsabilidades mezcladas.**
   - `AppLayout.tsx` (338 líneas): separar `AppHeader`, `NavigationMenu`, `ProfileSummary` y `DrawerNavigation` en `presentation/layout/`.
   - `router/index.tsx` (273 líneas): separar la composición de dependencias (`composition/`), las definiciones de rutas (`router/routes.tsx`) y los layouts (`router/layouts/`).

5. **Acoplamiento de gastos al dominio de ventas.** `ExpensesService` importa `NewSaleInput`, `validateNewSale`, `normalizeSaleAmount` y `normalizeSaleDetail` desde `domain/sales/newSale`. Además, `domain/business/categoryTotal.ts`, `dailySales.ts` y `monthSummary.ts` dependen de `domain/sales/saleTotal.ts`.
   - **Recomendación:** mover la validación de monto y detalle compartida a un módulo neutral (`domain/shared/money.ts` o similar) y que cada dominio tenga sus reglas.

6. **Lógica de negocio en presentación.** `SalesListView` calcula `sumSaleAmounts`. Mover la agregación al servicio o a un selector de dominio.

**Prioridad baja**

7. **Pequeñas incoherencias de estilo:**
   - Algunas vistas usan `useTexts().newSale` y otras `const { common, ... } = useTexts()`. Hay alias redundantes como `const locale = common.locale`.
   - `useSaleForm` está en `features/shared/` y `useSaleImages` en `features/sales/`. La ubicación es razonable, pero conviene documentar el criterio.
   - `presentation/tests/layout/AppLayout.test.tsx` vive fuera de una carpeta de feature. AGENTS.md pide `features/<módulo>/tests/`. Layout no es una feature, así que conviene decidir explícitamente dónde van los tests de layout.
   - `SalesListView.test.tsx` comprueba que `"Cargando ventas..."` no aparece. Es un resto de una versión anterior con texto visible; el test no aporta valor.

8. **Logging.** `console.error` en `salesService.removeImagesQuietly` es el único logging del proyecto. Aceptable por ahora, pero sin abstracción de logging.

9. **Mock de negocio en producción.** `mockBusinessContext.ts` (`businessId: "mock-business"`) es temporal y se usa para la zona horaria y para pasar a repositorios que lo ignoran. Se mantiene hasta que exista el modelo de negocios (diferido).

## 3. Coherencia a lo largo de la app

**Coherente:**
- Los textos de interfaz no están hardcodeados en componentes (solo en tests).
- Los `Spinner` siempre usan `aria-label={common.loading}` y no muestran texto visible, como exige AGENTS.md.
- No hay iconos SVG creados a mano; se usa `lucide-react`.
- Los montos se formatean con el locale del idioma activo.
- Las dependencias respetan la dirección de capas en la presentación (no hay imports de Supabase).

**Incoherente:**
- Auth en servicios (punto 1 del diagnóstico).
- Errores de validación y de "no encontrado" (punto 2).
- Ubicación de hooks y de tests de layout (punto 7).
- Calidad de contratos entre ventas y gastos: mismos conceptos, implementaciones distintas.

**Conclusión:** la base es coherente en UI e i18n, pero no en la capa de aplicación y datos. Ahí es donde la deuda se acumula.

## 4. Plan de acción recomendado (en orden)

Las recomendaciones se ejecutan como tareas ordenadas por prioridad en la sección 6.3. Resumen:

1. Unificar la autenticación en servicios (P1).
2. Unificar el contrato de errores (P2).
3. Extraer la máquina de estados de detalle (P3).
4. Desacoplar gastos del dominio de ventas (P4).
5. Derivar campos de validación en `useSaleForm` (P5).
6. Dividir `AppLayout.tsx` y `router/index.tsx` (P6 y P7).
7. Decidir la ubicación de `sumSaleAmounts` (P8) y limpiar estilo y tests (P9).

El aislamiento por negocio y la separación de `SalesRepository` quedan diferidos (sección 6.5).

## 5. Estado de verificación

Checks ejecutados sobre el árbol actual, sin cambios de código:

- `pnpm typecheck`: sin errores.
- `pnpm lint`: sin errores ni warnings.
- `pnpm test`: 9 archivos, 51 tests, todos en verde.

Este informe no valida el comportamiento en Supabase real. La verificación de RLS queda pendiente junto con el modelo de negocios (diferido).

## 6. Plan de implementación

Plan para aplicar las recomendaciones del informe. Antes de empezar, leer AGENTS.md y `docs/constitution.md`.

### 6.1 Principios de ejecución

- **Simple primero:** cada cambio debe reducir complejidad o duplicación. Si una abstracción tiene un solo consumidor concreto, no se crea.
- **Sin DDD avanzado:** no crear value objects, servicios de dominio ni capas nuevas sin necesidad concreta (AGENTS.md).
- **Cambios de comportamiento cero:** cada tarea mantiene la UI y los flujos actuales. Los tests existentes deben seguir pasando sin cambios de expectativa, salvo en los puntos indicados.
- **Una tarea a la vez:** cerrar cada tarea con sus checks antes de empezar la siguiente.
- **Checks por tarea:** `pnpm typecheck`, `pnpm lint` (sin warnings) y `pnpm test`. Al final, `pnpm build`.
- **Tests moderados:** no agregar tests para services ni repositories (AGENTS.md). Solo tests de presentación cuando cambie un comportamiento visible.

### 6.2 Diferido: aislamiento por negocio

No se implementa en esta fase. La base de datos no tiene tabla de negocios, ni vínculo entre `sales` o `expenses` y un negocio, ni entre usuarios y negocios. Por eso los repositorios reciben `businessId` sin usarlo y `mockBusinessContext.ts` es temporal. Las tareas diferidas están en la sección 6.5.

### 6.3 Tareas ordenadas por prioridad

P1 es la prioridad más alta. Las dependencias son explícitas. Las tareas sin dependencias pueden hacerse en cualquier orden.

Pregunta resuelta: los tests de layout se quedan en `presentation/tests/layout/`, como excepción aceptada por el usuario. No se mueven a `features/layout/tests/`.

---

#### [P1] T1. Unificar la validación de autenticación en servicios
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` y `pnpm test` (51 tests en verde).
- **Depende de:** ninguna.
- **Archivos:** nuevo `src/application/services/requireAuthenticatedUser.ts`, `salesService.ts`, `expensesService.ts`.
- **Pasos:**
  1. Extraer `requireAuthenticatedUser` a un módulo compartido y eliminar las dos copias.
  2. Aplicarla a todos los métodos de `ExpensesService`. Hoy `listForMonth`, `listCategories` y `listPaymentMethods` no la usan.
- **Criterio de cierre:** todos los métodos públicos de ambos servicios validan sesión y no hay copias duplicadas.

#### [P2] T2. Unificar errores de validación y no encontrado
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` y `pnpm test` (51 tests en verde). Se creó `application/errors.ts` con `NotFoundError` e `InputValidationError` (la antigua `NewSaleValidationError` se movió ahí y ahora la usan ventas y gastos). El adaptador de gastos lanza `NotFoundError` y el puerto `update`/`delete` devuelve `void`. Los mensajes visibles no cambian: la presentación no lee `error.message`.
- **Depende de:** T1.
- **Archivos:** nuevo `src/application/errors.ts`, `salesService.ts`, `expensesService.ts`, puerto `expensesRepository.ts`, adaptador `supabaseExpensesRepository.ts`.
- **Pasos:**
  1. Crear `NotFoundError` compartido. Reemplazar `Error("Sale not found")` y los booleanos de `update` y `delete` de gastos. El adaptador lanza `NotFoundError` cuando no hay filas afectadas.
  2. Hacer que `ExpensesService.create` y `update` lancen un error de validación con errores por campo, con la misma forma que `NewSaleValidationError`. Reutilizar la forma, sin duplicar clases.
- **Criterio de cierre:** ambos módulos reportan validación y "no encontrado" con el mismo contrato. Los mensajes visibles no cambian.

#### [P3] T3. Extraer la máquina de estados de detalle
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` y `pnpm test` (51 tests en verde). Cambio de comportamiento: al reintentar, la vista muestra el Spinner mientras recarga, igual que `useSaleCatalogs`. Medición: `SaleDetailView.tsx` pasó de 257 a 230 líneas y `ExpenseDetailView.tsx` de 241 a 215. El criterio de "menos de la mitad de líneas de estado" no se midió formalmente.
- **Depende de:** ninguna.
- **Archivos:** nuevos `src/presentation/features/shared/useDetailLoader.ts` y `src/presentation/features/shared/DetailStatus.tsx`; `SaleDetailView.tsx` y `ExpenseDetailView.tsx`.
- **Pasos:**
  1. `useDetailLoader` maneja carga, error, not found y reintento. Recibe la función de carga y devuelve el estado.
  2. `DetailStatus` renderiza los estados de error, not found y el Spinner con `aria-label={common.loading}`.
  3. Ambas vistas usan los dos elementos. Cada vista conserva solo su parte específica.
- **Criterio de cierre:** las dos vistas de detalle tienen menos de la mitad de líneas de estado. Tests de presentación en verde.

#### [P4] T4. Desacoplar gastos del dominio de ventas
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` y `pnpm test` (51 tests en verde).
- **Desviación del plan original:** mover solo `normalizeSaleAmount` no bastaba. `ExpensesService` también usaba la validación y el tipo de entrada de ventas. Por eso se movió todo lo compartido a `domain/shared/` con nombres neutrales, no solo el monto.
- **Depende de:** ninguna.
- **Archivos nuevos:** `src/domain/shared/amount.ts` (aritmética de montos en centavos), `src/domain/shared/transactionInput.ts` (`TransactionInput`, errores de campo, `normalizeDetail`, `validateTransactionInput`), `src/domain/sales/saleCatalog.ts` (`SaleCatalogOption`).
- **Eliminados:** `src/domain/sales/newSale.ts` y `src/domain/sales/saleTotal.ts`.
- **Pasos:**
  1. Mover las utilidades de monto y de entrada transaccional a `domain/shared/`. Ventas, gastos y `domain/business/*` las importan desde ahí.
  2. `ExpenseInput` pasa a ser alias de `TransactionInput`.
- **Criterio de cierre:** `ExpensesService` no importa de `domain/sales/`. Los cálculos no cambian. Cumplido.

#### [P5] T5. Derivar campos de validación en `useSaleForm`
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` y `pnpm test` (51 tests en verde).
- **Depende de:** T4 (usa `TransactionField` de `domain/shared/`).
- **Archivos:** `src/presentation/features/shared/useSaleForm.ts`, `src/presentation/features/shared/saleFormValues.ts`, `SaleFields.tsx`.
- **Pasos realizados:** se definió `VALIDATED_FIELDS` a partir de `TransactionField`. Se usa en `validateAll` (marcar como tocados) y en el guard `isValidatedField`, que reemplaza el `isNewSaleField` hardcodeado. `toNewSaleInput` pasa a `toTransactionInput`. `paymentMethodId` sigue sin validarse, como antes.
- **Criterio de cierre:** agregar un campo validado exige tocar el tipo y `VALIDATED_FIELDS`. Cumplido.


#### [P6] T6. Dividir `AppLayout.tsx`
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` y `pnpm test` (51 tests en verde). `AppLayout.tsx` pasó de 303 líneas a 80.
- **Depende de:** ninguna.
- **Archivos nuevos en `src/presentation/layout/`:** `AppHeader.tsx`, `AppDrawer.tsx` (menú lateral y su contenido), `NavigationList.tsx` (navegación con acordeones y enlaces), `ProfileHeader.tsx` (`ProfileAvatar` y `ProfileSummary`), `ThemeSwitch.tsx` y `LanguageSwitch.tsx` (cada uno con su propio estado), `profileState.ts` (tipo y `toProfileState`, sin JSX).
- **Desviación menor del plan:** se agregó `AppDrawer.tsx` y `profileState.ts`, y los nombres de archivo de perfil y navegación difieren de los ejemplos. Sin carpetas nuevas.
- **Pasos realizados:** cada subcomponente pasó a su archivo sin cambiar props visibles ni comportamiento. `ThemeSwitch` y `LanguageSwitch` ahora manejan su estado, en vez de recibirlo desde `AppLayout`.
- **Criterio de cierre:** `AppLayout.tsx` queda como composición de 80 líneas. Tests de layout en verde.

#### [P7] T7. Simplificar `router/index.tsx`
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` (sin warnings) y `pnpm test` (51 tests en verde).
- **Depende de:** ninguna.
- **Archivos:** `src/router/index.tsx`, nuevos `src/router/routes.tsx` y `src/router/layouts/` (`LoginLayout.tsx`, `ProtectedLayout.tsx`, `useSessionStatus.ts`).
- **Desviación de diseño:** `index.tsx` construye el objeto `dependencies` (servicios y funciones enlazadas) y exporta `AppDependencies = typeof dependencies`. `routes.tsx` y los layouts usan ese tipo por importación de tipo, sin importar valores de `index.tsx`. Los layouts reciben `auth` (tipo `AuthService`) y `loadUser` por props, en lugar de depender de servicios concretos.
- **Desviación menor:** `useSessionStatus` recibe `auth` como parámetro y se comparte entre login y protegido. El export por defecto de `router/index.tsx` se mantiene para `App.tsx`.
- **Pasos:**
  1. Mover la definición de rutas a `routes.tsx`.
  2. Mover los layouts de login y protegido a `router/layouts/`.
  3. Mantener la composición de servicios en `index.tsx`, que sigue siendo la única unión concreta.
- **Criterio de cierre:** `index.tsx` solo crea el router y compone dependencias. La navegación no cambia.

#### [P8] T8. Decidir dónde vive `sumSaleAmounts`
- **Estado:** completada como decisión, sin cambio de código. El helper se llama hoy `sumAmounts` (renombrado en T4) y vive en `domain/shared/amount.ts`.
- **Depende de:** ninguna.
- **Decisión:** la suma diaria se queda en `SalesListView`. Es una función pura de dominio, testeable, y su único consumidor es esa vista. Mover la agregación al servicio solo agregaría una capa sin beneficio concreto (KISS/YAGNI). Se revisa si aparece un segundo consumidor.
- **Criterio de cierre:** decisión documentada. Sin cambio de código porque no hay segundo consumidor. Test de total diario en `SalesListView.test.tsx` en verde.


#### [P9] T9. Unificar estilo y tests
- **Estado:** completada. Verificada con `pnpm typecheck`, `pnpm lint` y `pnpm test` (51 tests en verde).
- **Depende de:** ninguna (la pregunta de tests de layout quedó resuelta).
- **Pasos realizados:**
  1. Patrón único en las vistas: `const { clave: texts } = useTexts();` (o con `common`, según corresponda). Se migraron `LoginView`, `SearchView`, `NewExpenseView` y `NewSaleView`, que usaban `useTexts().clave`.
  2. Eliminados los alias `const locale = common.locale` en `SalesListView` y `ExpensesListView`. Ahora se usa `common.locale` directamente.
  3. Eliminado el assert obsoleto de `"Cargando ventas..."` en `SalesListView.test.tsx`. El test de spinner sigue validando `role="status"`.
  4. Extendido el mismo patrón a componentes, hooks de presentación y layout (`MonthPicker`, `ThemeSwitch`, `LanguageSwitch`, `AppLayout`, `AppHeader`, `AppDrawer`, `SaleImageThumbnail`, `SaleImagesField`, `DrawingCanvasModal`, `SearchFilterFields`, `TransactionDateField`). Ya no queda ningún acceso `useTexts().clave`. Los casos con `common` usan desestructuración anidada, por ejemplo `const { common: { locale, transactionDate } } = useTexts();`.
- **Criterio de cierre:** un solo patrón de textos en toda la presentación. Tests en verde.

#### [P10] T10. Verificación final
- **Estado:** completada. Ejecutado en esta sesión: `pnpm typecheck` (OK), `pnpm lint` (sin warnings), `pnpm test` (9 archivos, 51 tests en verde) y `pnpm build` (OK).
- **Depende de:** T1 a T9.
- **Observación:** `pnpm build` mostraba un aviso de Vite: chunk principal de 1.279 kB (384 kB gzip) por encima del límite de 500 kB. Se atendió con carga diferida por ruta: las 8 vistas protegidas se cargan con `lazy` en `router/routes.tsx` y el `Outlet` tiene un `Suspense` con el `Spinner` de HeroUI en `ProtectedLayout`. Resultado: chunk principal de 542 kB (156 kB gzip). El aviso persiste porque ese chunk sigue por encima de 500 kB; el resto del peso está en HeroUI, React, Router y Supabase, que se necesitan al arrancar.
- **Criterio de cierre:** checks en verde. Este informe refleja el estado final.

### 6.4 Orden de ejecución

1. T1 y T3 en paralelo (son independientes).
2. T2 (después de T1).
3. T4 y T5.
4. T6, T7 y T8.
5. T9.
6. T10.

### 6.5 Tareas diferidas (no priorizadas)

No se ejecutan en esta fase. Quedan registradas para retomarlas cuando exista el modelo de negocios.

- **D1. Modelo de negocios y aislamiento por negocio.** Crear tabla de negocios, vincular `sales` y `expenses` con `business_id` y vincular usuarios con negocios. Después, filtrar en los adaptadores de ventas y gastos (hoy `_business` no se usa) y verificar RLS (spec 001, T-05). Es prerrequisito de D2.
- **D2. Revisar `activeBusiness`.** Reemplazar el singleton de `router/index.tsx` por un contexto o por el resultado de `authService` cuando el negocio llegue desde la sesión. Depende de D1.
- **D3. Separar `SalesRepository` en interfaces.** Aplicar ISP solo cuando un consumidor necesite una parte del puerto y el resto sea un problema real. Hoy suma indirección sin beneficio.

