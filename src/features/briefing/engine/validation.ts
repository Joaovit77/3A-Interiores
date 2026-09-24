import type { AnswerValue } from "../definition/types";
import {
  isEmptyValue,
  type FieldInstance,
  type Flow,
  type ScreenInstance,
} from "./flow";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function fieldError(
  field: FieldInstance,
  value: AnswerValue | undefined,
): string | undefined {
  const { def } = field;

  if (
    def.kind === "email" &&
    typeof value === "string" &&
    value.trim() &&
    !EMAIL_RE.test(value.trim())
  ) {
    return "Confira o e-mail. Ele precisa ter o formato nome@exemplo.com.";
  }

  if (def.kind === "number" && typeof value === "number") {
    if (
      (def.min !== undefined && value < def.min) ||
      (def.max !== undefined && value > def.max)
    ) {
      return `Use um número entre ${def.min ?? 0} e ${def.max ?? "∞"}.`;
    }
  }

  if (!def.required || !isEmptyValue(value)) return undefined;

  switch (def.kind) {
    case "rooms":
      return "Escolha pelo menos um ambiente para continuar.";
    case "choice":
      return "Escolha uma opção para continuar.";
    case "consent":
      return "É preciso marcar esta opção para continuar.";
    default:
      return "Preencha este campo para continuar.";
  }
}

export function screenErrors(
  screen: ScreenInstance,
  effective: Flow["effective"],
) {
  const errors: Record<string, string> = {};
  for (const field of screen.fields) {
    const error = fieldError(field, effective[field.key]);
    if (error) errors[field.key] = error;
  }
  return errors;
}

/** Índice da primeira tela com erro, ou -1 se o fluxo todo é válido. */
export function firstInvalidScreen(flow: Flow): number {
  return flow.screens.findIndex(
    (s) => Object.keys(screenErrors(s, flow.effective)).length > 0,
  );
}
