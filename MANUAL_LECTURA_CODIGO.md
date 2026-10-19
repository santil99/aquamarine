# Manual técnico de lectura del código

Guía para auditar y entender cómo está construido cada componente de **aquamarine**. Describe el código tal como está hoy y usa archivos reales como ejemplos. Las reglas normativas viven en [AGENTS.md](AGENTS.md) y [docs/constitution.md](docs/constitution.md). Este manual explica cómo se aplican.

Las rutas son relativas a `src/` salvo que se indique otra cosa.

---

## 0. Mapa del proyecto

```
src/
├── domain/          Modelo plano y reglas puras (sin React, sin Supabase)
│   ├── shared/      Reglas compartidas por ventas y gastos (montos, validación de transacciones)
│   ├── sales/       Tipos y reglas de ventas
│   ├── expenses/    Tipos y reglas de gastos
│   ├── business/    Totales, series diarias, día de negocio
│   └── auth/        Campos de login
├── application/     Casos de uso (SERVICES) y contratos (ports)
│   ├── ports/       REPOSITORIES: interfaces que la infraestructura implementa
│   ├── services/    SERVICES: una clase por dominio funcional
│   └── errors.ts    Errores de aplicación tipados
├── infrastructure/  Adaptadores concretos
│   ├── supabase/    Cliente Supabase y repositorios que implementan los ports
│   └── business/    Contexto de negocio (hoy un mock)
├── presentation/    React
│   ├── features/<módulo>/   views/, componentes, hooks y tests del módulo
│   ├── features/shared/     Lo compartido entre módulos (formularios, estados, hooks)
│   ├── components/          Solo componentes globales y reutilizables
│   ├── layout/              Shell de la app (cabecera, menú, drawer, temas, idioma)
│   ├── formatters/          Formato de montos, fechas y etiquetas
│   └── texts/               Textos de interfaz (es.ts, en.ts) y hook useTexts
├── router/          Composition root, rutas y layouts de sesión
│   ├── index.tsx    Única unión entre implementaciones concretas y la app
│   ├── routes.tsx   Definición de rutas y adaptadores delgados
│   └── layouts/     LoginLayout, ProtectedLayout, useSessionStatus
├── App.tsx
└── main.tsx
```

**Regla de dependencias** (verificada con búsquedas en el código):

- `domain` no importa de ninguna otra capa.
- `application` importa `domain` y sus propios `ports`.
- `infrastructure` importa `application` (ports y errores) y `domain`.
- `presentation` no importa nada de `infrastructure`. Recibe funciones por props.
- `router/index.tsx` es el único archivo que conecta `infrastructure` con `application` y `presentation`.

Si al auditar aparece un import de `infrastructure` dentro de `presentation` (salvo `router/`), es una desviación.

---

## 1. Anatomía de un componente o vista

### 1.1 Orden de lectura

Para leer un archivo de vista de arriba a abajo, este orden facilita entender qué hace sin perderse:

1. **Imports.** Agrupados así: React, librerías (`@heroui/react`, `lucide-react`), tipos de application/domain, módulos de presentación, textos.
2. **Constantes del módulo.** Por ejemplo `EMPTY_FORM` en `NewSaleView.tsx`.
3. **Interfaz de props.** Siempre `readonly`. Declara qué puede pedir la vista: datos, funciones y callbacks.
4. **Componente exportado.** Es el punto de entrada. Su orden interno:
   1. `useTexts()`.
   2. Custom hooks de datos y estado (`useDetailLoader`, `useSaleCatalogs`, `useSaleForm`, `useSaleImages`).
   3. Estado local (`useState`).
   4. Guardas de estado (`loading`, `notFound`, `error`) que devuelven antes del JSX principal.
   5. JSX principal.
5. **Componentes internos** que solo esa vista usa, como `SaleDetailForm` dentro de `SaleDetailView.tsx`.
6. **Funciones auxiliares puras** al final, como `toFormValues`.

Ejemplo real: [SaleDetailView.tsx](presentation/features/sales/views/SaleDetailView.tsx)

- Líneas de imports y `SaleDetailViewProps`: qué puede recibir la vista. Incluye `loadSale`, `updateSale`, `deleteSale` y `onExit`. No recibe ningún servicio.
- `SaleDetailView` (export): carga la venta con `useDetailLoader(saleId, loadSale)` y los catálogos con `useSaleCatalogs(loadCatalogs)`. Después resuelve los estados con returns tempranos: `loading`, `notFound`, `error`. Si todo está bien, renderiza `SaleDetailForm`.
- `SaleDetailForm`: recibe ya la venta cargada. Por eso puede llamar a `useSaleForm(toFormValues(sale))` con un valor inicial seguro. Aquí están los handlers `handleSave` y `handleDelete`.
- `toFormValues`: transforma el dominio (`SaleDetail`) a valores de formulario (`SaleFormValues`).

