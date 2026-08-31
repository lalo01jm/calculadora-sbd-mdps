"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowUpRight, Dumbbell, Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "sbd" | "mdps";
type Unit = "kg" | "lb";
type Exercise =
  | "squat"
  | "bench"
  | "deadlift"
  | "muscle-up"
  | "pull-up"
  | "dip"
  | "street-squat";

const exercises: Record<Mode, { value: Exercise; label: string }[]> = {
  sbd: [
    { value: "squat", label: "Sentadilla" },
    { value: "bench", label: "Press de banca" },
    { value: "deadlift", label: "Peso muerto" },
  ],
  mdps: [
    { value: "muscle-up", label: "Muscle-up" },
    { value: "pull-up", label: "Dominada" },
    { value: "dip", label: "Paralelas" },
    { value: "street-squat", label: "Sentadilla" },
  ],
};

const bodyweightExercises: Exercise[] = ["muscle-up", "pull-up", "dip"];
const kilogramsToPounds = 2.2046226218;

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("mdps");
  const [exercise, setExercise] = useState<Exercise>("pull-up");
  const [bodyweight, setBodyweight] = useState("75");
  const [load, setLoad] = useState("20");
  const [reps, setReps] = useState("5");
  const [unit, setUnit] = useState<Unit>("kg");

  const usesBodyweight = bodyweightExercises.includes(exercise);
  const selectedExercise = exercises[mode].find(
    (item) => item.value === exercise,
  )?.label;

  const calculation = useMemo(() => {
    const bw = Number(bodyweight);
    const lifted = Number(load);
    const repetitionCount = Number(reps);
    const validBodyweight = !usesBodyweight || (bw > 0 && Number.isFinite(bw));
    const valid =
      validBodyweight &&
      lifted >= 0 &&
      Number.isFinite(lifted) &&
      Number.isInteger(repetitionCount) &&
      repetitionCount >= 1 &&
      repetitionCount <= 15;

    if (!valid) return null;

    const workingLoad = lifted + (usesBodyweight ? bw : 0);
    const formulas =
      repetitionCount === 1
        ? [
            { name: "Epley", total: workingLoad },
            { name: "Brzycki", total: workingLoad },
            { name: "Lombardi", total: workingLoad },
          ]
        : [
            {
              name: "Epley",
              total: workingLoad * (1 + repetitionCount / 30),
            },
            {
              name: "Brzycki",
              total: workingLoad * (36 / (37 - repetitionCount)),
            },
            {
              name: "Lombardi",
              total: workingLoad * Math.pow(repetitionCount, 0.1),
            },
          ];

    const averageTotal =
      formulas.reduce((sum, formula) => sum + formula.total, 0) /
      formulas.length;

    return {
      formulas: formulas.map((formula) => ({
        ...formula,
        result: usesBodyweight ? formula.total - bw : formula.total,
      })),
      average: usesBodyweight ? averageTotal - bw : averageTotal,
      averageTotal,
    };
  }, [bodyweight, load, reps, usesBodyweight]);

  const repetitionTable = useMemo(() => {
    if (!calculation) return [];

    const bw = Number(bodyweight);

    return Array.from({ length: 12 }, (_, index) => {
      const repetitionCount = index + 1;
      const estimatedLoads =
        repetitionCount === 1
          ? [
              calculation.averageTotal,
              calculation.averageTotal,
              calculation.averageTotal,
            ]
          : [
              calculation.averageTotal / (1 + repetitionCount / 30),
              calculation.averageTotal * ((37 - repetitionCount) / 36),
              calculation.averageTotal / Math.pow(repetitionCount, 0.1),
            ];

      const averageTotal =
        estimatedLoads.reduce((sum, value) => sum + value, 0) /
        estimatedLoads.length;

      return {
        reps: repetitionCount,
        total: averageTotal,
        load: usesBodyweight ? averageTotal - bw : averageTotal,
      };
    });
  }, [bodyweight, calculation, usesBodyweight]);

  const switchMode = (nextMode: string) => {
    const next = nextMode as Mode;
    setMode(next);
    setExercise(next === "sbd" ? "squat" : "pull-up");
  };

  const switchUnit = (nextUnit: Unit) => {
    if (nextUnit === unit) return;

    const factor = nextUnit === "lb" ? kilogramsToPounds : 1 / kilogramsToPounds;
    const convert = (value: string) => {
      if (value.trim() === "") return value;

      const numericValue = Number(value);
      return Number.isFinite(numericValue)
        ? String(round(numericValue * factor))
        : value;
    };

    setBodyweight((value) => convert(value));
    setLoad((value) => convert(value));
    setUnit(nextUnit);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0d0c] text-[#f4f3ea]">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -right-28 top-[-7rem] h-80 w-80 rounded-full bg-[#c8ff32]/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
        <header className="mb-7 flex items-center justify-between border-b border-white/10 pb-5 sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full border border-[#c8ff32]/50 bg-[#c8ff32]/10 text-[#c8ff32]">
              <Activity aria-hidden="true" className="size-4" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em]">1RM Lab</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                Fuerza estimada
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div
              className="flex rounded-full border border-white/10 bg-black/20 p-0.5"
              role="group"
              aria-label="Unidad de peso"
            >
              {(["kg", "lb"] as Unit[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => switchUnit(option)}
                  aria-pressed={unit === option}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${
                    unit === option
                      ? "bg-[#c8ff32] text-[#0b0d0c]"
                      : "text-white/45 hover:text-white/75"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <span className="max-w-40 text-right text-[9px] font-semibold leading-3 text-white/55">
              Página generada enteramente por IA
            </span>
          </div>
        </header>

        <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,.98fr)] lg:gap-12">
          <section className="max-w-2xl">
            <div className="mb-6">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#c8ff32]">
                <span className="h-px w-7 bg-[#c8ff32]" /> Calculadora de fuerza
              </p>
              <h1 className="max-w-xl text-[clamp(2.5rem,8vw,5.4rem)] font-black leading-[0.91] tracking-[-0.06em]">
                Calcula tu
                <span className="block text-[#c8ff32]">1RM estimado.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-white/55 sm:text-base">
                Promedio de Epley, Brzycki y Lombardi para powerlifting y streetlifting.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
              <Tabs value={mode} onValueChange={switchMode}>
                <TabsList className="mb-6 grid h-12 w-full grid-cols-2 rounded-2xl border border-white/10 bg-black/30 p-1">
                  <TabsTrigger
                    value="sbd"
                    className="h-full rounded-xl text-xs font-black uppercase tracking-[0.12em] text-white/45 data-[state=active]:bg-[#f4f3ea] data-[state=active]:text-[#0b0d0c]"
                  >
                    SBD
                  </TabsTrigger>
                  <TabsTrigger
                    value="mdps"
                    className="h-full rounded-xl text-xs font-black uppercase tracking-[0.12em] text-white/45 data-[state=active]:bg-[#c8ff32] data-[state=active]:text-[#0b0d0c]"
                  >
                    MDPS
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="exercise"
                    className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/50"
                  >
                    Ejercicio
                  </Label>
                  <Select value={exercise} onValueChange={(value) => setExercise(value as Exercise)}>
                    <SelectTrigger
                      id="exercise"
                      className="h-12 w-full rounded-xl border-white/10 bg-black/25 px-4 text-base font-bold shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#171a18] text-[#f4f3ea]">
                      {exercises[mode].map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="bodyweight"
                    className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/50"
                  >
                    Peso corporal
                    {!usesBodyweight && (
                      <span className="font-medium normal-case tracking-normal text-white/30">
                        opcional
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="bodyweight"
                      inputMode="decimal"
                      min="1"
                      step="0.1"
                      type="number"
                      value={bodyweight}
                      onChange={(event) => setBodyweight(event.target.value)}
                      className="h-14 rounded-xl border-white/10 bg-black/25 px-4 pr-12 text-xl font-black shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20"
                      aria-required={usesBodyweight}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/35">
                      {unit.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="load"
                    className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/50"
                  >
                    {usesBodyweight ? "Lastre añadido" : "Peso en barra"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="load"
                      inputMode="decimal"
                      min="0"
                      step="0.1"
                      type="number"
                      value={load}
                      onChange={(event) => setLoad(event.target.value)}
                      className="h-14 rounded-xl border-white/10 bg-black/25 px-4 pr-12 text-xl font-black shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/35">
                      {unit.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label
                    htmlFor="reps"
                    className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/50"
                  >
                    Repeticiones
                  </Label>
                  <Input
                    id="reps"
                    inputMode="numeric"
                    min="1"
                    max="15"
                    step="1"
                    type="number"
                    value={reps}
                    onChange={(event) => setReps(event.target.value)}
                    className="h-14 rounded-xl border-white/10 bg-black/25 px-4 text-xl font-black shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20"
                  />
                  <p className="mt-2 text-xs text-white/35">
                    Usa de 1 a 15 repeticiones; la estimación es más útil cerca de la fuerza máxima.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-7">
            <div className="overflow-hidden rounded-[1.75rem] bg-[#f4f3ea] text-[#101210] shadow-[0_30px_80px_rgba(0,0,0,.35)]">
              <div className="border-b border-black/10 p-5 sm:p-7">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/40">
                      Resultado · {selectedExercise}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black/60">
                      {usesBodyweight ? "1RM de lastre" : "1RM en barra"}
                    </p>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#101210] text-[#c8ff32]">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                  </div>
                </div>

                {calculation ? (
                  <div aria-live="polite">
                    <div className="flex items-end gap-2">
                      <span className="text-[clamp(4rem,15vw,7rem)] font-black leading-[0.78] tracking-[-0.075em] tabular-nums">
                        {round(calculation.average)}
                      </span>
                      <span className="mb-1 text-lg font-black uppercase text-black/35 sm:mb-2">
                        {unit}
                      </span>
                    </div>
                    <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#c8ff32] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em]">
                      <Dumbbell aria-hidden="true" className="size-3.5" />
                      Promedio de 3 fórmulas
                    </p>
                    {usesBodyweight && (
                      <p className="mt-4 text-xs font-semibold text-black/45">
                        Carga total estimada: {round(calculation.averageTotal)} {unit}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-8" aria-live="polite">
                    <p className="text-2xl font-black tracking-tight">Revisa los datos</p>
                    <p className="mt-2 text-sm leading-6 text-black/50">
                      Introduce valores válidos y entre 1 y 15 repeticiones.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-7">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-black/35">
                  Desglose
                </p>
                <div className="space-y-2">
                  {calculation?.formulas.map((formula) => (
                    <div
                      key={formula.name}
                      className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3"
                    >
                      <span className="text-sm font-bold">{formula.name}</span>
                      <span className="font-mono text-sm font-black tabular-nums">
                        {round(formula.result)} {unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/45">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#c8ff32]" />
              <p>
                {usesBodyweight
                  ? "Se estima primero la carga total (peso corporal + lastre) y después se resta tu peso para obtener el 1RM de lastre."
                  : "En ejercicios con barra, el peso corporal no se suma a la carga; solo se usa el peso levantado."}
              </p>
            </div>
          </aside>
        </div>

        {calculation && (
          <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="flex flex-col gap-2 border-b border-white/10 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c8ff32]">
                  Proyección de fuerza
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                  Tabla de cargas · 1–12 repeticiones
                </h2>
              </div>
              <p className="max-w-md text-xs leading-5 text-white/45 sm:text-right">
                Carga estimada al invertir Epley, Brzycki y Lombardi usando tu 1RM promedio.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                    <th scope="col" className="px-5 py-4 sm:px-7">
                      Repeticiones
                    </th>
                    <th scope="col" className="px-5 py-4 text-right sm:px-7">
                      {usesBodyweight ? "Lastre estimado" : "Carga estimada"}
                    </th>
                    {usesBodyweight && (
                      <th scope="col" className="px-5 py-4 text-right sm:px-7">
                        Carga total
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {repetitionTable.map((row) => {
                    const isCurrent = Number(reps) === row.reps;

                    return (
                      <tr
                        key={row.reps}
                        className={`border-b border-white/[0.07] last:border-0 ${
                          isCurrent ? "bg-[#c8ff32]/10" : ""
                        }`}
                      >
                        <th
                          scope="row"
                          className="px-5 py-3.5 text-sm font-black tabular-nums sm:px-7"
                        >
                          <span className="inline-flex items-center gap-2">
                            {row.reps}
                            {isCurrent && (
                              <span className="rounded-full bg-[#c8ff32] px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-[#0b0d0c]">
                                Actual
                              </span>
                            )}
                          </span>
                        </th>
                        <td className="px-5 py-3.5 text-right font-mono text-sm font-black tabular-nums text-[#c8ff32] sm:px-7">
                          {round(row.load)} {unit}
                        </td>
                        {usesBodyweight && (
                          <td className="px-5 py-3.5 text-right font-mono text-sm font-bold tabular-nums text-white/65 sm:px-7">
                            {round(row.total)} {unit}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {usesBodyweight && repetitionTable.some((row) => row.load < 0) && (
              <p className="border-t border-white/10 px-5 py-4 text-xs leading-5 text-white/40 sm:px-7">
                Un lastre negativo representa la asistencia aproximada necesaria para esa cantidad de repeticiones.
              </p>
            )}
          </section>
        )}

        <footer className="mt-10 flex flex-col gap-2 border-t border-white/10 py-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>Estimación orientativa · No sustituye un intento real</span>
          <span className="normal-case tracking-normal text-white/25">
            Esta página fue enteramente generada por IA.
          </span>
        </footer>
      </div>
    </main>
  );
}
