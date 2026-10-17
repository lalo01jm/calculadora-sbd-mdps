"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseWeightExpression } from "@/lib/weight-expression";

type Mode = "sbd" | "mdps";
type Unit = "kg" | "lb";
const kilogramsToPounds = 2.2046226218;

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("mdps");
  const [bodyweight, setBodyweight] = useState("75");
  const [load, setLoad] = useState("20");
  const [reps, setReps] = useState("5");
  const [rir, setRir] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [unitError, setUnitError] = useState("");
  const loadInput = useRef<HTMLInputElement>(null);
  const unitSwitcher = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let frame = 0;
    const updatePosition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!unitSwitcher.current) return;

        // Mobile keyboards can pan the visual viewport without moving fixed UI.
        const x = viewport.offsetLeft + viewport.width - window.innerWidth;
        const y = viewport.offsetTop;
        unitSwitcher.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    updatePosition();
    viewport.addEventListener("resize", updatePosition);
    viewport.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", updatePosition);
      viewport.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  const bodyweightValue = Number(bodyweight);
  const loadValue = parseWeightExpression(load);

  const usesBodyweight = mode === "mdps";

  const calculation = useMemo(() => {
    const bw = Number(bodyweight);
    const lifted = parseWeightExpression(load);
    const repetitionCount = Number(reps);
    const rirValue = rir.trim() === "" ? 0 : Number(rir);
    const effectiveReps = repetitionCount + rirValue;
    const validBodyweight = !usesBodyweight || (bw > 0 && Number.isFinite(bw));
    const validRir =
      Number.isFinite(rirValue) &&
      rirValue >= 0 &&
      rirValue <= 10 &&
      effectiveReps <= 15;
    const valid =
      validBodyweight &&
      validRir &&
      lifted >= 0 &&
      Number.isFinite(lifted) &&
      Number.isInteger(repetitionCount) &&
      repetitionCount >= 1 &&
      repetitionCount <= 15;

    if (!valid) return null;

    const workingLoad = lifted + (usesBodyweight ? bw : 0);
    const formulas =
      effectiveReps === 1
        ? [
            { name: "Epley", total: workingLoad },
            { name: "Brzycki", total: workingLoad },
            { name: "Lombardi", total: workingLoad },
          ]
        : [
            {
              name: "Epley",
              total: workingLoad * (1 + effectiveReps / 30),
            },
            {
              name: "Brzycki",
              total: workingLoad * (36 / (37 - effectiveReps)),
            },
            {
              name: "Lombardi",
              total: workingLoad * Math.pow(effectiveReps, 0.1),
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
      effectiveReps,
      rir: rirValue,
    };
  }, [bodyweight, load, reps, rir, usesBodyweight]);

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
    setMode(nextMode as Mode);
  };

  const insertPlus = () => {
    const input = loadInput.current;
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    const nextValue = input.value.slice(0, start) + "+" + input.value.slice(end);

    setLoad(nextValue);
    setUnitError("");

    // Keep the numeric keyboard open and continue typing after the inserted +.
    input.focus({ preventScroll: true });
    requestAnimationFrame(() => input.setSelectionRange(start + 1, start + 1));
  };

  const switchUnit = (nextUnit: Unit) => {
    if (nextUnit === unit) return;

    if ([bodyweight, load].some((value) =>
      value.trim() !== "" && !Number.isFinite(parseWeightExpression(value)),
    )) {
      setUnitError("Completa las sumas antes de cambiar de unidad.");
      return;
    }

    setUnitError("");

    const factor = nextUnit === "lb" ? kilogramsToPounds : 1 / kilogramsToPounds;
    const convert = (value: string) => {
      if (value.trim() === "") return value;

      const numericValue = parseWeightExpression(value);
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
        <header className="mb-4 flex min-h-9 items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full border border-[#c8ff32]/50 bg-[#c8ff32]/10 text-[#c8ff32]">
              <Activity aria-hidden="true" className="size-4" strokeWidth={2.2} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.18em]">1RM Lab</h1>
          </div>
          <div className="flex flex-col items-end gap-1.5 pl-4 pt-9">
            <div
              ref={unitSwitcher}
              className="fixed right-4 top-5 z-50 flex rounded-full border border-white/15 bg-[#0b0d0c]/90 p-0.5 shadow-[0_8px_24px_rgba(0,0,0,.35)] backdrop-blur-md sm:right-7 sm:top-7 lg:right-10 xl:right-[calc((100vw-72rem)/2+2.5rem)]"
              role="group"
              aria-label="Unidad de peso"
            >
              {(["kg", "lb"] as Unit[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onPointerDown={(event) => {
                    if (document.activeElement instanceof HTMLInputElement) {
                      event.preventDefault();
                    }
                  }}
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
            {unitError && (
              <span role="alert" className="max-w-44 text-right text-xs text-amber-300">
                {unitError}
              </span>
            )}
          </div>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,.98fr)] lg:gap-6">
          <section className="max-w-2xl">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
              <Tabs value={mode} onValueChange={switchMode}>
                <TabsList className="mb-4 grid h-12 w-full grid-cols-2 rounded-2xl border border-white/10 bg-black/30 p-1">
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

              <div className="grid grid-cols-2 gap-4">
                {mode === "mdps" && (
                  <div className="col-span-2 sm:col-span-1">
                    <Label
                      htmlFor="bodyweight"
                      className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/50"
                    >
                      Peso corporal
                    </Label>
                    <div className="relative">
                      <Input
                        id="bodyweight"
                        inputMode="decimal"
                        type="number"
                        min="1"
                        step="0.1"
                        autoComplete="off"
                        spellCheck={false}
                        value={bodyweight}
                        onChange={(event) => {
                          setBodyweight(event.target.value);
                          setUnitError("");
                        }}
                        className="h-12 rounded-xl border-white/10 bg-black/25 px-4 pr-12 text-xl font-black shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20 sm:h-14"
                        aria-required={usesBodyweight}
                        aria-invalid={bodyweight.trim() !== "" && (!Number.isFinite(bodyweightValue) || (usesBodyweight && bodyweightValue <= 0))}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/35">
                        {unit.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                <div className={mode === "sbd" ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                  <Label
                    htmlFor="load"
                    className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/50"
                  >
                    {usesBodyweight ? "Lastre" : "Peso en barra"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="load"
                      ref={loadInput}
                      inputMode="decimal"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={load}
                      onChange={(event) => {
                        setLoad(event.target.value);
                        setUnitError("");
                      }}
                      aria-describedby={load.includes("+") && Number.isFinite(loadValue) ? "load-hint" : undefined}
                      aria-invalid={load.trim() !== "" && !Number.isFinite(loadValue)}
                      className="h-12 rounded-xl border-white/10 bg-black/25 px-4 pr-24 text-xl font-black shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20 sm:h-14"
                    />
                    <button
                      type="button"
                      aria-label="Añadir suma al lastre o peso en barra"
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={insertPlus}
                      className="absolute right-11 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg bg-[#c8ff32]/10 text-2xl font-bold text-[#c8ff32] hover:bg-[#c8ff32]/20 focus-visible:outline-2 focus-visible:outline-[#c8ff32]"
                    >
                      +
                    </button>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/35">
                      {unit.toUpperCase()}
                    </span>
                  </div>
                  {load.includes("+") && Number.isFinite(loadValue) && (
                    <p id="load-hint" className="mt-1.5 text-xs text-white/55">
                      = {round(loadValue)} {unit}
                    </p>
                  )}
                </div>

                <div>
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
                    className="h-12 rounded-xl border-white/10 bg-black/25 px-4 text-xl font-black shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20 sm:h-14"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="rir"
                    className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white/50"
                  >
                    RIR
                    <span className="font-medium normal-case tracking-normal text-white/30">
                      opcional
                    </span>
                  </Label>
                  <Input
                    id="rir"
                    inputMode="decimal"
                    min="0"
                    max="10"
                    step="0.5"
                    type="number"
                    placeholder="0"
                    value={rir}
                    aria-describedby="rir-hint"
                    onChange={(event) => setRir(event.target.value)}
                    className="h-12 rounded-xl border-white/10 bg-black/25 px-4 text-xl font-black shadow-none focus-visible:border-[#c8ff32]/60 focus-visible:ring-[#c8ff32]/20 sm:h-14"
                  />
                  <p id="rir-hint" className="sr-only">
                    Repeticiones en reserva. Vacío equivale a 0. Repeticiones + RIR no puede superar 15.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-7">
            <div className="overflow-hidden rounded-[1.75rem] bg-[#f4f3ea] text-[#101210] shadow-[0_30px_80px_rgba(0,0,0,.35)]">
              <div className="border-b border-black/10 p-5 sm:p-6">
                <h2 className="mb-5 text-sm font-bold text-black/60">
                  {usesBodyweight ? "1RM estimado de lastre" : "1RM estimado en barra"}
                </h2>

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
                    {(usesBodyweight || calculation.rir > 0) && (
                      <div className="mt-4 space-y-1 text-xs font-semibold text-black/45">
                        {usesBodyweight && (
                          <p>
                            Total: {round(calculation.averageTotal)} {unit}
                          </p>
                        )}
                        {calculation.rir > 0 && (
                          <p>
                            {reps} reps + {round(calculation.rir)} RIR
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8" aria-live="polite">
                    <p className="text-2xl font-black tracking-tight">Revisa los datos</p>
                    <p className="mt-2 text-sm leading-6 text-black/50">
                      Usa pesos válidos y un máximo de 15 repeticiones + RIR.
                    </p>
                  </div>
                )}
              </div>

              <details className="px-5 py-3 sm:px-6">
                <summary className="cursor-pointer text-xs font-bold text-black/55">
                  Ver fórmulas
                </summary>
                <div className="mt-3 space-y-2">
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
              </details>
            </div>
          </aside>
        </div>

        {calculation && (
          <section className="mt-4 w-full min-w-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="border-b border-white/10 px-5 py-4 sm:px-7">
              <h2 className="text-base font-black tracking-tight">
                Cargas por repeticiones
              </h2>
            </div>

            <div className="w-full">
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">
                  Cargas estimadas de 1 a 12 repeticiones en {unit}
                </caption>
                <colgroup>
                  <col className={usesBodyweight ? "w-[30%]" : "w-[40%]"} />
                  <col />
                  {usesBodyweight && <col />}
                </colgroup>
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.08em] text-white/40 sm:tracking-[0.14em]">
                    <th scope="col" className="px-3 py-4 sm:px-7">
                      <span className="sm:hidden">Reps.</span>
                      <span className="hidden sm:inline">Repeticiones</span>
                    </th>
                    <th scope="col" className="px-3 py-4 text-right sm:px-7">
                      <span className="sm:hidden">{usesBodyweight ? "Lastre" : "Carga"}</span>
                      <span className="hidden sm:inline">{usesBodyweight ? "Lastre estimado" : "Carga estimada"}</span>
                    </th>
                    {usesBodyweight && (
                      <th scope="col" className="px-3 py-4 text-right sm:px-7">
                        <span className="sm:hidden">Total</span>
                        <span className="hidden sm:inline">Carga total</span>
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
                          className="px-3 py-3.5 text-sm font-black tabular-nums sm:px-7"
                        >
                          <span className="inline-flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                            {row.reps}
                            {isCurrent && (
                              <span className="rounded-full bg-[#c8ff32] px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-[#0b0d0c]">
                                Actual
                              </span>
                            )}
                          </span>
                        </th>
                        <td className="px-3 py-3.5 text-right font-mono text-xs font-black tabular-nums text-[#c8ff32] [overflow-wrap:anywhere] sm:px-7 sm:text-sm">
                          {round(row.load)} {unit}
                        </td>
                        {usesBodyweight && (
                          <td className="px-3 py-3.5 text-right font-mono text-xs font-bold tabular-nums text-white/65 [overflow-wrap:anywhere] sm:px-7 sm:text-sm">
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
                Lastre negativo = asistencia.
              </p>
            )}
          </section>
        )}

        <footer className="mt-6 border-t border-white/10 py-4 text-[10px] text-white/40">
          Esta página fue enteramente generada por IA.
        </footer>
      </div>
    </main>
  );
}