Esta separación evita un patrón frecuente: un formulario que inicializa su estado con datos que todavía no existen.

### 1.2 Estructura de un feature

Un módulo sigue la misma forma. Ejemplo con `features/sales/`:

```
features/sales/
├── views/            Una pantalla por archivo: NewSaleView, SaleDetailView, SalesListView
├── navigation/       Tipos de navegación entre pantallas (salesNavigation.ts, dayMode.tsx)
├── tests/            Tests de componentes y vistas del módulo
├── useSaleImages.ts  Hook de estado de imágenes (exclusivo de ventas)
├── SaleImagesField.tsx, SaleImageThumbnail.tsx, DrawingCanvasModal.tsx
```

Qué va en cada lugar:

| Si es… | Va en… | Ejemplo |
|---|---|---|
| Una pantalla completa | `features/<módulo>/views/` | `SaleDetailView.tsx` |
| Exclusivo del módulo | `features/<módulo>/` | `SaleImagesField.tsx` |
| Compartido entre módulos | `features/shared/` | `useSaleForm.ts`, `DetailStatus.tsx` |
| Global y reutilizable | `components/` | `MonthPicker.tsx` |
| Tipos de navegación | `features/<módulo>/navigation/` | `SalesListNavigationState` |

Nota de auditoría: `features/sales/` tiene componentes en la raíz, no en una carpeta `components/`. Es una desviación menor de estilo. Con pocos archivos no conviene reorganizar por ahora.

### 1.3 Ejemplo de lectura: `NewSaleView`

1. Lee `EMPTY_FORM` para saber el estado inicial.
2. Lee la interfaz de props: `timeZone`, `loadCatalogs`, `registerSale`. No hay nada de Supabase.
3. En el componente, los hooks muestran de dónde sale cada dato: `useSaleCatalogs` (catálogos), `useSaleForm` (valores, errores y validación), `useSaleImages` (fotos).
4. `handleSubmit` es el único camino de guardado: valida con `validateAll()`, llama a `registerSale` y limpia el formulario en éxito, o muestra `texts.saveError` en error.

---

## 2. Flujo de datos extremo a extremo

Se muestran dos recorridos: escribir una venta y leer una venta.

### 2.1 Guardar una venta nueva

| Paso | Dónde | Qué ocurre |
|---|---|---|
| 1 | `SaleFields` (shared) | El usuario escribe. Llama a `handleChange(field, value)` de `useSaleForm`. |
| 2 | `useSaleForm` | Actualiza `values` y marca el campo como `touched`. Los errores solo se muestran en campos tocados. |
| 3 | `NewSaleView.handleSubmit` | Llama a `validateAll()` (validación de UI). Si es válido, invoca `registerSale(input, transactionDate, images.newFiles)`. |
| 4 | `router/routes.tsx` (`NewSaleRoute`) | Recibe `deps.registerSale` y lo pasa como prop. La vista no sabe de dónde viene. |
| 5 | `router/index.tsx` | `registerSale = (…) => salesService.registerSale(…)`. Aquí se fija la implementación concreta. |
| 6 | `SalesService.registerSale` (application) | (a) `requireAuthenticatedUser`, (b) `validateTransactionInput` del dominio, (c) `validateSaleImages`, (d) `uploadImages`, (e) `salesRepository.create(record)`. |
| 7 | `uploadImages` (application) | Sube todas las imágenes o ninguna. Si una falla, borra las ya subidas y relanza el error. |
| 8 | `supabaseSalesRepository.create` (infrastructure) | Traduce el registro a columnas (`user_id`, `sale_date`, `images`) y ejecuta `supabase.from("sales").insert(…)`. |
| 9 | Vuelta | Si el insert falla, el servicio borra las imágenes subidas (`removeImagesQuietly`) y relanza. La vista captura cualquier error y muestra `texts.saveError`. En éxito, la vista resetea el formulario y muestra un toast. |

Puntos a revisar al auditar:

- **Validación doble, a propósito.** La vista valida para mostrar errores en tiempo real. El servicio valida de nuevo porque es el límite de confianza. No quitar ninguna de las dos.
- **Normalización en el servicio.** `normalizeAmount` (coma a punto) y `normalizeDetail` (trim, vacío a `null`) ocurren en `SalesService`, no en la vista ni en el adaptador.
- **Rollback de archivos.** Si el insert falla, las imágenes ya subidas se borran. Si el borrado falla, solo se registra en consola: el error original es el que importa.

