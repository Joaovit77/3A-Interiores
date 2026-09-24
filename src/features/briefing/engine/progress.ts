import type { Flow } from "./flow";

export const REVIEW_KEY = "revisao";
export const CONFIRMATION_KEY = "confirmacao";

export interface Progress {
  stageNumber: number;
  stageCount: number;
  stageTitle: string;
  /** De 0 a 1. Calculado por etapa, nunca pela quantidade de perguntas. */
  fraction: number;
}

/** Etapas visíveis + a etapa final de revisão. */
export function progressFor(flow: Flow, currentKey: string): Progress {
  const stageCount = flow.stages.length + 1;

  if (currentKey === REVIEW_KEY || currentKey === CONFIRMATION_KEY) {
    return {
      stageNumber: stageCount,
      stageCount,
      stageTitle: "Revisar e enviar",
      fraction:
        currentKey === CONFIRMATION_KEY ? 1 : (stageCount - 1) / stageCount,
    };
  }

  const screen =
    flow.screens.find((s) => s.key === currentKey) ?? flow.screens[0];
  const stageIndex = Math.max(
    0,
    flow.stages.findIndex((s) => s.id === screen?.stageId),
  );
  const inStage = flow.screens.filter((s) => s.stageId === screen?.stageId);
  const position = Math.max(0, inStage.indexOf(screen));
  const within = inStage.length ? position / inStage.length : 0;

  return {
    stageNumber: stageIndex + 1,
    stageCount,
    stageTitle: flow.stages[stageIndex]?.title ?? "",
    fraction: (stageIndex + within) / stageCount,
  };
}
