import { moduleFor } from "../definition/modules";
import {
  ROOMS_FIELD,
  roomInstances,
  type RoomSelection,
} from "../definition/rooms";
import { evaluateRule } from "../definition/rules";
import { STAGES } from "../definition/stages";
import type {
  AnswerValue,
  Answers,
  Ctx,
  FieldDef,
  OptionDef,
  Resident,
  RoomInstance,
  Scope,
  ScreenDef,
  StageDef,
} from "../definition/types";

export interface FieldInstance {
  key: string;
  def: FieldDef;
  options?: OptionDef[];
}

export interface ScreenInstance {
  /** Identificador usado em `?passo=`. */
  key: string;
  stageId: string;
  def: ScreenDef;
  scope: Scope;
  title: string;
  fields: FieldInstance[];
}

/** Tela de preferências visuais herdada do banheiro anterior (não é exibida). */
export interface InheritedScreen {
  stageId: string;
  room: RoomInstance;
  from: RoomInstance;
  def: ScreenDef;
  title: string;
  fields: FieldInstance[];
}

export interface RuleResult {
  name: string;
  result: boolean;
}

export interface Evaluation {
  screenKey: string;
  stageId: string;
  visible: boolean;
  reason?: "rules" | "no-fields" | "inherited";
  rules: RuleResult[];
}

export type Derived = Record<
  string,
  { kind: "default" | "inherited"; from?: string }
>;

export interface Flow {
  screens: ScreenInstance[];
  inheritedScreens: InheritedScreen[];
  /** Valores considerados pelo fluxo: só respostas visíveis, padrões e herdados. */
  effective: Answers;
  derived: Derived;
  evaluations: Evaluation[];
  residents: Resident[];
  rooms: RoomInstance[];
  stages: StageDef[];
}

export function fieldKey(scope: Scope, fieldId: string): string {
  switch (scope.kind) {
    case "global":
      return fieldId;
    case "resident":
      return `resident.${scope.residentId}.${fieldId}`;
    case "room":
      return `room.${scope.room.id}.${fieldId}`;
  }
}

function screenKey(scope: Scope, screenId: string): string {
  switch (scope.kind) {
    case "global":
      return screenId;
    case "resident":
      return `${screenId}-${scope.index}`;
    case "room":
      return `${scope.room.id}-${screenId}`;
  }
}

/**
 * Calcula o fluxo visível a partir das respostas.
 *
 * Percorre a definição em ordem. Cada regra só enxerga valores de telas e
 * campos visíveis anteriores, então uma resposta escondida nunca influencia o
 * fluxo, mas continua guardada em `answers` e volta se a condição voltar.
 */