### 2.2 Leer y editar una venta

| Paso | Dónde | Qué ocurre |
|---|---|---|
| 1 | `routes.tsx` (`SaleDetailRoute`) | Lee `id` de la URL con `useParams` y `date` del estado de navegación. Pasa `deps.loadSale`, `deps.updateSale`, etc. |
| 2 | `SaleDetailView` | `useDetailLoader(saleId, loadSale)` arranca en `loading` y ejecuta `loadSale(id)`. |
| 3 | `SalesService.getSale` | `requireAuthenticatedUser`, después `salesRepository.getById(id)`. Si no existe, devuelve `null`. Si existe, pide URLs firmadas para las imágenes y arma `SaleWithImages`. |
| 4 | `supabaseSalesRepository.getById` | Consulta con `amount::text` para no perder decimales en JavaScript. Usa `maybeSingle` y mapea con `toSaleDetail`. |
| 5 | `useDetailLoader` | `null` produce `notFound`; un objeto produce `success`; un error produce `error`. Cada resultado se ignora si el componente ya cambió de `saleId` (`isCurrent`). |
| 6 | `SaleDetailForm` | Inicializa `useSaleForm(toFormValues(sale))`. Al guardar, llama a `updateSale(sale.id, input, images.keptPaths, images.newFiles)`. |
| 7 | `SalesService.updateSale` | Valida, verifica que la venta exista (`NotFoundError`), calcula imágenes a borrar, sube las nuevas, actualiza y borra las imágenes quitadas. |

### 2.3 Dónde están los errores en el recorrido

| Origen | Error | Quién lo traduce |
|---|---|---|
| `requireAuthenticatedUser` | `Error` genérico | La vista (`catch`), que muestra un texto fijo |
| `validateTransactionInput` | Se lanza `InputValidationError` | En la práctica la vista ya valida antes, así que no se muestra |
| `updateSale` (venta inexistente) | `NotFoundError` | `useDetailLoader` no lo ve: la pantalla ya cargó. Solo llega si la venta se borró en medio |
| Supabase | Error de la librería | La vista (`catch`) o `useDetailLoader` (`error`) |

La presentación **nunca** muestra `error.message`. Todo texto visible sale de `texts/`.

---

## 3. Patrones internos

### 3.1 Custom hooks para separar estado de la vista

Los hooks de presentación encapsulan estado y reglas de la UI. Cada uno resuelve un problema concreto:

| Hook | Ubicación | Responsabilidad |
|---|---|---|
| `useDetailLoader<T>` | `features/shared/` | Máquina de estados de carga de detalle (`loading`, `success`, `notFound`, `error`) y `retry`. Lo usan las vistas de venta y gasto. |
| `useSaleForm` | `features/shared/` | Valores, errores visibles (solo en campos tocados), `validateAll`, `reset`. |
| `useSaleCatalogs` | `features/shared/` | Carga de categorías y medios de pago, con `retry`. |
| `useSaleImages` | `features/sales/` | Fotos de la venta: existentes, nuevas y las que se conservan. |
| `useSessionStatus(auth)` | `router/layouts/` | Estado de sesión compartido por el login y el área protegida. |

Regla de uso: un hook se crea cuando lo comparten dos vistas o cuando su lógica no entra en una función corta. `useSaleImages` existe solo porque la lógica de imágenes es compleja. No crear hooks de un solo uso sin razón.

### 3.2 Inyección de dependencias por props

Las vistas no importan servicios. Reciben funciones con la firma que necesitan:

```tsx
// SaleDetailView.tsx: la vista define lo que necesita
interface SaleDetailViewProps {
  readonly loadSale: (id: string) => Promise<SaleWithImages | null>;
  readonly updateSale: (id: string, input: TransactionInput, keptPaths: string[], newImages: Blob[]) => Promise<void>;
  // ...
}
```

```ts
// router/index.tsx: aquí se decide la implementación
const loadSale = (id: string) => salesService.getSale(id);
const dependencies = { loadSale, /* ... */ };
```

Beneficio concreto: los tests pasan `vi.fn` directamente. Ver [SaleDetailView.test.tsx](presentation/features/sales/tests/SaleDetailView.test.tsx), líneas 30 a 34. No hace falta mockear módulos ni Supabase.

### 3.3 Composición de rutas y adaptadores delgados

`router/routes.tsx` tiene un componente de ruta por pantalla (`SalesListRoute`, `SaleDetailRoute`, etc.). Cada uno hace tres cosas: lee parámetros de URL o de navegación, conecta callbacks de navegación (`onOpenSale`, `onExit`) y renderiza la vista. No contiene UI.

