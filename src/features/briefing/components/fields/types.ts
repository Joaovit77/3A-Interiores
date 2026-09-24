import type { AnswerValue } from "../../definition/types";
import type { FieldInstance } from "../../engine/flow";

export interface FieldProps {
  field: FieldInstance;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue | undefined) => void;
  error?: string;
  /** Esconde o rótulo visualmente quando o título da tela já faz a pergunta. */
  hideLegend?: boolean;
}