export function buildFlow(answers: Answers): Flow {
  const effective: Answers = {};
  const derived: Derived = {};
  const screens: ScreenInstance[] = [];
  const inheritedScreens: InheritedScreen[] = [];
  const evaluations: Evaluation[] = [];

  const residents = (): Resident[] => {
    const count = effective["household.count"];
    const total =
      typeof count === "number" ? Math.max(1, Math.floor(count)) : 1;
    return Array.from({ length: total }, (_, i) => ({
      id: `p${i + 1}`,
      index: i + 1,
    }));
  };
  const rooms = (): RoomInstance[] =>
    roomInstances(effective[ROOMS_FIELD] as RoomSelection | undefined);

  const makeCtx = (scope: Scope): Ctx => ({
    get: (key) => effective[key],
    local: (id) => effective[fieldKey(scope, id)],
    scope,
    get residents() {
      return residents();
    },
    get rooms() {
      return rooms();
    },
  });

  const resolveFields = (def: ScreenDef, ctx: Ctx) =>
    typeof def.fields === "function" ? def.fields(ctx) : def.fields;

  const resolveOptions = (field: FieldDef, ctx: Ctx) =>
    field.kind === "choice"
      ? typeof field.options === "function"
        ? field.options(ctx)
        : field.options
      : undefined;

  const titleOf = (def: ScreenDef, ctx: Ctx) =>
    typeof def.title === "function" ? def.title(ctx) : def.title;

  function processScreen(
    stage: StageDef,
    def: ScreenDef,
    scope: Scope,
    inheritFrom?: RoomInstance,
  ) {
    const ctx = makeCtx(scope);
    const key = screenKey(scope, def.id);
    const rules = (def.when ?? []).map((name) => ({
      name,
      result: evaluateRule(name, ctx),
    }));

    if (!rules.every((r) => r.result)) {
      evaluations.push({
        screenKey: key,
        stageId: stage.id,
        visible: false,
        reason: "rules",
        rules,
      });
      return;
    }

    if (inheritFrom && scope.kind === "room") {
      const fields: FieldInstance[] = [];
      for (const field of resolveFields(def, ctx)) {
        const target = fieldKey(scope, field.id);
        const source = `room.${inheritFrom.id}.${field.id}`;
        if (effective[source] === undefined) continue;
        effective[target] = effective[source];
        derived[target] = { kind: "inherited", from: source };
        fields.push({
          key: target,
          def: field,
          options: resolveOptions(field, ctx),
        });
      }
      inheritedScreens.push({
        stageId: stage.id,
        room: scope.room,
        from: inheritFrom,
        def,
        title: titleOf(def, ctx),
        fields,
      });
      evaluations.push({
        screenKey: key,
        stageId: stage.id,
        visible: false,
        reason: "inherited",
        rules,
      });
      return;
    }

    const fields: FieldInstance[] = [];
    for (const field of resolveFields(def, ctx)) {
      if (field.when && !field.when.every((name) => evaluateRule(name, ctx)))
        continue;
      const k = fieldKey(scope, field.id);
      const explicit = answers[k];
      if (explicit !== undefined) {
        effective[k] = explicit;
      } else if (field.defaultValue) {
        const value = field.defaultValue(ctx);
        if (value !== undefined) {
          effective[k] = value;
          derived[k] = { kind: "default" };
        }
      } else if (field.kind === "counter") {
        effective[k] = field.initial;
      }
      fields.push({ key: k, def: field, options: resolveOptions(field, ctx) });
    }

    if (fields.length === 0) {
      evaluations.push({
        screenKey: key,
        stageId: stage.id,
        visible: false,
        reason: "no-fields",
        rules,
      });
      return;
    }

    evaluations.push({
      screenKey: key,
      stageId: stage.id,
      visible: true,
      rules,
    });
    screens.push({
      key,
      stageId: stage.id,
      def,
      scope,
      title: titleOf(def, ctx),
      fields,
    });
  }

  for (const stage of STAGES) {
    for (const item of stage.items) {
      if (item.type === "screen") {
        processScreen(stage, item.screen, { kind: "global" });
      } else if (item.type === "perResident") {
        for (const r of residents()) {
          processScreen(stage, item.screen, {
            kind: "resident",
            residentId: r.id,
            index: r.index,
          });
        }
      } else {
        const instances = rooms();
        for (const room of instances) {
          const mod = room.hasModule ? moduleFor(room.type) : undefined;
          if (!mod) continue;
          const previous = instances.find(
            (r) => r.type === room.type && r.index === room.index - 1,
          );
          for (const def of mod.screens) {
            const reuse =
              previous &&
              mod.reuseFieldId &&
              def.reusable &&
              effective[`room.${room.id}.${mod.reuseFieldId}`] === "sim";
            processScreen(
              stage,
              def,
              { kind: "room", room },
              reuse ? previous : undefined,
            );
          }
        }
      }
    }
  }

  const visibleStages = STAGES.filter((stage) =>
    screens.some((s) => s.stageId === stage.id),
  );

  return {
    screens,
    inheritedScreens,
    effective,
    derived,
    evaluations,
    residents: residents(),
    rooms: rooms(),
    stages: visibleStages,
  };
}

export function isEmptyValue(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "boolean") return value === false;
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return Object.values(value).every(
    (v) => v === 0 || v === "" || v === undefined,
  );
}