Las vistas se cargan de forma diferida con `lazy`, y `ProtectedLayout` envuelve el `Outlet` en un `Suspense` con `Spinner`. Así cada pantalla carga solo su código.

### 3.4 Repositorios como objetos tipados

Los adaptadores de Supabase son objetos literales tipados con el port:

```ts
export const supabaseSalesRepository: SalesRepository = {
  async create(record) { /* ... */ },
  // ...
};
```

Si el adaptador no cumple el contrato, TypeScript falla. Las funciones `toSaleDetail`, `toSaleListItem` y similares son mapeos de fila (snake_case de la base) a modelo de dominio (camelCase). Viven al final del archivo y no se exportan.

### 3.5 Errores tipados

`src/application/errors.ts` define `NotFoundError` e `InputValidationError`. La presentación los trata como un fallo genérico y muestra un texto fijo. Los errores tipados sirven para que el servicio exprese la causa sin depender de mensajes técnicos.

### 3.6 Estados de carga y error de detalle

`DetailStatus` renderiza los estados `loading`, `notFound` y `error`. La regla del proyecto es que toda vista de detalle usa `useDetailLoader` y `DetailStatus`, sin reimplementar la máquina de estados. Esto aparece en `SaleDetailView` y `ExpenseDetailView`.

### 3.7 Cómo se mantiene el bajo acoplamiento

| Relación | Mecanismo | Verificado |
|---|---|---|
| Vista → servicio | Props con funciones | Sí, sin imports de `application` concreta |
| Servicio → datos | Interfaz `SalesRepository` (port) | Sí |
| Servicio → auth | Interfaz `AuthRepository` | Sí |
| Infraestructura → contrato | Implementa el port | Sí, tipado |
| Composición → todo | Solo `router/index.tsx` | Sí |

### 3.8 Excepciones conocidas

Un manual honesto también documenta lo que no cumple el patrón:

1. **`requireAuthenticatedUser` lanza `Error` genérico**, no un error tipado. Es la única excepción directa a la regla de errores tipados.
2. **`SaleImagesValidationError` está en `salesService.ts`**, extiende `Error` y no está en `application/errors.ts`. Debería estar con el resto de errores tipados.
3. **El orden de validación y autenticación no es uniforme.** `ExpensesService.create` y `update` validan antes de autenticar. `SalesService` autentica primero. Las dos formas son válidas, pero la diferencia no tiene una razón documentada.
4. **El contexto de negocio es un mock.** Los adaptadores reciben `business` y lo ignoran (`_business`). Las tablas no tienen `business_id`. Es la deuda D1 de [AUDITORIA.md](AUDITORIA.md), diferida a propósito.
5. **Import circular de tipo.** `routes.tsx` y los layouts importan `AppDependencies` desde `router/index.tsx`. Es solo de tipos y TypeScript lo borra al compilar, pero es una dependencia de lectura circular.
6. **Textos de error fijos.** La vista captura cualquier error con `catch {}` y muestra un texto. Es intencional, pero significa que un error de validación del servidor no se distingue de un error de red.
7. **Idioma.** Los textos van siempre en español e inglés. `en.ts` está tipado contra `es.ts`, y así lo indica la constitución (punto 13).

---

## 4. Guía de extensibilidad

### 4.1 Agregar un módulo nuevo (por ejemplo, "Proveedores")

Seguir el orden de capas de adentro hacia afuera. Cada paso compila por sí solo.

1. **Dominio** (`src/domain/proveedores/`)
   - Tipos planos del modelo y reglas puras que haga falta.
   - Sin dependencias de React ni de Supabase.
   - Si los datos son montos, usar `domain/shared/amount.ts`.
2. **Port** (`src/application/ports/proveedoresRepository.ts`)
   - Una interfaz con las operaciones que el servicio necesita. Solo esas.
   - Los tipos de entrada y salida vienen del dominio.
3. **Service** (`src/application/services/proveedoresService.ts`)
   - Una clase con `private readonly` para el port y el `authRepository`.
   - Cada método empieza con `await requireAuthenticatedUser(this.authRepository)` antes de tocar el port.
   - Validaciones con `validateTransactionInput` o reglas del dominio. Errores con `application/errors.ts`.
4. **Adaptador** (`src/infrastructure/supabase/supabaseProveedoresRepository.ts`)
   - Un objeto literal tipado con el port.
   - Funciones `toX` privadas para mapear filas a dominio.
   - Si hay filtros con texto libre, usar `escapeLikePattern`.
