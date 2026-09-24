"use client";

import { useState } from "react";

import type { Flow } from "../engine/flow";
import type { BriefingState } from "../engine/state";

interface DevPanelProps {
  flow: Flow;
  state: BriefingState;
  currentKey: string;
}

const pre =
  "bg-ink/5 max-h-64 overflow-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap break-all";

/**
 * Painel de inspeção do protótipo. Só é carregado em desenvolvimento
 * (ver `BriefingFlow`) e nunca aparece em build de produção.
 */
export function DevPanel({ flow, state, currentKey }: DevPanelProps) {
  const [open, setOpen] = useState(false);

  const hiddenAnswers = Object.keys(state.answers).filter(
    (key) => !(key in flow.effective),
  );
  const activeRules = [
    ...new Set(
      flow.evaluations.flatMap((e) =>
        e.rules.filter((r) => r.result).map((r) => r.name),
      ),
    ),
  ];
  const bathrooms = flow.rooms.filter((r) => r.type === "banheiro");

  return (
    <div data-testid="dev-panel" className="fixed bottom-24 left-3 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="rounded-full bg-ink px-3 py-2 font-mono text-xs text-paper shadow-lg"
      >
        DEV
      </button>
      {open ? (
        <div className="absolute bottom-12 left-0 flex max-h-[70dvh] w-[min(26rem,calc(100vw-1.5rem))] flex-col gap-4 overflow-auto rounded-xl border border-line bg-surface p-4 text-sm shadow-xl">
          <p className="font-semibold">DevPanel · só em desenvolvimento</p>

          <section>
            <h2 className="font-semibold">Tela atual</h2>
            <p className="font-mono text-xs">{currentKey || "—"}</p>
          </section>

          <section>
            <h2 className="font-semibold">Módulos selecionados</h2>
            <ul className="font-mono text-xs">
              {flow.rooms.map((r) => (
                <li key={r.id}>
                  {r.id} ·{" "}
                  {r.hasModule ? "módulo completo" : "B1.1 (sem perguntas)"}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-semibold">Reaproveitamento entre banheiros</h2>
            <ul className="font-mono text-xs">
              {bathrooms.map((b) => (
                <li key={b.id}>
                  {b.id}:{" "}
                  {b.index === 1
                    ? "primeiro"
                    : String(
                        flow.effective[`room.${b.id}.reuse_previous`] ??
                          "sem resposta",
                      )}
                  {" · herdadas: "}
                  {flow.inheritedScreens
                    .filter((i) => i.room.id === b.id)
                    .map((i) => i.def.id)
                    .join(", ") || "nenhuma"}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-semibold">
              Regras ativas ({activeRules.length})
            </h2>
            <p className="font-mono text-xs">
              {activeRules.join(", ") || "nenhuma"}
            </p>
          </section>

          <section>
            <h2 className="font-semibold">
              Telas visíveis ({flow.screens.length})
            </h2>
            <p className="font-mono text-xs">
              {flow.screens.map((s) => s.key).join(" → ")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold">Telas escondidas</h2>
            <ul className="font-mono text-xs">
              {flow.evaluations
                .filter((e) => !e.visible)
                .map((e) => (
                  <li key={e.screenKey}>
                    {e.screenKey} · {e.reason}
                    {e.rules.length
                      ? ` · ${e.rules.map((r) => `${r.name}=${r.result ? "sim" : "não"}`).join(", ")}`
                      : ""}
                  </li>
                ))}
            </ul>
          </section>

          <section>
            <h2 className="font-semibold">Valores herdados e pré-marcados</h2>
            <pre className={pre}>{JSON.stringify(flow.derived, null, 2)}</pre>
          </section>

          <section>
            <h2 className="font-semibold">Respostas efetivas</h2>
            <pre className={pre}>{JSON.stringify(flow.effective, null, 2)}</pre>
          </section>

          <section>
            <h2 className="font-semibold">
              Guardadas, mas escondidas ({hiddenAnswers.length})
            </h2>
            <p className="font-mono text-xs">
              {hiddenAnswers.join(", ") || "nenhuma"}
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
