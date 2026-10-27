# Resumen con evolución — SPEC

## Objetivo

Ampliar la pantalla de Resumen para responder «¿cómo vengo en los últimos meses?». Se mantiene el resumen mensual actual y se agrega una vista de evolución.

## Decisiones

- El Resumen se divide en dos segmentos (pestañas): **Mes · Evolución**.
- El ticket promedio mantiene su definición actual (promedio de ventas por día con ventas) y se muestra su evolución.
- Un desglose por categoría o medio de pago se evaluó y se descartó por no ser claro para el usuario.

## Requisitos funcionales

- **RF-1. Segmentos:** debajo del navegador de mes hay dos segmentos. «Mes» es el contenido actual y es el segmento inicial. El mes del navegador aplica a ambos.
- **RF-2. Evolución:** gráfico de barras con un valor por mes, terminando en el mes seleccionado.
  - Rango 3 / 6 / 12 meses, por defecto 6.
  - Métrica: Ingresos, Gastos, Balance o Ticket (promedio de las ventas diarias del mes, sin días en 0).
  - Los meses sin registros valen 0 (no se omiten, para no distorsionar la tendencia).
  - El mes en curso se dibuja atenuado y el tooltip lo marca como «En curso».
  - El balance negativo se dibuja en rojo.
- **RF-3. Variación:** una tarjeta muestra la diferencia del último mes frente al anterior (monto y %). Verde si mejora, rojo si empeora; en Gastos, subir es empeorar. Si el mes anterior vale 0 no se muestra el %.
- **RF-4. Estados:** carga con solo `Spinner` (`aria-label` de `common.loading`); error con texto fijo y «Reintentar».

## Requisitos de interfaz

- Mobile-first, componentes HeroUI (`Tabs`, `Card`), iconos `lucide-react`.
- Colores: ingresos `success`, gastos `danger`, balance primario, ticket teal.
- Textos en `es.ts` y `en.ts`; montos con el locale activo.

## Criterios de aceptación

- **CA-1:** Evolución muestra la serie del rango elegido y la variación frente al mes anterior.
- **CA-2:** cambiar métrica o rango no vuelve a consultar datos.

## Fuera de alcance

Desglose por categoría o medio de pago, artículos o productos, rangos de fechas libres, exportación, comparación año contra año.