5. **Composición** (`src/router/index.tsx`)
   - Instanciar el servicio.
   - Agregar funciones enlazadas (`const listProveedores = () => …`) y sumarlas a `dependencies`.
6. **Rutas** (`src/router/routes.tsx`)
   - Declarar la vista con `lazy(() => import(…).then((m) => ({ default: m.X })))`.
   - Agregar el componente adaptador (`XRoute`) que solo pasa props.
   - Agregar la ruta dentro de `ProtectedLayout`.
7. **Vista** (`src/presentation/features/proveedores/views/`)
   - Props tipadas con funciones, no servicios.
   - Textos con `const { proveedores: texts } = useTexts();`. Si el módulo usa textos nuevos, agregarlos en `es.ts` y `en.ts`.
   - Si es una vista de detalle, usar `useDetailLoader` y `DetailStatus`.
   - Si es un formulario, usar `useSaleForm` como referencia o extraer un hook compartido si la lógica se repite.
8. **Navegación** (`src/presentation/layout/navigationMenu.ts`)
   - Agregar la entrada al menú. El menú recibe los textos ya traducidos.
9. **Tests** (`src/presentation/features/proveedores/tests/`)
   - Tests de la vista con `vi.fn` por props.
   - No testear servicios ni repositorios (regla de AGENTS.md).
10. **Verificación.** `pnpm typecheck`, `pnpm lint` sin warnings, `pnpm test` y `pnpm build`. Este último para confirmar que la ruta nueva se carga en su propio chunk.

### 4.2 Modificar un módulo existente

Ejemplo: agregar un campo "Referencia" a las ventas.

1. **Dominio.** Agregar el campo a `SaleDetail` y `NewSaleRecord` (si aplica). Si es una regla de validación, va en `validateTransactionInput` (`domain/shared/transactionInput.ts`), que es compartida con gastos.
2. **Port.** Si cambia el contrato, actualizar `NewSaleRecord` o `SaleChanges` en `application/ports/salesRepository.ts`.
3. **Service.** Pasar el campo en `registerSale` y `updateSale`. Si necesita normalización, usar un helper de dominio como `normalizeDetail`.
4. **Adaptador.** Agregar la columna al `insert`, al `update` y al `select` correspondiente. Actualizar el tipo de fila (`SaleDetailRow`) y el mapeo (`toSaleDetail`).
5. **Formulario.** Agregar el campo en `SaleFormValues` (`saleFormValues.ts`), en `toTransactionInput` y en `toFormValues` de `SaleDetailView`. Agregar el campo en `SaleFields` para que se vea en alta y edición.
6. **Textos.** Agregar la etiqueta en `es.ts` y en `en.ts`.
7. **Tests.** Actualizar los tests de la vista afectada.

Checklist de cambio en un campo:

- [ ] Dominio
- [ ] Port
- [ ] Service
- [ ] Adaptador (`select`, `insert`/`update` y mapeo)
- [ ] `SaleFormValues`, `toTransactionInput` y `toFormValues`
- [ ] `SaleFields` (alta y edición)
- [ ] Textos en `es.ts` y `en.ts`
- [ ] Tests de la vista
- [ ] `pnpm typecheck` y `pnpm lint`

### 4.3 Antes de cerrar cualquier cambio

- Revisar que no haya imports, alias ni tests obsoletos. `pnpm typecheck` lo detecta con `noUnusedLocals`.
- Revisar que `presentation` no importe de `infrastructure`.
- Revisar que los textos nuevos estén en `es.ts` y `en.ts`.
- Revisar que el archivo no mezcle responsabilidades. Si un archivo de layout o router crece, dividirlo.

---

## 5. Cómo auditar un archivo en 10 minutos

1. Ver los imports: ¿aparece algo de `infrastructure` o de Supabase?
2. Ver la interfaz de props: ¿hay más de 6 o 7 props? ¿Son funciones concretas o tipos amplios?
3. Ver el componente: ¿hay returns tempranos para loading, notFound y error?
4. Ver los handlers: ¿cada uno hace una cosa? ¿Restauran el estado de `isSaving` en `finally`?
5. Ver las funciones auxiliares: ¿son puras? ¿Hay cálculo de negocio en la vista que debería estar en el dominio?
6. Ver el archivo de servicio correspondiente: ¿empieza con `requireAuthenticatedUser`? ¿Lanza errores tipados?
7. Ver el adaptador: ¿mapea columnas a dominio y no agrega lógica de negocio?

Si una respuesta no es la esperada, anotarla en [AUDITORIA.md](AUDITORIA.md) con el archivo y la línea.
