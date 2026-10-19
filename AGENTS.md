# AGENTS.md — app-sales

## Proyecto

Aplicación interna de gestión comercial. Lleva un registro de ventas y gastos de un negocio, permitiendo consultar balances e informacion relevante.

## Principios

- Organizar `src/presentation` por features. Lo exclusivo de un módulo va en `features/<módulo>/` (vistas, componentes, hooks, navegación y tests). Lo compartido entre módulos va en `features/shared/`. Solo lo global y reutilizable va en `components/`. Consultar esta regla antes de crear o mover archivos de presentación.
- Aplicar KISS/YAGNI. Antes de crear una capa, interfaz o patrón, confirmar que resuelve una necesidad concreta.
- Priorizar código declarativo, nombres claros que expresen intención y funciones pequeñas. Extraer lógica a funciones externas cuando mejore la legibilidad o permita reutilizarla; evitar abstracciones que no aporten claridad ni reutilización concreta.
- En React, considerar custom hooks para desacoplar lógica de estado cuando se comparta o cuando la extracción mejore claramente la legibilidad. Seguir las Rules of Hooks y evitar hooks de un solo uso que solo agreguen indirección.
- Usar arquitectura hexagonal simple: modelo plano, SERVICE de aplicación y REPOSITORY como contrato de datos; su adaptador concreto vive en infraestructura.
- Nombrar la operación de aplicación como SERVICE (por ejemplo, `SalesService`) y el puerto de persistencia como REPOSITORY (por ejemplo, `SalesRepository`). `Use case` es la intención que cubre el SERVICE, no otra capa duplicada. No usar `Reader` para este contrato.
- Mantener las reglas de aplicación y negocio (incluidas las validaciones de autenticación) en SERVICE/dominio, nunca en el REPOSITORY. El REPOSITORY traduce el puerto a consultas y mapeos de persistencia; el aislamiento de filas se delega a mecanismos de persistencia como RLS.
- Para problemas comunes, preferir APIs estándar y bibliotecas conocidas, seguras y mantenidas antes que formatos o mecanismos propios. Si una regla específica exige lógica propia, extraerla a una utilidad reutilizable fuera del componente.
- Mantener la UI mínima con HeroUI. Para esta tabla no implementar sorting, filtros ni helpers propios de ordenamiento; quedan fuera del alcance acordado.
- Para iconos usar siempre `lucide-react`. Nunca crear iconos a mano con `<svg>` ni `<path>`.
- Diseñar mobile-first. Mantener cada pantalla en `src/presentation/features/<módulo>/views/`; los archivos de ruta deben ser adaptadores delgados que renderizan una vista, no contener toda su UI.
- Los estados de carga muestran solo el `Spinner` de HeroUI, sin texto visible, en todas las pantallas. Su `aria-label` usa `es.common.loading`.
- Validar formularios en tiempo real: los errores de un campo aparecen al editarlo y se mantienen hasta corregirlo; al enviar se validan todos los campos.
- No introducir DDD avanzado, servicios de dominio ni value objects para envolver datos sin comportamiento.
- Usar Vite, React, TypeScript estricto y HeroUI. Los textos de interfaz viven en `src/presentation/texts/` (un diccionario por idioma, `en.ts` tipado contra `es.ts`). Las vistas nunca importan un idioma fijo: obtienen los textos con `useTexts()` y el idioma activo se cambia desde `LanguageContext`. Los montos se formatean con el locale del idioma activo.
- Leer la constitución y la spec activa antes de implementar. No ampliar el alcance aprobado por suposición.
- No deben quedar warnings en ningun archivo. Comprobar que no haya warnings. Si hay corregirlos.
- Errores de aplicación: los SERVICES lanzan errores tipados de `src/application/errors.ts` (`NotFoundError`, `InputValidationError`). No introducir `Error` genérico nuevo ni devolver booleanos como resultado. La presentación traduce cada error a un texto fijo y nunca muestra `error.message`.
- Autenticación en SERVICES: toda operación que requiera sesión llama a `requireAuthenticatedUser` antes de acceder al REPOSITORY. El orden respecto de la validación de entrada puede variar; ver el manual técnico.
- Vistas de detalle: los estados de carga, no encontrado y error usan `useDetailLoader` y `DetailStatus` (`features/shared/`). No reimplementar esa máquina de estados en una vista.
- Reglas de montos y validación de transacciones viven en `domain/shared/`. No duplicarlas en formularios ni en vistas.
- Layouts y router: separar cada archivo por responsabilidad (cabecera, menú, estado de sesión, rutas). Si un archivo combina varias, dividirlo.
- Hook de textos: en vistas y componentes usar `const { clave: texts } = useTexts();`. Para `common`, usar desestructuración anidada.
- Antes de cerrar un cambio: sin imports, alias ni tests obsoletos. Revisar `pnpm typecheck`, que detecta imports sin uso.

## Testing

- Priorizar tests de componentes y de la capa de presentación, especialmente para interacciones y estados visibles importantes.
- Ser moderado con la cantidad de Tests, no hacer sobreingenieria en testing. Se debe testear lo importante.
- No agregar tests para SERVICES ni REPOSITORIES. Tampoco testear getters/setters, adaptadores triviales, formato trivial ni comportamiento que ya proporcione HeroUI.
- Para cambios de UI, validar con los tests de presentación y los checks disponibles. No realizar test funcionales ni e2e. No levantar servidores de desarrollo para comprobar nada.
- Los archivos de tests van dentro de la feature a la que pertenecen, en `features/<módulo>/tests/`. Por ejemplo `features/sales/tests/` para los de ventas.
- Excepción aprobada: los tests de layout compartido van en `presentation/tests/layout/`.

## Comandos

- Desarrollo: `pnpm dev`
- Tests de componentes y presentación: `pnpm test`
- Tipos: `pnpm typecheck`
- Lint: `pnpm lint`
- Build: `pnpm build`. Si Vite avisa de chunks mayores a 500 kB, revisar primero si una dependencia pesada se carga en una ruta que no la usa. No ajustar `manualChunks` sin una decisión explícita, porque solo reorganiza el peso.

Ejecutar checks proporcionales al cambio. No afirmar que un check se ejecutó si no fue posible hacerlo.