/**
 * Tipos da definição do briefing (conteúdo aprovado no checkpoint B1).
 *
 * A definição descreve etapas, telas e campos. O motor em `../engine` decide
 * quais telas e campos ficam visíveis a partir das respostas.
 */

export interface MockFile {
  id: string;
  name: string;
  size: number;
  type: string;
  /** URL `blob:` local. Nada é enviado para servidor no protótipo. */
  url: string;
}

export type AnswerValue =
  | string
  | string[]
  | number
  | boolean
  | MockFile[]
  | Record<string, number>
  | Record<string, string>;

export type Answers = Record<string, AnswerValue>;

export type ImageRef =
  | { kind: "render"; src: string; alt: string }
  | { kind: "placeholder"; alt: string };

export interface OptionDef {
  value: string;
  label: string;
  description?: string;
  image?: ImageRef;
  /** Em múltipla escolha, marcar esta opção limpa as demais (e vice-versa). */
  exclusive?: boolean;
}

export type Scope =
  | { kind: "global" }
  | { kind: "resident"; residentId: string; index: number }
  | { kind: "room"; room: RoomInstance };

export interface Resident {
  id: string;
  index: number;
}

export interface RoomInstance {
  id: string;
  type: string;
  /** Posição entre os ambientes do mesmo tipo, a partir de 1. */
  index: number;
  /** Quantidade de ambientes do mesmo tipo. */
  total: number;
  label: string;
  hasModule: boolean;
}

/** Contexto disponível para regras, textos e valores padrão. */
export interface Ctx {
  /** Valor efetivo de uma chave completa, considerando só o que está visível até aqui. */
  get(key: string): AnswerValue | undefined;
  /** Valor efetivo de um campo no escopo atual (morador ou ambiente). */
  local(fieldId: string): AnswerValue | undefined;
  scope: Scope;
  residents: Resident[];
  rooms: RoomInstance[];
}

export type RuleId = string;

export interface Rule {
  label: string;
  test: (ctx: Ctx) => boolean;
}

interface BaseField {
  /** Chave completa (escopo global) ou id local (escopo de morador ou ambiente). */
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Todas as regras precisam ser verdadeiras para o campo aparecer. */
  when?: RuleId[];
  /** Valor pré-marcado a partir de respostas anteriores. */
  defaultValue?: (ctx: Ctx) => AnswerValue | undefined;
}

export interface TextFieldDef extends BaseField {
  kind: "text" | "textarea" | "email";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
}

export interface NumberFieldDef extends BaseField {
  kind: "number";
  unit?: string;
  min?: number;
  max?: number;
}

export interface CounterFieldDef extends BaseField {
  kind: "counter";
  min: number;
  max: number;
  initial: number;
}

export interface ChoiceFieldDef extends BaseField {
  kind: "choice";
  multiple?: boolean;
  /** Máximo de opções em múltipla escolha. */
  max?: number;
  layout: "cards" | "chips" | "images";
  options: OptionDef[] | ((ctx: Ctx) => OptionDef[]);
}

export interface RoomsFieldDef extends BaseField {
  kind: "rooms";
}

export interface UploadFieldDef extends BaseField {
  kind: "upload";
  accept: string;
  maxFiles: number;
}

export interface MatrixFieldDef extends BaseField {
  kind: "matrix";
  rows: { id: string; label: string }[];
  columns: OptionDef[];
}

export interface ConsentFieldDef extends BaseField {
  kind: "consent";
}

export type FieldDef =
  | TextFieldDef
  | NumberFieldDef
  | CounterFieldDef
  | ChoiceFieldDef
  | RoomsFieldDef
  | UploadFieldDef
  | MatrixFieldDef
  | ConsentFieldDef;

export interface ScreenDef {
  /** Identificador usado na URL (`?passo=`). Único dentro do escopo. */
  id: string;
  title: string | ((ctx: Ctx) => string);
  description?: string;
  fields: FieldDef[] | ((ctx: Ctx) => FieldDef[]);
  when?: RuleId[];
  /** Itens do briefing original atendidos por esta tela (rastreabilidade). */
  sources: string[];
  /** Tela nova, que não vem do briefing original. */
  isNew?: boolean;
  /** Preferência visual que pode ser herdada do banheiro anterior. */
  reusable?: boolean;
}

export interface ModuleDef {
  roomType: string;
  /** Campo que decide se as telas reaproveitáveis herdam do ambiente anterior. */
  reuseFieldId?: string;
  screens: ScreenDef[];
}

export type StageItem =
  | { type: "screen"; screen: ScreenDef }
  | { type: "perResident"; screen: ScreenDef }
  | { type: "roomModules" };

export interface StageDef {
  id: string;
  title: string;
  goal: string;
  items: StageItem[];
}
