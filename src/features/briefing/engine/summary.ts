import {
  PENDING_MODULE_MESSAGE,
  ROOM_TYPES,
  type RoomSelection,
} from "../definition/rooms";
import type { AnswerValue, MockFile } from "../definition/types";
import { isEmptyValue, type FieldInstance, type Flow } from "./flow";

export interface SummaryEntry {
  key: string;
  label: string;
  value: string;
  /** O rótulo repete o título da tela; a interface pode escondê-lo visualmente. */
  repeatsTitle?: boolean;
}

export interface SummaryScreen {
  /** Tela para onde o botão «Editar» leva. */
  screenKey: string;
  title: string;
  entries: SummaryEntry[];
  /** Nome do ambiente, quando a tela pertence a um módulo. */
  room?: string;
  /** Preferências herdadas do ambiente anterior. */
  inheritedFrom?: string;
}

export interface SummaryStage {
  id: string;
  title: string;
  screens: SummaryScreen[];
  notes: string[];
}

export function formatValue(
  field: FieldInstance,
  value: AnswerValue | undefined,
): string {
  if (value === undefined) return "";
  const { def } = field;
  const label = (v: string) =>
    field.options?.find((o) => o.value === v)?.label ?? v;

  switch (def.kind) {
    case "choice":
      return Array.isArray(value)
        ? (value as string[]).map(label).join(", ")
        : label(String(value));
    case "rooms": {
      const selection = value as RoomSelection;
      return ROOM_TYPES.filter((r) => (selection[r.type] ?? 0) > 0)
        .map((r) =>
          selection[r.type] > 1 ? `${r.label} (${selection[r.type]})` : r.label,
        )
        .join(", ");
    }
    case "upload": {
      const files = value as MockFile[];
      const names = files.map((f) => f.name).join(", ");
      return `${files.length} ${files.length === 1 ? "arquivo" : "arquivos"} (simulação): ${names}`;
    }
    case "matrix": {
      const answers = value as Record<string, string>;
      return def.rows
        .filter((row) => answers[row.id])
        .map((row) => {
          const column = def.columns.find((c) => c.value === answers[row.id]);
          return `${row.label}: ${column?.label ?? answers[row.id]}`;
        })
        .join("; ");
    }
    case "consent":
      return value === true ? "Autorizado" : "";
    case "number":
      return def.unit ? `${value} ${def.unit}` : String(value);
    default:
      return String(value);
  }
}

function entriesFor(
  fields: FieldInstance[],
  effective: Flow["effective"],
  title?: string,
): SummaryEntry[] {
  return fields
    .filter((f) => !isEmptyValue(effective[f.key]))
    .map((f) => ({
      key: f.key,
      label: f.def.label,
      value: formatValue(f, effective[f.key]),
      repeatsTitle: f.def.label === title,
    }))
    .filter((e) => e.value !== "");
}

/** Monta o resumo final. Respostas escondidas nunca aparecem. */
export function buildSummary(flow: Flow): SummaryStage[] {
  const pendingRooms = flow.rooms.filter((r) => !r.hasModule);

  return flow.stages.map((stage) => {
    const screens: SummaryScreen[] = [];

    for (const screen of flow.screens.filter((s) => s.stageId === stage.id)) {
      const room = screen.scope.kind === "room" ? screen.scope.room : undefined;
      const entries = entriesFor(screen.fields, flow.effective, screen.title);
      if (entries.length) {
        screens.push({
          screenKey: screen.key,
          title: screen.title,
          entries,
          room: room?.label,
        });
      }

      // Logo depois da primeira tela do ambiente, mostra o que foi herdado.
      if (
        room &&
        flow.screens.find(
          (s) => s.scope.kind === "room" && s.scope.room.id === room.id,
        ) === screen
      ) {
        const inherited = flow.inheritedScreens.filter(
          (i) => i.room.id === room.id,
        );
        const inheritedEntries = inherited.flatMap((i) =>
          entriesFor(i.fields, flow.effective),
        );
        if (inheritedEntries.length) {
          screens.push({
            screenKey: screen.key,
            title: `Mesma direção visual de: ${inherited[0].from.label}`,
            entries: inheritedEntries,
            room: room.label,
            inheritedFrom: inherited[0].from.label,
          });
        }
      }
    }

    const notes =
      stage.id === "ambientes" && pendingRooms.length
        ? [
            `${pendingRooms.map((r) => r.label).join(", ")}: ${PENDING_MODULE_MESSAGE}`,
          ]
        : [];

    return { id: stage.id, title: stage.title, screens, notes };
  });
}
