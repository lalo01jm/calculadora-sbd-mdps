# Calculadora de 1RM · SBD y MDPS

Calculadora web de **1RM estimado** para powerlifting y streetlifting. Combina las fórmulas de Epley, Brzycki y Lombardi y muestra tanto el resultado de cada una como su promedio.

**Aplicación:** [lalo01jm.github.io/calculadora-sbd-mdps](https://lalo01jm.github.io/calculadora-sbd-mdps/)

## Funcionalidades

- Dos modalidades: SBD y MDPS.
- Selector entre kilogramos y libras con conversión automática de los valores.
- Ajuste opcional mediante RIR (repeticiones en reserva).
- El modo SBD solicita únicamente el peso levantado; no muestra peso corporal.
- Resultado actualizado automáticamente al cambiar los datos.
- Lastre/peso en barra admite sumas, como `135+50` o `135+50+2.5`, con total visible debajo del campo.
- Promedio de tres fórmulas conocidas de estimación de 1RM.
- Desglose individual de Epley, Brzycki y Lombardi.
- Cálculo específico para ejercicios con peso corporal y lastre.
- Validación de 1 a 15 repeticiones.
- Tabla de cargas estimadas para series de 1 a 12 repeticiones.
- Interfaz adaptable a celulares y computadoras.

## Ejercicios incluidos

### SBD

- Sentadilla
- Press de banca
- Peso muerto

### MDPS

- Muscle-up
- Dominada
- Paralelas
- Sentadilla

## Cómo se calcula

Sea `W` la carga utilizada y `r` el número de repeticiones:

| Fórmula | Estimación |
| --- | --- |
| Epley | `W × (1 + r / 30)` |
| Brzycki | `W × 36 / (37 − r)` |
| Lombardi | `W × r^0.10` |

El resultado principal es el promedio aritmético de las tres estimaciones. Cuando se registra una sola repetición con RIR 0, la aplicación toma la carga levantada como el 1RM observado.

### Ajuste por RIR

El campo RIR es opcional. Vacío o `0` indica una serie al fallo. Cuando se introduce un valor mayor, el cálculo utiliza:

```text
repeticiones efectivas = repeticiones realizadas + RIR
```

La suma de repeticiones y RIR está limitada a 15 para mantener el cálculo dentro del intervalo admitido por la aplicación.

### Tabla de cargas por repeticiones

A partir del 1RM promedio, la aplicación invierte las tres fórmulas y promedia sus resultados para estimar la carga correspondiente a series de 1 a 12 repeticiones. En ejercicios con peso corporal muestra tanto el lastre como la carga total; un lastre negativo representa asistencia.

### Ejercicios con lastre

En muscle-up, dominadas y paralelas se estima primero el 1RM de la carga total:

```text
carga de trabajo = peso corporal + lastre
1RM de lastre = 1RM de carga total − peso corporal
```

En sentadilla, press de banca y peso muerto se utiliza directamente el peso colocado en la barra; el peso corporal no se suma.

## Desarrollo local

### Requisitos

- Node.js 22.13 o posterior
- npm

### Instalación

```bash
git clone https://github.com/lalo01jm/calculadora-sbd-mdps.git
cd calculadora-sbd-mdps
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

## Sumas en los campos de peso

En el lastre o peso en barra puedes escribir un peso o sumar varias cantidades con `+`: `135+50` equivale a `185`. Se admiten espacios y decimales con punto o coma. La suma se conserva mientras escribes y se muestra su total debajo del campo. Al cambiar entre kg y lb, se convierte el total. Las expresiones incompletas o no admitidas no generan una estimación. En el celular se solicita el teclado numérico y se ofrece un botón `+` junto al lastre/peso en barra. El peso corporal es un campo numérico simple, sin sumas.

Para ejecutar las pruebas del analizador:

```bash
node --experimental-strip-types --test tests/*.test.mjs
```

## Tecnologías

- React 19
- Next.js 16
- TypeScript
- Tailwind CSS
- Radix UI
- GitHub Pages

## Aviso

Las fórmulas proporcionan estimaciones y pierden precisión conforme aumenta el número de repeticiones. El resultado no sustituye una prueba real de fuerza máxima ni una programación individualizada.
