import type { AnswerValue, Answers } from "../definition/types";

/**
 * Estado do protótipo (B2): só em memória, sem persistência.
 *
 * Respostas cujas condições deixaram de valer continuam em `answers` para
 * reaparecer se a condição voltar. Elas não entram no resumo nem nas regras
 * (ver `buildFlow`). Esse é um comportamento de UX do protótipo; a persistência
 * desses dados no produto real será decidida no B3.
 */
export interface BriefingState {
  consent: boolean;
  answers: Answers;
  submitted: boolean;
}

export type BriefingAction =
  | { type: "setConsent"; value: boolean }
  | { type: "setAnswer"; key: string; value: AnswerValue | undefined }
  | { type: "submit" }
  | { type: "reset" };

export const initialState: BriefingState = {
  consent: false,
  answers: {},
  submitted: false,
};

export function briefingReducer(
  state: BriefingState,
  action: BriefingAction,
): BriefingState {
  switch (action.type) {
    case "setConsent":
      return { ...state, consent: action.value };
    case "setAnswer": {
      const answers = { ...state.answers };
      if (action.value === undefined) delete answers[action.key];
      else answers[action.key] = action.value;
      return { ...state, answers };
    }
    case "submit":
      return { ...state, submitted: true };
    case "reset":
      return initialState;
  }
}
