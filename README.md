# Calculadora de 1RM · SBD y MDPS

Calculadora web de **1RM estimado** para powerlifting y streetlifting. Combina las fórmulas de Epley, Brzycki y Lombardi y muestra tanto el resultado de cada una como su promedio.

**Aplicación:** [lalo01jm.github.io/calculadora-sbd-mdps](https://lalo01jm.github.io/calculadora-sbd-mdps/)

## Funcionalidades

- Dos modalidades: SBD y MDPS.
- Resultado actualizado automáticamente al cambiar los datos.
- Promedio de tres fórmulas conocidas de estimación de 1RM.
- Desglose individual de Epley, Brzycki y Lombardi.
- Cálculo específico para ejercicios con peso corporal y lastre.
- Validación de 1 a 15 repeticiones.
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

El resultado principal es el promedio aritmético de las tres estimaciones. Cuando se registra una sola repetición, la aplicación toma la carga levantada como el 1RM observado.

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

## Tecnologías

- React 19
- Next.js 16
- TypeScript
- Tailwind CSS
- Radix UI
- GitHub Pages

## Aviso

Las fórmulas proporcionan estimaciones y pierden precisión conforme aumenta el número de repeticiones. El resultado no sustituye una prueba real de fuerza máxima ni una programación individualizada.
